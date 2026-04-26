// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {ReentrancyGuard} from "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

import {Nox, euint256, externalEuint256, ebool} from "@iexec-nox/nox-protocol-contracts/contracts/sdk/Nox.sol";
import {IERC7984} from "@iexec-nox/nox-confidential-contracts/contracts/interfaces/IERC7984.sol";
import {IERC7984Receiver} from "@iexec-nox/nox-confidential-contracts/contracts/interfaces/IERC7984Receiver.sol";

import {ICampaign} from "./interfaces/ICampaign.sol";
import {ConfidentialEscrow} from "./ConfidentialEscrow.sol";

/* ============================================================================
 * @title  Campaign
 * @notice One StealthGive crowdfunding campaign. Donors contribute via the
 *         iExec Nox Confidential Token; per-donor amounts stay encrypted on
 *         chain while the aggregate total becomes publicly decryptable after
 *         the campaign deadline.
 *
 *         Two donation paths are supported:
 *
 *           A. Operator path (two transactions)
 *              donor → token.setOperator(campaign, until)
 *              donor → campaign.donate(externalEuint256, inputProof)
 *
 *           B. Single-tx path (ERC-7984 transferAndCall)
 *              donor → token.confidentialTransferAndCall(campaign, ...)
 *              token → campaign.onConfidentialTransferReceived(...)
 *
 *         State machine:
 *
 *              Active  ── deadline ──►  Settling  ── recipient withdraws ──►  Withdrawn
 *                                          │
 *                                          └── refund grace expires ──►  Refunding
 *                                                       (donors call refund())
 * ==========================================================================*/
contract Campaign is ICampaign, ConfidentialEscrow, IERC7984Receiver, ReentrancyGuard {
    // ---------------------------------------------------------------- Immutable parameters
    address public immutable creator;
    address public immutable recipient;
    uint256 public immutable goal;
    uint64 public immutable deadline;
    uint64 public immutable refundGracePeriod;

    // ---------------------------------------------------------------- Mutable parameters
    string public metadataURI;
    State public state;
    uint64 public settledAt;

    // ---------------------------------------------------------------- Construction
    constructor(
        IERC7984 _token,
        address _creator,
        address _recipient,
        uint256 _goal,
        uint64 _deadline,
        uint64 _refundGracePeriod,
        string memory _metadataURI
    ) ConfidentialEscrow(_token) {
        creator = _creator;
        recipient = _recipient;
        goal = _goal;
        deadline = _deadline;
        refundGracePeriod = _refundGracePeriod;
        metadataURI = _metadataURI;
        state = State.Active;
    }

    // ---------------------------------------------------------------- Donation: operator path

    /// @inheritdoc ICampaign
    function donate(externalEuint256 encryptedAmount, bytes calldata inputProof) external {
        if (state != State.Active) revert NotActive();
        if (block.timestamp >= deadline) revert DeadlinePassed();

        euint256 amount = Nox.fromExternal(encryptedAmount, inputProof);
        Nox.allowTransient(amount, address(token));

        // Pull confidential tokens from donor → escrow.
        // Donor must have previously called `token.setOperator(thisCampaign, until)`.
        euint256 transferred = token.confidentialTransferFrom(msg.sender, address(this), amount);

        _credit(msg.sender, transferred);
        emit Donated(msg.sender);
    }

    // ---------------------------------------------------------------- Donation: transferAndCall path

    /// @inheritdoc IERC7984Receiver
    /// @notice Receiver hook invoked by the Confidential Token when a donor
    ///         calls `token.confidentialTransferAndCall(thisCampaign, ...)`.
    function onConfidentialTransferReceived(
        address /*operator*/,
        address from,
        euint256 amount,
        bytes calldata /*data*/
    ) external returns (ebool) {
        require(msg.sender == address(token), "Campaign: unauthorized token");
        if (state != State.Active) revert NotActive();
        if (block.timestamp >= deadline) revert DeadlinePassed();

        _credit(from, amount);
        emit Donated(from);

        return Nox.toEbool(true);
    }

    // ---------------------------------------------------------------- Settlement

    /// @inheritdoc ICampaign
    function settle() external {
        if (state != State.Active) revert AlreadyFinalState();
        if (block.timestamp < deadline) revert DeadlineNotReached();

        // Make the aggregate total publicly decryptable so anyone can verify
        // whether the campaign reached its goal. Per-donor contributions
        // remain encrypted and accessible only to each donor.
        _openPublicTotal();

        state = State.Settling;
        settledAt = uint64(block.timestamp);

        emit Settled(settledAt);
    }

    // ---------------------------------------------------------------- Recipient withdrawal

    /// @inheritdoc ICampaign
    /// @notice Recipient takes the entire escrow balance. By calling this
    ///         function the recipient implicitly accepts the publicly-revealed
    ///         total as a successful campaign outcome (refunds are no longer
    ///         possible after withdrawal).
    function withdraw() external nonReentrant {
        if (state != State.Settling) revert NotSettling();
        if (msg.sender != recipient) revert NotRecipient();

        _releaseAllTo(recipient);
        state = State.Withdrawn;

        emit Withdrawn(recipient);
    }

    // ---------------------------------------------------------------- Donor refunds

    /// @inheritdoc ICampaign
    /// @notice Donor reclaims their full contribution. Available after the
    ///         refund-grace window has elapsed without the recipient
    ///         withdrawing — i.e. when the goal was not met or the recipient
    ///         declined to claim.
    function refund() external nonReentrant {
        if (state == State.Withdrawn) revert AlreadyFinalState();
        if (state != State.Settling && state != State.Refunding) revert NotSettling();
        if (block.timestamp < uint256(settledAt) + uint256(refundGracePeriod)) {
            revert RefundGraceNotElapsed();
        }
        if (!hasDonated[msg.sender]) revert NoContribution();

        // First refund flips the campaign into the explicit Refunding state.
        if (state == State.Settling) {
            state = State.Refunding;
        }

        _refundTo(msg.sender);
        emit Refunded(msg.sender);
    }
}

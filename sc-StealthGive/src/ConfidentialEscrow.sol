// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {Nox, euint256} from "@iexec-nox/nox-protocol-contracts/contracts/sdk/Nox.sol";
import {IERC7984} from "@iexec-nox/nox-confidential-contracts/contracts/interfaces/IERC7984.sol";

/* ============================================================================
 * @title  ConfidentialEscrow
 * @notice Abstract base that holds Confidential Token balances for a single
 *         StealthGive campaign. Encapsulates the core privacy invariants:
 *
 *           1. Per-donor contributions are stored as encrypted handles
 *              (`euint256`) and are decryptable only by that donor.
 *           2. The aggregate total is stored as an encrypted handle and is
 *              made publicly decryptable only after the deadline, via
 *              `_openPublicTotal()`.
 *           3. Token transfers happen entirely in encrypted form via the
 *              `IERC7984` confidential transfer functions.
 *
 *         Higher-level state machine (Active / Settling / Withdrawn /
 *         Refunding) lives in `Campaign.sol` which inherits this contract.
 * ==========================================================================*/
abstract contract ConfidentialEscrow {
    // ---------------------------------------------------------------- Storage
    /// @notice The Confidential Token this escrow accepts.
    IERC7984 public immutable token;

    /// @notice Encrypted aggregate of all donations received.
    euint256 internal _encryptedTotal;

    /// @notice Encrypted per-donor running contribution (used for refunds).
    mapping(address donor => euint256) internal _encryptedContrib;

    /// @notice Whether an address has donated at least once.
    mapping(address donor => bool) public hasDonated;

    /// @notice Distinct donor count (incremented on first donation, decremented on full refund).
    uint256 public donorCount;

    // ---------------------------------------------------------------- Construction
    constructor(IERC7984 _token) {
        token = _token;
    }

    // ---------------------------------------------------------------- Internal mutators

    /// @dev Add `amount` to both the donor's encrypted contribution and the
    ///      encrypted aggregate. Updates donor accounting.
    /// @dev The aggregate `_encryptedTotal` is marked publicly decryptable on
    ///      every credit so the campaign progress can be displayed live to
    ///      visitors (matching standard crowdfunding UX). Per-donor amounts
    ///      remain decryptable only by each donor — the privacy boundary
    ///      stays exactly where it should be: at the donor.
    function _credit(address donor, euint256 amount) internal {
        _encryptedTotal = Nox.add(_encryptedTotal, amount);
        Nox.allowThis(_encryptedTotal);
        Nox.allowPublicDecryption(_encryptedTotal);

        _encryptedContrib[donor] = Nox.add(_encryptedContrib[donor], amount);
        Nox.allowThis(_encryptedContrib[donor]);
        Nox.allow(_encryptedContrib[donor], donor);

        if (!hasDonated[donor]) {
            hasDonated[donor] = true;
            unchecked {
                ++donorCount;
            }
        }
    }

    /// @dev Mark the encrypted aggregate as publicly decryptable. Called
    ///      once at settlement so the world can verify the total raised.
    function _openPublicTotal() internal {
        Nox.allowPublicDecryption(_encryptedTotal);
    }

    /// @dev Send the entire escrow balance (the encrypted total) to `to`
    ///      using a confidential transfer. Used by `withdraw()`.
    function _releaseAllTo(address to) internal returns (euint256 transferred) {
        euint256 total = _encryptedTotal;
        Nox.allowTransient(total, address(token));
        transferred = token.confidentialTransfer(to, total);
    }

    /// @dev Send a single donor's contribution back to them and clear their
    ///      contribution + accounting. Used by `refund()`.
    function _refundTo(address donor) internal returns (euint256 transferred) {
        euint256 contribution = _encryptedContrib[donor];
        // Reset the encrypted contribution slot. `delete` is not supported on
        // user-defined value types, so we explicitly assign the zero handle.
        _encryptedContrib[donor] = euint256.wrap(bytes32(0));
        hasDonated[donor] = false;
        unchecked {
            --donorCount;
        }
        Nox.allowTransient(contribution, address(token));
        transferred = token.confidentialTransfer(donor, contribution);
    }

    // ---------------------------------------------------------------- External views

    /// @notice Encrypted aggregate handle. Decryptable by anyone after settlement.
    function encryptedTotal() external view returns (euint256) {
        return _encryptedTotal;
    }

    /// @notice Caller's encrypted contribution handle. Decryptable only by the caller.
    function myContribution() external view returns (euint256) {
        return _encryptedContrib[msg.sender];
    }
}

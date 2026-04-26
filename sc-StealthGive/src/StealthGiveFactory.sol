// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {IERC7984} from "@iexec-nox/nox-confidential-contracts/contracts/interfaces/IERC7984.sol";

import {IStealthGiveFactory} from "./interfaces/IStealthGiveFactory.sol";
import {Campaign} from "./Campaign.sol";

/* ============================================================================
 * @title  StealthGiveFactory
 * @notice Deploys and registers `Campaign` instances for StealthGive
 *         fundraisers. Bound to a single Confidential Token at construction
 *         time (e.g. cUSDC on Arbitrum Sepolia from the iExec CDeFi faucet).
 * ==========================================================================*/
contract StealthGiveFactory is IStealthGiveFactory {
    /// @inheritdoc IStealthGiveFactory
    IERC7984 public immutable token;

    /// @inheritdoc IStealthGiveFactory
    uint64 public immutable refundGracePeriod;

    address[] internal _campaigns;
    mapping(address campaign => bool) internal _isCampaign;

    constructor(IERC7984 _token, uint64 _refundGracePeriod) {
        require(address(_token) != address(0), "Factory: zero token");
        require(_refundGracePeriod > 0, "Factory: zero grace");
        token = _token;
        refundGracePeriod = _refundGracePeriod;
    }

    /// @inheritdoc IStealthGiveFactory
    function createCampaign(
        string calldata metadataURI,
        uint256 goal,
        uint64 deadline,
        address recipient
    ) external returns (address campaign) {
        if (deadline <= block.timestamp) revert InvalidDeadline();
        if (recipient == address(0)) revert InvalidRecipient();
        if (goal == 0) revert InvalidGoal();
        if (bytes(metadataURI).length == 0) revert EmptyMetadata();

        Campaign instance = new Campaign(
            token,
            msg.sender,
            recipient,
            goal,
            deadline,
            refundGracePeriod,
            metadataURI
        );

        campaign = address(instance);
        _campaigns.push(campaign);
        _isCampaign[campaign] = true;

        emit CampaignCreated(campaign, msg.sender, recipient, goal, deadline, metadataURI);
    }

    /// @inheritdoc IStealthGiveFactory
    function campaignCount() external view returns (uint256) {
        return _campaigns.length;
    }

    /// @inheritdoc IStealthGiveFactory
    function campaignAt(uint256 index) external view returns (address) {
        return _campaigns[index];
    }

    /// @inheritdoc IStealthGiveFactory
    function isCampaign(address candidate) external view returns (bool) {
        return _isCampaign[candidate];
    }

    /// @inheritdoc IStealthGiveFactory
    function allCampaigns() external view returns (address[] memory) {
        return _campaigns;
    }
}

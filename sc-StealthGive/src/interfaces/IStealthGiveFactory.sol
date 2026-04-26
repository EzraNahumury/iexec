// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {IERC7984} from "@iexec-nox/nox-confidential-contracts/contracts/interfaces/IERC7984.sol";

/// @title  IStealthGiveFactory
/// @notice Public interface for the campaign factory.
interface IStealthGiveFactory {
    event CampaignCreated(
        address indexed campaign,
        address indexed creator,
        address indexed recipient,
        uint256 goal,
        uint64 deadline,
        string metadataURI
    );

    error InvalidDeadline();
    error InvalidRecipient();
    error InvalidGoal();
    error EmptyMetadata();

    function token() external view returns (IERC7984);
    function refundGracePeriod() external view returns (uint64);
    function campaignCount() external view returns (uint256);
    function campaignAt(uint256 index) external view returns (address);
    function isCampaign(address candidate) external view returns (bool);
    function allCampaigns() external view returns (address[] memory);

    function createCampaign(
        string calldata metadataURI,
        uint256 goal,
        uint64 deadline,
        address recipient
    ) external returns (address campaign);
}

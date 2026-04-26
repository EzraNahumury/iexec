// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {ICampaign} from "./ICampaign.sol";

/// @title  ICampaignRegistry
/// @notice Read-only indexer over the StealthGive factory.
interface ICampaignRegistry {
    struct CampaignSummary {
        address campaign;
        address creator;
        address recipient;
        uint256 goal;
        uint64 deadline;
        uint64 settledAt;
        uint256 donorCount;
        ICampaign.State state;
        string metadataURI;
    }

    function paginate(uint256 offset, uint256 limit)
        external
        view
        returns (address[] memory page, uint256 total);

    function summarise(address campaign) external view returns (CampaignSummary memory);

    function summariseMany(address[] calldata campaigns_)
        external
        view
        returns (CampaignSummary[] memory);

    function listByState(ICampaign.State desired, uint256 offset, uint256 limit)
        external
        view
        returns (CampaignSummary[] memory results, uint256 totalScanned);
}

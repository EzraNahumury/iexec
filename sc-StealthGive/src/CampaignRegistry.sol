// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {ICampaign} from "./interfaces/ICampaign.sol";
import {ICampaignRegistry} from "./interfaces/ICampaignRegistry.sol";
import {IStealthGiveFactory} from "./interfaces/IStealthGiveFactory.sol";
import {Campaign} from "./Campaign.sol";

/* ============================================================================
 * @title  CampaignRegistry
 * @notice View-only indexer over a `StealthGiveFactory`. The frontend uses
 *         this contract to paginate, filter and fetch campaign summaries in
 *         a single RPC round-trip.
 * ==========================================================================*/
contract CampaignRegistry is ICampaignRegistry {
    IStealthGiveFactory public immutable factory;

    constructor(IStealthGiveFactory _factory) {
        require(address(_factory) != address(0), "Registry: zero factory");
        factory = _factory;
    }

    /// @inheritdoc ICampaignRegistry
    function paginate(uint256 offset, uint256 limit)
        external
        view
        returns (address[] memory page, uint256 total)
    {
        total = factory.campaignCount();
        if (offset >= total || limit == 0) {
            return (new address[](0), total);
        }

        uint256 end = offset + limit;
        if (end > total) end = total;

        page = new address[](end - offset);
        for (uint256 i; i < page.length; ++i) {
            page[i] = factory.campaignAt(offset + i);
        }
    }

    /// @inheritdoc ICampaignRegistry
    function summarise(address campaign) public view returns (CampaignSummary memory s) {
        Campaign c = Campaign(campaign);
        s = CampaignSummary({
            campaign: campaign,
            creator: c.creator(),
            recipient: c.recipient(),
            goal: c.goal(),
            deadline: c.deadline(),
            settledAt: c.settledAt(),
            donorCount: c.donorCount(),
            state: c.state(),
            metadataURI: c.metadataURI()
        });
    }

    /// @inheritdoc ICampaignRegistry
    function summariseMany(address[] calldata campaigns_)
        external
        view
        returns (CampaignSummary[] memory results)
    {
        results = new CampaignSummary[](campaigns_.length);
        for (uint256 i; i < campaigns_.length; ++i) {
            results[i] = summarise(campaigns_[i]);
        }
    }

    /// @inheritdoc ICampaignRegistry
    function listByState(ICampaign.State desired, uint256 offset, uint256 limit)
        external
        view
        returns (CampaignSummary[] memory results, uint256 totalScanned)
    {
        uint256 total = factory.campaignCount();
        if (offset >= total || limit == 0) {
            return (new CampaignSummary[](0), 0);
        }

        uint256 end = offset + limit;
        if (end > total) end = total;
        totalScanned = end - offset;

        // First pass: count matches so we size the output array exactly.
        uint256 matches;
        for (uint256 i = offset; i < end; ++i) {
            if (ICampaign(factory.campaignAt(i)).state() == desired) {
                unchecked {
                    ++matches;
                }
            }
        }

        results = new CampaignSummary[](matches);
        uint256 cursor;
        for (uint256 i = offset; i < end; ++i) {
            address candidate = factory.campaignAt(i);
            if (ICampaign(candidate).state() == desired) {
                results[cursor] = summarise(candidate);
                unchecked {
                    ++cursor;
                }
            }
        }
    }
}

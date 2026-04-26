// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {Test} from "forge-std/Test.sol";

import {StealthGiveFactory} from "../../src/StealthGiveFactory.sol";
import {CampaignRegistry} from "../../src/CampaignRegistry.sol";
import {Campaign} from "../../src/Campaign.sol";

import {TestConfidentialToken} from "./TestConfidentialToken.sol";

/* ============================================================================
 * @title  Setup
 * @notice Shared test scaffolding: deploys the Confidential Token (test
 *         variant), the StealthGive factory, the registry, and pre-funds a
 *         set of donor addresses with mintable test cUSDC.
 * ==========================================================================*/
abstract contract Setup is Test {
    TestConfidentialToken internal token;
    StealthGiveFactory internal factory;
    CampaignRegistry internal registry;

    address internal deployer = makeAddr("deployer");
    address internal creator = makeAddr("creator");
    address internal recipient = makeAddr("recipient");
    address internal alice = makeAddr("alice");
    address internal bob = makeAddr("bob");
    address internal carol = makeAddr("carol");

    uint64 internal constant REFUND_GRACE = 7 days;
    uint256 internal constant INITIAL_BALANCE = 10_000e6; // 10k tcUSDC (6 decimals)

    function setUp() public virtual {
        vm.startPrank(deployer);
        token = new TestConfidentialToken();
        factory = new StealthGiveFactory(token, REFUND_GRACE);
        registry = new CampaignRegistry(factory);
        vm.stopPrank();

        token.mintPlain(alice, INITIAL_BALANCE);
        token.mintPlain(bob, INITIAL_BALANCE);
        token.mintPlain(carol, INITIAL_BALANCE);
    }

    // ------------------------------------------------------------ Helpers

    function _createCampaign(uint256 goal, uint64 deadlineOffset, string memory uri)
        internal
        returns (Campaign campaign)
    {
        vm.prank(creator);
        address addr = factory.createCampaign(uri, goal, uint64(block.timestamp + deadlineOffset), recipient);
        campaign = Campaign(addr);
    }

    function _donate(Campaign campaign, address donor, uint256 amount) internal {
        vm.startPrank(donor);
        token.setOperator(address(campaign), uint48(block.timestamp + 1 hours));
        campaign.donate(token.encryptForTest(amount), "");
        vm.stopPrank();
    }
}

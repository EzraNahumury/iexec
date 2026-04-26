// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {Setup} from "./helpers/Setup.sol";
import {Campaign} from "../src/Campaign.sol";
import {ICampaign} from "../src/interfaces/ICampaign.sol";
import {Nox, euint256, externalEuint256} from "@iexec-nox/nox-protocol-contracts/contracts/sdk/Nox.sol";

contract CampaignTest is Setup {
    string internal constant URI = "ipfs://QmTestCampaignMetadata";
    uint256 internal constant GOAL = 1_000e6;

    Campaign internal campaign;

    function setUp() public override {
        super.setUp();
        campaign = _createCampaign(GOAL, 7 days, URI);
    }

    // ---------------------------------------------------------------- Donation flow

    function test_donate_singleDonorIncrementsCount() public {
        _donate(campaign, alice, 250e6);

        assertEq(campaign.donorCount(), 1);
        assertTrue(campaign.hasDonated(alice));
        assertEq(Nox.decrypt(campaign.encryptedTotal()), 250e6);

        vm.prank(alice);
        assertEq(Nox.decrypt(campaign.myContribution()), 250e6);
    }

    function test_donate_multipleDonorsAggregate() public {
        _donate(campaign, alice, 100e6);
        _donate(campaign, bob, 250e6);
        _donate(campaign, carol, 700e6);

        assertEq(campaign.donorCount(), 3);
        assertEq(Nox.decrypt(campaign.encryptedTotal()), 1_050e6);
    }

    function test_donate_sameDonorTwiceDoesNotDoubleCount() public {
        _donate(campaign, alice, 100e6);
        _donate(campaign, alice, 200e6);

        assertEq(campaign.donorCount(), 1);
        assertEq(Nox.decrypt(campaign.encryptedTotal()), 300e6);
    }

    function test_donate_revertsAfterDeadline() public {
        vm.warp(block.timestamp + 8 days);
        externalEuint256 encrypted = token.encryptForTest(100e6);

        vm.startPrank(alice);
        token.setOperator(address(campaign), uint48(block.timestamp + 1 hours));
        vm.expectRevert(ICampaign.DeadlinePassed.selector);
        campaign.donate(encrypted, "");
        vm.stopPrank();
    }

    // ---------------------------------------------------------------- Settle

    function test_settle_revertsBeforeDeadline() public {
        vm.expectRevert(ICampaign.DeadlineNotReached.selector);
        campaign.settle();
    }

    function test_settle_movesIntoSettlingState() public {
        _donate(campaign, alice, 500e6);
        vm.warp(block.timestamp + 8 days);

        campaign.settle();

        assertEq(uint256(campaign.state()), uint256(ICampaign.State.Settling));
        assertEq(campaign.settledAt(), uint64(block.timestamp));
    }

    function test_settle_revertsIfAlreadyCalled() public {
        vm.warp(block.timestamp + 8 days);
        campaign.settle();

        vm.expectRevert(ICampaign.AlreadyFinalState.selector);
        campaign.settle();
    }

    // ---------------------------------------------------------------- Withdraw

    function test_withdraw_recipientReceivesFullBalance() public {
        _donate(campaign, alice, 600e6);
        _donate(campaign, bob, 500e6);
        vm.warp(block.timestamp + 8 days);
        campaign.settle();

        vm.prank(recipient);
        campaign.withdraw();

        assertEq(uint256(campaign.state()), uint256(ICampaign.State.Withdrawn));
        assertEq(Nox.decrypt(token.confidentialBalanceOf(recipient)), 1_100e6);
    }

    function test_withdraw_revertsForNonRecipient() public {
        _donate(campaign, alice, 100e6);
        vm.warp(block.timestamp + 8 days);
        campaign.settle();

        vm.prank(alice);
        vm.expectRevert(ICampaign.NotRecipient.selector);
        campaign.withdraw();
    }

    function test_withdraw_revertsBeforeSettle() public {
        vm.prank(recipient);
        vm.expectRevert(ICampaign.NotSettling.selector);
        campaign.withdraw();
    }

    // ---------------------------------------------------------------- Refund

    function test_refund_revertsBeforeGrace() public {
        _donate(campaign, alice, 100e6);
        vm.warp(block.timestamp + 8 days);
        campaign.settle();

        vm.prank(alice);
        vm.expectRevert(ICampaign.RefundGraceNotElapsed.selector);
        campaign.refund();
    }

    function test_refund_donorRecoversFullContribution() public {
        _donate(campaign, alice, 400e6);
        _donate(campaign, bob, 200e6);
        vm.warp(block.timestamp + 8 days);
        campaign.settle();

        // Skip past the refund grace window.
        vm.warp(block.timestamp + REFUND_GRACE + 1);

        uint256 aliceBalanceBefore = Nox.decrypt(token.confidentialBalanceOf(alice));

        vm.prank(alice);
        campaign.refund();

        // Alice's raw token balance increases by exactly her contribution.
        assertEq(Nox.decrypt(token.confidentialBalanceOf(alice)) - aliceBalanceBefore, 400e6);

        // Campaign now in Refunding state, accounting cleared for alice.
        assertEq(uint256(campaign.state()), uint256(ICampaign.State.Refunding));
        assertFalse(campaign.hasDonated(alice));
        assertEq(campaign.donorCount(), 1); // bob still in
    }

    function test_refund_revertsIfNoContribution() public {
        _donate(campaign, alice, 100e6);
        vm.warp(block.timestamp + 8 days);
        campaign.settle();
        vm.warp(block.timestamp + REFUND_GRACE + 1);

        vm.prank(carol);
        vm.expectRevert(ICampaign.NoContribution.selector);
        campaign.refund();
    }

    function test_refund_revertsAfterWithdraw() public {
        _donate(campaign, alice, 100e6);
        vm.warp(block.timestamp + 8 days);
        campaign.settle();

        vm.prank(recipient);
        campaign.withdraw();

        vm.warp(block.timestamp + REFUND_GRACE + 1);
        vm.prank(alice);
        vm.expectRevert(ICampaign.AlreadyFinalState.selector);
        campaign.refund();
    }
}

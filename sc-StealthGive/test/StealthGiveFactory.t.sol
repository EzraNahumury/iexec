// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {Setup} from "./helpers/Setup.sol";
import {IStealthGiveFactory} from "../src/interfaces/IStealthGiveFactory.sol";
import {Campaign} from "../src/Campaign.sol";
import {ICampaign} from "../src/interfaces/ICampaign.sol";

contract StealthGiveFactoryTest is Setup {
    string internal constant URI = "ipfs://QmStealthGiveCampaignMetadataExampleHash";

    // ---------------------------------------------------------------- Construction

    function test_constructor_storesTokenAndGrace() public view {
        assertEq(address(factory.token()), address(token));
        assertEq(factory.refundGracePeriod(), REFUND_GRACE);
    }

    function test_constructor_revertsOnZeroToken() public {
        vm.expectRevert(bytes("Factory: zero token"));
        new StealthGiveFactoryClone(address(0), REFUND_GRACE);
    }

    function test_constructor_revertsOnZeroGrace() public {
        vm.expectRevert(bytes("Factory: zero grace"));
        new StealthGiveFactoryClone(address(token), 0);
    }

    // ---------------------------------------------------------------- createCampaign

    function test_createCampaign_happyPath() public {
        vm.prank(creator);
        address addr = factory.createCampaign(URI, 1_000e6, uint64(block.timestamp + 1 days), recipient);

        assertTrue(factory.isCampaign(addr));
        assertEq(factory.campaignCount(), 1);
        assertEq(factory.campaignAt(0), addr);

        Campaign c = Campaign(addr);
        assertEq(c.creator(), creator);
        assertEq(c.recipient(), recipient);
        assertEq(c.goal(), 1_000e6);
        assertEq(c.metadataURI(), URI);
        assertEq(uint256(c.state()), uint256(ICampaign.State.Active));
    }

    function test_createCampaign_emitsEvent() public {
        uint64 deadline = uint64(block.timestamp + 1 days);
        vm.prank(creator);
        // We cannot pre-compute the deployed address easily; use partial event matching.
        vm.expectEmit(false, true, true, true);
        emit IStealthGiveFactory.CampaignCreated(address(0), creator, recipient, 1_000e6, deadline, URI);
        factory.createCampaign(URI, 1_000e6, deadline, recipient);
    }

    function test_createCampaign_revertsOnPastDeadline() public {
        vm.prank(creator);
        vm.expectRevert(IStealthGiveFactory.InvalidDeadline.selector);
        factory.createCampaign(URI, 1_000e6, uint64(block.timestamp), recipient);
    }

    function test_createCampaign_revertsOnZeroRecipient() public {
        vm.prank(creator);
        vm.expectRevert(IStealthGiveFactory.InvalidRecipient.selector);
        factory.createCampaign(URI, 1_000e6, uint64(block.timestamp + 1 days), address(0));
    }

    function test_createCampaign_revertsOnZeroGoal() public {
        vm.prank(creator);
        vm.expectRevert(IStealthGiveFactory.InvalidGoal.selector);
        factory.createCampaign(URI, 0, uint64(block.timestamp + 1 days), recipient);
    }

    function test_createCampaign_revertsOnEmptyMetadata() public {
        vm.prank(creator);
        vm.expectRevert(IStealthGiveFactory.EmptyMetadata.selector);
        factory.createCampaign("", 1_000e6, uint64(block.timestamp + 1 days), recipient);
    }

    // ---------------------------------------------------------------- Listing

    function test_allCampaigns_returnsEverything() public {
        _createCampaign(1_000e6, 1 days, URI);
        _createCampaign(2_000e6, 1 days, URI);
        _createCampaign(3_000e6, 1 days, URI);

        address[] memory all = factory.allCampaigns();
        assertEq(all.length, 3);
        assertEq(factory.campaignCount(), 3);
    }
}

// Auxiliary clone of the factory used to test constructor reverts without
// importing it under a different name.
import {StealthGiveFactory} from "../src/StealthGiveFactory.sol";
import {IERC7984} from "@iexec-nox/nox-confidential-contracts/contracts/interfaces/IERC7984.sol";

contract StealthGiveFactoryClone is StealthGiveFactory {
    constructor(address tokenAddr, uint64 grace) StealthGiveFactory(IERC7984(tokenAddr), grace) {}
}

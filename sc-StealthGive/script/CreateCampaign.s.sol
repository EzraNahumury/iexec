// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {Script} from "forge-std/Script.sol";
import {console} from "forge-std/console.sol";

import {StealthGiveFactory} from "../src/StealthGiveFactory.sol";

/* ============================================================================
 * @title  CreateCampaign
 * @notice Helper script that creates a single Campaign through an already-
 *         deployed StealthGiveFactory. Useful for E2E demo scripting.
 *
 * Required env:
 *   - PRIVATE_KEY        : campaign creator key
 *   - FACTORY_ADDRESS    : deployed StealthGiveFactory
 *   - METADATA_URI       : IPFS / HTTPS URI of the campaign metadata JSON
 *   - GOAL               : plaintext fundraising target (in token base units)
 *   - DEADLINE_OFFSET    : seconds from now until the deadline
 *   - RECIPIENT          : address that can withdraw on success
 * ==========================================================================*/
contract CreateCampaign is Script {
    function run() external returns (address campaign) {
        uint256 creatorKey = vm.envUint("PRIVATE_KEY");
        address factoryAddress = vm.envAddress("FACTORY_ADDRESS");
        string memory metadataURI = vm.envString("METADATA_URI");
        uint256 goal = vm.envUint("GOAL");
        uint64 deadline = uint64(block.timestamp + vm.envUint("DEADLINE_OFFSET"));
        address recipient = vm.envAddress("RECIPIENT");

        StealthGiveFactory factory = StealthGiveFactory(factoryAddress);

        vm.startBroadcast(creatorKey);
        campaign = factory.createCampaign(metadataURI, goal, deadline, recipient);
        vm.stopBroadcast();

        console.log("Campaign deployed at: %s", campaign);
        console.log("Goal               : %s", goal);
        console.log("Deadline (unix)    : %s", deadline);
        console.log("Recipient          : %s", recipient);
        console.log("Metadata URI       : %s", metadataURI);
    }
}

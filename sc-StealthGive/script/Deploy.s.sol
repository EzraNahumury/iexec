// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import {Script} from "forge-std/Script.sol";
import {console} from "forge-std/console.sol";

import {IERC20} from "@openzeppelin/contracts/interfaces/IERC20.sol";
import {IERC7984} from "@iexec-nox/nox-confidential-contracts/contracts/interfaces/IERC7984.sol";

import {StealthGiveDollar} from "../src/StealthGiveDollar.sol";
import {ConfidentialSGD} from "../src/ConfidentialSGD.sol";
import {StealthGiveFactory} from "../src/StealthGiveFactory.sol";
import {CampaignRegistry} from "../src/CampaignRegistry.sol";

/* ============================================================================
 * @title  Deploy
 * @notice Deploys the full StealthGive stack on Arbitrum Sepolia:
 *
 *           1. StealthGiveDollar (SGD)        — public test ERC-20 with claim()
 *           2. ConfidentialSGD   (cSGD)       — iExec ERC-7984 wrapper of SGD
 *           3. StealthGiveFactory             — bound to cSGD
 *           4. CampaignRegistry               — view layer over the factory
 *
 * Required environment variables:
 *   - PRIVATE_KEY                : deployer key
 *
 * Optional environment variables:
 *   - REFUND_GRACE_PERIOD        : seconds donors wait after settle() before
 *                                  refund() opens. Default 7 days.
 *   - CONFIDENTIAL_TOKEN_ADDRESS : if set, *skip* deploying SGD + cSGD and
 *                                  bind the factory to this pre-existing
 *                                  Confidential Token address (e.g. iExec's
 *                                  official cUSDC).
 *
 * Usage:
 *   forge script script/Deploy.s.sol:Deploy \
 *     --rpc-url $ARB_SEPOLIA_RPC \
 *     --broadcast --verify --skip test
 * ==========================================================================*/
contract Deploy is Script {
    uint64 internal constant DEFAULT_REFUND_GRACE = 7 days;

    function run()
        external
        returns (
            StealthGiveDollar sgd,
            ConfidentialSGD cSGD,
            StealthGiveFactory factory,
            CampaignRegistry registry
        )
    {
        uint256 deployerKey = vm.envUint("PRIVATE_KEY");
        uint64 refundGrace = uint64(vm.envOr("REFUND_GRACE_PERIOD", uint256(DEFAULT_REFUND_GRACE)));
        address presetToken = vm.envOr("CONFIDENTIAL_TOKEN_ADDRESS", address(0));

        vm.startBroadcast(deployerKey);

        IERC7984 confidentialToken;

        if (presetToken == address(0)) {
            // Fresh stack: deploy our own SGD + cSGD wrapper.
            sgd = new StealthGiveDollar();
            cSGD = new ConfidentialSGD(IERC20(address(sgd)));
            confidentialToken = IERC7984(address(cSGD));
        } else {
            // Bind to a pre-existing Confidential Token (e.g. official cUSDC).
            confidentialToken = IERC7984(presetToken);
        }

        factory = new StealthGiveFactory(confidentialToken, refundGrace);
        registry = new CampaignRegistry(factory);

        vm.stopBroadcast();

        console.log("=== StealthGive deployment ===");
        if (address(sgd) != address(0)) {
            console.log("SGD (underlying)      : %s", address(sgd));
            console.log("cSGD (confidential)   : %s", address(cSGD));
        } else {
            console.log("Confidential Token    : %s (preset)", presetToken);
        }
        console.log("Refund grace (s)      : %s", refundGrace);
        console.log("StealthGiveFactory    : %s", address(factory));
        console.log("CampaignRegistry      : %s", address(registry));
    }
}

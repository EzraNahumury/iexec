// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import {ERC20} from "@openzeppelin/contracts/token/ERC20/ERC20.sol";

/* ============================================================================
 * @title  StealthGiveDollar (SGD)
 * @notice Public, freely-claimable test ERC-20 used as the *underlying* asset
 *         for the StealthGive Confidential Token (`ConfidentialSGD` / cSGD).
 *
 *         Built specifically to bypass the practical friction of relying on
 *         Circle's USDC faucet (blocked in several jurisdictions including
 *         Indonesia). Anyone, anywhere, with any wallet, can:
 *
 *           1. Call `claim()` once every 24 hours → receive 1,000 SGD
 *           2. Wrap SGD into cSGD via the iExec ERC-7984 wrapper
 *           3. Donate cSGD privately on StealthGive
 *
 *         No KYC, no captcha, no gatekeeper.
 *
 * @dev Decimals are 6 to match the USDC convention so amounts compose cleanly
 *      with the rest of the cDeFi ecosystem.
 * ==========================================================================*/
contract StealthGiveDollar is ERC20 {
    /// @notice Tokens minted per `claim()` call.
    uint256 public constant DRIP = 1_000e6; // 1,000 SGD

    /// @notice Minimum interval between successive claims by the same address.
    uint64 public constant COOLDOWN = 24 hours;

    /// @notice Last claim timestamp per address.
    mapping(address claimer => uint64) public lastClaim;

    error CooldownActive(uint64 nextClaimAt);

    event Claimed(address indexed claimer, uint256 amount, uint64 nextClaimAt);

    constructor() ERC20("StealthGive Dollar", "SGD") {}

    /// @inheritdoc ERC20
    function decimals() public pure override returns (uint8) {
        return 6;
    }

    /**
     * @notice Mint `DRIP` SGD to the caller. Rate-limited to once per
     *         `COOLDOWN` window per address. Anyone can call.
     */
    function claim() external {
        uint64 nextClaimAt = lastClaim[msg.sender] + COOLDOWN;
        if (block.timestamp < nextClaimAt && lastClaim[msg.sender] != 0) {
            revert CooldownActive(nextClaimAt);
        }

        lastClaim[msg.sender] = uint64(block.timestamp);
        _mint(msg.sender, DRIP);

        emit Claimed(msg.sender, DRIP, uint64(block.timestamp) + COOLDOWN);
    }
}

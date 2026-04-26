// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import {IERC20} from "@openzeppelin/contracts/interfaces/IERC20.sol";

import {ERC7984} from "@iexec-nox/nox-confidential-contracts/contracts/token/ERC7984.sol";
import {ERC20ToERC7984Wrapper} from
    "@iexec-nox/nox-confidential-contracts/contracts/token/extensions/ERC20ToERC7984Wrapper.sol";

/* ============================================================================
 * @title  ConfidentialSGD (cSGD)
 * @notice Concrete iExec ERC-7984 confidential token that wraps the public
 *         `StealthGiveDollar` (SGD) test asset 1:1. Donations on StealthGive
 *         are denominated in cSGD so per-donor amounts stay encrypted on
 *         chain.
 *
 *         Lifecycle:
 *
 *           SGD.claim()           ─► user holds plaintext SGD
 *           SGD.approve(cSGD, n)  ─► user authorises the wrapper
 *           cSGD.wrap(user, n)    ─► SGD locked, encrypted cSGD minted
 *           Campaign.donate(...)  ─► confidential transfer to campaign
 *           cSGD.unwrap(...)      ─► (later) recipient turns cSGD back into
 *                                   plaintext SGD if needed
 *
 *         All cSGD balance/transfer amounts live as `euint256` handles inside
 *         the iExec Nox TEE — never visible in plaintext on chain.
 * ==========================================================================*/
contract ConfidentialSGD is ERC20ToERC7984Wrapper {
    constructor(IERC20 underlying)
        ERC7984("Confidential StealthGive Dollar", "cSGD", "")
        ERC20ToERC7984Wrapper(underlying)
    {}
}

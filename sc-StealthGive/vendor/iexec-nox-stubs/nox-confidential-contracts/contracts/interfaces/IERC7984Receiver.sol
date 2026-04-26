// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {euint256, ebool} from "@iexec-nox/nox-protocol-contracts/contracts/sdk/Nox.sol";

/* ============================================================================
 * @title  IERC7984Receiver — receiver hook for confidentialTransferAndCall
 * @notice Contracts that wish to accept confidential-token transfers via the
 *         single-tx `confidentialTransferAndCall` flow must implement this
 *         interface. Returning an encrypted-true `ebool` accepts the
 *         transfer; returning encrypted-false reverts the transfer.
 * ==========================================================================*/
interface IERC7984Receiver {
    function onConfidentialTransferReceived(
        address operator,
        address from,
        euint256 amount,
        bytes calldata data
    ) external returns (ebool);
}

// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {euint256, externalEuint256, ebool} from "@iexec-nox/nox-protocol-contracts/contracts/sdk/Nox.sol";

/* ============================================================================
 * @title  IERC7984 — Confidential Token interface (stub)
 * @notice Mirrors the public ABI of the real `@iexec-nox/nox-confidential-
 *         contracts` IERC7984 so StealthGive contracts compile against the
 *         same import path. Replace the vendor stub with the real npm
 *         package before deployment by editing `remappings.txt`.
 * ==========================================================================*/
interface IERC7984 {
    // -------------------------------------------------------- Events
    event ConfidentialTransfer(address indexed from, address indexed to);
    event OperatorSet(address indexed owner, address indexed spender, uint48 until);

    // -------------------------------------------------------- Balances
    function confidentialBalanceOf(address account) external view returns (euint256);

    // -------------------------------------------------------- Transfers
    function confidentialTransfer(address to, euint256 amount) external returns (euint256);

    function confidentialTransfer(address to, externalEuint256 amount, bytes calldata inputProof)
        external
        returns (euint256);

    function confidentialTransferFrom(address from, address to, euint256 amount) external returns (euint256);

    function confidentialTransferFrom(
        address from,
        address to,
        externalEuint256 amount,
        bytes calldata inputProof
    ) external returns (euint256);

    function confidentialTransferAndCall(
        address recipient,
        externalEuint256 amount,
        bytes calldata inputProof,
        bytes calldata data
    ) external returns (euint256);

    function confidentialTransferAndCall(address recipient, euint256 amount, bytes calldata data)
        external
        returns (euint256);

    // -------------------------------------------------------- Operator approvals
    function setOperator(address spender, uint48 until) external;
    function isOperator(address owner, address spender) external view returns (bool);
}

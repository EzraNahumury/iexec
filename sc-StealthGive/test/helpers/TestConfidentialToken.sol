// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {Nox, euint256, externalEuint256} from "@iexec-nox/nox-protocol-contracts/contracts/sdk/Nox.sol";
import {ERC7984} from "@iexec-nox/nox-confidential-contracts/contracts/token/ERC7984.sol";

/* ============================================================================
 * @title  TestConfidentialToken
 * @notice Test-only concrete instance of the ERC-7984 stub. Adds an
 *         unrestricted mint function and a plaintext minting helper so unit
 *         tests can fund donor addresses without going through the real iExec
 *         CDeFi faucet.
 *
 *         WARNING: this contract MUST NEVER be deployed outside of `forge
 *         test`. It re-exports plaintext token mechanics that defeat all
 *         confidentiality guarantees of the production iExec Nox runtime.
 * ==========================================================================*/
contract TestConfidentialToken is ERC7984 {
    constructor() ERC7984("Test Confidential USDC", "tcUSDC", "") {}

    /// @notice Mint plaintext `amount` tokens to `to` (test-only).
    function mintPlain(address to, uint256 amount) external {
        _mint(to, Nox.toEuint256(amount));
    }

    /// @notice Encode a plaintext `amount` as an `externalEuint256` so test
    ///         code can build the same call shape donors use in production.
    function encryptForTest(uint256 amount) external pure returns (externalEuint256) {
        return externalEuint256.wrap(bytes32(amount));
    }
}

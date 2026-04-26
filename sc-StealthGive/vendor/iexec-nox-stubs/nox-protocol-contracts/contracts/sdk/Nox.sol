// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

/* ============================================================================
 * @title  Nox SDK — local compile-time stub
 * @notice This file is a STUB used so the StealthGive contracts compile and
 *         unit-test offline without the real iExec Nox runtime.
 *
 *         At deployment / production time the real package
 *         `@iexec-nox/nox-protocol-contracts` (installed via npm) takes over
 *         via the foundry remapping configured in `remappings.txt`. The real
 *         encrypted types are opaque handles managed by Nox precompiles and
 *         the iExec TEE worker fleet. The stub below mimics the public ABI
 *         using plaintext arithmetic so Solidity logic can be exercised by
 *         `forge test`. It is NOT private, NOT secure, and MUST be replaced
 *         with the real package before mainnet/testnet deployment.
 * ==========================================================================*/

/// @notice Opaque handle to a confidential 256-bit unsigned integer.
type euint256 is bytes32;

/// @notice User-submitted encrypted 256-bit handle (must be validated via
///         `Nox.fromExternal` before being used in encrypted arithmetic).
type externalEuint256 is bytes32;

/// @notice Opaque handle to a confidential boolean.
type ebool is bytes32;

library Nox {
    // ---------------------------------------------------------------------
    // Conversion helpers
    // ---------------------------------------------------------------------

    /// @notice Validate a user-submitted external handle and return an
    ///         internal handle usable in confidential arithmetic.
    /// @dev Real implementation verifies an EIP-712 / TEE attestation proof.
    function fromExternal(externalEuint256 value, bytes calldata /*inputProof*/)
        internal
        pure
        returns (euint256)
    {
        return euint256.wrap(externalEuint256.unwrap(value));
    }

    /// @notice Promote a plaintext `uint256` into an encrypted handle.
    function toEuint(uint256 value) internal pure returns (euint256) {
        return euint256.wrap(bytes32(value));
    }

    /// @notice Promote a plaintext `bool` into an encrypted handle.
    function toEbool(bool value) internal pure returns (ebool) {
        return ebool.wrap(bytes32(uint256(value ? 1 : 0)));
    }

    /// @notice STUB-ONLY direct decryption (real Nox decrypts via TEE oracle).
    function decrypt(euint256 value) internal pure returns (uint256) {
        return uint256(euint256.unwrap(value));
    }

    /// @notice STUB-ONLY direct decryption of an encrypted boolean.
    function decryptBool(ebool value) internal pure returns (bool) {
        return uint256(ebool.unwrap(value)) != 0;
    }

    // ---------------------------------------------------------------------
    // Arithmetic
    // ---------------------------------------------------------------------

    function add(euint256 a, euint256 b) internal pure returns (euint256) {
        unchecked {
            return euint256.wrap(bytes32(uint256(euint256.unwrap(a)) + uint256(euint256.unwrap(b))));
        }
    }

    function sub(euint256 a, euint256 b) internal pure returns (euint256) {
        unchecked {
            return euint256.wrap(bytes32(uint256(euint256.unwrap(a)) - uint256(euint256.unwrap(b))));
        }
    }

    function safeAdd(euint256 a, euint256 b) internal pure returns (euint256) {
        return euint256.wrap(bytes32(uint256(euint256.unwrap(a)) + uint256(euint256.unwrap(b))));
    }

    function safeSub(euint256 a, euint256 b) internal pure returns (euint256) {
        return euint256.wrap(bytes32(uint256(euint256.unwrap(a)) - uint256(euint256.unwrap(b))));
    }

    // ---------------------------------------------------------------------
    // Comparisons (return ebool handles)
    // ---------------------------------------------------------------------

    function eq(euint256 a, euint256 b) internal pure returns (ebool) {
        return ebool.wrap(bytes32(uint256(euint256.unwrap(a) == euint256.unwrap(b) ? 1 : 0)));
    }

    function ne(euint256 a, euint256 b) internal pure returns (ebool) {
        return ebool.wrap(bytes32(uint256(euint256.unwrap(a) != euint256.unwrap(b) ? 1 : 0)));
    }

    function lt(euint256 a, euint256 b) internal pure returns (ebool) {
        return ebool.wrap(bytes32(uint256(uint256(euint256.unwrap(a)) < uint256(euint256.unwrap(b)) ? 1 : 0)));
    }

    function le(euint256 a, euint256 b) internal pure returns (ebool) {
        return ebool.wrap(bytes32(uint256(uint256(euint256.unwrap(a)) <= uint256(euint256.unwrap(b)) ? 1 : 0)));
    }

    function gt(euint256 a, euint256 b) internal pure returns (ebool) {
        return ebool.wrap(bytes32(uint256(uint256(euint256.unwrap(a)) > uint256(euint256.unwrap(b)) ? 1 : 0)));
    }

    function ge(euint256 a, euint256 b) internal pure returns (ebool) {
        return ebool.wrap(bytes32(uint256(uint256(euint256.unwrap(a)) >= uint256(euint256.unwrap(b)) ? 1 : 0)));
    }

    /// @notice Encrypted ternary: returns `ifTrue` when `cond` is encrypted-true.
    function select(ebool cond, euint256 ifTrue, euint256 ifFalse) internal pure returns (euint256) {
        return uint256(ebool.unwrap(cond)) != 0 ? ifTrue : ifFalse;
    }

    // ---------------------------------------------------------------------
    // Access control (no-ops in stub; real Nox enforces TEE-side ACLs)
    // ---------------------------------------------------------------------

    function allow(euint256, address) internal {}
    function allow(ebool, address) internal {}
    function allowThis(euint256) internal {}
    function allowThis(ebool) internal {}
    function allowTransient(euint256, address) internal {}
    function allowTransient(ebool, address) internal {}
    function addViewer(euint256, address) internal {}
    function allowPublicDecryption(euint256) internal {}
    function allowPublicDecryption(ebool) internal {}
}

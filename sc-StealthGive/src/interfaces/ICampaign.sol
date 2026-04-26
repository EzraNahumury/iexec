// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {externalEuint256} from "@iexec-nox/nox-protocol-contracts/contracts/sdk/Nox.sol";

/// @title  ICampaign
/// @notice Public interface for a single StealthGive campaign instance.
interface ICampaign {
    /* ============================================================== State */

    enum State {
        Active, // accepting donations until deadline
        Settling, // deadline passed; total raised marked publicly decryptable
        Withdrawn, // recipient has claimed funds
        Refunding // refund grace expired without recipient withdrawal
    }

    /* ============================================================== Events */

    event Donated(address indexed donor);
    event Settled(uint64 settledAt);
    event Withdrawn(address indexed recipient);
    event Refunded(address indexed donor);

    /* ============================================================== Errors */

    error NotActive();
    error DeadlinePassed();
    error DeadlineNotReached();
    error NotSettling();
    error NotRecipient();
    error RefundGraceNotElapsed();
    error NoContribution();
    error AlreadyFinalState();

    /* ============================================================== Public state
     *
     * Note: declarations that overlap with public state variables in the base
     * `ConfidentialEscrow` contract (`token`, `hasDonated`, `donorCount`,
     * `encryptedTotal`, `myContribution`) are intentionally omitted here to
     * avoid Solidity override conflicts. They remain available on every
     * Campaign instance via the auto-generated getters of those state
     * variables.
     */

    function creator() external view returns (address);
    function recipient() external view returns (address);
    function goal() external view returns (uint256);
    function deadline() external view returns (uint64);
    function settledAt() external view returns (uint64);
    function refundGracePeriod() external view returns (uint64);
    function metadataURI() external view returns (string memory);
    function state() external view returns (State);

    /* ============================================================== Mutating actions */

    function donate(externalEuint256 encryptedAmount, bytes calldata inputProof) external;
    function settle() external;
    function withdraw() external;
    function refund() external;
}

import {parseGwei} from "viem";

/**
 * Sane gas overrides for Arbitrum Sepolia.
 *
 * Why: some wallets (notably MetaMask forks like Vibe) estimate
 * `maxFeePerGas` from a stale block and end up *below* the current base fee,
 * which makes the RPC reject the transaction with
 * "max fee per gas less than block base fee".
 *
 * 1 gwei is ~50× higher than the typical Arbitrum Sepolia base fee
 * (~0.02 gwei), so it always passes and the user only pays the real base fee
 * anyway (the rest of the cap is refunded). Priority fee is 0 because the
 * Arbitrum sequencer sequences by arrival, not bid.
 */
export const arbSepoliaGas = {
    maxFeePerGas: parseGwei("1"),
    maxPriorityFeePerGas: 0n,
} as const;

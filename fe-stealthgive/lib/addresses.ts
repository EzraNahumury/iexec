// ============================================================================
// Deployed contract addresses on Arbitrum Sepolia (chain id 421614).
// Re-deploy via `forge script script/Deploy.s.sol --broadcast` and update
// these addresses if you spin up a new stack.
// ============================================================================

import {arbitrumSepolia} from "wagmi/chains";

export const ACTIVE_CHAIN_ID = arbitrumSepolia.id;

export const addresses = {
    [arbitrumSepolia.id]: {
        sgd: "0xCA662c692e67A5ec3402D13327895eA762F702Bb" as const,
        cSGD: "0xa89340C4BC163ced823653d09DB1E1ba65Ca6849" as const,
        // v2: factory now also opens public decryption of the aggregate total on
        // every donation, so live "raised" can be displayed without waiting for
        // settlement.
        factory: "0xbD124A4C743847f5862024906B66ABeDeB9cCB6e" as const,
        registry: "0x1023b4ff42c3Ed560B07b9A705E9A2d0Fc465DC4" as const,
    },
} as const;

export type SupportedChainId = keyof typeof addresses;

export function getAddresses(chainId: number) {
    if (!(chainId in addresses)) {
        throw new Error(`Unsupported chain ${chainId}; deploy contracts first.`);
    }
    return addresses[chainId as SupportedChainId];
}

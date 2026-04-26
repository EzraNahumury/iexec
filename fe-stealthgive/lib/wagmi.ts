"use client";

import {getDefaultConfig} from "@rainbow-me/rainbowkit";
import {arbitrumSepolia} from "wagmi/chains";
import {http} from "wagmi";

export const wagmiConfig = getDefaultConfig({
    appName: "StealthGive",
    // Get a free WalletConnect project id at https://cloud.walletconnect.com
    projectId: process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID || "stealthgive-dev",
    chains: [arbitrumSepolia],
    transports: {
        [arbitrumSepolia.id]: http("https://sepolia-rollup.arbitrum.io/rpc"),
    },
    ssr: true,
});

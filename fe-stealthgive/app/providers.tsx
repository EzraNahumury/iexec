"use client";

import {RainbowKitProvider, lightTheme} from "@rainbow-me/rainbowkit";
import "@rainbow-me/rainbowkit/styles.css";
import {QueryClient, QueryClientProvider} from "@tanstack/react-query";
import {useState, type ReactNode} from "react";
import {WagmiProvider} from "wagmi";

import {wagmiConfig} from "@/lib/wagmi";

export function Providers({children}: {children: ReactNode}) {
    const [queryClient] = useState(() => new QueryClient());

    return (
        <WagmiProvider config={wagmiConfig}>
            <QueryClientProvider client={queryClient}>
                <RainbowKitProvider
                    locale="en-US"
                    theme={lightTheme({
                        accentColor: "#18181b",
                        accentColorForeground: "white",
                        borderRadius: "large",
                        fontStack: "system",
                        overlayBlur: "small",
                    })}
                    showRecentTransactions
                >
                    {children}
                </RainbowKitProvider>
            </QueryClientProvider>
        </WagmiProvider>
    );
}

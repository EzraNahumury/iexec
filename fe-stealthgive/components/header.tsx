"use client";

import {ConnectButton} from "@rainbow-me/rainbowkit";
import Link from "next/link";

export function Header() {
    return (
        <header className="border-b border-zinc-800 bg-zinc-950/90 backdrop-blur sticky top-0 z-50">
            <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
                <div className="flex items-center gap-8">
                    <Link href="/" className="flex items-center gap-2 group">
                        <span className="text-2xl">🦑</span>
                        <span className="font-semibold text-lg group-hover:text-violet-400 transition-colors">
                            StealthGive
                        </span>
                    </Link>
                    <nav className="hidden md:flex items-center gap-6 text-sm">
                        <Link
                            href="/campaigns"
                            className="text-zinc-400 hover:text-zinc-100 transition-colors"
                        >
                            Browse Campaigns
                        </Link>
                        <Link
                            href="/create"
                            className="text-zinc-400 hover:text-zinc-100 transition-colors"
                        >
                            Create Campaign
                        </Link>
                        <Link
                            href="/dashboard"
                            className="text-zinc-400 hover:text-zinc-100 transition-colors"
                        >
                            Dashboard
                        </Link>
                        <Link
                            href="/audit"
                            className="text-zinc-400 hover:text-zinc-100 transition-colors"
                        >
                            Audit
                        </Link>
                    </nav>
                </div>
                <ConnectButton
                    accountStatus={{smallScreen: "avatar", largeScreen: "full"}}
                    showBalance={{smallScreen: false, largeScreen: true}}
                    chainStatus="icon"
                />
            </div>
        </header>
    );
}

"use client";

import {ArrowUpRight} from "lucide-react";
import {ConnectButton} from "@rainbow-me/rainbowkit";
import Link from "next/link";
import {usePathname} from "next/navigation";

const navLinks = [
    {label: "Resources", href: "https://docs.iex.ec/nox-protocol/getting-started/welcome", external: true},
    {label: "Browse", href: "/campaigns"},
    {label: "Audit", href: "/audit"},
];

export function Header() {
    const pathname = usePathname();
    const isLanding = pathname === "/";

    return (
        <header
            className={`sticky top-0 z-50 ${
                isLanding
                    ? "bg-white/80 backdrop-blur border-b border-transparent"
                    : "bg-white/95 backdrop-blur border-b border-zinc-200"
            }`}
        >
            <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
                <Link href="/" className="flex items-center gap-2.5 group">
                    <span className="size-8 rounded-full bg-zinc-900 text-white inline-flex items-center justify-center text-sm">
                        🦑
                    </span>
                    <span className="font-semibold tracking-wide group-hover:text-zinc-700 transition-colors">
                        StealthGive
                    </span>
                </Link>

                <nav className="hidden md:flex items-center gap-8 text-[11px] tracking-[0.18em] uppercase text-zinc-600">
                    {navLinks.map(link =>
                        link.external ? (
                            <a
                                key={link.href}
                                href={link.href}
                                target="_blank"
                                rel="noreferrer"
                                className="hover:text-zinc-900 transition-colors"
                            >
                                {link.label}
                            </a>
                        ) : (
                            <Link
                                key={link.href}
                                href={link.href}
                                className="hover:text-zinc-900 transition-colors"
                            >
                                {link.label}
                            </Link>
                        ),
                    )}
                </nav>

                {isLanding ? (
                    <Link
                        href="/welcome"
                        className="inline-flex items-center gap-2 rounded-full bg-zinc-900 hover:bg-zinc-800 text-white text-[11px] font-semibold tracking-[0.16em] uppercase px-5 py-2.5 transition-colors"
                    >
                        Launch App
                        <span className="inline-flex items-center justify-center size-6 rounded-full border border-white/30">
                            <ArrowUpRight className="size-3" />
                        </span>
                    </Link>
                ) : (
                    <ConnectButton
                        accountStatus={{smallScreen: "avatar", largeScreen: "full"}}
                        showBalance={{smallScreen: false, largeScreen: true}}
                        chainStatus="icon"
                    />
                )}
            </div>
        </header>
    );
}

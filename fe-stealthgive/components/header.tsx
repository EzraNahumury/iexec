"use client";

import {ArrowUpRight} from "lucide-react";
import {ConnectButton} from "@rainbow-me/rainbowkit";
import Image from "next/image";
import Link from "next/link";
import {usePathname} from "next/navigation";
import {useEffect, useState} from "react";

const landingNav = [
    {label: "Resources", href: "https://docs.iex.ec/nox-protocol/getting-started/welcome", external: true},
    {label: "Browse", href: "/campaigns"},
    {label: "Audit", href: "/audit"},
];

const appNav = [
    {label: "Browse Campaigns", href: "/campaigns", external: false},
    {label: "Create Campaign", href: "/create", external: false},
    {label: "Dashboard", href: "/dashboard", external: false},
    {label: "Audit", href: "/audit", external: false},
];

export function Header() {
    const pathname = usePathname();
    // "Landing context" = the public-facing pages (home + welcome gate).
    // Everywhere else is "app context" — the wallet-connected dApp.
    const isLanding = pathname === "/" || pathname === "/welcome";
    const navLinks = isLanding ? landingNav : appNav;
    const [scrolled, setScrolled] = useState(false);

    useEffect(() => {
        const handle = () => setScrolled(window.scrollY > 32);
        handle();
        window.addEventListener("scroll", handle, {passive: true});
        return () => window.removeEventListener("scroll", handle);
    }, []);

    // At the very top of every page the header is solid white so the dark
    // banner / hero artwork doesn't bleed through. Once the user scrolls
    // past the first ~32px the bar fades to a translucent frosted-glass
    // panel that lets a hint of the page beneath show through.
    const bgClass = scrolled
        ? "bg-white/75 backdrop-blur-md border-b border-zinc-200/60"
        : "bg-white border-b border-transparent";

    return (
        <header
            className={`sticky top-0 z-50 transition-[background-color,border-color,backdrop-filter] duration-300 ${bgClass}`}
        >
            <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
                <Link href="/" className="flex items-center gap-2.5 group">
                    <span className="size-9 inline-flex items-center justify-center overflow-hidden">
                        <Image
                            src="/logo-new.png"
                            alt="StealthGive logo"
                            width={36}
                            height={36}
                            className="size-full object-contain"
                            priority
                        />
                    </span>
                    <span className="font-semibold tracking-wide text-zinc-900 group-hover:text-zinc-700 transition-colors">
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

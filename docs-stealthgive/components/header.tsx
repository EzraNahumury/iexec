"use client";

import {Menu, Search} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import {usePathname} from "next/navigation";
import {useEffect, useState} from "react";

import {sidebarNav} from "@/lib/nav";

import {SearchPalette} from "./search-palette";

/**
 * Editorial header — a hairline ribbon. No glass, no shadow.
 * Left: monogram + small wordmark. Right: live route breadcrumb in mono,
 * search trigger as an underlined sentence, GitHub mark.
 */
export function Header({onToggleSidebar}: {onToggleSidebar?: () => void}) {
    const [searchOpen, setSearchOpen] = useState(false);
    const pathname = usePathname();

    useEffect(() => {
        const onKey = (e: KeyboardEvent) => {
            if ((e.ctrlKey || e.metaKey) && e.key === "k") {
                e.preventDefault();
                setSearchOpen(true);
            }
            if (e.key === "Escape") setSearchOpen(false);
        };
        window.addEventListener("keydown", onKey);
        return () => window.removeEventListener("keydown", onKey);
    }, []);

    /* Compute § label like §02·01 from sidebar position. */
    let folio = "§00·00";
    let breadcrumb = "Dossier";
    outer: for (let s = 0; s < sidebarNav.length; s++) {
        const sec = sidebarNav[s];
        for (let i = 0; i < sec.items.length; i++) {
            if (sec.items[i].href === pathname) {
                folio = `§${String(s + 1).padStart(2, "0")}·${String(i + 1).padStart(2, "0")}`;
                breadcrumb = `${sec.title} ↳ ${sec.items[i].title}`;
                break outer;
            }
        }
    }

    return (
        <>
            <header className="sticky top-0 z-40 bg-[var(--paper)]/85 backdrop-blur-sm border-b border-[var(--rule)]">
                <div className="h-14 px-4 md:px-8 flex items-center gap-6">
                    {/* Mobile menu */}
                    <button
                        onClick={onToggleSidebar}
                        className="lg:hidden size-8 inline-flex items-center justify-center text-[var(--graphite)] hover:text-[var(--ink)]"
                        aria-label="Toggle sidebar"
                    >
                        <Menu className="size-[18px]" />
                    </button>

                    {/* Brand block */}
                    <Link href="/" className="flex items-center gap-3 group shrink-0">
                        <span className="size-7 inline-flex items-center justify-center">
                            <Image
                                src="/logo.png"
                                alt="StealthGive"
                                width={28}
                                height={28}
                                className="size-full object-contain"
                                priority
                            />
                        </span>
                        <span className="flex items-baseline gap-2 leading-none">
                            <span className="font-display text-[17px] tracking-tight text-[var(--ink)]">
                                Stealth<span className="font-italic-ed italic">Give</span>
                            </span>
                            <span className="hidden sm:inline-block smallcaps">Dossier</span>
                        </span>
                    </Link>

                    {/* Center — running breadcrumb */}
                    <div className="hidden md:flex items-center gap-3 flex-1 min-w-0">
                        <span className="h-3.5 w-px bg-[var(--rule)]" />
                        <span className="font-mono-ed text-[11px] text-[var(--pencil)] truncate">
                            {breadcrumb}
                        </span>
                    </div>

                    {/* Search — as a typographic sentence */}
                    <button
                        onClick={() => setSearchOpen(true)}
                        className="group inline-flex items-center gap-2 text-[13px] text-[var(--graphite)] hover:text-[var(--ink)] transition-colors"
                    >
                        <Search className="size-3.5" />
                        <span className="hidden sm:inline link-ink">
                            search the manual
                        </span>
                        <span className="sm:hidden">Search</span>
                        <kbd className="hidden md:inline-flex font-mono-ed text-[10px] tracking-[0.05em] text-[var(--pencil)] ml-1">
                            ⌘K
                        </kbd>
                    </button>

                    {/* GitHub */}
                    <a
                        href="https://github.com/EzraNahumury/iexec"
                        target="_blank"
                        rel="noreferrer"
                        className="text-[var(--graphite)] hover:text-[var(--ink)] transition-colors"
                        aria-label="GitHub"
                    >
                        <svg
                            viewBox="0 0 24 24"
                            fill="currentColor"
                            className="size-[16px]"
                            aria-hidden
                        >
                            <path d="M12 .5C5.7.5.5 5.7.5 12c0 5.1 3.3 9.4 7.9 10.9.6.1.8-.2.8-.5v-2c-3.2.7-3.9-1.4-3.9-1.4-.5-1.3-1.3-1.7-1.3-1.7-1-.7.1-.7.1-.7 1.2.1 1.8 1.2 1.8 1.2 1 1.8 2.7 1.3 3.4 1 .1-.8.4-1.3.7-1.6-2.5-.3-5.2-1.3-5.2-5.7 0-1.3.4-2.3 1.2-3.1-.1-.3-.5-1.5.1-3.1 0 0 1-.3 3.2 1.2.9-.3 1.9-.4 2.9-.4s2 .1 2.9.4c2.2-1.5 3.2-1.2 3.2-1.2.6 1.6.2 2.8.1 3.1.7.8 1.2 1.8 1.2 3.1 0 4.4-2.7 5.4-5.2 5.7.4.4.8 1.1.8 2.2v3.3c0 .3.2.7.8.5 4.6-1.5 7.9-5.8 7.9-10.9C23.5 5.7 18.3.5 12 .5z" />
                        </svg>
                    </a>

                    {/* Folio (page §) */}
                    <span className="hidden sm:inline-block folio">{folio}</span>
                </div>
            </header>

            <SearchPalette open={searchOpen} onClose={() => setSearchOpen(false)} />
        </>
    );
}

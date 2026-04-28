"use client";

import Link from "next/link";
import {usePathname} from "next/navigation";

import {sidebarNav} from "@/lib/nav";

/**
 * Editorial sidebar — index of a printed manual.
 * Section titles in mono small caps, leaf items in body sans, active
 * item rendered in serif italic with a vault-coloured § marker.
 */
export function Sidebar({onNavigate}: {onNavigate?: () => void}) {
    const pathname = usePathname();

    return (
        <aside className="h-full overflow-y-auto scrollbar-thin pt-12 pb-16 pr-2">
            {/* Manuscript heading */}
            <div className="mb-10 pl-1">
                <div className="smallcaps mb-2">Index</div>
                <p className="font-display text-[15px] leading-snug text-[var(--ink)]">
                    A working manual,
                    <br />
                    <span className="font-italic-ed italic text-[var(--graphite)]">
                        in four parts.
                    </span>
                </p>
            </div>

            <nav className="space-y-9">
                {sidebarNav.map((section, sIdx) => (
                    <div key={section.title}>
                        <div className="flex items-baseline gap-2 mb-3 pl-1">
                            <span className="font-mono-ed text-[10px] tracking-[0.16em] text-[var(--pencil)] tabular-nums">
                                §{String(sIdx + 1).padStart(2, "0")}
                            </span>
                            <span className="smallcaps text-[var(--graphite)]">
                                {section.title}
                            </span>
                        </div>
                        <ul>
                            {section.items.map((item, iIdx) => {
                                const active = pathname === item.href;
                                return (
                                    <li key={item.href} className="group">
                                        <Link
                                            href={item.href}
                                            onClick={onNavigate}
                                            className={`relative flex items-baseline gap-3 py-1.5 pl-1 pr-2 transition-colors ${
                                                active
                                                    ? "text-[var(--ink)]"
                                                    : "text-[var(--graphite)] hover:text-[var(--ink)]"
                                            }`}
                                        >
                                            {/* Hairline tick */}
                                            <span
                                                className={`font-mono-ed text-[10px] tabular-nums shrink-0 transition-colors ${
                                                    active ? "text-[var(--vault)]" : "text-[var(--rule)] group-hover:text-[var(--pencil)]"
                                                }`}
                                            >
                                                {String(iIdx + 1).padStart(2, "0")}
                                            </span>
                                            <span
                                                className={
                                                    active
                                                        ? "font-italic-ed italic text-[16px] leading-none text-[var(--ink)]"
                                                        : "text-[14px] leading-none"
                                                }
                                            >
                                                {item.title}
                                            </span>
                                            {/* Active marker */}
                                            {active && (
                                                <span className="ml-auto size-1.5 rounded-full bg-[var(--vault)] animate-blink" />
                                            )}
                                        </Link>
                                    </li>
                                );
                            })}
                        </ul>
                    </div>
                ))}
            </nav>

            {/* Colophon */}
            <div className="mt-14 pl-1 pr-2 pt-6 border-t border-[var(--rule)]">
                <div className="smallcaps mb-2">Colophon</div>
                <p className="text-[12px] leading-relaxed text-[var(--graphite)]">
                    Set in <span className="font-italic-ed italic">Fraunces</span>{" "}
                    &amp; <span className="font-italic-ed italic">Instrument Serif</span>.
                    Composed for the iExec Vibe Coding Challenge,{" "}
                    <span className="font-mono-ed">apr · mmxxvi</span>.
                </p>
            </div>
        </aside>
    );
}

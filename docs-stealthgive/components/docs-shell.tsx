"use client";

import {ArrowLeft, ArrowRight} from "lucide-react";
import Link from "next/link";
import {usePathname} from "next/navigation";
import {useState, type ReactNode} from "react";

import {flatNav} from "@/lib/nav";

import {Header} from "./header";
import {Sidebar} from "./sidebar";
import {TableOfContents, type TocItem} from "./toc";

export function DocsShell({children, toc}: {children: ReactNode; toc: TocItem[]}) {
    const pathname = usePathname();
    const [mobileOpen, setMobileOpen] = useState(false);

    const idx = flatNav.findIndex(n => n.href === pathname);
    const prev = idx > 0 ? flatNav[idx - 1] : null;
    const next = idx >= 0 && idx < flatNav.length - 1 ? flatNav[idx + 1] : null;

    return (
        <div className="min-h-screen relative">
            <Header onToggleSidebar={() => setMobileOpen(o => !o)} />

            <div className="max-w-[1480px] mx-auto px-5 md:px-10 lg:px-12 grid lg:grid-cols-[220px_1fr_220px] xl:grid-cols-[240px_1fr_240px] gap-10 xl:gap-16">
                {/* Left index — desktop */}
                <div className="hidden lg:block sticky top-14 h-[calc(100vh-56px)] -ml-2 border-r border-[var(--rule)]">
                    <Sidebar />
                </div>

                {/* Mobile sidebar */}
                {mobileOpen && (
                    <div
                        className="lg:hidden fixed inset-0 z-40 bg-[var(--ink)]/35 backdrop-blur-sm"
                        onClick={() => setMobileOpen(false)}
                    >
                        <div
                            className="absolute top-14 left-0 bottom-0 w-72 bg-[var(--paper)] border-r border-[var(--rule)] overflow-y-auto"
                            onClick={e => e.stopPropagation()}
                        >
                            <Sidebar onNavigate={() => setMobileOpen(false)} />
                        </div>
                    </div>
                )}

                {/* Content column */}
                <main className="min-w-0 py-14 md:py-20">
                    <article className="docs-prose max-w-[640px] animate-fade-up">
                        {children}
                    </article>

                    {/* Editorial pagination */}
                    {(prev || next) && (
                        <div className="max-w-[640px] mt-24 pt-6 border-t border-[var(--ink)]">
                            <div className="smallcaps mb-5 text-[var(--pencil)]">
                                Continue ↳
                            </div>
                            <div className="grid sm:grid-cols-2 gap-8">
                                <div>
                                    {prev && (
                                        <Link
                                            href={prev.href}
                                            className="group block py-1"
                                        >
                                            <div className="font-mono-ed text-[10px] tracking-[0.16em] uppercase text-[var(--pencil)] mb-1.5 inline-flex items-center gap-1.5">
                                                <ArrowLeft className="size-3 group-hover:-translate-x-0.5 transition-transform" />
                                                Previously
                                            </div>
                                            <div className="font-display text-[20px] leading-tight text-[var(--ink)] group-hover:text-[var(--vault)] transition-colors">
                                                <span className="font-italic-ed italic">
                                                    {prev.title}
                                                </span>
                                            </div>
                                        </Link>
                                    )}
                                </div>
                                <div className="sm:text-right">
                                    {next && (
                                        <Link
                                            href={next.href}
                                            className="group block py-1"
                                        >
                                            <div className="font-mono-ed text-[10px] tracking-[0.16em] uppercase text-[var(--pencil)] mb-1.5 inline-flex items-center gap-1.5 sm:justify-end sm:w-full">
                                                Next chapter
                                                <ArrowRight className="size-3 group-hover:translate-x-0.5 transition-transform" />
                                            </div>
                                            <div className="font-display text-[20px] leading-tight text-[var(--ink)] group-hover:text-[var(--vault)] transition-colors">
                                                <span className="font-italic-ed italic">
                                                    {next.title}
                                                </span>
                                            </div>
                                        </Link>
                                    )}
                                </div>
                            </div>
                        </div>
                    )}
                </main>

                {/* Right TOC */}
                <div className="hidden lg:block sticky top-14 h-[calc(100vh-56px)] py-14 pl-2 border-l border-[var(--rule)]">
                    <div className="pl-6">
                        <TableOfContents items={toc} />
                    </div>
                </div>
            </div>

            {/* Bottom hairline / colophon strip */}
            <footer className="border-t border-[var(--rule)] mt-12">
                <div className="max-w-[1480px] mx-auto px-5 md:px-10 lg:px-12 py-6 flex items-center justify-between text-[var(--pencil)]">
                    <span className="font-mono-ed text-[10px] tracking-[0.16em] uppercase">
                        Stealthgive · Dossier
                    </span>
                    <span className="font-italic-ed italic text-[13px] hidden md:inline">
                        the boundary is at the donor.
                    </span>
                    <span className="font-mono-ed text-[10px] tracking-[0.16em] uppercase">
                        Vol. 01 · 2026
                    </span>
                </div>
            </footer>
        </div>
    );
}

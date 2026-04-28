"use client";

import {Search, X} from "lucide-react";
import Link from "next/link";
import {useEffect, useMemo, useRef, useState} from "react";

import {sidebarNav} from "@/lib/nav";

type Doc = {
    title: string;
    href: string;
    section: string;
    keywords: string;
};

const allDocs: Doc[] = sidebarNav.flatMap(s =>
    s.items.map(it => ({
        title: it.title,
        href: it.href,
        section: s.title,
        keywords: `${s.title} ${it.title}`.toLowerCase(),
    })),
);

const aliases: Record<string, string[]> = {
    "/getting-started/quick-start": ["install", "setup", "run", "start"],
    "/getting-started/architecture": ["diagram", "stack", "layer"],
    "/contracts/overview": ["solidity", "foundry"],
    "/contracts/stealthgive": ["sgd", "csgd", "campaign", "factory", "registry"],
    "/contracts/deployment": ["deploy", "arbitrum", "verify"],
    "/frontend/overview": ["nextjs", "frontend"],
    "/frontend/features": ["chaingpt", "ai", "audit"],
    "/frontend/wallet": ["rainbowkit", "wagmi", "connect"],
    "/guides/setup": ["env", "install"],
    "/guides/usage": ["donate", "wrap", "claim"],
    "/guides/faq": ["question", "help"],
};

export function SearchPalette({open, onClose}: {open: boolean; onClose: () => void}) {
    const [q, setQ] = useState("");
    const [activeIdx, setActiveIdx] = useState(0);
    const inputRef = useRef<HTMLInputElement>(null);

    const results = useMemo(() => {
        const query = q.trim().toLowerCase();
        if (!query) return allDocs;
        return allDocs.filter(d => {
            const aliasMatch = (aliases[d.href] ?? []).some(a => a.includes(query));
            return d.keywords.includes(query) || aliasMatch;
        });
    }, [q]);

    useEffect(() => {
        if (open) {
            setQ("");
            setActiveIdx(0);
            setTimeout(() => inputRef.current?.focus(), 30);
        }
    }, [open]);

    useEffect(() => {
        if (!open) return;
        const onKey = (e: KeyboardEvent) => {
            if (e.key === "ArrowDown") {
                e.preventDefault();
                setActiveIdx(i => Math.min(i + 1, results.length - 1));
            }
            if (e.key === "ArrowUp") {
                e.preventDefault();
                setActiveIdx(i => Math.max(i - 1, 0));
            }
            if (e.key === "Enter") {
                const target = results[activeIdx];
                if (target) {
                    window.location.href = target.href;
                    onClose();
                }
            }
        };
        window.addEventListener("keydown", onKey);
        return () => window.removeEventListener("keydown", onKey);
    }, [open, results, activeIdx, onClose]);

    if (!open) return null;

    return (
        <div
            className="fixed inset-0 z-50 flex items-start justify-center p-4 pt-[14vh] bg-[var(--ink)]/30 backdrop-blur-[1px]"
            onClick={onClose}
        >
            <div
                onClick={e => e.stopPropagation()}
                className="w-full max-w-xl bg-[var(--paper)] border border-[var(--ink)] rounded-none overflow-hidden animate-fade-up"
            >
                {/* Manuscript header */}
                <div className="px-5 py-3 border-b border-[var(--rule)] flex items-center justify-between">
                    <div className="smallcaps">Index of the manual</div>
                    <button
                        onClick={onClose}
                        className="text-[var(--pencil)] hover:text-[var(--ink)]"
                        aria-label="Close"
                    >
                        <X className="size-3.5" />
                    </button>
                </div>

                {/* Input */}
                <div className="flex items-center gap-3 px-5 py-4 border-b border-[var(--rule)]">
                    <Search className="size-4 text-[var(--graphite)] shrink-0" />
                    <input
                        ref={inputRef}
                        value={q}
                        onChange={e => {
                            setQ(e.target.value);
                            setActiveIdx(0);
                        }}
                        placeholder="search by topic, contract, function…"
                        className="flex-1 bg-transparent outline-none font-italic-ed italic text-[20px] text-[var(--ink)] placeholder:text-[var(--pencil)] placeholder:font-italic-ed placeholder:italic"
                    />
                </div>

                {/* Results */}
                <div className="max-h-[55vh] overflow-y-auto scrollbar-thin">
                    {results.length === 0 ? (
                        <div className="px-5 py-10 text-center">
                            <p className="font-display text-lg text-[var(--ink)]">
                                Nothing in the index for{" "}
                                <span className="font-italic-ed italic">
                                    &ldquo;{q}&rdquo;
                                </span>
                            </p>
                            <p className="text-[12px] text-[var(--pencil)] mt-1.5">
                                try: install, donate, audit, wallet
                            </p>
                        </div>
                    ) : (
                        <ul>
                            {results.map((r, i) => (
                                <li
                                    key={r.href}
                                    className={
                                        i !== results.length - 1
                                            ? "border-b border-[var(--rule-soft)]"
                                            : ""
                                    }
                                >
                                    <Link
                                        href={r.href}
                                        onClick={onClose}
                                        onMouseEnter={() => setActiveIdx(i)}
                                        className={`flex items-baseline justify-between gap-4 px-5 py-3 ${
                                            i === activeIdx
                                                ? "bg-[var(--rule-soft)]"
                                                : ""
                                        }`}
                                    >
                                        <div className="flex items-baseline gap-3 min-w-0">
                                            <span
                                                className={`font-mono-ed text-[10px] tracking-[0.16em] uppercase shrink-0 ${
                                                    i === activeIdx
                                                        ? "text-[var(--vault)]"
                                                        : "text-[var(--pencil)]"
                                                }`}
                                            >
                                                {r.section}
                                            </span>
                                            <span
                                                className={`text-[15px] truncate ${
                                                    i === activeIdx
                                                        ? "font-italic-ed italic text-[var(--ink)]"
                                                        : "text-[var(--ink-soft)]"
                                                }`}
                                            >
                                                {r.title}
                                            </span>
                                        </div>
                                        <span
                                            className={`font-mono-ed text-[10px] shrink-0 ${
                                                i === activeIdx
                                                    ? "text-[var(--vault)]"
                                                    : "text-[var(--pencil)]"
                                            }`}
                                        >
                                            ↳ open
                                        </span>
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    )}
                </div>

                {/* Footer */}
                <div className="border-t border-[var(--rule)] px-5 py-2.5 flex items-center gap-5 font-mono-ed text-[10px] tracking-[0.12em] uppercase text-[var(--pencil)]">
                    <span>↑↓ navigate</span>
                    <span>↵ open</span>
                    <span>esc close</span>
                </div>
            </div>
        </div>
    );
}

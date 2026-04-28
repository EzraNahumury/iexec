"use client";

import {useEffect, useState} from "react";

export type TocItem = {id: string; title: string; depth: 2 | 3};

/**
 * Right-rail TOC styled as a manuscript table of contents.
 * Roman-numeral headings, leader dots between title and locator.
 */
export function TableOfContents({items}: {items: TocItem[]}) {
    const [activeId, setActiveId] = useState<string | null>(items[0]?.id ?? null);

    useEffect(() => {
        if (items.length === 0) return;
        const observer = new IntersectionObserver(
            entries => {
                const visible = entries
                    .filter(e => e.isIntersecting)
                    .sort(
                        (a, b) =>
                            a.target.getBoundingClientRect().top -
                            b.target.getBoundingClientRect().top,
                    );
                if (visible[0]) setActiveId((visible[0].target as HTMLElement).id);
            },
            {rootMargin: "-100px 0px -60% 0px", threshold: [0, 1]},
        );
        items.forEach(it => {
            const el = document.getElementById(it.id);
            if (el) observer.observe(el);
        });
        return () => observer.disconnect();
    }, [items]);

    if (items.length === 0) return null;

    return (
        <div>
            <div className="smallcaps mb-4 flex items-center gap-2">
                <span>Contents</span>
                <span className="flex-1 h-px bg-[var(--rule)]" />
                <span className="text-[var(--rule)]">❡</span>
            </div>

            <ol className="space-y-0.5">
                {items.map((it, i) => {
                    const active = activeId === it.id;
                    const numeral = romanize(i + 1);
                    return (
                        <li key={it.id}>
                            <a
                                href={`#${it.id}`}
                                className={`group flex items-baseline gap-2 py-1.5 transition-colors ${
                                    it.depth === 3 ? "pl-5" : ""
                                } ${
                                    active
                                        ? "text-[var(--ink)]"
                                        : "text-[var(--pencil)] hover:text-[var(--ink)]"
                                }`}
                            >
                                <span
                                    className={`font-mono-ed text-[10px] uppercase tabular-nums shrink-0 transition-colors ${
                                        active
                                            ? "text-[var(--vault)]"
                                            : "text-[var(--rule)] group-hover:text-[var(--pencil)]"
                                    }`}
                                >
                                    {numeral}
                                </span>
                                <span
                                    className={`text-[12.5px] leading-snug ${
                                        active ? "font-italic-ed italic text-[14px]" : ""
                                    }`}
                                >
                                    {it.title}
                                </span>
                                {/* Leader dots */}
                                <span
                                    className="flex-1 mx-1 self-center border-b border-dotted border-[var(--rule)] opacity-60"
                                    aria-hidden
                                />
                                {active && (
                                    <span className="size-1 rounded-full bg-[var(--vault)] shrink-0" />
                                )}
                            </a>
                        </li>
                    );
                })}
            </ol>

            <div className="mt-10 pt-5 border-t border-[var(--rule)] space-y-2.5">
                <a
                    href="https://github.com/EzraNahumury/iexec"
                    target="_blank"
                    rel="noreferrer"
                    className="text-[12px] text-[var(--graphite)] hover:text-[var(--vault)] transition-colors flex items-center gap-2"
                >
                    <svg viewBox="0 0 24 24" fill="currentColor" className="size-3" aria-hidden>
                        <path d="M12 .5C5.7.5.5 5.7.5 12c0 5.1 3.3 9.4 7.9 10.9.6.1.8-.2.8-.5v-2c-3.2.7-3.9-1.4-3.9-1.4-.5-1.3-1.3-1.7-1.3-1.7-1-.7.1-.7.1-.7 1.2.1 1.8 1.2 1.8 1.2 1 1.8 2.7 1.3 3.4 1 .1-.8.4-1.3.7-1.6-2.5-.3-5.2-1.3-5.2-5.7 0-1.3.4-2.3 1.2-3.1-.1-.3-.5-1.5.1-3.1 0 0 1-.3 3.2 1.2.9-.3 1.9-.4 2.9-.4s2 .1 2.9.4c2.2-1.5 3.2-1.2 3.2-1.2.6 1.6.2 2.8.1 3.1.7.8 1.2 1.8 1.2 3.1 0 4.4-2.7 5.4-5.2 5.7.4.4.8 1.1.8 2.2v3.3c0 .3.2.7.8.5 4.6-1.5 7.9-5.8 7.9-10.9C23.5 5.7 18.3.5 12 .5z" />
                    </svg>
                    <span className="link-ink">Edit on GitHub</span>
                </a>
                <p className="text-[10.5px] font-mono-ed text-[var(--pencil)]">
                    last revised · arbitrum sepolia
                </p>
            </div>
        </div>
    );
}

function romanize(num: number): string {
    const numerals: [number, string][] = [
        [10, "x"], [9, "ix"], [5, "v"], [4, "iv"], [1, "i"],
    ];
    let result = "";
    for (const [val, sym] of numerals) {
        while (num >= val) {
            result += sym;
            num -= val;
        }
    }
    return result;
}

"use client";

import {Fragment} from "react";

/**
 * Tiny markdown renderer scoped to what ChainGPT typically returns:
 * `**bold**`, `### h3`, `## h2`, `- bullet`, `1. ordered`, and blank-line
 * paragraph breaks. Avoids pulling in a full markdown library.
 *
 * Inline `code` and links aren't supported because the model rarely
 * uses them; if needed later we can extend renderInline.
 */
export function Markdown({text, className = ""}: {text: string; className?: string}) {
    const blocks = parseBlocks(text.replace(/\r\n/g, "\n").trim());
    return (
        <div className={`space-y-3 text-sm leading-relaxed text-zinc-700 ${className}`}>
            {blocks.map((b, i) => (
                <Fragment key={i}>{renderBlock(b)}</Fragment>
            ))}
        </div>
    );
}

type Block =
    | {kind: "h2" | "h3" | "h4"; text: string}
    | {kind: "p"; text: string}
    | {kind: "ul"; items: string[]}
    | {kind: "ol"; items: string[]};

function parseBlocks(src: string): Block[] {
    const lines = src.split("\n");
    const out: Block[] = [];
    let buf: string[] = [];
    let listKind: "ul" | "ol" | null = null;
    let listItems: string[] = [];

    const flushPara = () => {
        if (buf.length) {
            out.push({kind: "p", text: buf.join(" ").trim()});
            buf = [];
        }
    };
    const flushList = () => {
        if (listItems.length && listKind) {
            out.push({kind: listKind, items: listItems});
            listItems = [];
            listKind = null;
        }
    };

    for (const raw of lines) {
        const line = raw.trim();

        if (!line) {
            flushPara();
            flushList();
            continue;
        }

        const h = /^(#{2,4})\s+(.*)$/.exec(line);
        if (h) {
            flushPara();
            flushList();
            const level = h[1].length;
            out.push({kind: (level === 2 ? "h2" : level === 3 ? "h3" : "h4"), text: h[2]});
            continue;
        }

        const ul = /^[-*]\s+(.*)$/.exec(line);
        if (ul) {
            flushPara();
            if (listKind && listKind !== "ul") flushList();
            listKind = "ul";
            listItems.push(ul[1]);
            continue;
        }

        const ol = /^\d+\.\s+(.*)$/.exec(line);
        if (ol) {
            flushPara();
            if (listKind && listKind !== "ol") flushList();
            listKind = "ol";
            listItems.push(ol[1]);
            continue;
        }

        if (listKind) flushList();
        buf.push(line);
    }
    flushPara();
    flushList();
    return out;
}

function renderBlock(b: Block) {
    switch (b.kind) {
        case "h2":
            return (
                <h3 className="text-base font-semibold text-zinc-900 tracking-tight mt-2">
                    {renderInline(b.text)}
                </h3>
            );
        case "h3":
            return (
                <h4 className="text-[13px] font-semibold tracking-[0.12em] uppercase text-zinc-900 mt-2">
                    {renderInline(b.text)}
                </h4>
            );
        case "h4":
            return (
                <h5 className="text-xs font-semibold tracking-[0.14em] uppercase text-zinc-700 mt-1">
                    {renderInline(b.text)}
                </h5>
            );
        case "p":
            return <p>{renderInline(b.text)}</p>;
        case "ul":
            return (
                <ul className="space-y-1.5 pl-1">
                    {b.items.map((it, i) => (
                        <li key={i} className="flex gap-2.5">
                            <span className="size-1.5 rounded-full bg-zinc-900 shrink-0 mt-[7px]" />
                            <span>{renderInline(it)}</span>
                        </li>
                    ))}
                </ul>
            );
        case "ol":
            return (
                <ol className="space-y-2">
                    {b.items.map((it, i) => (
                        <li key={i} className="flex gap-3">
                            <span className="font-mono text-[11px] tabular-nums font-semibold text-zinc-500 mt-0.5 shrink-0 min-w-[18px]">
                                {String(i + 1).padStart(2, "0")}
                            </span>
                            <span>{renderInline(it)}</span>
                        </li>
                    ))}
                </ol>
            );
    }
}

/**
 * Inline renderer — only **bold** for now. Splits the text into a flat
 * sequence of strings + bold spans without recursion.
 */
function renderInline(text: string) {
    // Strip stray triple-asterisks the model occasionally emits.
    const clean = text.replace(/\*{3,}/g, "**");
    const parts: Array<string | {bold: string}> = [];
    const re = /\*\*([^*]+)\*\*/g;
    let lastIndex = 0;
    let m: RegExpExecArray | null;
    while ((m = re.exec(clean)) !== null) {
        if (m.index > lastIndex) parts.push(clean.slice(lastIndex, m.index));
        parts.push({bold: m[1]});
        lastIndex = re.lastIndex;
    }
    if (lastIndex < clean.length) parts.push(clean.slice(lastIndex));

    return parts.map((p, i) =>
        typeof p === "string" ? (
            <Fragment key={i}>{p}</Fragment>
        ) : (
            <strong key={i} className="font-semibold text-zinc-900">
                {p.bold}
            </strong>
        ),
    );
}

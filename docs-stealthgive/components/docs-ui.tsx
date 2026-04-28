import {ArrowRight} from "lucide-react";
import Link from "next/link";
import type {ReactNode} from "react";

/* ─────────────────────────────────────────────────────────────────────────
   HERO — editorial title page. No gradient cards. Asymmetric column.
   ───────────────────────────────────────────────────────────────────────── */

export function Hero({
    eyebrow,
    badge,
    title,
    italic,
    description,
    primaryHref,
    primaryLabel,
    secondaryHref,
    secondaryLabel,
}: {
    eyebrow?: string;
    badge?: string;
    title: string;
    italic?: string;
    description: string;
    primaryHref?: string;
    primaryLabel?: string;
    secondaryHref?: string;
    secondaryLabel?: string;
}) {
    return (
        <header className="not-prose mb-20 md:mb-28">
            {/* Spec line */}
            <div className="flex items-baseline justify-between mb-10 pb-3 border-b border-[var(--ink)]">
                <div className="flex items-baseline gap-4">
                    {badge && (
                        <span className="inline-flex items-center gap-2 font-mono-ed text-[10px] tracking-[0.18em] uppercase text-[var(--vault)]">
                            <span className="size-1 rounded-full bg-[var(--vault)] animate-blink" />
                            {badge}
                        </span>
                    )}
                    {eyebrow && (
                        <span className="smallcaps text-[var(--graphite)]">{eyebrow}</span>
                    )}
                </div>
                <span className="font-mono-ed text-[10px] tracking-[0.16em] uppercase text-[var(--pencil)] hidden sm:inline">
                    arbitrum sepolia · 421614
                </span>
            </div>

            {/* Title — large editorial display */}
            <h1 className="font-display text-[44px] md:text-[68px] leading-[0.96] tracking-[-0.02em] text-[var(--ink)] max-w-[16ch]">
                {title}
                {italic && (
                    <>
                        {" "}
                        <span className="font-italic-ed italic font-light text-[var(--graphite)]">
                            {italic}
                        </span>
                    </>
                )}
            </h1>

            {/* Asymmetric row: lede + meta */}
            <div className="mt-10 grid md:grid-cols-[1fr_auto] gap-10 items-end">
                <p className="text-[17px] md:text-[19px] leading-[1.55] text-[var(--ink-soft)] font-light max-w-[52ch] drop-cap">
                    {description}
                </p>

                <div className="md:text-right shrink-0">
                    <div className="smallcaps mb-2">A working manual,</div>
                    <p className="font-italic-ed italic text-[18px] text-[var(--graphite)] leading-tight">
                        edited & set
                        <br />
                        by Ezra Nahumury
                    </p>
                </div>
            </div>

            {/* Editorial CTAs */}
            {(primaryHref || secondaryHref) && (
                <div className="mt-12 flex flex-wrap items-baseline gap-x-8 gap-y-3">
                    {primaryHref && primaryLabel && (
                        <Link
                            href={primaryHref}
                            className="group inline-flex items-baseline gap-2 text-[var(--ink)] hover:text-[var(--vault)] transition-colors"
                        >
                            <span className="font-mono-ed text-[10px] tracking-[0.16em] uppercase text-[var(--vault)]">
                                ↳ begin
                            </span>
                            <span className="font-italic-ed italic text-[22px]">
                                {primaryLabel}
                            </span>
                            <ArrowRight className="size-3.5 self-center group-hover:translate-x-1 transition-transform" />
                        </Link>
                    )}
                    {secondaryHref && secondaryLabel && (
                        <Link
                            href={secondaryHref}
                            className="text-[14px] text-[var(--graphite)] hover:text-[var(--ink)] transition-colors link-ink"
                        >
                            or, read about {secondaryLabel.toLowerCase()}
                        </Link>
                    )}
                </div>
            )}
        </header>
    );
}

/* ─────────────────────────────────────────────────────────────────────────
   HEADINGS — H2 with small-caps eyebrow optional
   ───────────────────────────────────────────────────────────────────────── */

export function H2({id, children}: {id: string; children: ReactNode}) {
    return (
        <h2
            id={id}
            className="not-prose mt-20 mb-5 font-display text-[28px] md:text-[34px] leading-[1.05] tracking-[-0.01em] text-[var(--ink)] scroll-mt-24"
        >
            {children}
        </h2>
    );
}

export function H3({id, children}: {id: string; children: ReactNode}) {
    return (
        <h3
            id={id}
            className="not-prose mt-12 mb-3 font-display text-[20px] leading-[1.15] text-[var(--ink)] scroll-mt-24"
        >
            <span className="font-italic-ed italic font-light text-[var(--graphite)]">
                ↳{" "}
            </span>
            {children}
        </h3>
    );
}

export function P({children}: {children: ReactNode}) {
    return (
        <p className="not-prose text-[15.5px] leading-[1.75] text-[var(--ink-soft)] mb-4 font-light">
            {children}
        </p>
    );
}

export function Lead({children}: {children: ReactNode}) {
    return (
        <p className="not-prose font-italic-ed italic text-[20px] leading-[1.55] text-[var(--graphite)] mb-8 max-w-[42ch]">
            {children}
        </p>
    );
}

/* ─────────────────────────────────────────────────────────────────────────
   FEATURE CARDS — hairline panels, serif numerals, no shadow
   ───────────────────────────────────────────────────────────────────────── */

export function FeatureGrid({children}: {children: ReactNode}) {
    return (
        <div className="not-prose grid sm:grid-cols-2 gap-px bg-[var(--rule)] border border-[var(--rule)] my-8">
            {children}
        </div>
    );
}

let cardCounter = 0;
export function FeatureCard({
    icon,
    title,
    children,
}: {
    icon?: ReactNode;
    title: string;
    children: ReactNode;
}) {
    // We can't reliably persist counter across SSR; instead use a CSS counter on the parent.
    return (
        <article className="group bg-[var(--paper)] hover:bg-[var(--rule-soft)] transition-colors p-6 relative">
            <div className="flex items-start justify-between gap-3 mb-4">
                {icon ? (
                    <span className="text-[var(--vault)] [&_svg]:size-[18px]">
                        {icon}
                    </span>
                ) : (
                    <span />
                )}
                <span className="font-mono-ed text-[10px] tracking-[0.14em] uppercase text-[var(--pencil)] group-hover:text-[var(--vault)] transition-colors">
                    fig.
                </span>
            </div>
            <div className="font-display text-[18px] leading-tight text-[var(--ink)] mb-2">
                {title}
            </div>
            <p className="text-[13.5px] text-[var(--graphite)] leading-relaxed">
                {children}
            </p>
        </article>
    );
}

/* ─────────────────────────────────────────────────────────────────────────
   CALLOUTS — marginalia style, hairline left bar
   ───────────────────────────────────────────────────────────────────────── */

type CalloutKind = "info" | "warning" | "tip" | "secure";

const calloutAccent: Record<CalloutKind, {bar: string; label: string; tone: string}> = {
    info: {bar: "bg-[var(--graphite)]", label: "Note", tone: "text-[var(--ink-soft)]"},
    warning: {bar: "bg-[var(--amber)]", label: "Warning", tone: "text-[var(--amber)]"},
    tip: {bar: "bg-[var(--vault)]", label: "Tip", tone: "text-[var(--vault)]"},
    secure: {bar: "bg-[var(--ink)]", label: "Privacy", tone: "text-[var(--ink)]"},
};

export function Callout({
    kind = "info",
    title,
    children,
}: {
    kind?: CalloutKind;
    title?: string;
    children: ReactNode;
}) {
    const a = calloutAccent[kind];
    return (
        <aside className={`not-prose my-8 grid grid-cols-[3px_1fr] gap-5`}>
            <div className={`${a.bar} w-[3px]`} aria-hidden />
            <div>
                <div className={`smallcaps mb-1.5 ${a.tone}`}>
                    {title ?? a.label}
                </div>
                <div className="text-[14.5px] text-[var(--ink-soft)] leading-relaxed font-light">
                    {children}
                </div>
            </div>
        </aside>
    );
}

/* ─────────────────────────────────────────────────────────────────────────
   CODE BLOCK — manuscript code; rule lines top/bottom + filename
   ───────────────────────────────────────────────────────────────────────── */

export function CodeBlock({
    children,
    language,
    file,
}: {
    children: string;
    language?: string;
    file?: string;
}) {
    const label = file ?? language ?? "snippet";
    return (
        <figure className="not-prose my-8">
            {/* Filename / language banner */}
            <div className="flex items-baseline justify-between mb-2 px-px">
                <span className="font-mono-ed text-[10px] tracking-[0.18em] uppercase text-[var(--graphite)]">
                    ── {label} ──
                </span>
                {language && file && (
                    <span className="font-mono-ed text-[10px] tracking-[0.16em] uppercase text-[var(--pencil)]">
                        {language}
                    </span>
                )}
            </div>
            <pre className="border-t border-b border-[var(--ink)] py-5 px-px text-[13.5px] leading-[1.7] overflow-x-auto font-mono-ed text-[var(--ink-soft)]">
                <code>{children}</code>
            </pre>
        </figure>
    );
}

export function InlineCode({children}: {children: ReactNode}) {
    return (
        <code className="font-mono-ed text-[0.9em] text-[var(--ink)] border-b border-[var(--rule)]">
            {children}
        </code>
    );
}

/* ─────────────────────────────────────────────────────────────────────────
   SPEC TABLE — typographic, no rounded box
   ───────────────────────────────────────────────────────────────────────── */

export function SpecTable({children}: {children: ReactNode}) {
    return (
        <div className="not-prose my-8 border-t border-b border-[var(--ink)]">
            <table className="w-full text-[14px]">{children}</table>
        </div>
    );
}

export function SpecRow({label, children}: {label: string; children: ReactNode}) {
    return (
        <tr className="border-b border-[var(--rule)] last:border-b-0">
            <td className="py-3.5 pr-6 align-top w-1/3">
                <span className="smallcaps">{label}</span>
            </td>
            <td className="py-3.5 align-top text-[var(--ink-soft)] font-light">
                {children}
            </td>
        </tr>
    );
}

/* ─────────────────────────────────────────────────────────────────────────
   FILE TREE — typographic project structure (editorial, not a code dump)
   ───────────────────────────────────────────────────────────────────────── */

export type FileNode =
    | {kind: "folder"; name: string; note?: string; children?: FileNode[]}
    | {kind: "file"; name: string; note?: string};

export function FileTree({
    root,
    nodes,
    caption,
}: {
    root?: string;
    nodes: FileNode[];
    caption?: string;
}) {
    return (
        <figure className="not-prose my-10">
            {caption && (
                <div className="flex items-baseline justify-between mb-3 pb-2 border-b border-[var(--ink)]">
                    <figcaption className="font-italic-ed italic text-[18px] text-[var(--ink)]">
                        {caption}
                    </figcaption>
                    <span className="font-mono-ed text-[10px] tracking-[0.16em] uppercase text-[var(--pencil)]">
                        directory
                    </span>
                </div>
            )}

            <div className="border border-[var(--ink)] bg-[var(--paper)]">
                {/* Root header */}
                {root && (
                    <div className="flex items-baseline justify-between px-5 py-3 border-b border-[var(--ink)] bg-[var(--rule-soft)]">
                        <div className="flex items-baseline gap-2.5">
                            <span className="text-[var(--vault)] font-mono-ed text-[12px]">▸</span>
                            <span className="font-mono-ed text-[13px] text-[var(--ink)] font-medium">
                                {root}
                            </span>
                        </div>
                        <span className="smallcaps text-[var(--pencil)]">root</span>
                    </div>
                )}

                <div className="divide-y divide-[var(--rule-soft)]">
                    {nodes.map((node, i) => (
                        <FileTreeNode key={i} node={node} depth={0} />
                    ))}
                </div>
            </div>
        </figure>
    );
}

function FileTreeNode({node, depth}: {node: FileNode; depth: number}) {
    const isFolder = node.kind === "folder";
    const hasChildren = isFolder && !!node.children && node.children.length > 0;
    const indent = depth * 20;

    if (hasChildren) {
        return (
            <div>
                {/* Folder header row */}
                <div
                    className="flex items-baseline gap-3 px-5 py-2.5"
                    style={{paddingLeft: 20 + indent}}
                >
                    <span
                        className="font-mono-ed text-[11px] text-[var(--vault)] shrink-0"
                        aria-hidden
                    >
                        ▾
                    </span>
                    <span className="font-mono-ed text-[12.5px] text-[var(--ink)] font-medium">
                        {node.name}
                    </span>
                    {node.note && (
                        <>
                            <span
                                className="flex-1 self-center mx-1 border-b border-dotted border-[var(--rule)] opacity-50"
                                aria-hidden
                            />
                            <span className="font-italic-ed italic text-[12.5px] text-[var(--graphite)] text-right shrink-0">
                                {node.note}
                            </span>
                        </>
                    )}
                </div>
                {/* Children */}
                <div className="border-t border-[var(--rule-soft)] divide-y divide-[var(--rule-soft)] bg-[var(--paper)]">
                    {node.children!.map((child, i) => (
                        <FileTreeNode key={i} node={child} depth={depth + 1} />
                    ))}
                </div>
            </div>
        );
    }

    // Leaf node (file or empty folder)
    const glyph = isFolder ? "▸" : "·";
    const glyphColor = isFolder ? "text-[var(--vault)]" : "text-[var(--rule)]";

    return (
        <div
            className="group flex items-baseline gap-3 px-5 py-2 hover:bg-[var(--rule-soft)] transition-colors"
            style={{paddingLeft: 20 + indent}}
        >
            <span
                className={`font-mono-ed text-[11px] shrink-0 ${glyphColor} group-hover:text-[var(--vault)] transition-colors`}
                aria-hidden
            >
                {glyph}
            </span>
            <span
                className={`font-mono-ed text-[12.5px] shrink-0 ${
                    isFolder
                        ? "text-[var(--ink)] font-medium"
                        : "text-[var(--ink-soft)]"
                }`}
            >
                {node.name}
            </span>
            {node.note && (
                <>
                    <span
                        className="flex-1 self-center mx-1 border-b border-dotted border-[var(--rule)] opacity-60"
                        aria-hidden
                    />
                    <span className="font-italic-ed italic text-[12.5px] text-[var(--graphite)] text-right">
                        {node.note}
                    </span>
                </>
            )}
        </div>
    );
}

/* ─────────────────────────────────────────────────────────────────────────
   STEPS — numbered manuscript steps, large numerals, italic title
   ───────────────────────────────────────────────────────────────────────── */

export function Steps({children}: {children: ReactNode}) {
    return (
        <ol className="not-prose my-10 [counter-reset:step] space-y-12">{children}</ol>
    );
}

export function Step({title, children}: {title: string; children: ReactNode}) {
    return (
        <li className="grid grid-cols-[auto_1fr] gap-x-6 [counter-increment:step]">
            <span
                className="font-display text-[40px] leading-none text-[var(--rule)] font-light tabular-nums before:content-[counter(step,decimal-leading-zero)]"
                aria-hidden
            />
            <div className="pt-1">
                <h4 className="font-display text-[20px] leading-tight text-[var(--ink)] mb-2">
                    <span className="font-italic-ed italic">{title}</span>
                </h4>
                <div className="text-[14px] text-[var(--graphite)] leading-[1.7] font-light max-w-[52ch]">
                    {children}
                </div>
            </div>
        </li>
    );
}

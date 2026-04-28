"use client";

import type {ReactNode} from "react";

/* ─────────────────────────────────────────────────────────────────────────
   ARCHITECTURE — manuscript "fig." stack with hairline rules
   ───────────────────────────────────────────────────────────────────────── */

type Layer = {
    label: string;
    title: string;
    italic?: string;
    description: string;
    items: string[];
};

const layers: Layer[] = [
    {
        label: "stratum i",
        title: "The Browser",
        italic: "the operator",
        description:
            "Where donor and creator meet the protocol. Next.js 16, RainbowKit, Wagmi. No backend service in sight.",
        items: ["Next.js 16", "Wagmi 2.19", "RainbowKit 2.2", "Tailwind v4"],
    },
    {
        label: "stratum ii",
        title: "The Server",
        italic: "an AI proxy",
        description:
            "Five Next.js Route Handlers brokering ChainGPT calls. The API key never crosses the network boundary.",
        items: ["draft-campaign", "generate-hero", "audit-contract", "review-campaign", "impact-report"],
    },
    {
        label: "stratum iii",
        title: "The Chain",
        italic: "five contracts",
        description:
            "Solidity contracts on Arbitrum Sepolia. They hold encrypted state, run the campaign state machine, and bind cSGD.",
        items: ["StealthGiveDollar", "ConfidentialSGD", "Factory", "Campaign", "Registry"],
    },
    {
        label: "stratum iv",
        title: "The Vault",
        italic: "iExec Nox TEE",
        description:
            "The Trusted Execution Environment that does the actual confidential work. Encrypted amounts never become plaintext.",
        items: ["Handle Gateway", "NoxCompute precompile", "ERC-7984 ops"],
    },
];

export function ArchitectureDiagram() {
    return (
        <figure className="not-prose my-12">
            <div className="flex items-baseline justify-between mb-5 pb-2 border-b border-[var(--ink)]">
                <figcaption className="font-italic-ed italic text-[18px] text-[var(--ink)]">
                    Fig. i — <span className="text-[var(--graphite)]">the four strata.</span>
                </figcaption>
                <span className="font-mono-ed text-[10px] tracking-[0.16em] uppercase text-[var(--pencil)]">
                    plate · 01
                </span>
            </div>

            <div className="space-y-0 border border-[var(--ink)]">
                {layers.map((layer, i) => (
                    <div
                        key={layer.label}
                        className={`grid grid-cols-[64px_1fr] md:grid-cols-[80px_120px_1fr] items-stretch ${
                            i !== 0 ? "border-t border-[var(--rule)]" : ""
                        }`}
                    >
                        {/* Stratum number column */}
                        <div className="flex flex-col items-center justify-center py-6 px-2 bg-[var(--rule-soft)] border-r border-[var(--rule)]">
                            <div className="font-display text-[34px] md:text-[42px] leading-none text-[var(--ink)] font-light tabular-nums">
                                {String(i + 1).padStart(2, "0")}
                            </div>
                            <div className="mt-1.5 smallcaps text-center leading-tight">
                                {layer.label}
                            </div>
                        </div>

                        {/* Title column */}
                        <div className="hidden md:flex flex-col justify-center py-5 px-5 border-r border-[var(--rule)]">
                            <div className="font-display text-[18px] text-[var(--ink)] leading-tight">
                                {layer.title}
                            </div>
                            {layer.italic && (
                                <div className="font-italic-ed italic text-[14px] text-[var(--graphite)] mt-0.5">
                                    {layer.italic}
                                </div>
                            )}
                        </div>

                        {/* Body */}
                        <div className="py-5 px-5">
                            <div className="md:hidden font-display text-[16px] text-[var(--ink)] mb-1">
                                {layer.title}
                                {layer.italic && (
                                    <span className="font-italic-ed italic text-[var(--graphite)]">
                                        {" "}— {layer.italic}
                                    </span>
                                )}
                            </div>
                            <p className="text-[13.5px] text-[var(--ink-soft)] leading-relaxed mb-3 max-w-[56ch] font-light">
                                {layer.description}
                            </p>
                            <div className="flex flex-wrap gap-x-3 gap-y-1">
                                {layer.items.map(it => (
                                    <span
                                        key={it}
                                        className="font-mono-ed text-[11px] text-[var(--graphite)] before:content-['—_'] before:text-[var(--rule)]"
                                    >
                                        {it}
                                    </span>
                                ))}
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            <p className="mt-3 font-italic-ed italic text-[13px] text-[var(--pencil)]">
                Each stratum communicates only with its neighbour. The boundary <em>is</em> the privacy.
            </p>
        </figure>
    );
}

/* ─────────────────────────────────────────────────────────────────────────
   DONATION FLOW — numbered horizontal ledger with arrows
   ───────────────────────────────────────────────────────────────────────── */

type FlowStep = {title: string; description: string};

const flowSteps: FlowStep[] = [
    {
        title: "Sign",
        description: "Wallet signs an EIP-712 message. The gateway returns an encrypted handle.",
    },
    {
        title: "Encrypt",
        description: "Amount + RSA pubkey are sealed locally. Plaintext never leaves the browser.",
    },
    {
        title: "Operate",
        description: "Tx 1 — donor grants the campaign a transient operator permission.",
    },
    {
        title: "Donate",
        description: "Tx 2 — campaign accepts the handle, folds it into its encrypted total.",
    },
    {
        title: "Reveal",
        description: "allowPublicDecryption opens the new aggregate. The single amount stays private.",
    },
];

export function DonationFlowDiagram() {
    return (
        <figure className="not-prose my-12">
            <div className="flex items-baseline justify-between mb-5 pb-2 border-b border-[var(--ink)]">
                <figcaption className="font-italic-ed italic text-[18px] text-[var(--ink)]">
                    Fig. ii — <span className="text-[var(--graphite)]">a donation, in five movements.</span>
                </figcaption>
                <span className="font-mono-ed text-[10px] tracking-[0.16em] uppercase text-[var(--pencil)]">
                    plate · 02
                </span>
            </div>

            <ol className="grid gap-px bg-[var(--rule)] border border-[var(--ink)] sm:grid-cols-2 lg:grid-cols-5">
                {flowSteps.map((step, i) => (
                    <li
                        key={step.title}
                        className="bg-[var(--paper)] p-5 group hover:bg-[var(--rule-soft)] transition-colors"
                    >
                        <div className="flex items-baseline justify-between mb-3">
                            <span className="font-display text-[42px] leading-none text-[var(--rule)] group-hover:text-[var(--vault)] transition-colors tabular-nums">
                                {String(i + 1).padStart(2, "0")}
                            </span>
                            {i < flowSteps.length - 1 && (
                                <span
                                    className="font-mono-ed text-[10px] text-[var(--pencil)]"
                                    aria-hidden
                                >
                                    ↳
                                </span>
                            )}
                        </div>
                        <div className="font-display text-[18px] text-[var(--ink)] leading-tight mb-1.5">
                            <span className="font-italic-ed italic">{step.title}</span>
                        </div>
                        <p className="text-[12.5px] text-[var(--graphite)] leading-relaxed font-light">
                            {step.description}
                        </p>
                    </li>
                ))}
            </ol>

            <p className="mt-3 font-italic-ed italic text-[13px] text-[var(--pencil)]">
                Two transactions, one signature, no plaintext.
            </p>
        </figure>
    );
}

/* ─────────────────────────────────────────────────────────────────────────
   LIFECYCLE — four-state manuscript figure
   ───────────────────────────────────────────────────────────────────────── */

type Lifecycle = {
    name: string;
    description: string;
    actor: string;
    glyph: string;
};

const lifecycle: Lifecycle[] = [
    {
        name: "Active",
        description: "Donations accepted. Encrypted aggregate updated on each donate.",
        actor: "Anyone",
        glyph: "⊕",
    },
    {
        name: "Settling",
        description: "Deadline reached. Recipient has 7 days to withdraw funds.",
        actor: "Recipient",
        glyph: "◷",
    },
    {
        name: "Withdrawn",
        description: "Funds delivered to recipient. Terminal state.",
        actor: "—",
        glyph: "◉",
    },
    {
        name: "Refunding",
        description: "Recipient missed window. Each donor may refund individually.",
        actor: "Each donor",
        glyph: "↻",
    },
];

export function LifecycleDiagram() {
    return (
        <figure className="not-prose my-12">
            <div className="flex items-baseline justify-between mb-5 pb-2 border-b border-[var(--ink)]">
                <figcaption className="font-italic-ed italic text-[18px] text-[var(--ink)]">
                    Fig. iii — <span className="text-[var(--graphite)]">the campaign, as a small machine.</span>
                </figcaption>
                <span className="font-mono-ed text-[10px] tracking-[0.16em] uppercase text-[var(--pencil)]">
                    plate · 03
                </span>
            </div>

            <ol className="grid sm:grid-cols-2 gap-px bg-[var(--rule)] border border-[var(--ink)]">
                {lifecycle.map((s, i) => (
                    <li key={s.name} className="bg-[var(--paper)] p-6 group hover:bg-[var(--rule-soft)] transition-colors">
                        <div className="flex items-start justify-between mb-3">
                            <div>
                                <div className="font-mono-ed text-[10px] tracking-[0.16em] uppercase text-[var(--pencil)] mb-1">
                                    state · {String(i + 1).padStart(2, "0")}
                                </div>
                                <div className="font-display text-[24px] leading-tight text-[var(--ink)]">
                                    <span className="font-italic-ed italic">{s.name}</span>
                                </div>
                            </div>
                            <span
                                className="font-display text-[36px] leading-none text-[var(--rule)] group-hover:text-[var(--vault)] transition-colors"
                                aria-hidden
                            >
                                {s.glyph}
                            </span>
                        </div>
                        <p className="text-[13.5px] text-[var(--ink-soft)] leading-relaxed font-light mb-3 max-w-[40ch]">
                            {s.description}
                        </p>
                        <div className="pt-3 border-t border-[var(--rule)] flex items-baseline gap-2">
                            <span className="smallcaps text-[var(--pencil)]">Acts</span>
                            <span className="font-mono-ed text-[11.5px] text-[var(--graphite)]">
                                {s.actor}
                            </span>
                        </div>
                    </li>
                ))}
            </ol>
        </figure>
    );
}

/* Small helper for inline figure captions in pages */
export function FigureCaption({n, children}: {n: string; children: ReactNode}) {
    return (
        <p className="not-prose font-italic-ed italic text-[13px] text-[var(--pencil)] my-4">
            <span className="font-mono-ed not-italic text-[10px] tracking-[0.16em] uppercase mr-2">
                fig. {n}
            </span>
            {children}
        </p>
    );
}

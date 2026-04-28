"use client";

import {motion} from "framer-motion";
import {ArrowRight, Check, Eye, EyeOff, Globe, Lock, Shield, ShieldCheck} from "lucide-react";

export type FeatureVariant = "hidden" | "verifiable" | "open";

type Props = {
    variant: FeatureVariant;
    eyebrow: string;
    title: string;
    body: string;
};

/**
 * Big "Three guarantees" feature card. The illustration zone is rendered as
 * a small dashboard-style mockup (chips, pills, mini chart) so each card
 * looks like a screenshot of a real dApp module rather than an abstract
 * decoration. Monochrome to match the rest of the site.
 */
export function FeatureCard({variant, eyebrow, title, body}: Props) {
    return (
        <motion.div
            whileHover={{y: -6}}
            transition={{type: "spring", stiffness: 260, damping: 22}}
            className="group h-full flex flex-col rounded-3xl bg-white border border-zinc-200 overflow-hidden hover:shadow-[0_20px_40px_-20px_rgba(0,0,0,0.18)] hover:ring-1 hover:ring-zinc-300 transition-shadow"
        >
            {/* Illustration zone — dashboard mockup */}
            <div className="relative aspect-[4/3] bg-zinc-100 overflow-hidden flex-shrink-0 p-5">
                <Mockup variant={variant} />
            </div>

            {/* Body */}
            <div className="p-7 flex-1 flex flex-col">
                <div className="text-[10px] font-semibold tracking-[0.2em] uppercase text-zinc-500">
                    {eyebrow}
                </div>
                <h3 className="mt-3 font-semibold text-zinc-900 text-lg leading-snug">{title}</h3>
                <p className="mt-2 text-sm text-zinc-600 leading-relaxed">{body}</p>
            </div>
        </motion.div>
    );
}

function Mockup({variant}: {variant: FeatureVariant}) {
    switch (variant) {
        case "hidden":
            return <HiddenMockup />;
        case "verifiable":
            return <VerifiableMockup />;
        case "open":
            return <OpenMockup />;
    }
}

/* ────────────────────────── shared bits ────────────────────────── */

function CornerChip({position, children}: {position: "tl" | "tr" | "bl" | "br"; children: React.ReactNode}) {
    const pos =
        position === "tl"
            ? "top-3 left-3"
            : position === "tr"
            ? "top-3 right-3"
            : position === "bl"
            ? "bottom-3 left-3"
            : "bottom-3 right-3";
    return (
        <div
            className={`absolute ${pos} size-9 rounded-xl bg-white border border-zinc-200 flex items-center justify-center shadow-sm text-zinc-900`}
        >
            {children}
        </div>
    );
}

/* ────────────────────────── card 1: hidden ────────────────────────── */

/**
 * Mockup: a "donations" widget with cipher header (●●●●●) and a bar chart
 * pulsing underneath, framed by a Lock chip top-left and an EyeOff chip
 * bottom-right.
 */
function HiddenMockup() {
    const bars = [
        {h: 30, delay: 0.0},
        {h: 55, delay: 0.1},
        {h: 40, delay: 0.2},
        {h: 70, delay: 0.3},
        {h: 50, delay: 0.4},
        {h: 80, delay: 0.5},
        {h: 65, delay: 0.6},
        {h: 90, delay: 0.7},
        {h: 55, delay: 0.8},
        {h: 75, delay: 0.9},
    ];

    return (
        <div className="absolute inset-3 rounded-xl bg-white border border-zinc-200 flex flex-col p-4 shadow-sm">
            <CornerChip position="tl">
                <Lock className="size-4" />
            </CornerChip>
            <CornerChip position="br">
                <EyeOff className="size-4" />
            </CornerChip>

            {/* Header — cipher row + caption */}
            <div className="ml-12 mr-12 mb-3">
                <div className="flex items-center gap-1.5">
                    {[0, 1, 2, 3, 4].map(i => (
                        <motion.span
                            key={i}
                            className="size-2.5 rounded-full bg-zinc-900"
                            animate={{opacity: [0.25, 1, 0.25]}}
                            transition={{
                                duration: 1.6,
                                repeat: Infinity,
                                ease: "easeInOut",
                                delay: i * 0.18,
                            }}
                        />
                    ))}
                    <span className="ml-1.5 text-[10px] font-mono text-zinc-500 uppercase tracking-wider">
                        cSGD
                    </span>
                </div>
                <div className="text-[9px] uppercase tracking-[0.18em] text-zinc-400 mt-0.5">
                    Per-donor amount
                </div>
            </div>

            {/* Bar chart filling remaining space */}
            <div className="flex-1 flex items-end gap-1 ml-12 mr-12">
                {bars.map((b, i) => (
                    <motion.div
                        key={i}
                        className="flex-1 rounded-t-sm bg-zinc-300"
                        initial={{height: `${b.h * 0.5}%`}}
                        animate={{height: [`${b.h * 0.5}%`, `${b.h}%`, `${b.h * 0.5}%`]}}
                        transition={{
                            duration: 2.4,
                            repeat: Infinity,
                            ease: "easeInOut",
                            delay: b.delay,
                        }}
                    />
                ))}
            </div>
        </div>
    );
}

/* ────────────────────────── card 2: verifiable ────────────────────────── */

/**
 * Mockup: a goal-progress widget. Big animated percentage counter in the
 * centre, four "donor pulse" dots ticking above it, and an animated arc
 * tracing in the background.
 */
function VerifiableMockup() {
    return (
        <div className="absolute inset-3 rounded-xl bg-white border border-zinc-200 flex flex-col items-center justify-center p-4 shadow-sm">
            <CornerChip position="tl">
                <ShieldCheck className="size-4" />
            </CornerChip>
            <CornerChip position="br">
                <Check className="size-4" />
            </CornerChip>

            {/* Donor pulse row */}
            <div className="flex items-center gap-2 mb-3">
                {[0, 1, 2, 3].map(i => (
                    <motion.span
                        key={i}
                        className="size-7 rounded-full bg-zinc-200 border-2 border-white"
                        animate={{
                            backgroundColor: ["rgb(228,228,231)", "rgb(24,24,27)", "rgb(228,228,231)"],
                            scale: [1, 1.08, 1],
                        }}
                        transition={{
                            duration: 2.6,
                            repeat: Infinity,
                            ease: "easeInOut",
                            delay: i * 0.4,
                        }}
                    />
                ))}
            </div>

            {/* Counter */}
            <AnimatedCounter />

            <div className="mt-2 text-[10px] uppercase tracking-[0.18em] text-zinc-500">
                Aggregate total
            </div>
        </div>
    );
}

function AnimatedCounter() {
    return (
        <div className="text-3xl font-semibold tabular-nums text-zinc-900 leading-none flex items-baseline">
            <motion.span
                animate={{opacity: [0.4, 1, 0.4]}}
                transition={{duration: 2.4, repeat: Infinity, ease: "easeInOut"}}
            >
                100
            </motion.span>
            <span className="text-base text-zinc-400">%</span>
        </div>
    );
}

/* ────────────────────────── card 3: open ────────────────────────── */

/**
 * Mockup: two pill nodes ("Wallet" and "Donate") connected by a line, with
 * a packet pulsing left → right, framed by a Globe chip top-left and a
 * Shield chip bottom-right.
 */
function OpenMockup() {
    return (
        <div className="absolute inset-3 rounded-xl bg-white border border-zinc-200 flex items-center justify-center p-4 shadow-sm">
            <CornerChip position="tl">
                <Globe className="size-4" />
            </CornerChip>
            <CornerChip position="br">
                <Shield className="size-4" />
            </CornerChip>

            <div className="flex items-center gap-3">
                {/* Wallet pill */}
                <div className="rounded-xl border border-zinc-200 bg-zinc-50 px-3 py-2 text-xs font-medium text-zinc-700 inline-flex items-center gap-1.5">
                    <span className="size-2 rounded-full bg-zinc-400" />
                    Wallet
                </div>

                {/* Connection with travelling packet */}
                <div className="relative h-px w-16 bg-zinc-200">
                    <motion.span
                        className="absolute -top-1 size-2 rounded-full bg-zinc-900"
                        initial={{left: 0}}
                        animate={{left: ["0%", "100%", "0%"]}}
                        transition={{duration: 2.4, repeat: Infinity, ease: "easeInOut"}}
                    />
                    <motion.span
                        className="absolute -top-2 size-4 rounded-full bg-zinc-900/15"
                        initial={{left: "-8px"}}
                        animate={{left: ["-8px", "calc(100% - 8px)", "-8px"]}}
                        transition={{duration: 2.4, repeat: Infinity, ease: "easeInOut"}}
                    />
                </div>

                {/* Donate pill */}
                <div className="rounded-xl border border-zinc-300 bg-zinc-900 px-3 py-2 text-xs font-medium text-white inline-flex items-center gap-1.5">
                    Donate
                    <ArrowRight className="size-3" />
                </div>
            </div>
        </div>
    );
}

// Re-export Eye to silence unused-import warnings if any consumer expects it.
export {Eye};

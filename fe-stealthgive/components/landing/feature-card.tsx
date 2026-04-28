"use client";

import {motion} from "framer-motion";

export type FeatureVariant = "hidden" | "verifiable" | "open";

type Props = {
    variant: FeatureVariant;
    eyebrow: string;
    title: string;
    body: string;
};

/**
 * Big "Three guarantees" feature card. Light visual zone (zinc-50/white)
 * with dark animated illustration so it reads as the inverse of the
 * dark-zone TouchpointCard further up the page — gives the landing a
 * dark→light→dark visual rhythm.
 */
export function FeatureCard({variant, eyebrow, title, body}: Props) {
    return (
        <motion.div
            whileHover={{y: -6}}
            transition={{type: "spring", stiffness: 260, damping: 22}}
            className="group h-full flex flex-col rounded-3xl bg-white border border-zinc-200 overflow-hidden hover:shadow-[0_20px_40px_-20px_rgba(0,0,0,0.18)] hover:ring-1 hover:ring-zinc-300 transition-shadow"
        >
            {/* Illustration zone */}
            <div className="relative aspect-[4/3] bg-gradient-to-br from-zinc-50 via-white to-zinc-100 overflow-hidden flex-shrink-0">
                <Illustration variant={variant} />
                <div
                    className="absolute inset-x-0 bottom-0 h-12 bg-gradient-to-t from-zinc-100/40 to-transparent pointer-events-none"
                    aria-hidden
                />
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

function Illustration({variant}: {variant: FeatureVariant}) {
    switch (variant) {
        case "hidden":
            return <HiddenIllustration />;
        case "verifiable":
            return <VerifiableIllustration />;
        case "open":
            return <OpenIllustration />;
    }
}

/**
 * "Per-donor amounts stay hidden" — masked digits ●●●●● flickering on/off,
 * with a lock icon orbiting overhead. Communicates encrypted/hidden values.
 */
function HiddenIllustration() {
    return (
        <div className="absolute inset-0 flex items-center justify-center">
            {/* Lock icon centred */}
            <motion.div
                className="absolute z-10"
                animate={{y: [0, -3, 0]}}
                transition={{duration: 2.6, repeat: Infinity, ease: "easeInOut"}}
            >
                <div className="size-14 rounded-2xl bg-zinc-900 text-white flex items-center justify-center shadow-lg">
                    <svg viewBox="0 0 24 24" fill="none" className="size-7">
                        <path
                            d="M6 10V7a6 6 0 1 1 12 0v3M5 10h14a1 1 0 0 1 1 1v9a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1v-9a1 1 0 0 1 1-1Zm7 4v3"
                            stroke="currentColor"
                            strokeWidth="1.6"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                        />
                    </svg>
                </div>
            </motion.div>

            {/* Masked dots row above the lock */}
            <div className="absolute top-6 flex gap-1.5">
                {[0, 1, 2, 3, 4].map(i => (
                    <motion.div
                        key={i}
                        className="size-2 rounded-full bg-zinc-900"
                        animate={{opacity: [0.2, 1, 0.2]}}
                        transition={{
                            duration: 1.6,
                            repeat: Infinity,
                            ease: "easeInOut",
                            delay: i * 0.18,
                        }}
                    />
                ))}
            </div>

            {/* Faint number "ghost" peeking through underneath, never resolves */}
            <motion.div
                className="absolute bottom-7 font-mono text-2xl tracking-widest text-zinc-300 select-none"
                animate={{opacity: [0.15, 0.4, 0.15]}}
                transition={{duration: 3, repeat: Infinity, ease: "easeInOut"}}
            >
                **** ****
            </motion.div>
        </div>
    );
}

/**
 * "Total raised stays verifiable" — animated progress ring filling up to
 * a check mark. Communicates public proof / verifiability.
 */
function VerifiableIllustration() {
    const radius = 38;
    const circumference = 2 * Math.PI * radius;
    return (
        <div className="absolute inset-0 flex items-center justify-center">
            <svg viewBox="0 0 100 100" className="size-32">
                {/* Track */}
                <circle
                    cx="50"
                    cy="50"
                    r={radius}
                    stroke="rgba(0,0,0,0.08)"
                    strokeWidth="6"
                    fill="none"
                />
                {/* Animated arc */}
                <motion.circle
                    cx="50"
                    cy="50"
                    r={radius}
                    stroke="rgb(24,24,27)"
                    strokeWidth="6"
                    fill="none"
                    strokeLinecap="round"
                    transform="rotate(-90 50 50)"
                    initial={{strokeDasharray: circumference, strokeDashoffset: circumference}}
                    animate={{strokeDashoffset: [circumference, circumference * 0.15, circumference]}}
                    transition={{duration: 4, repeat: Infinity, ease: "easeInOut"}}
                />
                {/* Check mark in centre */}
                <motion.path
                    d="M38 51 L46 59 L62 41"
                    stroke="rgb(24,24,27)"
                    strokeWidth="3.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    fill="none"
                    initial={{pathLength: 0}}
                    animate={{pathLength: [0, 1, 1, 0]}}
                    transition={{
                        duration: 4,
                        repeat: Infinity,
                        ease: "easeInOut",
                        times: [0, 0.4, 0.85, 1],
                    }}
                />
            </svg>

            {/* Tiny rising tick marks beside the ring suggesting growing total */}
            <div className="absolute right-12 flex items-end gap-1 h-12">
                {[0, 1, 2, 3].map(i => (
                    <motion.div
                        key={i}
                        className="w-1 rounded-sm bg-zinc-900/70"
                        initial={{height: 4}}
                        animate={{height: [4, 8 + i * 6, 4]}}
                        transition={{
                            duration: 2.4,
                            repeat: Infinity,
                            ease: "easeInOut",
                            delay: i * 0.15,
                        }}
                    />
                ))}
            </div>
        </div>
    );
}

/**
 * "Self-sovereign onboarding" — three nodes connected by a line that
 * carries a "data packet" pulse from left to right, communicating
 * unrestricted flow. No gatekeeper, just user → wallet → app.
 */
function OpenIllustration() {
    return (
        <div className="absolute inset-0 flex items-center justify-center">
            <svg viewBox="0 0 240 100" className="w-3/4">
                {/* Connection line */}
                <line
                    x1="30"
                    y1="50"
                    x2="210"
                    y2="50"
                    stroke="rgb(212,212,216)"
                    strokeWidth="2"
                />
                {/* Three nodes */}
                {[30, 120, 210].map((cx, i) => (
                    <g key={cx}>
                        <motion.circle
                            cx={cx}
                            cy="50"
                            r={14}
                            fill="rgb(24,24,27)"
                            animate={{r: [14, 16, 14]}}
                            transition={{
                                duration: 2.2,
                                repeat: Infinity,
                                ease: "easeInOut",
                                delay: i * 0.4,
                            }}
                        />
                        <circle cx={cx} cy="50" r="5" fill="white" />
                    </g>
                ))}

                {/* Travelling packet */}
                <motion.circle
                    r="4"
                    fill="rgb(24,24,27)"
                    cy="50"
                    initial={{cx: 30}}
                    animate={{cx: [30, 210, 210]}}
                    transition={{
                        duration: 2.6,
                        repeat: Infinity,
                        ease: "easeInOut",
                        times: [0, 0.7, 1],
                    }}
                />
                <motion.circle
                    r="8"
                    fill="rgba(24,24,27,0.2)"
                    cy="50"
                    initial={{cx: 30}}
                    animate={{cx: [30, 210, 210]}}
                    transition={{
                        duration: 2.6,
                        repeat: Infinity,
                        ease: "easeInOut",
                        times: [0, 0.7, 1],
                    }}
                />
            </svg>

            {/* Caption-style chain of words */}
            <div className="absolute bottom-6 flex items-center gap-3 text-[9px] font-mono uppercase tracking-[0.18em] text-zinc-500">
                <span>Wallet</span>
                <span className="text-zinc-300">─</span>
                <span>Encrypt</span>
                <span className="text-zinc-300">─</span>
                <span>Donate</span>
            </div>
        </div>
    );
}

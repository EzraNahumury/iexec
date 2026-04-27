"use client";

import {motion} from "framer-motion";

export type TouchpointVariant = "copy" | "image" | "audit" | "review" | "impact";

type Props = {
    variant: TouchpointVariant;
    tag: string;
    title: string;
    description: string;
};

// Monochrome to match the rest of the page. We vary gradient direction
// and stop ordering per variant so each card still feels distinct, but
// the colour story stays strictly black-and-white.
const palettes: Record<TouchpointVariant, {bg: string; accent: string; ring: string}> = {
    copy: {
        bg: "from-zinc-900 via-zinc-800 to-zinc-700",
        accent: "text-zinc-900",
        ring: "ring-zinc-300",
    },
    image: {
        bg: "from-zinc-700 via-zinc-900 to-zinc-800",
        accent: "text-zinc-900",
        ring: "ring-zinc-300",
    },
    audit: {
        bg: "from-zinc-800 via-zinc-700 to-zinc-900",
        accent: "text-zinc-900",
        ring: "ring-zinc-300",
    },
    review: {
        bg: "from-zinc-900 via-zinc-700 to-zinc-900",
        accent: "text-zinc-900",
        ring: "ring-zinc-300",
    },
    impact: {
        bg: "from-zinc-700 via-zinc-800 to-black",
        accent: "text-zinc-900",
        ring: "ring-zinc-300",
    },
};

/**
 * One ChainGPT touchpoint card. Each variant ships with a bespoke
 * micro-illustration animated in SVG so the cards don't look
 * cookie-cutter. Hover lifts the card and amplifies the artwork.
 */
export function TouchpointCard({variant, tag, title, description}: Props) {
    const palette = palettes[variant];

    return (
        <motion.div
            whileHover={{y: -6}}
            transition={{type: "spring", stiffness: 260, damping: 22}}
            className={`group rounded-3xl border border-zinc-200 bg-white overflow-hidden hover:shadow-[0_20px_40px_-20px_rgba(0,0,0,0.2)] hover:ring-1 ${palette.ring} transition-shadow`}
        >
            {/* Illustration area */}
            <div
                className={`relative aspect-[5/3] bg-gradient-to-br ${palette.bg} overflow-hidden`}
            >
                <Illustration variant={variant} />
                {/* Soft inner highlight + bottom darken for depth */}
                <div
                    className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(255,255,255,0.35),transparent_60%)] pointer-events-none"
                    aria-hidden
                />
                <div
                    className="absolute inset-x-0 bottom-0 h-12 bg-gradient-to-t from-black/15 to-transparent pointer-events-none"
                    aria-hidden
                />
            </div>

            {/* Body */}
            <div className="p-5">
                <div className={`text-[10px] font-semibold tracking-[0.18em] uppercase ${palette.accent}`}>
                    {tag}
                </div>
                <h3 className="mt-2 font-semibold text-zinc-900 leading-snug">{title}</h3>
                <p className="mt-1.5 text-xs text-zinc-600 leading-relaxed">{description}</p>
            </div>
        </motion.div>
    );
}

/* ─────────────────────── illustrations ─────────────────────── */

function Illustration({variant}: {variant: TouchpointVariant}) {
    switch (variant) {
        case "copy":
            return <CopyIllustration />;
        case "image":
            return <ImageIllustration />;
        case "audit":
            return <AuditIllustration />;
        case "review":
            return <ReviewIllustration />;
        case "impact":
            return <ImpactIllustration />;
    }
}

/** Sparkles drifting upward, plus a stylised "Aa" mark to suggest text. */
function CopyIllustration() {
    return (
        <div className="absolute inset-0 flex items-center justify-center">
            {/* Big A in the centre */}
            <motion.div
                className="text-white/90 font-serif italic text-[68px] leading-none select-none"
                animate={{rotate: [0, 1.5, 0, -1.5, 0]}}
                transition={{duration: 6, repeat: Infinity, ease: "easeInOut"}}
            >
                Aa
            </motion.div>

            {/* Floating sparkles */}
            {[
                {x: "20%", y: "30%", size: 6, delay: 0},
                {x: "75%", y: "25%", size: 4, delay: 1.2},
                {x: "30%", y: "70%", size: 5, delay: 0.6},
                {x: "70%", y: "65%", size: 3, delay: 1.8},
                {x: "50%", y: "20%", size: 4, delay: 0.3},
            ].map((s, i) => (
                <motion.div
                    key={i}
                    className="absolute rounded-full bg-white"
                    style={{left: s.x, top: s.y, width: s.size, height: s.size}}
                    animate={{
                        y: [0, -8, 0],
                        opacity: [0.4, 1, 0.4],
                        scale: [0.8, 1.2, 0.8],
                    }}
                    transition={{
                        duration: 2.8 + i * 0.3,
                        repeat: Infinity,
                        ease: "easeInOut",
                        delay: s.delay,
                    }}
                />
            ))}
        </div>
    );
}

/** Animated colour squares assembling a "frame", evoking image generation. */
function ImageIllustration() {
    const cells = Array.from({length: 9}, (_, i) => i);
    return (
        <div className="absolute inset-0 flex items-center justify-center">
            <motion.div
                className="grid grid-cols-3 gap-1 size-20"
                animate={{rotate: [0, 4, 0, -4, 0]}}
                transition={{duration: 8, repeat: Infinity, ease: "easeInOut"}}
            >
                {cells.map(i => (
                    <motion.div
                        key={i}
                        className="rounded-sm bg-white"
                        animate={{opacity: [0.35, 1, 0.35]}}
                        transition={{
                            duration: 2.2,
                            repeat: Infinity,
                            ease: "easeInOut",
                            delay: i * 0.12,
                        }}
                    />
                ))}
            </motion.div>
            {/* Outer frame */}
            <div className="absolute size-24 border-2 border-white/40 rounded-md" />
        </div>
    );
}

/** Shield with vertical scanning beam. */
function AuditIllustration() {
    return (
        <div className="absolute inset-0 flex items-center justify-center">
            <svg viewBox="0 0 100 100" className="w-24 h-24">
                <defs>
                    <linearGradient id="shield-fill" x1="0" x2="0" y1="0" y2="1">
                        <stop offset="0%" stopColor="white" stopOpacity="0.9" />
                        <stop offset="100%" stopColor="white" stopOpacity="0.6" />
                    </linearGradient>
                </defs>
                {/* Shield outline */}
                <path
                    d="M50 10 L82 22 V52 C82 70 68 84 50 92 C32 84 18 70 18 52 V22 Z"
                    fill="url(#shield-fill)"
                    stroke="white"
                    strokeWidth="1.5"
                />
                {/* Inner check */}
                <path
                    d="M36 52 L46 62 L66 42"
                    stroke="white"
                    strokeWidth="3"
                    fill="none"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="opacity-60"
                />
            </svg>
            {/* Scanning beam */}
            <motion.div
                className="absolute inset-x-0 h-[2px] bg-white/70"
                style={{boxShadow: "0 0 12px rgba(255,255,255,0.9)"}}
                animate={{top: ["20%", "80%", "20%"]}}
                transition={{duration: 3, repeat: Infinity, ease: "easeInOut"}}
            />
        </div>
    );
}

/** Concentric sonar rings expanding outward. */
function ReviewIllustration() {
    return (
        <div className="absolute inset-0 flex items-center justify-center">
            {[0, 1, 2].map(i => (
                <motion.div
                    key={i}
                    className="absolute rounded-full border-2 border-white/80"
                    initial={{width: 28, height: 28, opacity: 0}}
                    animate={{
                        width: ["28px", "120px"],
                        height: ["28px", "120px"],
                        opacity: [0.9, 0],
                    }}
                    transition={{
                        duration: 2.4,
                        repeat: Infinity,
                        ease: "easeOut",
                        delay: i * 0.8,
                    }}
                />
            ))}
            {/* Centre dot */}
            <div className="size-3 rounded-full bg-white shadow-[0_0_18px_rgba(255,255,255,0.9)]" />
        </div>
    );
}

/** Bar chart growing rhythmically. */
function ImpactIllustration() {
    const bars = [
        {h: [30, 60, 30], delay: 0},
        {h: [45, 80, 45], delay: 0.2},
        {h: [55, 90, 55], delay: 0.4},
        {h: [40, 70, 40], delay: 0.6},
        {h: [70, 95, 70], delay: 0.8},
    ];
    return (
        <div className="absolute inset-0 flex items-end justify-center gap-2 px-6 pb-6">
            {bars.map((b, i) => (
                <motion.div
                    key={i}
                    className="w-3 rounded-t-sm bg-white/90"
                    animate={{height: b.h.map(v => `${v}%`)}}
                    transition={{
                        duration: 2.6,
                        repeat: Infinity,
                        ease: "easeInOut",
                        delay: b.delay,
                    }}
                />
            ))}
        </div>
    );
}

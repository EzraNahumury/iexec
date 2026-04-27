"use client";

import {ArrowRight, Coins, Heart, Plus} from "lucide-react";
import Link from "next/link";
import {useState} from "react";
import {motion, AnimatePresence} from "framer-motion";

type Path = {
    id: string;
    icon: React.ReactNode;
    eyebrow: string;
    title: string;
    body: string;
    bullets: string[];
    cta: string;
    href: string;
    chipBg: string;
    accent: string; // text-${accent}-500 etc.
};

const paths: Path[] = [
    {
        id: "donate",
        icon: <Heart className="size-7" strokeWidth={2.5} />,
        eyebrow: "Donate",
        title: "Browse campaigns & donate privately",
        body:
            "Pick a cause that matters to you. Donations are encrypted client-side via the iExec Nox gateway — nobody can see how much you gave, including the campaign creator.",
        bullets: [
            "Encrypted client-side",
            "Aggregate publicly verifiable",
            "Refundable if goal missed",
            "Powered by ERC-7984",
        ],
        cta: "Browse Campaigns",
        href: "/campaigns",
        chipBg: "bg-rose-500",
        accent: "rose",
    },
    {
        id: "create",
        icon: <Plus className="size-7" strokeWidth={2.5} />,
        eyebrow: "Create",
        title: "Launch a confidential fundraiser",
        body:
            "Start a campaign for a cause where donor privacy matters: press freedom, mutual aid, dissident funds. AI helps you draft the copy and a hero image in seconds.",
        bullets: [
            "AI campaign copy",
            "AI-generated hero image",
            "Inline ChainGPT contract audit",
            "Per-campaign AI risk review",
        ],
        cta: "Start a Campaign",
        href: "/create",
        chipBg: "bg-violet-600",
        accent: "violet",
    },
    {
        id: "wallet",
        icon: <Coins className="size-7" strokeWidth={2.5} />,
        eyebrow: "Wallet",
        title: "Get test tokens & manage cSGD",
        body:
            "Claim 1,000 SGD per 24h, wrap into confidential cSGD via the iExec ERC-7984 wrapper, then reveal your encrypted balance with a gasless EIP-712 signature.",
        bullets: [
            "Claim 1,000 SGD per 24h",
            "Wrap SGD → cSGD 1:1",
            "Reveal balance via Nox gateway",
            "Zero KYC, zero Circle dep",
        ],
        cta: "Open Dashboard",
        href: "/dashboard",
        chipBg: "bg-zinc-900",
        accent: "zinc",
    },
];

export default function WelcomePage() {
    const [active, setActive] = useState<Path>(paths[0]);

    return (
        <div className="relative min-h-[calc(100vh-72px)] bg-white overflow-hidden">
            {/* Subtle grid background */}
            <div className="absolute inset-0 bg-grid pointer-events-none opacity-60" aria-hidden />
            <div
                className="absolute inset-0 pointer-events-none"
                style={{
                    background:
                        "radial-gradient(ellipse 80% 60% at 50% 30%, rgba(255,255,255,1), rgba(255,255,255,0.6))",
                }}
                aria-hidden
            />

            <div className="relative max-w-2xl mx-auto px-6 pt-14 pb-24">
                {/* Logo */}
                <motion.div
                    initial={{opacity: 0, y: 8, scale: 0.9}}
                    animate={{opacity: 1, y: 0, scale: 1}}
                    transition={{duration: 0.5, ease: [0.22, 0.61, 0.36, 1]}}
                    className="flex justify-center mb-7"
                >
                    <div className="size-14 rounded-full bg-zinc-900 text-white inline-flex items-center justify-center text-2xl shadow-[0_8px_24px_rgba(0,0,0,0.12)]">
                        🦑
                    </div>
                </motion.div>

                {/* Heading */}
                <motion.h1
                    initial={{opacity: 0, y: 12}}
                    animate={{opacity: 1, y: 0}}
                    transition={{duration: 0.6, delay: 0.1}}
                    className="text-center text-4xl md:text-5xl tracking-tight text-zinc-900"
                >
                    Welcome to{" "}
                    <span className="font-serif italic">StealthGive</span>
                </motion.h1>

                <motion.p
                    initial={{opacity: 0}}
                    animate={{opacity: 1}}
                    transition={{duration: 0.5, delay: 0.25}}
                    className="text-center text-zinc-600 mt-4"
                >
                    Choose how you want to continue.{" "}
                    <Link
                        href="/"
                        className="text-zinc-900 underline underline-offset-4 hover:text-violet-600 transition-colors"
                    >
                        Back to homepage
                    </Link>
                </motion.p>

                {/* Path tab strip */}
                <motion.div
                    initial={{opacity: 0, y: 12}}
                    animate={{opacity: 1, y: 0}}
                    transition={{duration: 0.6, delay: 0.35}}
                    className="mt-10 flex justify-center gap-3"
                >
                    {paths.map(p => {
                        const isActive = active.id === p.id;
                        return (
                            <button
                                key={p.id}
                                onClick={() => setActive(p)}
                                className={`size-14 md:size-16 rounded-full inline-flex items-center justify-center transition-all border-2 ${
                                    isActive
                                        ? `${p.chipBg} text-white border-transparent shadow-lg scale-110`
                                        : "bg-white border-zinc-300 text-zinc-500 hover:border-zinc-900 hover:text-zinc-900"
                                }`}
                                aria-label={p.eyebrow}
                            >
                                {p.icon}
                            </button>
                        );
                    })}
                </motion.div>

                {/* Active path card */}
                <motion.div
                    initial={{opacity: 0, y: 24}}
                    animate={{opacity: 1, y: 0}}
                    transition={{duration: 0.6, delay: 0.45}}
                    className="mt-8 rounded-3xl border border-zinc-200 bg-white shadow-[0_20px_48px_-20px_rgba(0,0,0,0.15)] overflow-hidden"
                >
                    {/* Hero strip — dotted pattern + floating decorations + connecting arc */}
                    <div className="relative aspect-[16/7] bg-gradient-to-br from-zinc-50 via-white to-zinc-100 overflow-hidden">
                        {/* Dotted grid pattern */}
                        <svg
                            className="absolute inset-0 w-full h-full"
                            xmlns="http://www.w3.org/2000/svg"
                            aria-hidden
                        >
                            <defs>
                                <pattern
                                    id="dots"
                                    width="20"
                                    height="20"
                                    patternUnits="userSpaceOnUse"
                                >
                                    <circle cx="10" cy="10" r="1" fill="rgba(0,0,0,0.08)" />
                                </pattern>
                                <radialGradient id="halo" cx="50%" cy="55%" r="35%">
                                    <stop offset="0%" stopColor="white" stopOpacity="0.95" />
                                    <stop offset="100%" stopColor="white" stopOpacity="0" />
                                </radialGradient>
                            </defs>
                            <rect width="100%" height="100%" fill="url(#dots)" />
                            <rect width="100%" height="100%" fill="url(#halo)" />
                        </svg>

                        {/* Floating decorative particles */}
                        {[
                            {top: "18%", left: "12%", size: "size-1.5", delay: 0},
                            {top: "70%", left: "20%", size: "size-1", delay: 0.6},
                            {top: "30%", left: "85%", size: "size-2", delay: 1.2},
                            {top: "78%", left: "82%", size: "size-1", delay: 0.3},
                            {top: "12%", left: "55%", size: "size-1", delay: 0.9},
                            {top: "85%", left: "48%", size: "size-1.5", delay: 0.4},
                        ].map((p, i) => (
                            <motion.div
                                key={i}
                                className={`absolute rounded-full bg-zinc-300 ${p.size}`}
                                style={{top: p.top, left: p.left}}
                                animate={{y: [0, -6, 0], opacity: [0.4, 0.9, 0.4]}}
                                transition={{
                                    duration: 3 + p.delay,
                                    delay: p.delay,
                                    repeat: Infinity,
                                    ease: "easeInOut",
                                }}
                                aria-hidden
                            />
                        ))}

                        {/* Chips row */}
                        <div className="relative h-full flex items-center justify-center gap-8 z-10">
                            {paths.map(p => {
                                const isActive = active.id === p.id;
                                return (
                                    <motion.button
                                        key={p.id}
                                        layout
                                        onClick={() => setActive(p)}
                                        transition={{
                                            type: "spring",
                                            stiffness: 300,
                                            damping: 26,
                                        }}
                                        className={`relative rounded-full inline-flex items-center justify-center transition-shadow ${
                                            isActive
                                                ? `${p.chipBg} text-white size-24 md:size-28 shadow-xl border-4 border-white`
                                                : "bg-white border-2 border-zinc-200 text-zinc-300 size-12 md:size-14 hover:border-zinc-400 hover:text-zinc-500"
                                        }`}
                                        aria-label={p.eyebrow}
                                    >
                                        {/* Pulsing halo around active chip */}
                                        {isActive && (
                                            <motion.span
                                                className={`absolute inset-0 rounded-full ${p.chipBg} -z-10`}
                                                animate={{scale: [1, 1.4, 1], opacity: [0.3, 0, 0.3]}}
                                                transition={{
                                                    duration: 2.4,
                                                    repeat: Infinity,
                                                    ease: "easeOut",
                                                }}
                                            />
                                        )}
                                        {p.icon}
                                    </motion.button>
                                );
                            })}
                        </div>
                    </div>

                    <AnimatePresence mode="wait">
                        <motion.div
                            key={active.id}
                            initial={{opacity: 0, y: 8}}
                            animate={{opacity: 1, y: 0}}
                            exit={{opacity: 0, y: -8}}
                            transition={{duration: 0.25}}
                            className="p-7 md:p-8"
                        >
                            <div className="flex items-center gap-2 mb-4">
                                <span className="text-[11px] font-semibold tracking-[0.18em] uppercase px-2.5 py-1 rounded-full bg-zinc-900 text-white">
                                    {active.eyebrow}
                                </span>
                                <span className="text-[11px] font-medium tracking-wide px-2.5 py-1 rounded-full bg-zinc-100 text-zinc-700 border border-zinc-200">
                                    iExec Nox
                                </span>
                                <span className="text-[11px] font-medium tracking-wide px-2.5 py-1 rounded-full bg-zinc-100 text-zinc-700 border border-zinc-200">
                                    ERC-7984
                                </span>
                            </div>

                            <h2 className="text-2xl md:text-[28px] font-semibold tracking-tight text-zinc-900 mb-3 leading-tight">
                                {active.title}
                            </h2>

                            <p className="text-[15px] text-zinc-600 leading-relaxed mb-6">{active.body}</p>

                            <div className="grid grid-cols-2 gap-y-2.5 gap-x-6 mb-7 text-sm text-zinc-800">
                                {active.bullets.map(b => (
                                    <div key={b} className="flex items-center gap-2.5">
                                        <span className={`size-1.5 rounded-full ${active.chipBg}`} />
                                        {b}
                                    </div>
                                ))}
                            </div>

                            <Link
                                href={active.href}
                                className={`group w-full rounded-2xl ${active.chipBg} hover:opacity-90 px-6 py-4 inline-flex items-center justify-center gap-2 text-sm font-semibold text-white shadow-[0_8px_24px_-8px_rgba(0,0,0,0.25)] transition-all`}
                            >
                                {active.cta}
                                <ArrowRight className="size-4 group-hover:translate-x-0.5 transition-transform" />
                            </Link>
                        </motion.div>
                    </AnimatePresence>
                </motion.div>

                {/* Footer hint */}
                <motion.p
                    initial={{opacity: 0}}
                    animate={{opacity: 1}}
                    transition={{duration: 0.5, delay: 0.6}}
                    className="text-center text-xs text-zinc-500 mt-8"
                >
                    All flows happen on Arbitrum Sepolia. No mainnet funds at risk.
                </motion.p>
            </div>
        </div>
    );
}

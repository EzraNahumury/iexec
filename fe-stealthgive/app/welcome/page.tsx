"use client";

import {ArrowRight, Coins, Heart, Plus} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import {useState} from "react";
import {motion, AnimatePresence} from "framer-motion";

type Path = {
    id: string;
    icon: React.ReactNode;
    eyebrow: string;
    tags: string[];
    title: string;
    body: string;
    bullets: string[];
    cta: string;
    href: string;
};

const paths: Path[] = [
    {
        id: "donate",
        icon: <Heart className="size-6" strokeWidth={2.4} fill="currentColor" />,
        eyebrow: "Donate",
        tags: ["iExec Nox", "ERC-7984"],
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
    },
    {
        id: "create",
        icon: <Plus className="size-6" strokeWidth={2.6} />,
        eyebrow: "Create",
        tags: ["ChainGPT", "AI-assisted"],
        title: "Launch a confidential fundraiser",
        body:
            "Start a campaign for a cause where donor privacy matters: press freedom, mutual aid, dissident funds. AI helps you draft the copy and a hero image in seconds.",
        bullets: [
            "AI campaign copy",
            "AI-generated hero image",
            "Inline contract audit",
            "Per-campaign risk review",
        ],
        cta: "Start a Campaign",
        href: "/create",
    },
    {
        id: "wallet",
        icon: <Coins className="size-6" strokeWidth={2.4} />,
        eyebrow: "Wallet",
        tags: ["Arbitrum Sepolia", "Self-sovereign"],
        title: "Get test tokens & manage cSGD",
        body:
            "Claim 1,000 SGD per 24h, wrap into confidential cSGD via the iExec ERC-7984 wrapper, then reveal your encrypted balance with a gasless EIP-712 signature.",
        bullets: [
            "Claim 1,000 SGD / 24h",
            "Wrap SGD → cSGD 1:1",
            "Reveal via Nox gateway",
            "Zero KYC, zero Circle",
        ],
        cta: "Open Dashboard",
        href: "/dashboard",
    },
];

export default function WelcomePage() {
    const [active, setActive] = useState<Path>(paths[0]);

    return (
        <div className="relative min-h-[calc(100vh-72px)] bg-white overflow-hidden">
            {/* Subtle full-page grid background */}
            <div className="absolute inset-0 bg-grid pointer-events-none opacity-50" aria-hidden />
            <div
                className="absolute inset-0 pointer-events-none"
                style={{
                    background:
                        "radial-gradient(ellipse 80% 70% at 50% 30%, rgba(255,255,255,1), rgba(255,255,255,0.5))",
                }}
                aria-hidden
            />

            <div className="relative max-w-2xl mx-auto px-6 pt-14 md:pt-20 pb-24">
                {/* Logo */}
                <motion.div
                    initial={{opacity: 0, y: 8, scale: 0.9}}
                    animate={{opacity: 1, y: 0, scale: 1}}
                    transition={{duration: 0.5, ease: [0.22, 0.61, 0.36, 1]}}
                    className="flex justify-center mb-8"
                >
                    <div className="size-16 inline-flex items-center justify-center overflow-hidden">
                        <Image
                            src="/logo-new-removebg-preview.png"
                            alt="StealthGive"
                            width={64}
                            height={64}
                            className="size-full object-contain"
                            priority
                        />
                    </div>
                </motion.div>

                {/* Heading + sub-line */}
                <motion.h1
                    initial={{opacity: 0, y: 12}}
                    animate={{opacity: 1, y: 0}}
                    transition={{duration: 0.6, delay: 0.1}}
                    className="text-center text-5xl md:text-6xl tracking-tight text-zinc-900 leading-[1.1]"
                >
                    Welcome to{" "}
                    <span className="font-serif italic font-light">StealthGive</span>
                </motion.h1>

                <motion.p
                    initial={{opacity: 0}}
                    animate={{opacity: 1}}
                    transition={{duration: 0.5, delay: 0.25}}
                    className="text-center text-zinc-600 mt-4"
                >
                    Choose how you want to continue.
                </motion.p>

                <motion.div
                    initial={{opacity: 0}}
                    animate={{opacity: 1}}
                    transition={{duration: 0.5, delay: 0.3}}
                    className="text-center mt-1"
                >
                    <Link
                        href="/"
                        className="text-sm text-zinc-700 underline underline-offset-4 hover:text-zinc-900 transition-colors"
                    >
                        Back to homepage
                    </Link>
                </motion.div>

                {/* Card */}
                <motion.div
                    initial={{opacity: 0, y: 24}}
                    animate={{opacity: 1, y: 0}}
                    transition={{duration: 0.7, delay: 0.4}}
                    className="mt-10 rounded-3xl border border-zinc-200 bg-white shadow-[0_24px_60px_-24px_rgba(0,0,0,0.18)] overflow-hidden"
                >
                    {/* Hero zone — three uniform chips on a clean dotted backdrop */}
                    <div className="relative aspect-[16/8] bg-gradient-to-br from-zinc-50 to-zinc-100 overflow-hidden">
                        <svg
                            className="absolute inset-0 w-full h-full"
                            xmlns="http://www.w3.org/2000/svg"
                            aria-hidden
                        >
                            <defs>
                                <pattern
                                    id="welcome-dots"
                                    width="22"
                                    height="22"
                                    patternUnits="userSpaceOnUse"
                                >
                                    <circle cx="11" cy="11" r="1" fill="rgba(0,0,0,0.07)" />
                                </pattern>
                            </defs>
                            <rect width="100%" height="100%" fill="url(#welcome-dots)" />
                        </svg>
                        <div
                            className="absolute inset-0"
                            style={{
                                background:
                                    "radial-gradient(ellipse 50% 50% at 50% 50%, rgba(255,255,255,0.95), rgba(255,255,255,0))",
                            }}
                            aria-hidden
                        />

                        <div className="relative h-full flex items-center justify-center gap-6 z-10">
                            {paths.map(p => {
                                const isActive = active.id === p.id;
                                return (
                                    <motion.button
                                        key={p.id}
                                        onClick={() => setActive(p)}
                                        whileHover={{scale: isActive ? 1 : 1.06}}
                                        whileTap={{scale: 0.94}}
                                        animate={{scale: isActive ? 1.08 : 1}}
                                        transition={{
                                            type: "spring",
                                            stiffness: 280,
                                            damping: 22,
                                        }}
                                        className={`size-16 md:size-20 rounded-full inline-flex items-center justify-center transition-colors ${
                                            isActive
                                                ? "bg-zinc-900 text-white shadow-xl"
                                                : "bg-white border border-zinc-200 text-zinc-400 hover:text-zinc-700 hover:border-zinc-400"
                                        }`}
                                        aria-label={p.eyebrow}
                                    >
                                        {p.icon}
                                    </motion.button>
                                );
                            })}
                        </div>
                    </div>

                    {/* Body */}
                    <AnimatePresence mode="wait">
                        <motion.div
                            key={active.id}
                            initial={{opacity: 0, y: 8}}
                            animate={{opacity: 1, y: 0}}
                            exit={{opacity: 0, y: -8}}
                            transition={{duration: 0.25}}
                            className="p-7 md:p-8"
                        >
                            {/* Tag row — 1 dark eyebrow + 2 light tags */}
                            <div className="flex items-center gap-2 mb-5">
                                <span className="text-[11px] font-semibold tracking-[0.18em] uppercase px-3 py-1 rounded-full bg-zinc-900 text-white">
                                    {active.eyebrow}
                                </span>
                                {active.tags.map(t => (
                                    <span
                                        key={t}
                                        className="text-[11px] font-medium px-3 py-1 rounded-full bg-zinc-100 text-zinc-700 border border-zinc-200"
                                    >
                                        {t}
                                    </span>
                                ))}
                            </div>

                            <h2 className="text-2xl md:text-[28px] font-semibold tracking-tight text-zinc-900 mb-3 leading-tight">
                                {active.title}
                            </h2>

                            <p className="text-[15px] text-zinc-600 leading-relaxed mb-6">{active.body}</p>

                            {/* 2x2 feature grid */}
                            <div className="grid grid-cols-2 gap-y-2.5 gap-x-6 mb-7 text-sm text-zinc-700">
                                {active.bullets.map(b => (
                                    <div key={b} className="flex items-center gap-2.5">
                                        <span className="size-1.5 rounded-full bg-zinc-400" />
                                        {b}
                                    </div>
                                ))}
                            </div>

                            {/* Outline CTA */}
                            <Link
                                href={active.href}
                                className="group block w-full rounded-2xl border border-zinc-200 bg-white hover:bg-zinc-50 hover:border-zinc-400 px-6 py-4 transition-colors"
                            >
                                <span className="flex items-center justify-center gap-2 text-sm font-semibold text-zinc-900">
                                    {active.cta}
                                    <ArrowRight className="size-4 group-hover:translate-x-0.5 transition-transform" />
                                </span>
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

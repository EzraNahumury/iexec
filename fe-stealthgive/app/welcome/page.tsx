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
    chipText: string;
};

const paths: Path[] = [
    {
        id: "donate",
        icon: <Heart className="size-7" />,
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
        chipText: "text-white",
    },
    {
        id: "create",
        icon: <Plus className="size-7" />,
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
        chipText: "text-white",
    },
    {
        id: "wallet",
        icon: <Coins className="size-7" />,
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
        chipText: "text-white",
    },
];

export default function WelcomePage() {
    const [active, setActive] = useState<Path>(paths[0]);

    return (
        <div className="min-h-screen flex items-start justify-center px-6 pt-16 pb-24 bg-white">
            <div className="w-full max-w-2xl">
                {/* Logo */}
                <motion.div
                    initial={{opacity: 0, y: 12}}
                    animate={{opacity: 1, y: 0}}
                    transition={{duration: 0.5}}
                    className="flex justify-center mb-6"
                >
                    <div className="size-12 rounded-full bg-zinc-900 text-white inline-flex items-center justify-center text-xl">
                        🦑
                    </div>
                </motion.div>

                {/* Heading */}
                <motion.div
                    initial={{opacity: 0, y: 16}}
                    animate={{opacity: 1, y: 0}}
                    transition={{duration: 0.6, delay: 0.1}}
                    className="text-center mb-3"
                >
                    <h1 className="text-4xl md:text-5xl tracking-tight">
                        Welcome to{" "}
                        <span className="font-serif italic font-light">StealthGive</span>
                    </h1>
                </motion.div>

                <motion.p
                    initial={{opacity: 0}}
                    animate={{opacity: 1}}
                    transition={{duration: 0.5, delay: 0.25}}
                    className="text-center text-zinc-500"
                >
                    Choose how you want to continue.{" "}
                    <Link
                        href="/"
                        className="underline underline-offset-2 hover:text-zinc-900 transition-colors"
                    >
                        Back to homepage
                    </Link>
                </motion.p>

                {/* Path tab strip */}
                <motion.div
                    initial={{opacity: 0, y: 12}}
                    animate={{opacity: 1, y: 0}}
                    transition={{duration: 0.6, delay: 0.35}}
                    className="mt-12 flex justify-center gap-3"
                >
                    {paths.map(p => (
                        <button
                            key={p.id}
                            onClick={() => setActive(p)}
                            className={`size-14 md:size-16 rounded-full inline-flex items-center justify-center transition-all border ${
                                active.id === p.id
                                    ? `${p.chipBg} ${p.chipText} border-transparent shadow-md scale-105`
                                    : "bg-white border-zinc-200 text-zinc-400 hover:border-zinc-400 hover:text-zinc-700"
                            }`}
                            aria-label={p.eyebrow}
                        >
                            {p.icon}
                        </button>
                    ))}
                </motion.div>

                {/* Active path card */}
                <motion.div
                    initial={{opacity: 0, y: 24}}
                    animate={{opacity: 1, y: 0}}
                    transition={{duration: 0.6, delay: 0.45}}
                    className="mt-8 rounded-3xl border border-zinc-200 bg-white shadow-sm overflow-hidden"
                >
                    {/* Hero strip with the 3 chips, active one bigger */}
                    <div className="aspect-[16/7] bg-zinc-100 flex items-center justify-center gap-6">
                        {paths.map(p => {
                            const isActive = active.id === p.id;
                            return (
                                <motion.div
                                    key={p.id}
                                    layout
                                    transition={{type: "spring", stiffness: 300, damping: 26}}
                                    className={`rounded-full inline-flex items-center justify-center border ${
                                        isActive
                                            ? `${p.chipBg} ${p.chipText} border-transparent size-20 md:size-24 shadow-lg`
                                            : "bg-white border-zinc-200 text-zinc-300 size-12 md:size-14"
                                    }`}
                                >
                                    {p.icon}
                                </motion.div>
                            );
                        })}
                    </div>

                    <AnimatePresence mode="wait">
                        <motion.div
                            key={active.id}
                            initial={{opacity: 0, y: 8}}
                            animate={{opacity: 1, y: 0}}
                            exit={{opacity: 0, y: -8}}
                            transition={{duration: 0.25}}
                            className="p-7"
                        >
                            <div className="flex items-center gap-2 mb-3">
                                <span className="text-xs px-2.5 py-1 rounded-full bg-zinc-100 text-zinc-700 font-medium">
                                    {active.eyebrow}
                                </span>
                                <span className="text-xs px-2.5 py-1 rounded-full bg-zinc-100 text-zinc-700 font-medium">
                                    iExec Nox
                                </span>
                            </div>
                            <h2 className="text-xl md:text-2xl font-semibold tracking-tight mb-3">
                                {active.title}
                            </h2>
                            <p className="text-sm text-zinc-600 leading-relaxed mb-6">{active.body}</p>

                            <div className="grid grid-cols-2 gap-y-2 gap-x-6 mb-7 text-sm text-zinc-700">
                                {active.bullets.map(b => (
                                    <div key={b} className="flex items-center gap-2">
                                        <span className={`size-1.5 rounded-full ${active.chipBg}`} />
                                        {b}
                                    </div>
                                ))}
                            </div>

                            <Link
                                href={active.href}
                                className="w-full rounded-2xl border border-zinc-200 px-6 py-4 inline-flex items-center justify-center gap-2 text-sm font-semibold hover:bg-zinc-50 transition-colors"
                            >
                                {active.cta}
                                <ArrowRight className="size-4" />
                            </Link>
                        </motion.div>
                    </AnimatePresence>
                </motion.div>
            </div>
        </div>
    );
}

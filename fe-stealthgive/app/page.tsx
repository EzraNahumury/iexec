import {ArrowUpRight, EyeOff, Globe, ShieldCheck, Sparkles, Users, Zap} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import {motion} from "framer-motion";

import {FadeUp} from "@/components/landing/fade-up";
import {HeroGrid} from "@/components/landing/hero-grid";
import {LandingFooter} from "@/components/landing/landing-footer";
import {PillButton} from "@/components/landing/pill-button";

const features = [
    {
        eyebrow: "Encrypted donations",
        title: "Per-donor amounts stay hidden",
        body: "Every contribution is encrypted client-side via the iExec Nox gateway. Even campaign creators can't tell who gave how much.",
        icon: <EyeOff className="size-5" />,
    },
    {
        eyebrow: "Public accountability",
        title: "Total raised stays verifiable",
        body: "Aggregate totals are publicly decryptable on chain — donors can see real progress without surrendering their identity.",
        icon: <ShieldCheck className="size-5" />,
    },
    {
        eyebrow: "Zero gatekeepers",
        title: "Self-sovereign onboarding",
        body: "Claim our test SGD token from any wallet, any country. No Circle faucet, no VPN, no KYC — just on-chain donation flow.",
        icon: <Globe className="size-5" />,
    },
];

const numbers = [
    {value: "5", label: "Smart contracts deployed & verified"},
    {value: "5", label: "ChainGPT integrations live"},
    {value: "1:1", label: "Wrap ratio SGD → cSGD"},
    {value: "0", label: "Plaintext leaks per donation"},
];

export default function Home() {
    return (
        <div id="top" className="bg-white text-zinc-900">
            {/* ──────────── Hero ──────────── */}
            <section className="relative">
                <div className="relative h-[680px] md:h-[760px] flex items-center">
                    <HeroGrid />

                    <div className="relative max-w-6xl mx-auto px-6 w-full">
                        <FadeUp>
                            <div className="inline-flex items-center gap-2 rounded-full border border-zinc-200 bg-white px-3 py-1 text-[11px] font-medium tracking-[0.16em] uppercase text-zinc-600 mb-8 shadow-sm">
                                <span className="size-1.5 rounded-full bg-emerald-500 animate-pulse" />
                                Live · Arbitrum Sepolia · iExec Nox
                            </div>
                        </FadeUp>

                        <FadeUp delay={0.1}>
                            <h1 className="text-5xl md:text-7xl leading-[1.05] tracking-tight max-w-4xl">
                                Give to the causes that{" "}
                                <span className="font-serif italic font-light">cannot be doxxed</span>
                            </h1>
                        </FadeUp>

                        <FadeUp delay={0.2}>
                            <p className="mt-7 text-lg text-zinc-600 max-w-xl leading-relaxed">
                                StealthGive is confidential crowdfunding on iExec Nox. Donor amounts are
                                encrypted in a TEE; campaign totals stay publicly verifiable.
                            </p>
                        </FadeUp>

                        <FadeUp delay={0.3}>
                            <div className="mt-10 flex flex-wrap items-center gap-4">
                                <PillButton href="/welcome" size="lg">
                                    Launch App
                                </PillButton>
                                <Link
                                    href="#how-it-works"
                                    className="text-sm uppercase tracking-[0.18em] text-zinc-700 hover:text-zinc-900 transition-colors inline-flex items-center gap-2"
                                >
                                    How it works
                                    <ArrowUpRight className="size-3.5" />
                                </Link>
                            </div>
                        </FadeUp>
                    </div>
                </div>
            </section>

            {/* Banner showcase */}
            <section className="relative -mt-16 md:-mt-24 z-10">
                <div className="max-w-6xl mx-auto px-6">
                    <FadeUp delay={0.1}>
                        <motion.div
                            initial={{opacity: 0, y: 40, scale: 0.96}}
                            whileInView={{opacity: 1, y: 0, scale: 1}}
                            viewport={{once: true, margin: "-100px"}}
                            transition={{duration: 0.9, ease: [0.22, 0.61, 0.36, 1]}}
                            className="relative rounded-3xl overflow-hidden shadow-[0_30px_80px_-20px_rgba(0,0,0,0.25)] border border-zinc-200 bg-zinc-900"
                        >
                            <Image
                                src="/image.png"
                                alt="StealthGive — confidential crowdfunding banner"
                                width={1920}
                                height={1080}
                                className="w-full h-auto block"
                                priority
                            />
                        </motion.div>
                    </FadeUp>
                </div>
            </section>

            {/* ──────────── Big text section ──────────── */}
            <section id="how-it-works" className="border-t border-zinc-100">
                <div className="max-w-7xl mx-auto px-6 py-24 md:py-32 grid lg:grid-cols-2 gap-16 items-center">
                    <FadeUp>
                        <h2 className="text-4xl md:text-6xl tracking-tight leading-[1.05]">
                            <span className="text-zinc-400">Confidential</span>{" "}
                            <span className="font-serif italic font-light">DeFi crowdfunding</span>{" "}
                            <br />
                            <span className="text-zinc-900">native to Arbitrum.</span>
                        </h2>
                        <p className="mt-8 text-zinc-600 leading-relaxed max-w-md">
                            Built on the iExec Nox protocol with our own ERC-7984 confidential token
                            (cSGD) — every donation rides through a real Trusted Execution Environment,
                            on a chain your wallet already speaks.
                        </p>
                        <div className="mt-8">
                            <PillButton href="/welcome">Open App</PillButton>
                        </div>
                    </FadeUp>

                    <FadeUp delay={0.15}>
                        <div className="aspect-[4/3] rounded-3xl bg-zinc-950 relative overflow-hidden border border-zinc-200">
                            {/* Decorative TEE lattice */}
                            <svg
                                className="absolute inset-0 w-full h-full opacity-70"
                                viewBox="0 0 400 300"
                                fill="none"
                            >
                                <defs>
                                    <radialGradient id="glow" cx="50%" cy="50%" r="50%">
                                        <stop offset="0%" stopColor="white" stopOpacity="0.3" />
                                        <stop offset="100%" stopColor="white" stopOpacity="0" />
                                    </radialGradient>
                                </defs>
                                <rect width="400" height="300" fill="url(#glow)" />
                                {Array.from({length: 12}).map((_, i) =>
                                    Array.from({length: 16}).map((__, j) => {
                                        const cx = 16 + j * 24;
                                        const cy = 16 + i * 24;
                                        const dist = Math.hypot(cx - 200, cy - 150);
                                        const opacity = Math.max(0.1, 1 - dist / 200);
                                        return (
                                            <circle
                                                key={`${i}-${j}`}
                                                cx={cx}
                                                cy={cy}
                                                r={1.4}
                                                fill="white"
                                                opacity={opacity * 0.8}
                                            />
                                        );
                                    }),
                                )}
                            </svg>
                            <div className="absolute inset-0 flex items-end p-8">
                                <div className="text-white space-y-1">
                                    <div className="text-[11px] tracking-[0.2em] uppercase text-white/60">
                                        Encrypted on chain
                                    </div>
                                    <div className="font-mono text-sm text-white/90 break-all">
                                        0x0000066eee2301ec…
                                    </div>
                                </div>
                            </div>
                        </div>
                    </FadeUp>
                </div>

                {/* Number row */}
                <div className="border-y border-zinc-100">
                    <div className="max-w-7xl mx-auto px-6 grid grid-cols-2 md:grid-cols-4 divide-x divide-zinc-100">
                        {numbers.map((n, i) => (
                            <FadeUp key={n.label} delay={0.05 * i} className="px-6 py-10">
                                <div className="text-4xl md:text-5xl font-light tracking-tight">
                                    {n.value}
                                </div>
                                <div className="mt-2 text-[11px] tracking-[0.18em] uppercase text-zinc-500">
                                    {n.label}
                                </div>
                            </FadeUp>
                        ))}
                    </div>
                </div>
            </section>

            {/* ──────────── Why earn cards ──────────── */}
            <section className="bg-zinc-50">
                <div className="max-w-7xl mx-auto px-6 py-24 md:py-32">
                    <FadeUp>
                        <div className="max-w-3xl">
                            <div className="text-[11px] tracking-[0.18em] uppercase text-zinc-500 mb-4">
                                Why give with StealthGive
                            </div>
                            <h2 className="text-4xl md:text-6xl tracking-tight leading-[1.05]">
                                <span className="font-serif italic font-light">Three guarantees</span>{" "}
                                that ordinary crowdfunding can&apos;t make.
                            </h2>
                        </div>
                    </FadeUp>

                    <div className="mt-16 grid md:grid-cols-3 gap-6">
                        {features.map((f, i) => (
                            <FadeUp key={f.title} delay={0.1 * i}>
                                <div className="rounded-3xl bg-white border border-zinc-200 p-7 h-full hover:shadow-md hover:-translate-y-0.5 transition-all">
                                    <div className="aspect-[4/3] rounded-2xl bg-zinc-100 flex items-center justify-center mb-6 border border-zinc-200">
                                        <div className="size-14 rounded-full bg-zinc-900 text-white flex items-center justify-center">
                                            {f.icon}
                                        </div>
                                    </div>
                                    <div className="text-[10px] tracking-[0.2em] uppercase text-zinc-500 mb-2">
                                        {f.eyebrow}
                                    </div>
                                    <h3 className="font-semibold text-lg mb-2">{f.title}</h3>
                                    <p className="text-sm text-zinc-600 leading-relaxed">{f.body}</p>
                                </div>
                            </FadeUp>
                        ))}
                    </div>
                </div>
            </section>

            {/* ──────────── ChainGPT touchpoints ──────────── */}
            <section className="border-t border-zinc-100">
                <div className="max-w-7xl mx-auto px-6 py-24 md:py-32">
                    <FadeUp>
                        <div className="max-w-3xl">
                            <div className="text-[11px] tracking-[0.18em] uppercase text-zinc-500 mb-4">
                                AI-assisted, end-to-end
                            </div>
                            <h2 className="text-4xl md:text-6xl tracking-tight leading-[1.05]">
                                Five <span className="font-serif italic font-light">ChainGPT</span>{" "}
                                touchpoints — live.
                            </h2>
                            <p className="mt-6 text-zinc-600 max-w-md leading-relaxed">
                                We use ChainGPT&apos;s Web3 LLM, NFT/Image Generator, and Smart Contract
                                Auditor to remove the friction from launching, trusting, and reporting on
                                a confidential campaign.
                            </p>
                        </div>
                    </FadeUp>

                    <div className="mt-12 grid md:grid-cols-2 lg:grid-cols-5 gap-3">
                        {[
                            {label: "Campaign copy", icon: <Sparkles className="size-4" />},
                            {label: "Hero image gen", icon: <Zap className="size-4" />},
                            {label: "Contract audit", icon: <ShieldCheck className="size-4" />},
                            {label: "Risk review", icon: <Users className="size-4" />},
                            {label: "Impact report", icon: <Globe className="size-4" />},
                        ].map((c, i) => (
                            <FadeUp key={c.label} delay={0.06 * i}>
                                <div className="rounded-2xl border border-zinc-200 bg-white p-5 h-full">
                                    <div className="size-9 rounded-full bg-zinc-900 text-white flex items-center justify-center mb-4">
                                        {c.icon}
                                    </div>
                                    <div className="text-sm font-medium">{c.label}</div>
                                </div>
                            </FadeUp>
                        ))}
                    </div>
                </div>
            </section>

            {/* ──────────── Final CTA ──────────── */}
            <section className="border-t border-zinc-100">
                <div className="max-w-7xl mx-auto px-6 py-24 md:py-32 grid lg:grid-cols-2 gap-12 items-center">
                    <FadeUp>
                        <h2 className="text-3xl md:text-5xl tracking-tight leading-[1.1]">
                            Start giving privately.
                        </h2>
                        <p className="mt-5 text-zinc-600 max-w-md leading-relaxed">
                            Join the growing community of donors taking control of their on-chain
                            footprint with StealthGive.
                        </p>
                        <div className="mt-8">
                            <PillButton href="/welcome" size="lg">
                                Launch App
                            </PillButton>
                        </div>
                    </FadeUp>

                    <FadeUp delay={0.15} className="md:text-right">
                        <h3 className="text-5xl md:text-7xl tracking-tight leading-[1.05]">
                            <span className="text-zinc-300">Confidential giving</span>
                            <br />
                            <span className="font-serif italic font-light">native to</span>{" "}
                            <span className="text-zinc-900">Arbitrum</span>{" "}
                            <span className="inline-flex align-middle">
                                <span className="size-14 rounded-full bg-white border border-zinc-200 inline-flex items-center justify-center shadow-md overflow-hidden p-2">
                                    <Image
                                        src="/arbitrum.png"
                                        alt="Arbitrum"
                                        width={56}
                                        height={56}
                                        className="size-full object-contain"
                                    />
                                </span>
                            </span>
                        </h3>
                    </FadeUp>
                </div>
            </section>

            <LandingFooter />
        </div>
    );
}

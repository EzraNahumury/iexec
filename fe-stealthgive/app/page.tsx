import {ArrowUpRight, FileCode2, Repeat, ShieldOff, Sparkles} from "lucide-react";
import Link from "next/link";
import type {ReactNode} from "react";

import {BannerHero} from "@/components/landing/banner-hero";
import {FadeUp} from "@/components/landing/fade-up";
import {FeatureCard, type FeatureVariant} from "@/components/landing/feature-card";
import {LandingFooter} from "@/components/landing/landing-footer";
import {NetworkCanvas} from "@/components/landing/network-canvas";
import {PillButton} from "@/components/landing/pill-button";
import {TouchpointCard} from "@/components/landing/touchpoint-card";

const features: {
    variant: FeatureVariant;
    eyebrow: string;
    title: string;
    body: string;
}[] = [
    {
        variant: "hidden",
        eyebrow: "Encrypted donations",
        title: "Per-donor amounts stay hidden",
        body: "Every contribution is encrypted client-side via the iExec Nox gateway. Even campaign creators can't tell who gave how much.",
    },
    {
        variant: "verifiable",
        eyebrow: "Public accountability",
        title: "Total raised stays verifiable",
        body: "Aggregate totals are publicly decryptable on chain — donors can see real progress without surrendering their identity.",
    },
    {
        variant: "open",
        eyebrow: "Zero gatekeepers",
        title: "Self-sovereign onboarding",
        body: "Claim our test SGD token from any wallet, any country. No Circle faucet, no VPN, no KYC — just on-chain donation flow.",
    },
];

const numbers: {
    value: string;
    label: string;
    sub: string;
    icon: ReactNode;
    accent: "emerald" | "violet" | "amber" | "sky";
}[] = [
    {
        value: "5",
        label: "Smart contracts deployed & verified",
        sub: "Source-verified on Arbiscan",
        icon: <FileCode2 className="size-4" />,
        accent: "emerald",
    },
    {
        value: "5",
        label: "ChainGPT integrations live",
        sub: "Web3 LLM · Image Gen · Auditor",
        icon: <Sparkles className="size-4" />,
        accent: "violet",
    },
    {
        value: "1:1",
        label: "Wrap ratio SGD → cSGD",
        sub: "Lossless ERC-7984 wrap",
        icon: <Repeat className="size-4" />,
        accent: "amber",
    },
    {
        value: "0",
        label: "Plaintext leaks per donation",
        sub: "Encrypted in TEE end-to-end",
        icon: <ShieldOff className="size-4" />,
        accent: "sky",
    },
];

const accentRing: Record<"emerald" | "violet" | "amber" | "sky", string> = {
    emerald: "bg-emerald-500/15 group-hover:bg-emerald-500/25",
    violet: "bg-violet-500/15 group-hover:bg-violet-500/25",
    amber: "bg-amber-500/15 group-hover:bg-amber-500/25",
    sky: "bg-sky-500/15 group-hover:bg-sky-500/25",
};

export default function Home() {
    return (
        <div id="top" className="bg-white text-zinc-900">
            {/* ──────────── Hero — banner with text overlay ──────────── */}
            <section className="relative pt-8 md:pt-12">
                <div className="max-w-[1400px] mx-auto px-4 md:px-8">
                    <BannerHero />
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
                            {/* Animated TEE node graph */}
                            <NetworkCanvas />
                            {/* Soft inner glow */}
                            <div
                                className="absolute inset-0 pointer-events-none"
                                style={{
                                    background:
                                        "radial-gradient(ellipse at 50% 50%, rgba(255,255,255,0.08) 0%, transparent 60%)",
                                }}
                                aria-hidden
                            />
                            {/* Bottom fade so caption stays legible */}
                            <div
                                className="absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-zinc-950 to-transparent pointer-events-none"
                                aria-hidden
                            />
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

            </section>

            {/* ──────────── Number row — dark stats band ──────────── */}
            <section className="relative bg-zinc-950 text-white overflow-hidden">
                {/* Decorative grid pattern */}
                <div
                    className="absolute inset-0 opacity-[0.06] pointer-events-none"
                    style={{
                        backgroundImage:
                            "linear-gradient(to right, white 1px, transparent 1px), linear-gradient(to bottom, white 1px, transparent 1px)",
                        backgroundSize: "64px 64px",
                    }}
                    aria-hidden
                />
                {/* Soft gradient orb */}
                <div className="absolute -top-32 left-1/2 -translate-x-1/2 size-[600px] rounded-full bg-emerald-500/[0.04] blur-3xl pointer-events-none" />

                <div className="relative max-w-7xl mx-auto px-6 py-20 md:py-24">
                    <FadeUp>
                        <div className="flex flex-wrap items-end justify-between gap-6 mb-12">
                            <div>
                                <div className="text-[11px] font-semibold tracking-[0.2em] uppercase text-white/50 mb-3 inline-flex items-center gap-2">
                                    <span className="size-1 rounded-full bg-emerald-400 animate-pulse" />
                                    By the numbers
                                </div>
                                <h3 className="text-3xl md:text-5xl font-semibold tracking-tight leading-[1.05]">
                                    The shape of{" "}
                                    <span className="font-serif italic font-light text-white/70">
                                        this build
                                    </span>
                                </h3>
                            </div>
                            <p className="text-sm text-white/50 max-w-xs leading-relaxed">
                                Every figure verified on chain or by reading the source — no
                                marketing inflation.
                            </p>
                        </div>
                    </FadeUp>

                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
                        {numbers.map((n, i) => (
                            <FadeUp key={n.label} delay={0.06 * i}>
                                <div className="group relative rounded-2xl border border-white/10 bg-white/[0.03] backdrop-blur p-5 md:p-6 hover:border-white/25 hover:bg-white/[0.06] transition-all duration-300 overflow-hidden h-full">
                                    {/* Corner glow */}
                                    <div
                                        className={`absolute -bottom-12 -right-12 size-32 rounded-full blur-2xl pointer-events-none transition-colors ${accentRing[n.accent]}`}
                                    />

                                    {/* Icon chip */}
                                    <div className="size-9 rounded-xl bg-white/10 backdrop-blur border border-white/15 flex items-center justify-center mb-5 group-hover:bg-white/15 group-hover:border-white/25 transition-colors">
                                        {n.icon}
                                    </div>

                                    {/* Big value */}
                                    <div className="text-5xl md:text-6xl font-semibold tabular-nums tracking-tight leading-none">
                                        {n.value}
                                    </div>

                                    {/* Label + sub */}
                                    <div className="mt-5 space-y-1.5">
                                        <div className="text-[11px] font-semibold tracking-[0.16em] uppercase text-white/70 leading-snug">
                                            {n.label}
                                        </div>
                                        <div className="text-[11px] text-white/40 leading-snug">
                                            {n.sub}
                                        </div>
                                    </div>
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
                            <FadeUp key={f.title} delay={0.1 * i} className="h-full">
                                <FeatureCard
                                    variant={f.variant}
                                    eyebrow={f.eyebrow}
                                    title={f.title}
                                    body={f.body}
                                />
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

                    <div className="mt-12 grid md:grid-cols-2 lg:grid-cols-5 gap-4">
                        {[
                            {
                                variant: "copy" as const,
                                tag: "Web3 LLM",
                                title: "Campaign copy",
                                description: "Drafts a compelling title + 3-paragraph story from a one-line brief.",
                            },
                            {
                                variant: "image" as const,
                                tag: "NFT Image Gen",
                                title: "Hero artwork",
                                description: "Generates a unique 16:9 banner for every campaign in seconds.",
                            },
                            {
                                variant: "audit" as const,
                                tag: "Contract Auditor",
                                title: "Solidity audit",
                                description: "Reviews Campaign.sol with severity-rated findings.",
                            },
                            {
                                variant: "review" as const,
                                tag: "Web3 LLM",
                                title: "Per-campaign risk review",
                                description: "Donor-facing analysis of goal, deadline, recipient health.",
                            },
                            {
                                variant: "impact" as const,
                                tag: "On-chain Insights",
                                title: "Impact report",
                                description: "State-aware narrative of fundraiser outcomes when settled.",
                            },
                        ].map((c, i) => (
                            <FadeUp key={c.title} delay={0.06 * i} className="h-full">
                                <TouchpointCard
                                    variant={c.variant}
                                    tag={c.tag}
                                    title={c.title}
                                    description={c.description}
                                />
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
                            <span className="text-zinc-900">Arbitrum.</span>
                        </h3>
                    </FadeUp>
                </div>
            </section>

            <LandingFooter />
        </div>
    );
}

import {ArrowRight, Eye, EyeOff, Heart, Lock, ShieldCheck, Sparkles} from "lucide-react";
import Link from "next/link";

const useCases = [
    {
        icon: "📰",
        title: "Press freedom",
        body: "Donors to journalist legal funds become retaliation targets. StealthGive hides the link.",
    },
    {
        icon: "🏳️‍🌈",
        title: "LGBTQ+ shelters",
        body: "Donors face criminal liability in 60+ jurisdictions. Confidentiality is survival.",
    },
    {
        icon: "⚕️",
        title: "War-zone medical aid",
        body: "Cross-border donors face sanctions exposure when amounts are public.",
    },
    {
        icon: "🛡️",
        title: "Whistleblower funds",
        body: "Per-donor amounts reveal organisational alignment. We hide them.",
    },
    {
        icon: "🔐",
        title: "Open-source bounties",
        body: "Don’t want your employer to know you fund the competing project.",
    },
    {
        icon: "🤝",
        title: "Mutual-aid pots",
        body: "Donor doxxing in repressive regimes leads to arrests. Not on our watch.",
    },
];

const steps = [
    {
        icon: <Heart className="size-5 text-violet-300" />,
        title: "Claim test SGD",
        body: "1,000 SGD per 24h. No KYC, no captcha, no Circle faucet, no VPN.",
    },
    {
        icon: <EyeOff className="size-5 text-violet-300" />,
        title: "Wrap to cSGD",
        body: "Confidential balance via the iExec ERC-7984 wrapper.",
    },
    {
        icon: <Lock className="size-5 text-violet-300" />,
        title: "Donate privately",
        body: "Amount encrypted client-side. Even creators can’t see it.",
    },
    {
        icon: <Eye className="size-5 text-violet-300" />,
        title: "Total stays verifiable",
        body: "Aggregate raised is publicly decryptable. Per-donor stays hidden forever.",
    },
];

export default function Home() {
    return (
        <div className="flex-1">
            {/* Hero */}
            <section className="relative overflow-hidden">
                <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_50%_-20%,rgba(124,58,237,0.25),transparent_60%)]" />
                <div className="max-w-5xl mx-auto px-6 py-24 md:py-32 text-center">
                    <div className="inline-flex items-center gap-2 rounded-full border border-violet-500/30 bg-violet-500/10 px-4 py-1.5 text-xs font-medium text-violet-300 mb-8">
                        <span className="size-1.5 rounded-full bg-violet-400 animate-pulse" />
                        Live on Arbitrum Sepolia · Built on iExec Nox
                    </div>
                    <h1 className="text-5xl md:text-7xl font-semibold tracking-tight bg-gradient-to-br from-white via-zinc-100 to-zinc-500 bg-clip-text text-transparent leading-[1.05]">
                        Crowdfunding for
                        <br />
                        causes that cannot
                        <br />
                        be doxxed.
                    </h1>
                    <p className="mt-8 text-lg md:text-xl text-zinc-400 max-w-2xl mx-auto leading-relaxed">
                        Donor amounts are{" "}
                        <strong className="text-zinc-100">cryptographically hidden</strong> inside the iExec
                        TEE. The total raised stays publicly verifiable. Even campaign creators can&apos;t
                        link any donor to any contribution.
                    </p>
                    <div className="mt-10 flex flex-wrap items-center justify-center gap-3">
                        <Link
                            href="/campaigns"
                            className="inline-flex items-center gap-2 rounded-full bg-violet-600 hover:bg-violet-500 transition-colors px-6 py-3 text-sm font-medium"
                        >
                            Browse Campaigns
                            <ArrowRight className="size-4" />
                        </Link>
                        <Link
                            href="/dashboard"
                            className="inline-flex items-center gap-2 rounded-full border border-zinc-700 hover:border-zinc-500 transition-colors px-6 py-3 text-sm font-medium"
                        >
                            <Sparkles className="size-4" />
                            Get Test Tokens
                        </Link>
                    </div>
                    <p className="mt-8 text-xs text-zinc-500">
                        No Circle. No VPN. No KYC. Anyone in the world can use it in two clicks.
                    </p>
                </div>
            </section>

            {/* Use cases */}
            <section className="max-w-5xl mx-auto px-6 py-16">
                <div className="text-center mb-12">
                    <div className="inline-flex items-center gap-2 text-xs font-medium text-violet-300 mb-3">
                        <ShieldCheck className="size-4" />
                        WHY IT MATTERS
                    </div>
                    <h2 className="text-3xl md:text-4xl font-semibold tracking-tight">
                        Built for the people who get punished for giving.
                    </h2>
                </div>
                <div className="grid md:grid-cols-3 gap-6">
                    {useCases.map(item => (
                        <div
                            key={item.title}
                            className="rounded-2xl border border-zinc-800 bg-zinc-900/40 p-6 hover:border-zinc-700 hover:bg-zinc-900/60 transition-colors"
                        >
                            <div className="text-3xl mb-3">{item.icon}</div>
                            <h3 className="font-semibold mb-2">{item.title}</h3>
                            <p className="text-sm text-zinc-400 leading-relaxed">{item.body}</p>
                        </div>
                    ))}
                </div>
            </section>

            {/* How it works */}
            <section className="max-w-5xl mx-auto px-6 py-16 border-t border-zinc-900">
                <div className="text-center mb-12">
                    <div className="inline-flex items-center gap-2 text-xs font-medium text-violet-300 mb-3">
                        <Sparkles className="size-4" />
                        HOW IT WORKS
                    </div>
                    <h2 className="text-3xl md:text-4xl font-semibold tracking-tight">
                        Four steps. Zero gatekeepers.
                    </h2>
                </div>
                <div className="grid md:grid-cols-4 gap-4">
                    {steps.map((s, i) => (
                        <div
                            key={s.title}
                            className="rounded-2xl border border-zinc-800 bg-zinc-900/40 p-6 relative"
                        >
                            <div className="text-zinc-700 font-mono text-xs absolute top-4 right-4">
                                {String(i + 1).padStart(2, "0")}
                            </div>
                            <div className="mb-4">{s.icon}</div>
                            <h3 className="font-semibold mb-2">{s.title}</h3>
                            <p className="text-sm text-zinc-400 leading-relaxed">{s.body}</p>
                        </div>
                    ))}
                </div>
            </section>

            {/* Final CTA */}
            <section className="max-w-3xl mx-auto px-6 py-24 text-center">
                <h2 className="text-3xl md:text-4xl font-semibold tracking-tight mb-4">
                    Ready to give without leaving a trail?
                </h2>
                <p className="text-zinc-400 mb-8">
                    Connect your wallet, claim test tokens, donate to a real cause. All on Arbitrum Sepolia,
                    all confidential.
                </p>
                <Link
                    href="/campaigns"
                    className="inline-flex items-center gap-2 rounded-full bg-violet-600 hover:bg-violet-500 transition-colors px-8 py-3 text-sm font-medium"
                >
                    Browse Campaigns
                    <ArrowRight className="size-4" />
                </Link>
            </section>

            <footer className="max-w-5xl mx-auto px-6 py-12 border-t border-zinc-900 text-center text-xs text-zinc-600">
                Built for the iExec Vibe Coding Challenge · Powered by Nox + ChainGPT · Deployed on Arbitrum
                Sepolia
            </footer>
        </div>
    );
}

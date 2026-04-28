import {
    BookOpen,
    Code2,
    Cpu,
    Eye,
    Layers,
    Lock,
    Sparkles,
    Wallet,
    Zap,
} from "lucide-react";
import Link from "next/link";

import {DocsShell} from "@/components/docs-shell";
import {
    Callout,
    FeatureCard,
    FeatureGrid,
    H2,
    Hero,
    P,
} from "@/components/docs-ui";

const toc = [
    {id: "what-is-stealthgive", title: "What is StealthGive?", depth: 2 as const},
    {id: "key-features", title: "Key Features", depth: 2 as const},
    {id: "explore-the-docs", title: "Explore the Docs", depth: 2 as const},
];

export default function Home() {
    return (
        <DocsShell toc={toc}>
            <Hero
                badge="Private Donation Protocol"
                eyebrow="Introduction"
                title="Confidential crowdfunding"
                italic="for the cautious."
                description="Per-donor amounts stay encrypted in an iExec TEE. Aggregate totals stay publicly verifiable. Built end-to-end on Arbitrum Sepolia."
                primaryHref="/getting-started/quick-start"
                primaryLabel="Get Started"
                secondaryHref="/getting-started/architecture"
                secondaryLabel="View Architecture"
            />

            <H2 id="what-is-stealthgive">What is StealthGive?</H2>
            <P>
                StealthGive is an open-source dApp where donors contribute privately and
                campaign totals stay publicly verifiable. Donations flow through real
                ERC-7984 confidential tokens on iExec Nox — no mixers, no off-chain
                promises. The campaign creator launches a fundraiser; donors give in
                private; the world sees the total grow but never the individual amounts.
            </P>

            <Callout kind="secure" title="Privacy boundary">
                The line is drawn at the donor. Aggregate totals are public so accountability
                is preserved. Per-donor contributions stay encrypted inside the iExec TEE —
                even the campaign creator cannot link an address to a specific amount.
            </Callout>

            <H2 id="key-features">Key Features</H2>

            <FeatureGrid>
                <FeatureCard icon={<Lock className="size-4" />} title="Encrypted donations">
                    Each donation is encrypted client-side via the iExec Nox gateway before it
                    ever leaves the browser.
                </FeatureCard>
                <FeatureCard icon={<Eye className="size-4" />} title="Publicly verifiable totals">
                    Aggregates are decryptable on chain via{" "}
                    <code>allowPublicDecryption</code> — anyone can read the live total
                    without a wallet.
                </FeatureCard>
                <FeatureCard icon={<Zap className="size-4" />} title="Self-sovereign onboarding">
                    Claim 1,000 SGD per 24 h from any wallet. No Circle faucet, no VPN, no KYC.
                </FeatureCard>
                <FeatureCard icon={<Sparkles className="size-4" />} title="AI-assisted creation">
                    Five live ChainGPT touchpoints — campaign copy, hero image, audit, risk
                    review, impact narrative.
                </FeatureCard>
                <FeatureCard icon={<Cpu className="size-4" />} title="Real TEE compute">
                    14 events per wrap to the NoxCompute precompile prove the trusted execution
                    is real, not a stub.
                </FeatureCard>
                <FeatureCard icon={<Layers className="size-4" />} title="Composable on Arbitrum">
                    All five contracts are deployed and verified on Arbitrum Sepolia (chain id
                    421614).
                </FeatureCard>
            </FeatureGrid>

            <H2 id="explore-the-docs">Explore the Docs</H2>
            <P>
                Pick where you want to dive in. Most readers start with{" "}
                <Link
                    href="/getting-started/quick-start"
                    className="text-emerald-700 underline underline-offset-2 hover:text-emerald-900"
                >
                    Quick Start
                </Link>{" "}
                to spin up the project locally; if you&apos;re here to inspect the on-chain
                logic head to{" "}
                <Link
                    href="/contracts/overview"
                    className="text-emerald-700 underline underline-offset-2 hover:text-emerald-900"
                >
                    Smart Contracts
                </Link>
                .
            </P>

            <FeatureGrid>
                <Link href="/getting-started/quick-start" className="block">
                    <FeatureCard icon={<Zap className="size-4" />} title="Quick Start">
                        Clone, install, and run the full stack in under 5 minutes.
                    </FeatureCard>
                </Link>
                <Link href="/getting-started/architecture" className="block">
                    <FeatureCard icon={<Layers className="size-4" />} title="Architecture">
                        How frontend, contracts, Nox TEE, and ChainGPT fit together.
                    </FeatureCard>
                </Link>
                <Link href="/contracts/stealthgive" className="block">
                    <FeatureCard icon={<Code2 className="size-4" />} title="Contracts">
                        SGD, cSGD, Factory, Campaign, and the confidential escrow.
                    </FeatureCard>
                </Link>
                <Link href="/frontend/wallet" className="block">
                    <FeatureCard icon={<Wallet className="size-4" />} title="Wallet Integration">
                        RainbowKit + Wagmi setup, gas overrides, EIP-712 auth.
                    </FeatureCard>
                </Link>
                <Link href="/guides/usage" className="block">
                    <FeatureCard icon={<BookOpen className="size-4" />} title="Usage Flow">
                        Walk through claim → wrap → donate → reveal end-to-end.
                    </FeatureCard>
                </Link>
                <Link href="/guides/faq" className="block">
                    <FeatureCard icon={<Sparkles className="size-4" />} title="FAQ">
                        Common questions about privacy, gas, and the TEE model.
                    </FeatureCard>
                </Link>
            </FeatureGrid>
        </DocsShell>
    );
}

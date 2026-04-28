import {DocsShell} from "@/components/docs-shell";
import {
    Callout,
    FeatureCard,
    FeatureGrid,
    H2,
    Hero,
    P,
    SpecRow,
    SpecTable,
} from "@/components/docs-ui";
import {Coins, FileLock2, Layers, Network} from "lucide-react";

const toc = [
    {id: "contract-set", title: "Contract Set", depth: 2 as const},
    {id: "deployed", title: "Deployed Addresses", depth: 2 as const},
    {id: "design", title: "Design Notes", depth: 2 as const},
];

export default function ContractsOverviewPage() {
    return (
        <DocsShell toc={toc}>
            <Hero
                eyebrow="Smart Contracts"
                title="Overview"
                description="Six Solidity contracts orchestrate the confidential crowdfunding flow. Five are deployed on Arbitrum Sepolia; one is iExec's NoxCompute precompile."
            />

            <H2 id="contract-set">Contract Set</H2>

            <FeatureGrid>
                <FeatureCard icon={<Coins className="size-4" />} title="StealthGiveDollar">
                    Public ERC-20 (SGD) with a 1,000 / 24 h <code>claim()</code>. Underlying
                    asset for cSGD.
                </FeatureCard>
                <FeatureCard icon={<FileLock2 className="size-4" />} title="ConfidentialSGD">
                    Concrete instance of iExec&apos;s <code>ERC20ToERC7984Wrapper</code>.
                    Wraps SGD ↔ cSGD 1:1.
                </FeatureCard>
                <FeatureCard icon={<Layers className="size-4" />} title="StealthGiveFactory">
                    Deploys + registers <code>Campaign</code> instances. Bound to cSGD at
                    construction.
                </FeatureCard>
                <FeatureCard icon={<Network className="size-4" />} title="Campaign">
                    Per-fundraiser contract. State machine:{" "}
                    <code>Active → Settling → Withdrawn / Refunding</code>.
                </FeatureCard>
                <FeatureCard icon={<FileLock2 className="size-4" />} title="ConfidentialEscrow">
                    Abstract base. Holds the encrypted aggregate + per-donor handles. Wraps
                    every Nox SDK call.
                </FeatureCard>
                <FeatureCard icon={<Layers className="size-4" />} title="CampaignRegistry">
                    View-only indexer for the frontend. Lists active campaigns and produces
                    summaries.
                </FeatureCard>
            </FeatureGrid>

            <H2 id="deployed">Deployed Addresses</H2>
            <P>All contracts are source-verified on Arbiscan.</P>

            <SpecTable>
                <tbody>
                    <SpecRow label="StealthGiveDollar (SGD)">
                        <code>0xCA662c692e67A5ec3402D13327895eA762F702Bb</code>
                    </SpecRow>
                    <SpecRow label="ConfidentialSGD (cSGD)">
                        <code>0xa89340C4BC163ced823653d09DB1E1ba65Ca6849</code>
                    </SpecRow>
                    <SpecRow label="StealthGiveFactory">
                        <code>0xbD124A4C743847f5862024906B66ABeDeB9cCB6e</code>
                    </SpecRow>
                    <SpecRow label="CampaignRegistry">
                        <code>0x1023b4ff42c3Ed560B07b9A705E9A2d0Fc465DC4</code>
                    </SpecRow>
                    <SpecRow label="Demo Campaign">
                        <code>0x63b2b615c9112Bb03Cd25cbB0f8fcd82Dc8C124c</code>
                    </SpecRow>
                    <SpecRow label="iExec NoxCompute (precompile)">
                        <code>0xd464B198f06756a1d00be223634b85E0a731c229</code>
                    </SpecRow>
                </tbody>
            </SpecTable>

            <H2 id="design">Design Notes</H2>

            <Callout kind="info" title="Why ERC-7984 only?">
                The hackathon explicitly disqualifies partial implementations of ERC-3643 or
                ERC-7540. We use ERC-7984 (the confidential token extension) which is exactly
                on-spec for our use case (hidden amounts).
            </Callout>

            <Callout kind="secure" title="On-chain metadata, no IPFS">
                Campaign metadata (title, story, hero image reference) is stored as a{" "}
                <code>data:application/json;base64,…</code> URI inside the campaign contract.
                The frontend never depends on IPFS gateways or external servers.
            </Callout>
        </DocsShell>
    );
}

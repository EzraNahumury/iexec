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
import {FileSearch, Image as ImgIcon, ScrollText, ShieldCheck, Sparkles} from "lucide-react";

const toc = [
    {id: "core", title: "Core dApp Features", depth: 2 as const},
    {id: "ai", title: "AI Touchpoints", depth: 2 as const},
    {id: "diagnostics", title: "Diagnostics", depth: 2 as const},
];

export default function FrontendFeaturesPage() {
    return (
        <DocsShell toc={toc}>
            <Hero
                eyebrow="Frontend"
                title="Features"
                description="Every interactive surface ships against real contracts and a real TEE — no mock data."
            />

            <H2 id="core">Core dApp Features</H2>

            <SpecTable>
                <tbody>
                    <SpecRow label="Claim SGD">
                        1,000 / 24 h, anti-Sybil cooldown, no KYC
                    </SpecRow>
                    <SpecRow label="Wrap SGD → cSGD">
                        Approve + wrap via iExec ERC-7984 wrapper
                    </SpecRow>
                    <SpecRow label="Reveal balance">
                        Gasless EIP-712 signature via Nox gateway
                    </SpecRow>
                    <SpecRow label="Browse campaigns">
                        Paginated, parallel <code>encryptedTotal</code> fetch
                    </SpecRow>
                    <SpecRow label="Donate privately">
                        Client-side encrypt + setOperator + donate (2 tx)
                    </SpecRow>
                    <SpecRow label="Live total raised">
                        <code>publicDecrypt</code> with auto-retry on gateway sync
                    </SpecRow>
                    <SpecRow label="Settle / withdraw / refund">
                        Full state machine on chain
                    </SpecRow>
                    <SpecRow label="Create campaign">
                        Metadata encoded as on-chain data URI
                    </SpecRow>
                </tbody>
            </SpecTable>

            <H2 id="ai">AI Touchpoints</H2>
            <P>
                Five ChainGPT endpoints. All proxied through Next.js Route Handlers so the
                API key never lands in the browser bundle.
            </P>

            <FeatureGrid>
                <FeatureCard icon={<Sparkles className="size-4" />} title="Campaign copy assist">
                    <code>/api/ai/draft-campaign</code> — Web3 LLM (general_assistant). Input a
                    one-line brief, get a title + 3-paragraph story.
                </FeatureCard>
                <FeatureCard icon={<ImgIcon className="size-4" />} title="Hero image generator">
                    <code>/api/ai/generate-hero</code> — NFT/Image Generator (velogen).
                    768×432 banner cached in localStorage per campaign.
                </FeatureCard>
                <FeatureCard icon={<ShieldCheck className="size-4" />} title="Smart contract audit">
                    <code>/api/ai/audit-contract</code> — Smart Contract Auditor. Cached
                    server-side; rendered on the standalone <code>/audit</code> page.
                </FeatureCard>
                <FeatureCard icon={<FileSearch className="size-4" />} title="AI risk review">
                    <code>/api/ai/review-campaign</code> — analyses goal, deadline,
                    EOA-vs-contract recipient, donor traction.
                </FeatureCard>
                <FeatureCard icon={<ScrollText className="size-4" />} title="Impact report">
                    <code>/api/ai/impact-report</code> — state-aware narrative
                    (&ldquo;Projected Impact&rdquo; → &ldquo;Final Impact Report&rdquo;).
                </FeatureCard>
            </FeatureGrid>

            <H2 id="diagnostics">Diagnostics</H2>
            <Callout kind="tip" title="Clock-skew correction">
                The Nox gateway validates EIP-712 timestamps strictly. If your machine clock
                drifts, <code>withCorrectedClock</code> probes the gateway via{" "}
                <code>/api/time</code> (server-side HEAD request reading the{" "}
                <code>Date</code> header) and monkey-patches <code>Date.now()</code> for the
                duration of SDK calls. Runs silently — no UI banner.
            </Callout>
        </DocsShell>
    );
}

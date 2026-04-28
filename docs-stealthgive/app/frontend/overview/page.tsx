import {DocsShell} from "@/components/docs-shell";
import {
    Callout,
    FileTree,
    H2,
    Hero,
    SpecRow,
    SpecTable,
    type FileNode,
} from "@/components/docs-ui";

const toc = [
    {id: "stack", title: "Stack", depth: 2 as const},
    {id: "structure", title: "Folder Structure", depth: 2 as const},
    {id: "routes", title: "Routes", depth: 2 as const},
];

const projectTree: FileNode[] = [
    {
        kind: "folder",
        name: "app/",
        note: "Next.js App Router pages",
        children: [
            {kind: "file", name: "layout.tsx", note: "root layout"},
            {kind: "file", name: "providers.tsx", note: "Wagmi · RainbowKit · QueryClient"},
            {kind: "file", name: "page.tsx", note: "landing"},
            {kind: "file", name: "welcome/", note: "first-time onboarding"},
            {kind: "file", name: "dashboard/", note: "claim · wrap · reveal"},
            {kind: "file", name: "campaigns/", note: "browse + detail"},
            {kind: "file", name: "create/", note: "new campaign + AI assist"},
            {kind: "file", name: "audit/", note: "Campaign.sol audit"},
            {
                kind: "folder",
                name: "api/",
                note: "server route handlers",
                children: [
                    {kind: "file", name: "time/", note: "gateway clock probe"},
                    {kind: "file", name: "ai/", note: "5 ChainGPT endpoints"},
                ],
            },
        ],
    },
    {
        kind: "folder",
        name: "components/",
        note: "view layer",
        children: [
            {kind: "file", name: "header.tsx"},
            {kind: "file", name: "total-raised.tsx", note: "publicDecrypt + auto-retry"},
            {kind: "file", name: "campaign-card.tsx"},
            {kind: "file", name: "campaign-review.tsx", note: "ChainGPT risk review"},
            {kind: "file", name: "impact-report.tsx", note: "ChainGPT impact narrative"},
            {kind: "file", name: "markdown.tsx", note: "lightweight MD renderer"},
        ],
    },
    {
        kind: "folder",
        name: "lib/",
        note: "shared utilities",
        children: [
            {kind: "file", name: "abis.ts", note: "auto-generated from forge"},
            {kind: "file", name: "addresses.ts"},
            {kind: "file", name: "nox.ts", note: "SDK wrapper + auth-refresh"},
            {kind: "file", name: "clock.ts", note: "withCorrectedClock helper"},
            {kind: "file", name: "metadata.ts", note: "data: URI parser (UTF-8 safe)"},
            {kind: "file", name: "gas.ts", note: "Arbitrum Sepolia gas overrides"},
        ],
    },
];

export default function FrontendOverviewPage() {
    return (
        <DocsShell toc={toc}>
            <Hero
                eyebrow="Frontend"
                title="Overview"
                description="Next.js 16 App Router app with strict TypeScript, Tailwind v4, and zero off-chain backend services."
            />

            <H2 id="stack">Stack</H2>
            <SpecTable>
                <tbody>
                    <SpecRow label="Framework">Next.js 16, React 19, App Router</SpecRow>
                    <SpecRow label="Wallet">RainbowKit 2.2 + Wagmi 2.19 + Viem 2.48</SpecRow>
                    <SpecRow label="Styling">Tailwind CSS v4 + lucide-react + Framer Motion</SpecRow>
                    <SpecRow label="State">TanStack Query 5</SpecRow>
                    <SpecRow label="Confidential UX">@iexec-nox/handle 0.1.0-beta.10</SpecRow>
                    <SpecRow label="Backend">None — view contract for indexing</SpecRow>
                </tbody>
            </SpecTable>

            <H2 id="structure">Folder Structure</H2>
            <FileTree
                caption="Fig. iv — the working directory."
                root="fe-stealthgive/"
                nodes={projectTree}
            />

            <H2 id="routes">Routes</H2>
            <SpecTable>
                <tbody>
                    <SpecRow label="/">Landing — hero, features, ChainGPT touchpoints, stats</SpecRow>
                    <SpecRow label="/welcome">Three-path onboarding (Donate · Create · Wallet)</SpecRow>
                    <SpecRow label="/dashboard">Claim SGD, wrap to cSGD, reveal balance</SpecRow>
                    <SpecRow label="/campaigns">Browse all campaigns (paginated)</SpecRow>
                    <SpecRow label="/campaigns/[address]">Detail · donate · settle · withdraw · refund</SpecRow>
                    <SpecRow label="/create">Form + AI draft + AI hero image</SpecRow>
                    <SpecRow label="/audit">Standalone full audit of Campaign.sol</SpecRow>
                </tbody>
            </SpecTable>

            <Callout kind="info" title="No off-chain backend">
                Campaign metadata is encoded as a base64 data URI inside the contract.
                Indexing is done by reading <code>CampaignRegistry</code>. The only server
                code is API route handlers that proxy ChainGPT — everything else runs
                directly against the chain.
            </Callout>
        </DocsShell>
    );
}

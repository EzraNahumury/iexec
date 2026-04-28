import {ArchitectureDiagram, DonationFlowDiagram} from "@/components/diagrams";
import {DocsShell} from "@/components/docs-shell";
import {
    Callout,
    CodeBlock,
    FeatureCard,
    FeatureGrid,
    H2,
    Hero,
    P,
} from "@/components/docs-ui";
import {Cpu, Database, Globe, Sparkles} from "lucide-react";

const toc = [
    {id: "layers", title: "System Layers", depth: 2 as const},
    {id: "data-flow", title: "Data Flow", depth: 2 as const},
    {id: "stack", title: "Tech Stack", depth: 2 as const},
];

export default function ArchitecturePage() {
    return (
        <DocsShell toc={toc}>
            <Hero
                eyebrow="Getting Started"
                title="Architecture"
                description="Four cleanly separated layers: a Next.js frontend, on-chain Solidity contracts, the iExec Nox TEE, and ChainGPT proxied server-side."
            />

            <H2 id="layers">System Layers</H2>
            <P>
                Four cleanly separated layers. The frontend never talks to the gateway
                directly without going through one of these primitives.
            </P>

            <ArchitectureDiagram />

            <FeatureGrid>
                <FeatureCard icon={<Globe className="size-4" />} title="Frontend">
                    Next.js 16 + React 19. RainbowKit + Wagmi for wallet UX. Tailwind v4 for
                    styling, Framer Motion for animation.
                </FeatureCard>
                <FeatureCard icon={<Database className="size-4" />} title="Smart Contracts">
                    Solidity 0.8.28 + Foundry. ERC-7984 confidential token deployed via
                    iExec&apos;s wrapper.
                </FeatureCard>
                <FeatureCard icon={<Cpu className="size-4" />} title="iExec Nox TEE">
                    Encrypted ops happen off-chain inside a Trusted Execution Environment.
                </FeatureCard>
                <FeatureCard icon={<Sparkles className="size-4" />} title="ChainGPT (server)">
                    Five AI endpoints proxied through Next.js Route Handlers — API key never
                    leaves the server.
                </FeatureCard>
            </FeatureGrid>

            <H2 id="data-flow">Data Flow</H2>
            <P>
                A confidential donation moves through five steps. Each step happens in a
                different layer; the boundaries are what guarantee privacy.
            </P>

            <DonationFlowDiagram />

            <Callout kind="secure" title="Why two transactions?">
                ERC-7984 doesn&apos;t expose plain <code>transferFrom</code>. The donor first
                grants a transient operator permission with <code>setOperator</code>, then
                calls <code>donate</code>. Both transactions are signed in the same wallet
                session.
            </Callout>

            <H2 id="stack">Tech Stack</H2>
            <CodeBlock language="text">{`Smart Contracts ┃ Solidity 0.8.28, Foundry, OpenZeppelin v5
                ┃ ERC-7984 (iExec Nox)
Nox SDK         ┃ @iexec-nox/handle 0.1.0-beta.10
                ┃ @iexec-nox/nox-protocol-contracts 0.2.2
                ┃ @iexec-nox/nox-confidential-contracts 0.1.0
AI              ┃ ChainGPT API — Web3 LLM, NFT/Image Generator,
                ┃ Smart Contract Auditor (5 server endpoints)
Frontend        ┃ Next.js 16, React 19, Tailwind v4
                ┃ RainbowKit 2.2, Wagmi 2.19, Viem 2.48
Network         ┃ Arbitrum Sepolia (chain id 421614)`}</CodeBlock>
        </DocsShell>
    );
}

import {DocsShell} from "@/components/docs-shell";
import {
    Callout,
    CodeBlock,
    H2,
    Hero,
    P,
    SpecRow,
    SpecTable,
    Step,
    Steps,
} from "@/components/docs-ui";

const toc = [
    {id: "clone", title: "Clone & Install", depth: 2 as const},
    {id: "env", title: "Environment Variables", depth: 2 as const},
    {id: "scripts", title: "Useful Scripts", depth: 2 as const},
];

export default function SetupGuidePage() {
    return (
        <DocsShell toc={toc}>
            <Hero
                eyebrow="Guides"
                title="Setup"
                description="Everything you need to run the project locally — contracts, frontend, and AI integration."
            />

            <H2 id="clone">Clone &amp; Install</H2>

            <Steps>
                <Step title="Clone the monorepo">
                    <CodeBlock language="bash">{`git clone https://github.com/EzraNahumury/iexec.git stealthgive
cd stealthgive`}</CodeBlock>
                </Step>
                <Step title="Install both workspaces">
                    <CodeBlock language="bash">{`cd sc-StealthGive && forge install && cd ..
cd fe-stealthgive && npm install && cd ..`}</CodeBlock>
                </Step>
            </Steps>

            <H2 id="env">Environment Variables</H2>

            <P>Two env files: one for contracts, one for the frontend.</P>

            <SpecTable>
                <tbody>
                    <SpecRow label="sc-StealthGive/.env">
                        <code>PRIVATE_KEY</code>, <code>ARB_SEPOLIA_RPC</code>,{" "}
                        <code>ARBISCAN_API_KEY</code>
                    </SpecRow>
                    <SpecRow label="fe-stealthgive/.env.local">
                        <code>CHAINGPT_API_KEY</code> (server-side only)
                    </SpecRow>
                </tbody>
            </SpecTable>

            <CodeBlock language="bash">{`# sc-StealthGive/.env
PRIVATE_KEY=0x...
ARB_SEPOLIA_RPC=https://sepolia-rollup.arbitrum.io/rpc
ARBISCAN_API_KEY=...

# fe-stealthgive/.env.local
CHAINGPT_API_KEY=...`}</CodeBlock>

            <Callout kind="warning" title="Never commit env files">
                Both files are gitignored. The <code>CHAINGPT_API_KEY</code> is referenced
                only in server-side route handlers — it never reaches the browser bundle.
            </Callout>

            <H2 id="scripts">Useful Scripts</H2>

            <SpecTable>
                <tbody>
                    <SpecRow label="forge build">Compile all contracts</SpecRow>
                    <SpecRow label="forge test -vv">Run the 24-test Foundry suite</SpecRow>
                    <SpecRow label="forge script Deploy.s.sol --broadcast">
                        Deploy to Arbitrum Sepolia
                    </SpecRow>
                    <SpecRow label="npm run dev">Start frontend on http://localhost:3000</SpecRow>
                    <SpecRow label="npm run build">Production build</SpecRow>
                    <SpecRow label="npm run lint">ESLint check</SpecRow>
                </tbody>
            </SpecTable>
        </DocsShell>
    );
}

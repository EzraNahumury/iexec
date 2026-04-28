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
    {id: "prerequisites", title: "Prerequisites", depth: 2 as const},
    {id: "install", title: "Install", depth: 2 as const},
    {id: "run", title: "Run the Stack", depth: 2 as const},
    {id: "verify", title: "Verify the Walkthrough", depth: 2 as const},
];

export default function QuickStartPage() {
    return (
        <DocsShell toc={toc}>
            <Hero
                badge="5 min setup"
                eyebrow="Getting Started"
                title="Quick"
                italic="Start"
                description="Clone the repo, install dependencies, and run the full stack locally in under five minutes."
                primaryHref="#install"
                primaryLabel="Jump to Install"
                secondaryHref="/getting-started/architecture"
                secondaryLabel="See Architecture"
            />

            <H2 id="prerequisites">Prerequisites</H2>
            <SpecTable>
                <tbody>
                    <SpecRow label="Node.js">≥ 20</SpecRow>
                    <SpecRow label="npm">≥ 9</SpecRow>
                    <SpecRow label="Foundry">forge, cast, anvil — install via foundryup</SpecRow>
                    <SpecRow label="Wallet">
                        Any EVM wallet with Arbitrum Sepolia ETH
                    </SpecRow>
                </tbody>
            </SpecTable>

            <Callout kind="tip">
                Need test ETH? Drip from the{" "}
                <a
                    href="https://cloud.google.com/application/web3/faucet/ethereum/sepolia"
                    target="_blank"
                    rel="noreferrer"
                    className="text-emerald-700 underline underline-offset-2"
                >
                    Google Cloud Sepolia Faucet
                </a>{" "}
                and bridge to Arbitrum Sepolia via{" "}
                <a
                    href="https://bridge.arbitrum.io/?destinationChain=arbitrum-sepolia&sourceChain=sepolia"
                    target="_blank"
                    rel="noreferrer"
                    className="text-emerald-700 underline underline-offset-2"
                >
                    bridge.arbitrum.io
                </a>
                .
            </Callout>

            <H2 id="install">Install</H2>
            <P>The repo is a monorepo with two workspaces: contracts and frontend.</P>

            <Steps>
                <Step title="Clone the repository">
                    <CodeBlock language="bash">{`git clone https://github.com/EzraNahumury/iexec.git stealthgive
cd stealthgive`}</CodeBlock>
                </Step>
                <Step title="Install Foundry dependencies">
                    <CodeBlock language="bash">{`cd sc-StealthGive
forge install
cd ..`}</CodeBlock>
                </Step>
                <Step title="Install frontend dependencies">
                    <CodeBlock language="bash">{`cd fe-stealthgive
npm install
cd ..`}</CodeBlock>
                </Step>
            </Steps>

            <H2 id="run">Run the Stack</H2>
            <P>
                The contracts are already live on Arbitrum Sepolia, so you only need the
                frontend dev server.
            </P>

            <CodeBlock language="bash">{`cd fe-stealthgive
npm run dev
# → http://localhost:3000`}</CodeBlock>

            <Callout kind="info" title="Optional: redeploy contracts">
                If you want your own copy of the contracts, copy{" "}
                <code>sc-StealthGive/.env.example</code> to <code>.env</code>, fill in your{" "}
                <code>PRIVATE_KEY</code>, then run{" "}
                <code>forge script script/Deploy.s.sol --broadcast</code>. Update{" "}
                <code>fe-stealthgive/lib/addresses.ts</code> with the new addresses.
            </Callout>

            <H2 id="verify">Verify the Walkthrough</H2>
            <P>
                Open <code>http://localhost:3000</code>, connect your wallet, and walk through
                the demo flow:
            </P>
            <Steps>
                <Step title="Claim 1,000 SGD">
                    On <code>/dashboard</code> click{" "}
                    <strong>Claim 1,000 SGD</strong>. There&apos;s a 24-hour cooldown per
                    address.
                </Step>
                <Step title="Wrap into cSGD">
                    Type <code>100</code>, click <strong>Approve</strong>, then{" "}
                    <strong>Wrap</strong>. You now hold 100 cSGD encrypted in the TEE.
                </Step>
                <Step title="Donate privately">
                    Open the demo campaign on <code>/campaigns</code>. Donate any amount —
                    your contribution is encrypted client-side; only the aggregate total is
                    public.
                </Step>
            </Steps>
        </DocsShell>
    );
}

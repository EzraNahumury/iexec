import {DocsShell} from "@/components/docs-shell";
import {
    Callout,
    CodeBlock,
    H2,
    Hero,
    P,
    Step,
    Steps,
} from "@/components/docs-ui";

const toc = [
    {id: "compile-test", title: "Compile & Test", depth: 2 as const},
    {id: "env", title: "Environment", depth: 2 as const},
    {id: "deploy", title: "Deploy", depth: 2 as const},
    {id: "verify", title: "Verify on Arbiscan", depth: 2 as const},
];

export default function DeploymentPage() {
    return (
        <DocsShell toc={toc}>
            <Hero
                eyebrow="Smart Contracts"
                title="Deployment"
                description="Compile, test, and deploy the contracts to Arbitrum Sepolia using Foundry."
            />

            <H2 id="compile-test">Compile &amp; Test</H2>

            <CodeBlock language="bash">{`cd sc-StealthGive
forge build
forge test -vv          # 24/24 passing against vendor stubs`}</CodeBlock>

            <Callout kind="info" title="Vendor stubs?">
                The Nox precompile is only available on iExec-enabled networks. The repo
                ships with offline-compile stubs in{" "}
                <code>sc-StealthGive/vendor/iexec-nox-stubs/</code> so{" "}
                <code>forge test</code> works locally without an RPC.
            </Callout>

            <H2 id="env">Environment</H2>
            <P>
                Copy <code>.env.example</code> and fill in your testnet private key and an
                Arbitrum Sepolia RPC URL.
            </P>

            <CodeBlock language="bash">{`cp .env.example .env
# Then edit .env:
PRIVATE_KEY=0x...                # testnet only — do not reuse mainnet
ARB_SEPOLIA_RPC=https://sepolia-rollup.arbitrum.io/rpc
ARBISCAN_API_KEY=...             # for verification`}</CodeBlock>

            <H2 id="deploy">Deploy</H2>

            <Steps>
                <Step title="Source the env">
                    <CodeBlock language="bash">source .env</CodeBlock>
                </Step>
                <Step title="Run the deploy script">
                    <CodeBlock language="bash">{`forge script script/Deploy.s.sol:Deploy \\
  --rpc-url $ARB_SEPOLIA_RPC \\
  --broadcast --skip test`}</CodeBlock>
                </Step>
                <Step title="Update the frontend">
                    Copy the printed addresses for SGD, cSGD, Factory, and Registry into{" "}
                    <code>fe-stealthgive/lib/addresses.ts</code>.
                </Step>
            </Steps>

            <H2 id="verify">Verify on Arbiscan</H2>
            <P>
                Verification uses Etherscan API V2 (multi-chain via <code>chainid</code> param).
                Set <code>ARBISCAN_API_KEY</code> first.
            </P>

            <CodeBlock language="bash">{`forge verify-contract \\
  --chain arbitrum-sepolia \\
  --watch \\
  <contract-address> \\
  src/Campaign.sol:Campaign`}</CodeBlock>

            <Callout kind="tip">
                After verification, the Arbiscan page exposes <strong>Read Contract</strong>{" "}
                and <strong>Write Contract</strong> tabs — handy for inspecting state without
                writing a script.
            </Callout>
        </DocsShell>
    );
}

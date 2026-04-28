import {DocsShell} from "@/components/docs-shell";
import {
    Callout,
    H2,
    Hero,
    P,
    Step,
    Steps,
} from "@/components/docs-ui";

const toc = [
    {id: "donor", title: "Donor Flow", depth: 2 as const},
    {id: "creator", title: "Creator Flow", depth: 2 as const},
    {id: "settle", title: "Settlement", depth: 2 as const},
];

export default function UsagePage() {
    return (
        <DocsShell toc={toc}>
            <Hero
                eyebrow="Guides"
                title="Usage Flow"
                description="The end-to-end donor journey, from claiming test tokens to revealing the aggregate of a campaign."
            />

            <H2 id="donor">Donor Flow</H2>

            <Steps>
                <Step title="Connect wallet">
                    Click <strong>Connect Wallet</strong> in the header. The dApp prompts to
                    add Arbitrum Sepolia if it&apos;s not already in the wallet.
                </Step>
                <Step title="Claim 1,000 SGD">
                    On <code>/dashboard</code> click <strong>Claim 1,000 SGD</strong>. There
                    is a 24-hour cooldown per address — anti-Sybil without KYC.
                </Step>
                <Step title="Wrap into cSGD">
                    Type any amount, click <strong>Approve</strong> (sets ERC-20 allowance for
                    the wrapper), then <strong>Wrap</strong>. The result is encrypted cSGD
                    held inside the iExec TEE.
                </Step>
                <Step title="Browse a campaign">
                    Open <code>/campaigns</code>, click any card. The detail page shows the
                    live aggregate, the AI risk review, and the donate panel.
                </Step>
                <Step title="Donate privately">
                    Type an amount in the side panel, click <strong>Donate privately</strong>.
                    Two transactions fire: <code>setOperator</code> (1-hour transient
                    permission) then <code>donate</code> with the encrypted handle. Your
                    contribution is invisible to everyone.
                </Step>
                <Step title="Reveal your balance">
                    Back on <code>/dashboard</code>, click <strong>Reveal balance · gasless</strong>.
                    The Nox gateway returns your private balance after a single EIP-712
                    signature.
                </Step>
            </Steps>

            <H2 id="creator">Creator Flow</H2>

            <Steps>
                <Step title="Open the create page">
                    Navigate to <code>/create</code> while connected.
                </Step>
                <Step title="Use the AI assist">
                    Type a one-line brief (&ldquo;legal fund for journalists facing SLAPP
                    suits&rdquo;), click <strong>Generate</strong>. ChainGPT drafts a title +
                    3-paragraph story and generates a hero image in parallel.
                </Step>
                <Step title="Tune parameters">
                    Set the goal (in cSGD), the deadline (in days), and the recipient
                    address. The recipient is who can call <code>withdraw()</code> after the
                    deadline.
                </Step>
                <Step title="Deploy">
                    Click <strong>Create campaign</strong>. The factory deploys a fresh{" "}
                    <code>Campaign</code> contract bound to your params. You&apos;re
                    redirected to the detail page.
                </Step>
            </Steps>

            <H2 id="settle">Settlement</H2>
            <P>
                Each campaign is a four-state machine. After the deadline anyone can call{" "}
                <code>settle()</code>, which transitions <code>Active → Settling</code>. The
                recipient then has 7 days to <code>withdraw()</code>; if they don&apos;t,
                donors can each call <code>refund()</code>.
            </P>

            <Callout kind="info" title="Why a refund window?">
                The grace window protects donors against an absent or compromised recipient
                while still leaving room for legitimately delayed withdrawals.
            </Callout>
        </DocsShell>
    );
}

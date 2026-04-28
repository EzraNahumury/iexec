import {DocsShell} from "@/components/docs-shell";
import {Callout, H2, H3, Hero, P} from "@/components/docs-ui";

const toc = [
    {id: "privacy", title: "Privacy", depth: 2 as const},
    {id: "tooling", title: "Tooling", depth: 2 as const},
    {id: "deploy", title: "Deployment", depth: 2 as const},
];

export default function FaqPage() {
    return (
        <DocsShell toc={toc}>
            <Hero
                eyebrow="Guides"
                title="FAQ"
                description="Common questions about confidentiality, the TEE model, and the local dev experience."
            />

            <H2 id="privacy">Privacy</H2>

            <H3 id="who-can-see-amount">Who can see how much I donated?</H3>
            <P>
                Nobody, except you. The amount is encrypted client-side via the Nox gateway
                before it ever leaves your browser. Even the campaign creator only sees the
                aggregate total, never your individual contribution.
            </P>

            <H3 id="aggregate-public">Why is the aggregate public?</H3>
            <P>
                Crowdfunding accountability requires that anyone can verify how much was
                raised. We expose only the aggregate via{" "}
                <code>Nox.allowPublicDecryption</code>; per-donor handles stay private.
            </P>

            <Callout kind="secure" title="Out-of-scope threats">
                Network-level metadata (your RPC provider sees IP ↔ tx) and timing-correlation
                attacks against tiny anonymity sets are not solved by the protocol. A campaign
                with very few donors is inherently weaker.
            </Callout>

            <H2 id="tooling">Tooling</H2>

            <H3 id="why-utf8">Why is there UTF-8 handling code in metadata.ts?</H3>
            <P>
                Browser <code>btoa</code>/<code>atob</code> only handle Latin-1 codepoints.
                Em dashes and other multi-byte UTF-8 characters get corrupted on encode,
                which is why <code>metadata.ts</code> uses <code>TextEncoder</code>/
                <code>TextDecoder</code> for round-trip safety.
            </P>

            <H3 id="why-clock">What does withCorrectedClock do?</H3>
            <P>
                The Nox gateway validates EIP-712 timestamps strictly. If the user&apos;s
                machine clock is even a few seconds ahead of UTC, every fresh token is
                rejected as &ldquo;not active or expired&rdquo;.{" "}
                <code>withCorrectedClock</code> probes the gateway clock via{" "}
                <code>/api/time</code> and patches <code>Date.now()</code> for the duration of
                the SDK call.
            </P>

            <H2 id="deploy">Deployment</H2>

            <H3 id="why-own-token">Why deploy your own SGD instead of using cUSDC?</H3>
            <P>
                The Circle USDC faucet is blocked by Indonesian ISPs. To onboard testers from
                anywhere we deploy a public ERC-20 (SGD) plus a confidential wrapper (cSGD)
                using iExec&apos;s <code>ERC20ToERC7984Wrapper</code>. Anyone can claim 1,000
                SGD per 24 h, no faucet, no VPN.
            </P>

            <H3 id="forge-test">Why does forge test work without an RPC?</H3>
            <P>
                The repo ships offline-compile stubs for the Nox precompile under{" "}
                <code>sc-StealthGive/vendor/iexec-nox-stubs/</code>. Tests exercise the
                contract logic against the stubs without needing a TEE-enabled RPC.
            </P>
        </DocsShell>
    );
}

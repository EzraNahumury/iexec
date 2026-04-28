import {DocsShell} from "@/components/docs-shell";
import {
    Callout,
    CodeBlock,
    H2,
    Hero,
    P,
} from "@/components/docs-ui";

const toc = [
    {id: "rainbowkit", title: "RainbowKit Setup", depth: 2 as const},
    {id: "gas", title: "Gas Overrides", depth: 2 as const},
    {id: "auth", title: "EIP-712 Auth", depth: 2 as const},
];

export default function WalletPage() {
    return (
        <DocsShell toc={toc}>
            <Hero
                eyebrow="Frontend"
                title="Wallet Integration"
                description="RainbowKit + Wagmi v2 for connect, viem for low-level calls, custom helpers for gas + EIP-712 auth refresh."
            />

            <H2 id="rainbowkit">RainbowKit Setup</H2>
            <P>
                The provider is configured with a light theme that matches the docs site.
                Locale is forced to English so the modal copy stays consistent.
            </P>

            <CodeBlock language="tsx">{`<RainbowKitProvider
    locale="en-US"
    theme={lightTheme({
        accentColor: "#18181b",
        accentColorForeground: "white",
        borderRadius: "large",
        fontStack: "system",
        overlayBlur: "small",
    })}
    showRecentTransactions
>
    {children}
</RainbowKitProvider>`}</CodeBlock>

            <Callout kind="warning" title="Wagmi version">
                RainbowKit 2.x requires Wagmi 2.x. Wagmi 3 introduces breaking changes that
                make the connect button render <code>NaN ETH</code>. Pin to{" "}
                <code>wagmi@^2.19</code>.
            </Callout>

            <H2 id="gas">Gas Overrides</H2>
            <P>
                Some wallets (notably Vibe wallet) compute gas fees below the current
                Arbitrum baseFee. We supply explicit overrides on every write call so the
                wallet can&apos;t under-bid the chain.
            </P>

            <CodeBlock language="ts">{`// fe-stealthgive/lib/gas.ts
import {parseGwei} from "viem";

export const arbSepoliaGas = {
    maxFeePerGas: parseGwei("1"),
    maxPriorityFeePerGas: 0n,
} as const;

// Usage:
await writeContractAsync({
    address: ADDR.cSGD,
    abi: confidentialSGDAbi,
    functionName: "wrap",
    args: [donor, amount],
    ...arbSepoliaGas,
});`}</CodeBlock>

            <H2 id="auth">EIP-712 Auth</H2>
            <P>
                The Nox SDK issues a short-lived auth token after the first EIP-712
                signature. When that token expires the SDK starts returning 401. Our{" "}
                <code>useHandleClient()</code> wraps the SDK with a refresh helper that drops
                the cached client and re-signs.
            </P>

            <CodeBlock language="ts">{`// fe-stealthgive/lib/nox.ts
const {client, refresh} = useHandleClient();

try {
    await client?.decrypt(handle);
} catch (err) {
    if (isAuthError(err)) {
        const fresh = await refresh();
        await fresh?.decrypt(handle);
    }
}`}</CodeBlock>

            <Callout kind="tip" title="Why withCorrectedClock?">
                If the user&apos;s system clock drifts more than a few seconds from UTC, the
                gateway will reject every fresh EIP-712 token as &ldquo;not active or
                expired&rdquo;. Wrap SDK calls with <code>withCorrectedClock(fn)</code> — it
                probes the gateway clock via <code>/api/time</code> and monkey-patches{" "}
                <code>Date.now()</code> for the duration of the call.
            </Callout>
        </DocsShell>
    );
}

import {NextResponse} from "next/server";

export const dynamic = "force-dynamic";
export const revalidate = 0;

const GATEWAY_URL =
    "https://2e1800fc0dddeeadc189283ed1dce13c1ae28d48-3000.apps.ovh-tdx-dev.noxprotocol.dev";

/**
 * Returns the Nox gateway's authoritative UTC time. We read it from the
 * `Date` HTTP response header on a HEAD request — that header is set by
 * the gateway's TLS terminator using its own clock, which is the exact
 * clock the gateway uses to validate `notBefore`/`expiresAt` on EIP-712
 * tokens.
 *
 * The request is proxied server-side so the client never has to deal
 * with CORS preflight when probing a third-party host. If the gateway
 * is unreachable we fall back to the server's own Date.now() — better
 * than nothing.
 */
export async function GET() {
    let gatewayMs: number | null = null;
    try {
        const res = await fetch(GATEWAY_URL, {
            method: "HEAD",
            cache: "no-store",
            // Use a short timeout so a slow gateway doesn't stall the page.
            signal: AbortSignal.timeout(4_000),
        });
        const dateHeader = res.headers.get("date");
        if (dateHeader) {
            const parsed = Date.parse(dateHeader);
            if (!Number.isNaN(parsed)) gatewayMs = parsed;
        }
    } catch {
        /* fall through to server time */
    }

    return NextResponse.json(
        {
            now: gatewayMs ?? Date.now(),
            serverNow: Date.now(),
            source: gatewayMs !== null ? "gateway" : "server",
        },
        {headers: {"Cache-Control": "no-store"}},
    );
}

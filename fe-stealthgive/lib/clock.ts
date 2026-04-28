"use client";

/**
 * Clock-skew workaround for the Nox Handle Gateway.
 *
 * Why we need this:
 *   - The SDK builds EIP-712 authorisations with `Date.now()` for the
 *     `notBefore` and `expiresAt` fields.
 *   - The gateway validates: notBefore <= gateway_now <= expiresAt
 *   - If the user's machine clock is even a few seconds ahead of UTC,
 *     `notBefore` lands in the future from the gateway's perspective and
 *     the token is rejected as "not active or expired".
 *
 * How `withCorrectedClock` works:
 *   1. Server-side proxy at `/api/time` fetches the gateway's own clock
 *      (read from the `Date` HTTP response header on a HEAD request).
 *   2. Client computes `offset = gatewayMs - localMs` (corrected for RTT).
 *   3. If skew is non-trivial, monkey-patches `Date.now()` to add the
 *      offset for the duration of the supplied SDK call, then restores
 *      the real implementation in `finally`.
 *
 * The monkey-patch is process-global but synchronous-scoped: the SDK
 * code that reads `Date.now()` runs entirely inside the `await fn()`
 * window, so callers outside the wrapper see the real clock untouched.
 */

let cachedOffsetMs: number | null = null;
let cachedAt = 0;
const CACHE_TTL_MS = 60_000;

// Lower threshold: gateway is strict, even a 2-second skew can break auth.
const APPLY_THRESHOLD_MS = 1_000;

export type ClockProbe = {
    offsetMs: number;
    source: "gateway" | "server" | "none";
    rttMs: number;
};

let lastProbe: ClockProbe | null = null;

async function probeClock(): Promise<ClockProbe> {
    if (cachedOffsetMs !== null && Date.now() - cachedAt < CACHE_TTL_MS) {
        return lastProbe ?? {offsetMs: cachedOffsetMs, source: "none", rttMs: 0};
    }
    try {
        const start = Date.now();
        const res = await fetch("/api/time", {cache: "no-store"});
        const end = Date.now();
        if (!res.ok) throw new Error("non-ok response");
        const body = (await res.json()) as {
            now: number;
            serverNow: number;
            source: "gateway" | "server";
        };
        const halfRtt = (end - start) / 2;
        // The gateway's Date header is HTTP-1-second granularity, so the
        // best estimate of "what the gateway saw at the moment we sent the
        // request" is `body.now`, and we compare against the midpoint of
        // our request as the local timestamp.
        const localAtMidpoint = start + halfRtt;
        const offset = body.now - localAtMidpoint;
        const probe: ClockProbe = {
            offsetMs: offset,
            source: body.source,
            rttMs: end - start,
        };
        cachedOffsetMs = offset;
        cachedAt = Date.now();
        lastProbe = probe;
        // eslint-disable-next-line no-console
        console.info(
            `[clock] skew = ${offset.toFixed(0)}ms (source: ${body.source}, rtt: ${
                end - start
            }ms)`,
        );
        return probe;
    } catch (err) {
        // eslint-disable-next-line no-console
        console.warn("[clock] probe failed:", err);
        return {offsetMs: 0, source: "none", rttMs: 0};
    }
}

export async function withCorrectedClock<T>(fn: () => Promise<T>): Promise<T> {
    if (typeof window === "undefined") return fn();

    const {offsetMs, source} = await probeClock();
    if (Math.abs(offsetMs) < APPLY_THRESHOLD_MS || source === "none") {
        return fn();
    }

    const realDateNow = Date.now;
    const corrected: typeof Date.now = () => realDateNow.call(Date) + offsetMs;
    Date.now = corrected;
    // eslint-disable-next-line no-console
    console.info(`[clock] patching Date.now with +${offsetMs.toFixed(0)}ms for SDK call`);
    try {
        return await fn();
    } finally {
        Date.now = realDateNow;
    }
}

/** Returns the most recent probe result for diagnostics UI. */
export function getLastClockProbe(): ClockProbe | null {
    return lastProbe;
}

/** Force-refresh the cached offset. */
export function invalidateClockOffset() {
    cachedOffsetMs = null;
    cachedAt = 0;
    lastProbe = null;
}

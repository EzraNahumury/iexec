"use client";

/**
 * Clock-skew workaround for the Nox Handle Gateway.
 *
 * The SDK builds EIP-712 authorisations with `Date.now()` for the
 * `notBefore` and `expiresAt` fields. If the user's system clock is
 * ahead of UTC by more than a few seconds, the gateway rejects the
 * token as "not active or expired" — even though the signature is fresh.
 *
 * `withCorrectedClock(fn)` measures the local→server offset, and if the
 * skew is non-trivial, monkey-patches `Date.now()` for the duration of
 * the supplied call so the SDK builds timestamps using server time.
 * `Date.now()` is restored in `finally`.
 */

let cachedOffsetMs: number | null = null;
let cachedAt = 0;
const CACHE_TTL_MS = 60_000;

async function fetchServerOffset(): Promise<number> {
    if (cachedOffsetMs !== null && Date.now() - cachedAt < CACHE_TTL_MS) {
        return cachedOffsetMs;
    }
    try {
        const start = Date.now();
        const res = await fetch("/api/time", {cache: "no-store"});
        if (!res.ok) return 0;
        const {now: serverNow} = (await res.json()) as {now: number};
        const end = Date.now();
        // Account for round-trip latency by assuming the server replied at the
        // midpoint of the request.
        const halfRtt = (end - start) / 2;
        const offset = serverNow - (start + halfRtt);
        cachedOffsetMs = offset;
        cachedAt = Date.now();
        return offset;
    } catch {
        return 0;
    }
}

export async function withCorrectedClock<T>(fn: () => Promise<T>): Promise<T> {
    if (typeof window === "undefined") return fn();

    const offset = await fetchServerOffset();
    // Skew under 5 seconds is within normal variance; don't bother patching.
    if (Math.abs(offset) < 5_000) return fn();

    const realDateNow = Date.now;
    const corrected: typeof Date.now = () => realDateNow.call(Date) + offset;
    Date.now = corrected;
    try {
        return await fn();
    } finally {
        Date.now = realDateNow;
    }
}

/** Force-refresh the cached offset. Call after a system clock change. */
export function invalidateClockOffset() {
    cachedOffsetMs = null;
    cachedAt = 0;
}

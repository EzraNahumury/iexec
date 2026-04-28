"use client";

import {createViemHandleClient, type HandleClient} from "@iexec-nox/handle";
import {useCallback, useEffect, useRef, useState} from "react";
import {useWalletClient} from "wagmi";

/**
 * Lazily initialise a Nox HandleClient bound to the connected wallet.
 *
 * The Nox gateway issues a short-lived auth token after the first EIP-712
 * signature. When that token expires the SDK starts returning HTTP 401
 * ("Unauthorized: token is not active or expired"). Higher-level callers
 * should treat any error matching `isAuthError(err)` as recoverable: invoke
 * `refresh()` to drop the cached client, await a new one, then retry.
 *
 * Usage:
 *
 *   const {client, refresh} = useHandleClient();
 *   try {
 *     await client?.decrypt(handle);
 *   } catch (err) {
 *     if (isAuthError(err)) {
 *       const fresh = await refresh();
 *       await fresh?.decrypt(handle);
 *     }
 *   }
 */
export function useHandleClient(): {
    client: HandleClient | null;
    refresh: () => Promise<HandleClient | null>;
} {
    const {data: walletClient} = useWalletClient();
    const [client, setClient] = useState<HandleClient | null>(null);
    const inflight = useRef<Promise<HandleClient | null> | null>(null);

    const create = useCallback(async () => {
        if (!walletClient) return null;
        const c = await createViemHandleClient(walletClient);
        setClient(c);
        return c;
    }, [walletClient]);

    useEffect(() => {
        let cancelled = false;
        if (!walletClient) {
            setClient(null);
            return;
        }
        create().catch(err => {
            if (!cancelled) console.error("Failed to init Nox HandleClient:", err);
        });
        return () => {
            cancelled = true;
        };
    }, [walletClient, create]);

    const refresh = useCallback(async () => {
        if (inflight.current) return inflight.current;
        // Drop the in-memory storage of the previous client by recreating it.
        // We also clear any auth material the SDK may have cached in
        // localStorage / sessionStorage under the "iexec-nox" / "handle"
        // prefix — some wallets (notably MetaMask forks) silently reuse a
        // previously-signed EIP-712 token until those keys are gone.
        if (typeof window !== "undefined") {
            try {
                for (const storage of [window.localStorage, window.sessionStorage]) {
                    const keys: string[] = [];
                    for (let i = 0; i < storage.length; i++) {
                        const key = storage.key(i);
                        if (key && /iexec|nox|handle|decrypt/i.test(key)) keys.push(key);
                    }
                    keys.forEach(k => storage.removeItem(k));
                }
            } catch {
                // ignore — storage may be unavailable in some contexts
            }
        }
        const p = (async () => {
            setClient(null);
            const fresh = await create();
            console.info("[nox] Re-initialised HandleClient (auth refresh)");
            inflight.current = null;
            return fresh;
        })();
        inflight.current = p;
        return p;
    }, [create]);

    return {client, refresh};
}

export function isAuthError(err: unknown): boolean {
    const msg = (err as Error)?.message ?? "";
    return /401|unauthor|token is not active|expired/i.test(msg);
}

/**
 * Convert a raw SDK error into a clean, actionable user message. Strips
 * the verbose "Unexpected response from Handle Gateway (status: 401, data:
 * {...json blob...})" wrapper that the SDK throws and replaces it with
 * something the donor can act on.
 */
export function friendlyAuthError(err: unknown): string {
    if (isAuthError(err)) {
        return "Your gateway session has expired. Reconnect your wallet to refresh it.";
    }
    const raw = (err as Error)?.message ?? "Something went wrong.";
    // Trim huge JSON-data dumps the SDK appends.
    const trimmed = raw.replace(/\s*\(status: \d+,?\s*data:.*\)/i, "").trim();
    return trimmed || "Something went wrong.";
}

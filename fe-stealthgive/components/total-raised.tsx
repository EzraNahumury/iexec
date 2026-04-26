"use client";

import {Lock, RefreshCw, Sparkles} from "lucide-react";
import {useCallback, useEffect, useRef, useState} from "react";

import {formatPercent, formatSGD} from "@/lib/format";
import {isAuthError, useHandleClient} from "@/lib/nox";

import {ProgressBar} from "./progress-bar";

type Props = {
    encryptedTotal?: `0x${string}` | string;
    goal: bigint;
    autoLoad?: boolean;
};

const ZERO_HANDLE = "0x0000000000000000000000000000000000000000000000000000000000000000";

/**
 * Decryption flow:
 *   1. The handle returned by `encryptedTotal()` changes every time someone
 *      donates (Nox is immutable — each `add()` allocates a fresh handle).
 *   2. The contract calls `allowPublicDecryption(newHandle)` on chain.
 *   3. The off-chain Nox gateway then needs to index that event before
 *      `publicDecrypt` succeeds. This is usually 5–60s but can be longer.
 *
 * We therefore: keep the previous decrypted value on screen while the new
 * handle propagates, label the state as "syncing", and silently retry every
 * 6 seconds for up to 3 minutes before surfacing a real error.
 */
export function TotalRaised({encryptedTotal, goal, autoLoad = true}: Props) {
    const {client: handleClient, refresh: refreshHandleClient} = useHandleClient();
    const [revealed, setRevealed] = useState<bigint | null>(null);
    const [syncing, setSyncing] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Avoid losing the last successful value when the handle rotates.
    const lastDecryptedHandle = useRef<string | null>(null);
    const retryTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
    const startedAt = useRef<number>(0);

    const handleStr = encryptedTotal?.toString() ?? "";
    const isZero = !encryptedTotal || handleStr === ZERO_HANDLE;

    const reveal = useCallback(
        async (silent = false) => {
            if (!handleClient || !encryptedTotal || isZero) return;
            if (!silent) {
                setSyncing(true);
                setError(null);
                startedAt.current = Date.now();
            }
            try {
                let res;
                try {
                    res = await handleClient.publicDecrypt(encryptedTotal as `0x${string}`);
                } catch (err) {
                    if (isAuthError(err)) {
                        const fresh = await refreshHandleClient();
                        if (!fresh) throw err;
                        res = await fresh.publicDecrypt(encryptedTotal as `0x${string}`);
                    } else {
                        throw err;
                    }
                }
                setRevealed(res.value as bigint);
                lastDecryptedHandle.current = handleStr;
                setError(null);
                setSyncing(false);
                if (retryTimer.current) {
                    clearTimeout(retryTimer.current);
                    retryTimer.current = null;
                }
            } catch (err) {
                const msg = (err as Error).message ?? "";
                const isNotReady = /not publicly decryptable|does not exist/i.test(msg);
                if (isNotReady) {
                    // Gateway hasn't indexed the new handle yet — keep previous value
                    // visible, show subtle "syncing", and retry shortly.
                    setSyncing(true);
                    const elapsed = Date.now() - startedAt.current;
                    if (elapsed < 180_000) {
                        retryTimer.current = setTimeout(() => reveal(true), 6_000);
                    } else {
                        setSyncing(false);
                        setError("Gateway sync taking longer than expected — try the refresh button.");
                    }
                } else {
                    setSyncing(false);
                    setError(msg || "Decryption failed");
                }
            }
        },
        [handleClient, encryptedTotal, isZero, handleStr, refreshHandleClient],
    );

    // Auto-load on mount + whenever the handle changes (new donation).
    useEffect(() => {
        if (!autoLoad) return;
        if (lastDecryptedHandle.current && lastDecryptedHandle.current === handleStr) return;
        reveal();
        return () => {
            if (retryTimer.current) clearTimeout(retryTimer.current);
        };
    }, [autoLoad, reveal, handleStr]);

    if (isZero) {
        return (
            <div className="space-y-2">
                <div className="flex items-baseline justify-between">
                    <span className="text-zinc-400 text-sm">Raised</span>
                    <span className="font-mono text-lg">
                        0 / <span className="text-zinc-500">{formatSGD(goal)} cSGD</span>
                    </span>
                </div>
                <ProgressBar percent={0} />
                <p className="text-xs text-zinc-500">No donations yet — be the first.</p>
            </div>
        );
    }

    const percent = revealed !== null ? formatPercent(revealed, goal) : 0;

    return (
        <div className="space-y-2">
            <div className="flex items-baseline justify-between gap-2">
                <span className="text-zinc-400 text-sm">Raised</span>
                <div className="flex items-center gap-2">
                    {revealed !== null ? (
                        <span className="font-mono text-lg">
                            <span className="text-emerald-400">{formatSGD(revealed)}</span> /{" "}
                            <span className="text-zinc-500">{formatSGD(goal)} cSGD</span>
                        </span>
                    ) : syncing ? (
                        <span className="text-zinc-500 text-sm inline-flex items-center gap-1.5">
                            <RefreshCw className="size-3.5 animate-spin" />
                            Decrypting…
                        </span>
                    ) : (
                        <button
                            onClick={() => reveal()}
                            disabled={!handleClient}
                            className="inline-flex items-center gap-1.5 text-xs text-violet-300 hover:text-violet-200 disabled:opacity-50"
                        >
                            <Sparkles className="size-3.5" />
                            Reveal
                        </button>
                    )}
                </div>
            </div>
            <ProgressBar percent={percent} accent={percent >= 100 ? "emerald" : "violet"} />
            <div className="flex items-center justify-between text-xs">
                <p className="inline-flex items-center gap-1.5 text-zinc-500">
                    <Lock className="size-3" />
                    Aggregate decrypted via the iExec Nox gateway. Per-donor amounts stay private.
                </p>
                {syncing && revealed !== null && (
                    <span className="inline-flex items-center gap-1 text-amber-400">
                        <RefreshCw className="size-3 animate-spin" />
                        Syncing new donation…
                    </span>
                )}
            </div>
            {error && (
                <div className="flex items-center justify-between text-xs">
                    <span className="text-zinc-500">{error}</span>
                    <button
                        onClick={() => reveal()}
                        className="inline-flex items-center gap-1 text-violet-300 hover:text-violet-200"
                    >
                        <RefreshCw className="size-3" />
                        Retry
                    </button>
                </div>
            )}
        </div>
    );
}

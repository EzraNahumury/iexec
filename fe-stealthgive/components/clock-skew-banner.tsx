"use client";

import {AlertCircle, CheckCircle2, Clock} from "lucide-react";
import {useEffect, useState} from "react";

import {getLastClockProbe, type ClockProbe} from "@/lib/clock";

/**
 * Diagnostic banner that surfaces the detected clock skew between the
 * user's browser and the Nox gateway. Helps debug "token is not active
 * or expired" auth failures: if the offset is large, the workaround
 * patches Date.now during SDK calls — this banner confirms it visually.
 *
 * Polls the helper module so the banner updates after the first SDK
 * call (which is when probeClock is triggered).
 */
export function ClockSkewBanner() {
    const [probe, setProbe] = useState<ClockProbe | null>(getLastClockProbe());

    useEffect(() => {
        // Probe directly so the banner shows on first paint instead of
        // waiting for an SDK call.
        let cancelled = false;
        fetch("/api/time", {cache: "no-store"})
            .then(r => r.json())
            .then((body: {now: number; serverNow: number; source: "gateway" | "server"}) => {
                if (cancelled) return;
                const localNow = Date.now();
                const offset = body.now - localNow;
                setProbe({offsetMs: offset, source: body.source, rttMs: 0});
            })
            .catch(() => {
                /* ignore */
            });

        const id = setInterval(() => {
            const latest = getLastClockProbe();
            if (latest) setProbe(latest);
        }, 2_000);

        return () => {
            cancelled = true;
            clearInterval(id);
        };
    }, []);

    if (!probe) return null;
    if (probe.source === "none") return null;

    const absMs = Math.abs(probe.offsetMs);
    const absSec = absMs / 1000;
    const isCorrected = absMs >= 1_000;
    const isSevere = absMs >= 30_000;

    if (!isCorrected && !isSevere) {
        // Healthy: show only briefly with green tone (or skip entirely).
        return (
            <div className="rounded-2xl border border-emerald-200 bg-emerald-50/40 px-4 py-2.5 text-xs text-emerald-800 inline-flex items-center gap-2">
                <CheckCircle2 className="size-3.5" />
                Clock synced with Nox gateway · skew {absSec.toFixed(1)}s
                <span className="text-emerald-700/60">· source: {probe.source}</span>
            </div>
        );
    }

    return (
        <div
            className={`rounded-2xl border px-4 py-3 text-xs flex items-start gap-3 ${
                isSevere
                    ? "border-red-300 bg-red-50/60 text-red-800"
                    : "border-amber-300 bg-amber-50/60 text-amber-800"
            }`}
        >
            {isSevere ? (
                <AlertCircle className="size-4 shrink-0 mt-0.5" />
            ) : (
                <Clock className="size-4 shrink-0 mt-0.5" />
            )}
            <div className="flex-1">
                <p className="font-semibold">
                    Clock skew detected ·{" "}
                    {probe.offsetMs > 0 ? "+" : ""}
                    {(probe.offsetMs / 1000).toFixed(1)}s vs Nox gateway
                </p>
                <p className="opacity-80 mt-0.5 leading-relaxed">
                    {isSevere
                        ? "Your system clock is significantly off. Decryption will keep failing — open Windows Settings → Time & language → Date & time → click Sync now."
                        : "We'll auto-correct timestamps when calling the SDK so the gateway accepts your token. If decryption still fails, your wallet may be returning a malformed signature."}
                </p>
                <p className="opacity-60 mt-1 font-mono text-[10px]">
                    source: {probe.source} · rtt: {probe.rttMs}ms
                </p>
            </div>
        </div>
    );
}

"use client";

import {Loader2, RefreshCw, ScrollText, Sparkles} from "lucide-react";
import {useEffect, useState} from "react";

type State = "active" | "settling" | "withdrawn" | "refunding";

type Props = {
    campaign: `0x${string}`;
    title: string;
    goalCSGD: string;
    totalRaisedCSGD: string | null; // null when not yet decrypted / 0
    donorCount: number;
    createdAtMs?: number;
    deadlineMs: number;
    settledAtMs?: number;
    state: State;
};

const STORAGE_PREFIX = "stealthgive:impact:";

const stateLabels: Record<State, {heading: string; sub: string}> = {
    active: {
        heading: "Projected Impact",
        sub: "AI narrative based on current traction. Will be regenerated automatically as donations come in.",
    },
    settling: {
        heading: "Impact Report (Pending Withdrawal)",
        sub: "Campaign deadline reached. Aggregate total revealed; awaiting recipient action.",
    },
    withdrawn: {
        heading: "Final Impact Report",
        sub: "Campaign settled and recipient has withdrawn. Privacy of every donor preserved.",
    },
    refunding: {
        heading: "Refund Impact Report",
        sub: "Recipient did not withdraw within grace window. Donors can reclaim their contributions.",
    },
};

export function ImpactReport({
    campaign,
    title,
    goalCSGD,
    totalRaisedCSGD,
    donorCount,
    createdAtMs,
    deadlineMs,
    settledAtMs,
    state,
}: Props) {
    const [report, setReport] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const cacheKey =
        STORAGE_PREFIX + campaign.toLowerCase() + ":" + (totalRaisedCSGD ?? "0");
    const labels = stateLabels[state];

    // Restore the most recent impact report for this exact (campaign, total)
    // pair on mount. When the revealed total changes the cache key changes,
    // so the report regenerates rather than showing stale numbers.
    useEffect(() => {
        try {
            const cached = window.localStorage.getItem(cacheKey);
            if (cached) setReport(cached);
            else setReport(null);
        } catch {
            /* ignore */
        }
    }, [cacheKey]);

    async function fetchReport() {
        if (totalRaisedCSGD === null) return;
        setLoading(true);
        setError(null);
        try {
            const now = Date.now();
            const daysElapsed = createdAtMs
                ? Math.max(0, Math.floor((now - createdAtMs) / 86_400_000))
                : 0;
            const daysToDeadline = Math.floor((deadlineMs - now) / 86_400_000);

            const res = await fetch("/api/ai/impact-report", {
                method: "POST",
                headers: {"Content-Type": "application/json"},
                body: JSON.stringify({
                    title,
                    goalCSGD,
                    totalRaisedCSGD,
                    donorCount,
                    daysElapsed,
                    daysToDeadline,
                    state,
                    settledISO: settledAtMs ? new Date(settledAtMs).toISOString() : undefined,
                }),
            });
            const data = (await res.json()) as {report?: string; error?: string};
            if (!res.ok || !data.report) {
                throw new Error(data.error || "Impact report generation failed");
            }
            setReport(data.report);
            try {
                window.localStorage.setItem(cacheKey, data.report);
            } catch {
                /* quota — ignore */
            }
        } catch (err) {
            setError((err as Error).message ?? "Impact report generation failed");
        } finally {
            setLoading(false);
        }
    }

    const cantGenerateYet =
        totalRaisedCSGD === null || Number(totalRaisedCSGD) <= 0;

    return (
        <section className="rounded-2xl border border-amber-500/30 bg-gradient-to-br from-amber-500/10 to-transparent p-5">
            <div className="flex items-center justify-between mb-2">
                <div className="inline-flex items-center gap-2">
                    <ScrollText className="size-4 text-amber-300" />
                    <h2 className="font-semibold text-sm">{labels.heading}</h2>
                    <span className="text-[10px] font-medium px-1.5 py-0.5 rounded-full bg-amber-500/20 text-amber-200">
                        ChainGPT · On-chain Insights
                    </span>
                </div>
                {report && !loading && (
                    <button
                        onClick={fetchReport}
                        className="text-xs text-amber-200 hover:text-amber-100 inline-flex items-center gap-1"
                    >
                        <RefreshCw className="size-3" />
                        Regenerate
                    </button>
                )}
            </div>

            <p className="text-xs text-zinc-400 mb-3">{labels.sub}</p>

            {cantGenerateYet ? (
                <p className="text-xs text-zinc-500 italic">
                    Available after the first donation reveals an aggregate total.
                </p>
            ) : !report && !loading && !error ? (
                <button
                    onClick={fetchReport}
                    className="w-full rounded-full bg-amber-600 hover:bg-amber-500 px-4 py-2 text-sm font-medium inline-flex items-center justify-center gap-2"
                >
                    <Sparkles className="size-3.5" />
                    Generate impact report (~6s)
                </button>
            ) : null}

            {loading && (
                <div className="flex items-center gap-2 text-sm text-zinc-400">
                    <Loader2 className="size-4 animate-spin" />
                    Drafting impact narrative…
                </div>
            )}

            {error && <p className="text-sm text-red-400 break-words">{error}</p>}

            {report && (
                <p className="text-sm text-zinc-200 leading-relaxed whitespace-pre-line">{report}</p>
            )}
        </section>
    );
}

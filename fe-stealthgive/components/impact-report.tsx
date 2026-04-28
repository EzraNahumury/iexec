"use client";

import {ArrowUpRight, Loader2, RefreshCw, ScrollText, Sparkles} from "lucide-react";
import {useEffect, useState} from "react";

import {Markdown} from "./markdown";

type State = "active" | "settling" | "withdrawn" | "refunding";

type Props = {
    campaign: `0x${string}`;
    title: string;
    goalCSGD: string;
    totalRaisedCSGD: string | null;
    donorCount: number;
    createdAtMs?: number;
    deadlineMs: number;
    settledAtMs?: number;
    state: State;
};

const STORAGE_PREFIX = "stealthgive:impact:";

const stateLabels: Record<State, {heading: string; emphasis: string; sub: string}> = {
    active: {
        heading: "Projected",
        emphasis: "Impact",
        sub: "AI narrative based on current traction. Will be regenerated automatically as donations come in.",
    },
    settling: {
        heading: "Pending",
        emphasis: "Withdrawal",
        sub: "Campaign deadline reached. Aggregate total revealed; awaiting recipient action.",
    },
    withdrawn: {
        heading: "Final",
        emphasis: "Impact",
        sub: "Campaign settled and recipient has withdrawn. Privacy of every donor preserved.",
    },
    refunding: {
        heading: "Refund",
        emphasis: "Phase",
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
        <section className="rounded-3xl border border-zinc-200 bg-white p-6 md:p-7 relative overflow-hidden">
            <div className="absolute -bottom-16 -left-12 size-48 rounded-full bg-zinc-100/70 blur-3xl pointer-events-none" />

            <div className="flex items-start justify-between mb-4 relative gap-4">
                <div>
                    <div className="text-[10px] font-semibold tracking-[0.18em] uppercase text-zinc-500 mb-2 inline-flex items-center gap-2">
                        <ScrollText className="size-3" />
                        Impact Narrative
                    </div>
                    <h2 className="text-xl font-semibold text-zinc-900 tracking-tight">
                        {labels.heading}{" "}
                        <span className="font-serif italic font-light">{labels.emphasis}</span>
                    </h2>
                </div>
                <span className="text-[10px] font-semibold tracking-[0.16em] uppercase px-2.5 py-1 rounded-full bg-zinc-900 text-white whitespace-nowrap shrink-0">
                    ChainGPT
                </span>
            </div>

            <p className="text-sm text-zinc-500 mb-5 leading-relaxed">{labels.sub}</p>

            {cantGenerateYet ? (
                <p className="text-xs text-zinc-500 italic inline-flex items-center gap-2">
                    <span className="size-1 rounded-full bg-zinc-300" />
                    Available after the first donation reveals an aggregate total.
                </p>
            ) : !report && !loading && !error ? (
                <button
                    onClick={fetchReport}
                    className="group inline-flex items-center gap-3 rounded-full bg-zinc-900 hover:bg-zinc-800 text-white text-xs font-bold tracking-[0.18em] uppercase px-5 py-3 transition-colors"
                >
                    <Sparkles className="size-3.5" />
                    Generate impact report · ~6s
                    <span className="inline-flex items-center justify-center size-5 rounded-full border border-white/40 group-hover:border-white/70 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5">
                        <ArrowUpRight className="size-3" />
                    </span>
                </button>
            ) : null}

            {loading && (
                <div className="flex items-center gap-2 text-sm text-zinc-600">
                    <Loader2 className="size-4 animate-spin" />
                    Drafting impact narrative…
                </div>
            )}

            {error && <p className="text-sm text-red-600 break-words">{error}</p>}

            {report && (
                <>
                    <Markdown text={report} />
                    {!loading && (
                        <button
                            onClick={fetchReport}
                            className="mt-4 text-[11px] font-semibold tracking-[0.16em] uppercase text-zinc-500 hover:text-zinc-900 inline-flex items-center gap-1.5 transition-colors"
                        >
                            <RefreshCw className="size-3" />
                            Regenerate
                        </button>
                    )}
                </>
            )}
        </section>
    );
}

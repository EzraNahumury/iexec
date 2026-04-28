"use client";

import {ArrowUpRight, Loader2, RefreshCw, Sparkles} from "lucide-react";
import {useEffect, useState} from "react";
import {usePublicClient} from "wagmi";

import {Markdown} from "./markdown";

type Props = {
    campaign: `0x${string}`;
    title: string;
    goalCSGD: string;
    deadlineMs: number;
    recipient: `0x${string}`;
    donorCount: number;
    refundGraceSeconds: number;
};

const STORAGE_PREFIX = "stealthgive:review:";

export function CampaignReview({
    campaign,
    title,
    goalCSGD,
    deadlineMs,
    recipient,
    donorCount,
    refundGraceSeconds,
}: Props) {
    const publicClient = usePublicClient();
    const [review, setReview] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const cacheKey = STORAGE_PREFIX + campaign.toLowerCase();

    useEffect(() => {
        try {
            const cached = window.localStorage.getItem(cacheKey);
            if (cached) setReview(cached);
        } catch {
            /* ignore */
        }
    }, [cacheKey]);

    async function fetchReview() {
        if (!publicClient) return;
        setLoading(true);
        setError(null);
        try {
            let recipientIsContract = false;
            try {
                const code = await publicClient.getCode({address: recipient});
                recipientIsContract = !!code && code !== "0x";
            } catch {
                /* ignore */
            }

            const daysLeft = Math.max(
                0,
                Math.ceil((deadlineMs - Date.now()) / 86_400_000),
            );

            const res = await fetch("/api/ai/review-campaign", {
                method: "POST",
                headers: {"Content-Type": "application/json"},
                body: JSON.stringify({
                    title,
                    goal: goalCSGD,
                    deadlineISO: new Date(deadlineMs).toISOString(),
                    daysLeft,
                    recipient,
                    recipientIsContract,
                    donorCount,
                    refundGraceDays: Math.round(refundGraceSeconds / 86_400),
                }),
            });

            const data = (await res.json()) as {review?: string; error?: string};
            if (!res.ok || !data.review) {
                throw new Error(data.error || "Review failed");
            }
            setReview(data.review);
            try {
                window.localStorage.setItem(cacheKey, data.review);
            } catch {
                /* quota — ignore */
            }
        } catch (err) {
            setError((err as Error).message ?? "Review failed");
        } finally {
            setLoading(false);
        }
    }

    return (
        <section className="rounded-3xl border border-zinc-200 bg-white p-6 md:p-7 relative overflow-hidden">
            <div className="absolute -top-12 -right-12 size-40 rounded-full bg-zinc-100/70 blur-2xl pointer-events-none" />

            <div className="flex items-start justify-between mb-4 relative gap-4">
                <div>
                    <div className="text-[10px] font-semibold tracking-[0.18em] uppercase text-zinc-500 mb-2 inline-flex items-center gap-2">
                        <span className="size-1 rounded-full bg-zinc-900" />
                        AI Risk Review
                    </div>
                    <h2 className="text-xl font-semibold text-zinc-900 tracking-tight">
                        How safe is{" "}
                        <span className="font-serif italic font-light">this campaign?</span>
                    </h2>
                </div>
                <span className="text-[10px] font-semibold tracking-[0.16em] uppercase px-2.5 py-1 rounded-full bg-zinc-900 text-white whitespace-nowrap shrink-0">
                    ChainGPT
                </span>
            </div>

            {!review && !loading && !error && (
                <button
                    onClick={fetchReview}
                    className="group inline-flex items-center gap-3 rounded-full bg-zinc-900 hover:bg-zinc-800 text-white text-xs font-bold tracking-[0.18em] uppercase px-5 py-3 transition-colors"
                >
                    <Sparkles className="size-3.5" />
                    Generate review · ~5s
                    <span className="inline-flex items-center justify-center size-5 rounded-full border border-white/40 group-hover:border-white/70 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5">
                        <ArrowUpRight className="size-3" />
                    </span>
                </button>
            )}

            {loading && (
                <div className="flex items-center gap-2 text-sm text-zinc-600">
                    <Loader2 className="size-4 animate-spin" />
                    Analysing this campaign…
                </div>
            )}

            {error && <p className="text-sm text-red-600 break-words">{error}</p>}

            {review && (
                <>
                    <Markdown text={review} />
                    {!loading && (
                        <button
                            onClick={fetchReview}
                            className="mt-4 text-[11px] font-semibold tracking-[0.16em] uppercase text-zinc-500 hover:text-zinc-900 inline-flex items-center gap-1.5 transition-colors"
                        >
                            <RefreshCw className="size-3" />
                            Refresh
                        </button>
                    )}
                </>
            )}
        </section>
    );
}

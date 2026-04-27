"use client";

import {Loader2, RefreshCw, Sparkles} from "lucide-react";
import {useEffect, useState} from "react";
import {usePublicClient} from "wagmi";

type Props = {
    campaign: `0x${string}`;
    title: string;
    goalCSGD: string; // e.g. "10000"
    deadlineMs: number;
    recipient: `0x${string}`;
    donorCount: number;
    refundGraceSeconds: number;
};

const STORAGE_PREFIX = "stealthgive:review:";

/**
 * Per-campaign AI risk review. Calls /api/ai/review-campaign with the
 * campaign's deployment parameters and renders the resulting 2-paragraph
 * review.
 *
 * Result is cached in localStorage keyed by campaign address so revisits
 * don't burn ChainGPT credits.
 */
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

    // Load cached review once on mount.
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
            // Detect whether the recipient is a contract (multisig vs EOA) so
            // the model can comment on it.
            let recipientIsContract = false;
            try {
                const code = await publicClient.getCode({address: recipient});
                recipientIsContract = !!code && code !== "0x";
            } catch {
                /* ignore — non-fatal */
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
        <section className="rounded-2xl border border-violet-500/30 bg-gradient-to-br from-violet-500/10 to-transparent p-5">
            <div className="flex items-center justify-between mb-3">
                <div className="inline-flex items-center gap-2">
                    <Sparkles className="size-4 text-violet-300" />
                    <h2 className="font-semibold text-sm">AI Risk Review</h2>
                    <span className="text-[10px] font-medium px-1.5 py-0.5 rounded-full bg-violet-500/20 text-violet-200">
                        ChainGPT · this campaign
                    </span>
                </div>
                {review && !loading && (
                    <button
                        onClick={fetchReview}
                        className="text-xs text-violet-300 hover:text-violet-200 inline-flex items-center gap-1"
                    >
                        <RefreshCw className="size-3" />
                        Refresh
                    </button>
                )}
            </div>

            {!review && !loading && !error && (
                <button
                    onClick={fetchReview}
                    className="w-full rounded-full bg-violet-600 hover:bg-violet-500 px-4 py-2 text-sm font-medium inline-flex items-center justify-center gap-2"
                >
                    <Sparkles className="size-3.5" />
                    Generate review (~5s)
                </button>
            )}

            {loading && (
                <div className="flex items-center gap-2 text-sm text-zinc-400">
                    <Loader2 className="size-4 animate-spin" />
                    Analysing this campaign…
                </div>
            )}

            {error && <p className="text-sm text-red-400 break-words">{error}</p>}

            {review && (
                <p className="text-sm text-zinc-200 leading-relaxed whitespace-pre-line">{review}</p>
            )}
        </section>
    );
}

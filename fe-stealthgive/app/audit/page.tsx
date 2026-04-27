"use client";

import {ArrowLeft, ExternalLink, Loader2, ShieldCheck, Sparkles} from "lucide-react";
import Link from "next/link";
import {useEffect, useState} from "react";

const CAMPAIGN_TEMPLATE_LINK =
    "https://github.com/EzraNahumury/iexec/blob/main/sc-StealthGive/src/Campaign.sol";

export default function AuditPage() {
    const [audit, setAudit] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [fromCache, setFromCache] = useState(false);

    // Pull cached audit on mount so revisits don't have to wait again.
    useEffect(() => {
        let cancelled = false;
        fetch("/api/ai/audit-contract")
            .then(r => r.json())
            .then((data: {audit: string | null; cached: boolean}) => {
                if (cancelled) return;
                if (data.audit) {
                    setAudit(data.audit);
                    setFromCache(data.cached);
                }
            })
            .catch(() => {
                /* ignore — page still works with empty state */
            });
        return () => {
            cancelled = true;
        };
    }, []);

    async function runAudit() {
        setLoading(true);
        setError(null);
        try {
            const res = await fetch("/api/ai/audit-contract", {method: "POST"});
            const data = (await res.json()) as
                | {audit: string; cached: boolean}
                | {error: string};
            if (!res.ok || "error" in data) {
                throw new Error("error" in data ? data.error : "Audit failed");
            }
            setAudit(data.audit);
            setFromCache(data.cached);
        } catch (err) {
            setError((err as Error).message ?? "Audit failed");
        } finally {
            setLoading(false);
        }
    }

    return (
        <div className="max-w-4xl mx-auto px-6 py-12">
            <Link
                href="/campaigns"
                className="inline-flex items-center gap-1.5 text-sm text-zinc-400 hover:text-zinc-200 mb-6"
            >
                <ArrowLeft className="size-4" />
                Back to campaigns
            </Link>

            <header className="space-y-4 mb-10">
                <div className="inline-flex items-center gap-2 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3 py-1 text-xs font-medium text-emerald-300">
                    <ShieldCheck className="size-3.5" />
                    ChainGPT · Smart Contract Auditor
                </div>
                <h1 className="text-4xl font-semibold tracking-tight">
                    Campaign.sol Security Audit
                </h1>
                <p className="text-zinc-400 leading-relaxed max-w-2xl">
                    Every campaign on StealthGive is an instance of the same{" "}
                    <code className="text-zinc-200">Campaign.sol</code> contract. We run it through the
                    ChainGPT smart-contract auditor model and publish the result here so donors and
                    creators can review the code path their funds will travel.
                </p>
                <div className="flex flex-wrap items-center gap-3">
                    <button
                        onClick={runAudit}
                        disabled={loading}
                        className="rounded-full bg-violet-600 hover:bg-violet-500 disabled:opacity-50 px-5 py-2.5 text-sm font-medium inline-flex items-center gap-2"
                    >
                        {loading ? (
                            <>
                                <Loader2 className="size-4 animate-spin" />
                                Auditing… (~20s)
                            </>
                        ) : audit ? (
                            <>
                                <Sparkles className="size-4" />
                                Re-run audit
                            </>
                        ) : (
                            <>
                                <Sparkles className="size-4" />
                                Run audit
                            </>
                        )}
                    </button>
                    <a
                        href={CAMPAIGN_TEMPLATE_LINK}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1.5 text-sm text-zinc-400 hover:text-zinc-200"
                    >
                        View Campaign.sol on GitHub
                        <ExternalLink className="size-3.5" />
                    </a>
                </div>
            </header>

            {error && (
                <div className="rounded-2xl border border-red-500/30 bg-red-500/5 p-5 mb-6">
                    <p className="text-sm text-red-300 break-words">{error}</p>
                </div>
            )}

            {!audit && !error && !loading && (
                <div className="rounded-2xl border border-dashed border-zinc-800 p-12 text-center">
                    <ShieldCheck className="size-10 mx-auto mb-4 text-zinc-600" />
                    <p className="text-zinc-400">
                        Click <strong>Run audit</strong> to ask ChainGPT to review the contract.
                    </p>
                </div>
            )}

            {audit && (
                <article className="rounded-2xl border border-zinc-800 bg-zinc-900/40 p-6 md:p-8">
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="font-semibold inline-flex items-center gap-2">
                            <ShieldCheck className="size-4 text-emerald-400" />
                            Audit Report
                        </h2>
                        {fromCache && (
                            <span className="text-xs text-zinc-500">cached · click Re-run for fresh</span>
                        )}
                    </div>
                    <pre className="whitespace-pre-wrap break-words text-sm text-zinc-200 leading-relaxed font-sans">
                        {audit}
                    </pre>
                </article>
            )}

            <footer className="mt-10 text-xs text-zinc-500">
                The audit is generated by an AI model and is not a substitute for a professional human
                security review. Treat findings as starting points for further investigation.
            </footer>
        </div>
    );
}

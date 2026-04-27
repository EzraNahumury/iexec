"use client";

import {ChevronDown, ChevronUp, Loader2, Shield, Sparkles} from "lucide-react";
import {useEffect, useState} from "react";

/**
 * Collapsible "Smart Contract Audit" section. Audits the shared Campaign.sol
 * template via ChainGPT (cached server-side after first run). Same content
 * shown inline on every campaign detail page so donors don't have to leave
 * the page to read it.
 */
export function ContractAuditSection() {
    const [open, setOpen] = useState(false);
    const [audit, setAudit] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Pre-load if already cached server-side; cheap GET that never hits the LLM.
    useEffect(() => {
        let cancelled = false;
        fetch("/api/ai/audit-contract")
            .then(r => r.json())
            .then((data: {audit: string | null; cached: boolean}) => {
                if (cancelled) return;
                if (data.audit) setAudit(data.audit);
            })
            .catch(() => {
                /* ignore */
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
        } catch (err) {
            setError((err as Error).message ?? "Audit failed");
        } finally {
            setLoading(false);
        }
    }

    return (
        <section className="rounded-2xl border border-emerald-500/30 bg-emerald-500/5 overflow-hidden">
            <button
                onClick={() => setOpen(o => !o)}
                className="w-full flex items-center justify-between p-5 hover:bg-emerald-500/10 transition-colors"
            >
                <div className="flex items-center gap-2.5 text-left">
                    <Shield className="size-4 text-emerald-300" />
                    <div>
                        <div className="font-semibold inline-flex items-center gap-2">
                            Smart Contract Audit
                            <span className="text-[10px] font-medium px-1.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300">
                                ChainGPT
                            </span>
                        </div>
                        <p className="text-xs text-zinc-400 mt-0.5">
                            All campaigns share the same{" "}
                            <code className="text-zinc-700">Campaign.sol</code> template — audited once,
                            verifiable everywhere.
                        </p>
                    </div>
                </div>
                {open ? (
                    <ChevronUp className="size-4 text-zinc-400" />
                ) : (
                    <ChevronDown className="size-4 text-zinc-400" />
                )}
            </button>

            {open && (
                <div className="border-t border-emerald-500/20 p-5 space-y-4">
                    {!audit && !loading && !error && (
                        <button
                            onClick={runAudit}
                            className="rounded-full bg-violet-600 hover:bg-violet-500 px-5 py-2.5 text-sm font-medium inline-flex items-center gap-2"
                        >
                            <Sparkles className="size-4" />
                            Run audit (~20s, costs 0.5 ChainGPT credit)
                        </button>
                    )}

                    {loading && (
                        <div className="flex items-center gap-2 text-sm text-zinc-400">
                            <Loader2 className="size-4 animate-spin" />
                            ChainGPT is auditing the contract…
                        </div>
                    )}

                    {error && <p className="text-sm text-red-400 break-words">{error}</p>}

                    {audit && (
                        <>
                            <pre className="whitespace-pre-wrap break-words text-sm text-zinc-800 leading-relaxed font-sans">
                                {audit}
                            </pre>
                            <button
                                onClick={runAudit}
                                disabled={loading}
                                className="text-xs text-violet-300 hover:text-violet-200 inline-flex items-center gap-1"
                            >
                                <Sparkles className="size-3" />
                                Re-run for fresh audit
                            </button>
                        </>
                    )}
                </div>
            )}
        </section>
    );
}

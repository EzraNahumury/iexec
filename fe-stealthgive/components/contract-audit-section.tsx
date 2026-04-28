"use client";

import {ArrowUpRight, ChevronDown, Loader2, Shield, Sparkles} from "lucide-react";
import {useEffect, useState} from "react";
import {motion, AnimatePresence} from "framer-motion";

export function ContractAuditSection() {
    const [open, setOpen] = useState(false);
    const [audit, setAudit] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

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
        <section className="rounded-3xl border border-zinc-200 bg-white overflow-hidden">
            <button
                onClick={() => setOpen(o => !o)}
                className="w-full flex items-center justify-between p-6 hover:bg-zinc-50 transition-colors"
            >
                <div className="flex items-center gap-3 text-left">
                    <div className="size-10 rounded-xl bg-zinc-900 text-white flex items-center justify-center shrink-0">
                        <Shield className="size-4" />
                    </div>
                    <div>
                        <div className="font-semibold text-zinc-900 inline-flex items-center gap-2">
                            Smart Contract Audit
                            <span className="text-[10px] font-semibold tracking-[0.16em] uppercase px-2 py-0.5 rounded-full bg-zinc-900 text-white">
                                ChainGPT
                            </span>
                        </div>
                        <p className="text-xs text-zinc-500 mt-1">
                            Every campaign shares the same{" "}
                            <code className="font-mono text-[11px] text-zinc-700 bg-zinc-100 px-1.5 py-0.5 rounded">
                                Campaign.sol
                            </code>{" "}
                            template — audited once, verifiable everywhere.
                        </p>
                    </div>
                </div>
                <motion.div
                    animate={{rotate: open ? 180 : 0}}
                    transition={{duration: 0.2}}
                    className="size-8 rounded-full border border-zinc-200 flex items-center justify-center text-zinc-500 shrink-0"
                >
                    <ChevronDown className="size-4" />
                </motion.div>
            </button>

            <AnimatePresence initial={false}>
                {open && (
                    <motion.div
                        initial={{height: 0, opacity: 0}}
                        animate={{height: "auto", opacity: 1}}
                        exit={{height: 0, opacity: 0}}
                        transition={{duration: 0.25, ease: "easeInOut"}}
                        className="overflow-hidden"
                    >
                        <div className="border-t border-zinc-100 p-6 space-y-4">
                            {!audit && !loading && !error && (
                                <button
                                    onClick={runAudit}
                                    className="group inline-flex items-center gap-3 rounded-full bg-zinc-900 hover:bg-zinc-800 text-white text-xs font-bold tracking-[0.18em] uppercase px-5 py-3 transition-colors"
                                >
                                    <Sparkles className="size-3.5" />
                                    Run audit · ~20s · 0.5 credit
                                    <span className="inline-flex items-center justify-center size-5 rounded-full border border-white/40 group-hover:border-white/70 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5">
                                        <ArrowUpRight className="size-3" />
                                    </span>
                                </button>
                            )}

                            {loading && (
                                <div className="flex items-center gap-2 text-sm text-zinc-600">
                                    <Loader2 className="size-4 animate-spin" />
                                    ChainGPT is auditing the contract…
                                </div>
                            )}

                            {error && <p className="text-sm text-red-600 break-words">{error}</p>}

                            {audit && (
                                <>
                                    <pre className="whitespace-pre-wrap break-words text-sm text-zinc-700 leading-relaxed font-sans">
                                        {audit}
                                    </pre>
                                    <button
                                        onClick={runAudit}
                                        disabled={loading}
                                        className="text-[11px] font-semibold tracking-[0.16em] uppercase text-zinc-500 hover:text-zinc-900 inline-flex items-center gap-1.5 transition-colors"
                                    >
                                        <Sparkles className="size-3" />
                                        Re-run for fresh audit
                                    </button>
                                </>
                            )}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </section>
    );
}

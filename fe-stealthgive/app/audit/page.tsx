"use client";

import {
    ArrowLeft,
    ArrowUpRight,
    CheckCircle2,
    ExternalLink,
    Loader2,
    RefreshCw,
    Shield,
    ShieldCheck,
    Sparkles,
} from "lucide-react";
import Link from "next/link";
import {AnimatePresence, motion} from "framer-motion";
import {useEffect, useMemo, useState} from "react";

const CAMPAIGN_TEMPLATE_LINK =
    "https://github.com/EzraNahumury/iexec/blob/main/sc-StealthGive/src/Campaign.sol";

type Status = "idle" | "running" | "complete" | "error";

export default function AuditPage() {
    const [audit, setAudit] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [status, setStatus] = useState<Status>("idle");
    const [fromCache, setFromCache] = useState(false);

    useEffect(() => {
        let cancelled = false;
        fetch("/api/ai/audit-contract")
            .then(r => r.json())
            .then((data: {audit: string | null; cached: boolean}) => {
                if (cancelled) return;
                if (data.audit) {
                    setAudit(data.audit);
                    setFromCache(data.cached);
                    setStatus("complete");
                }
            })
            .catch(() => {});
        return () => {
            cancelled = true;
        };
    }, []);

    async function runAudit() {
        setStatus("running");
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
            setStatus("complete");
        } catch (err) {
            setError((err as Error).message ?? "Audit failed");
            setStatus("error");
        }
    }

    return (
        <div className="relative min-h-[calc(100vh-72px)]">
            <div className="absolute inset-0 bg-grid pointer-events-none opacity-50" aria-hidden />
            <div
                className="absolute inset-0 pointer-events-none"
                style={{
                    background:
                        "radial-gradient(ellipse 80% 60% at 50% 20%, rgba(255,255,255,1), rgba(255,255,255,0.4))",
                }}
                aria-hidden
            />

            <div className="relative max-w-5xl mx-auto px-6 py-12 md:py-16">
                <Link
                    href="/campaigns"
                    className="inline-flex items-center gap-1.5 text-sm text-zinc-500 hover:text-zinc-900 mb-10 transition-colors"
                >
                    <ArrowLeft className="size-4" />
                    Back to campaigns
                </Link>

                <motion.div
                    initial={{opacity: 0, y: 12}}
                    animate={{opacity: 1, y: 0}}
                    transition={{duration: 0.6}}
                    className="space-y-5 mb-10"
                >
                    <div className="inline-flex items-center gap-2 rounded-full border border-emerald-500/40 bg-emerald-500/10 px-3 py-1 text-xs font-medium text-emerald-700">
                        <ShieldCheck className="size-3.5" />
                        ChainGPT · Smart Contract Auditor
                    </div>

                    <h1 className="text-5xl md:text-6xl font-semibold tracking-tight text-zinc-900 leading-[1.05]">
                        Campaign.sol{" "}
                        <span className="font-serif italic font-light">security audit</span>
                    </h1>

                    <p className="text-zinc-600 leading-relaxed max-w-2xl text-lg">
                        Every campaign on StealthGive is an instance of the same{" "}
                        <code className="font-mono text-sm text-zinc-900 px-1.5 py-0.5 rounded bg-zinc-100 border border-zinc-200">
                            Campaign.sol
                        </code>{" "}
                        contract. We run it through the ChainGPT smart-contract auditor model and
                        publish the result here so donors and creators can review the code path their
                        funds will travel.
                    </p>
                </motion.div>

                <StatGrid status={status} audit={audit} />

                <motion.div
                    initial={{opacity: 0}}
                    animate={{opacity: 1}}
                    transition={{duration: 0.5, delay: 0.3}}
                    className="flex flex-wrap items-center gap-4 mt-8"
                >
                    <button
                        onClick={runAudit}
                        disabled={status === "running"}
                        className="group inline-flex items-center gap-3 rounded-full bg-zinc-900 hover:bg-zinc-800 disabled:bg-zinc-700 text-white px-6 py-3 text-xs font-semibold tracking-[0.16em] uppercase transition-colors"
                    >
                        {status === "running" ? (
                            <>
                                <Loader2 className="size-4 animate-spin" />
                                Auditing…
                            </>
                        ) : audit ? (
                            <>
                                <RefreshCw className="size-4" />
                                Re-run audit
                            </>
                        ) : (
                            <>
                                <Sparkles className="size-4" />
                                Run audit
                            </>
                        )}
                        {status !== "running" && (
                            <span className="inline-flex items-center justify-center size-6 rounded-full border border-white/30 group-hover:border-white/60 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5">
                                <ArrowUpRight className="size-3" />
                            </span>
                        )}
                    </button>

                    <a
                        href={CAMPAIGN_TEMPLATE_LINK}
                        target="_blank"
                        rel="noreferrer"
                        className="text-xs uppercase tracking-[0.18em] text-zinc-700 hover:text-zinc-900 transition-colors inline-flex items-center gap-2 font-medium"
                    >
                        View Campaign.sol on GitHub
                        <ExternalLink className="size-3.5" />
                    </a>
                </motion.div>

                <motion.div
                    initial={{opacity: 0, y: 16}}
                    animate={{opacity: 1, y: 0}}
                    transition={{duration: 0.7, delay: 0.4}}
                    className="mt-10 rounded-3xl border border-zinc-200 bg-white shadow-[0_24px_60px_-24px_rgba(0,0,0,0.18)] overflow-hidden"
                >
                    <AnimatePresence mode="wait">
                        {status === "running" && <RunningPanel key="running" />}
                        {status === "error" && <ErrorPanel key="error" error={error ?? ""} />}
                        {status === "complete" && audit && (
                            <CompletePanel key="complete" audit={audit} fromCache={fromCache} />
                        )}
                        {status === "idle" && <IdlePanel key="idle" />}
                    </AnimatePresence>
                </motion.div>

                <motion.p
                    initial={{opacity: 0}}
                    animate={{opacity: 1}}
                    transition={{duration: 0.5, delay: 0.6}}
                    className="mt-8 text-xs text-zinc-500 max-w-2xl leading-relaxed"
                >
                    The audit is generated by an AI model and is not a substitute for a professional
                    human security review. Treat findings as starting points for further investigation.
                </motion.p>
            </div>
        </div>
    );
}

function StatGrid({status, audit}: {status: Status; audit: string | null}) {
    const counts = useMemo(() => parseSeverityCounts(audit), [audit]);

    const stats = [
        {label: "Auditor", value: "ChainGPT", sub: "smart_contract_auditor"},
        {
            label: "Findings",
            value: counts.total === null ? "—" : counts.total.toString(),
            sub: counts.total === null ? "Not yet run" : "across all severities",
        },
        {
            label: "Critical / High",
            value: counts.high === null ? "—" : `${counts.critical ?? 0} / ${counts.high ?? 0}`,
            sub: counts.high === null ? "—" : "highest severity bucket",
        },
        {
            label: "Status",
            value:
                status === "running"
                    ? "Running"
                    : status === "complete"
                      ? "Complete"
                      : status === "error"
                        ? "Error"
                        : "Idle",
            sub:
                status === "complete"
                    ? "Auto-decryptable on chain"
                    : status === "running"
                      ? "Querying ChainGPT"
                      : status === "idle"
                        ? "Run audit to start"
                        : "Re-run to retry",
        },
    ];

    return (
        <motion.div
            initial="hidden"
            animate="show"
            variants={{
                hidden: {},
                show: {transition: {staggerChildren: 0.06, delayChildren: 0.15}},
            }}
            className="grid grid-cols-2 lg:grid-cols-4 gap-3"
        >
            {stats.map(s => (
                <motion.div
                    key={s.label}
                    variants={{
                        hidden: {opacity: 0, y: 12},
                        show: {opacity: 1, y: 0},
                    }}
                    className="rounded-2xl border border-zinc-200 bg-white p-4"
                >
                    <div className="text-[10px] font-semibold tracking-[0.18em] uppercase text-zinc-500">
                        {s.label}
                    </div>
                    <div className="text-2xl font-semibold tabular-nums text-zinc-900 mt-2 leading-none">
                        {s.value}
                    </div>
                    <div className="text-xs text-zinc-500 mt-1.5 leading-snug">{s.sub}</div>
                </motion.div>
            ))}
        </motion.div>
    );
}

function parseSeverityCounts(audit: string | null) {
    if (!audit) return {critical: null, high: null, medium: null, low: null, total: null};
    const text = audit.toLowerCase();
    const count = (re: RegExp) => (text.match(re) ?? []).length;
    const critical = count(/\b(?:severity\s*[:\-]?\s*critical|\bcritical\b)/g);
    const high = count(/\b(?:severity\s*[:\-]?\s*high|\bhigh\b)/g);
    const medium = count(/\b(?:severity\s*[:\-]?\s*medium|\bmedium\b)/g);
    const low = count(/\b(?:severity\s*[:\-]?\s*low|\blow\b)/g);
    return {critical, high, medium, low, total: critical + high + medium + low};
}

function IdlePanel() {
    return (
        <motion.div
            initial={{opacity: 0}}
            animate={{opacity: 1}}
            exit={{opacity: 0}}
            transition={{duration: 0.4}}
            className="relative aspect-[16/8] bg-gradient-to-br from-zinc-50 to-zinc-100 overflow-hidden"
        >
            <DotPattern />
            <ScanningShield />
            <div className="absolute inset-0 flex items-end p-8">
                <div className="space-y-1">
                    <div className="text-[11px] tracking-[0.2em] uppercase text-zinc-500">
                        Awaiting audit
                    </div>
                    <div className="text-zinc-700">
                        Click <strong className="text-zinc-900">Run audit</strong> to ask ChainGPT to
                        review the contract.
                    </div>
                </div>
            </div>
        </motion.div>
    );
}

function RunningPanel() {
    return (
        <motion.div
            initial={{opacity: 0}}
            animate={{opacity: 1}}
            exit={{opacity: 0}}
            transition={{duration: 0.3}}
            className="relative aspect-[16/8] bg-gradient-to-br from-zinc-900 via-zinc-800 to-zinc-950 overflow-hidden"
        >
            <CodeLines />
            <div className="absolute inset-0 flex items-center justify-center">
                <motion.div
                    animate={{rotate: 360}}
                    transition={{duration: 8, repeat: Infinity, ease: "linear"}}
                    className="absolute"
                >
                    <svg viewBox="0 0 200 200" className="w-48 h-48 opacity-30">
                        <circle
                            cx="100"
                            cy="100"
                            r="80"
                            stroke="white"
                            strokeWidth="1"
                            fill="none"
                            strokeDasharray="4 8"
                        />
                        <circle
                            cx="100"
                            cy="100"
                            r="60"
                            stroke="white"
                            strokeWidth="1"
                            fill="none"
                            strokeDasharray="2 12"
                        />
                    </svg>
                </motion.div>
                <motion.div
                    animate={{scale: [1, 1.06, 1]}}
                    transition={{duration: 1.6, repeat: Infinity, ease: "easeInOut"}}
                    className="size-20 rounded-2xl bg-emerald-500/20 border border-emerald-400/40 flex items-center justify-center text-emerald-300 z-10"
                >
                    <Shield className="size-10" />
                </motion.div>
            </div>
            <div className="absolute inset-x-0 bottom-0 p-8 flex items-center gap-3 text-white">
                <Loader2 className="size-4 animate-spin text-emerald-400" />
                <span className="text-sm">
                    ChainGPT is auditing <code className="font-mono">Campaign.sol</code>… ~20 seconds
                </span>
            </div>
        </motion.div>
    );
}

function ErrorPanel({error}: {error: string}) {
    return (
        <motion.div
            initial={{opacity: 0}}
            animate={{opacity: 1}}
            exit={{opacity: 0}}
            className="p-6 bg-red-500/5 border-l-4 border-red-500"
        >
            <div className="text-sm font-medium text-red-700 mb-1">Audit failed</div>
            <div className="text-sm text-red-600/80 break-words">{error}</div>
        </motion.div>
    );
}

function CompletePanel({audit, fromCache}: {audit: string; fromCache: boolean}) {
    return (
        <motion.div
            initial={{opacity: 0, y: 12}}
            animate={{opacity: 1, y: 0}}
            exit={{opacity: 0}}
            transition={{duration: 0.5}}
            className="p-6 md:p-8"
        >
            <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
                <h2 className="font-semibold inline-flex items-center gap-2 text-zinc-900">
                    <CheckCircle2 className="size-5 text-emerald-500" />
                    Audit report
                </h2>
                <span className="text-[11px] font-medium px-2.5 py-1 rounded-full bg-zinc-100 text-zinc-600 border border-zinc-200">
                    {fromCache ? "From cache" : "Fresh"}
                </span>
            </div>
            <pre className="whitespace-pre-wrap break-words text-sm text-zinc-800 leading-relaxed font-sans bg-zinc-50 border border-zinc-200 rounded-xl p-5">
                {audit}
            </pre>
        </motion.div>
    );
}

function DotPattern() {
    return (
        <svg className="absolute inset-0 w-full h-full" aria-hidden>
            <defs>
                <pattern id="audit-dots" width="22" height="22" patternUnits="userSpaceOnUse">
                    <circle cx="11" cy="11" r="1" fill="rgba(0,0,0,0.07)" />
                </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#audit-dots)" />
        </svg>
    );
}

function ScanningShield() {
    return (
        <div className="absolute inset-0 flex items-center justify-center">
            {[0, 1, 2].map(i => (
                <motion.div
                    key={i}
                    className="absolute rounded-full border-2 border-zinc-300"
                    initial={{width: 60, height: 60, opacity: 0}}
                    animate={{
                        width: ["60px", "180px"],
                        height: ["60px", "180px"],
                        opacity: [0.6, 0],
                    }}
                    transition={{
                        duration: 2.6,
                        repeat: Infinity,
                        ease: "easeOut",
                        delay: i * 0.85,
                    }}
                />
            ))}
            <motion.div
                animate={{y: [0, -4, 0]}}
                transition={{duration: 3, repeat: Infinity, ease: "easeInOut"}}
                className="size-16 rounded-2xl bg-zinc-900 text-white flex items-center justify-center shadow-xl z-10"
            >
                <Shield className="size-7" />
            </motion.div>
            <motion.div
                className="absolute inset-x-12 h-[2px] bg-zinc-900/40"
                style={{boxShadow: "0 0 10px rgba(0,0,0,0.25)"}}
                animate={{top: ["20%", "80%", "20%"]}}
                transition={{duration: 4, repeat: Infinity, ease: "easeInOut"}}
            />
        </div>
    );
}

function CodeLines() {
    const lines = useMemo(
        () =>
            Array.from({length: 18}, (_, i) => ({
                w: 30 + ((i * 17) % 50),
                delay: (i * 0.18) % 2.4,
            })),
        [],
    );
    return (
        <div className="absolute inset-0 flex flex-col gap-3 p-6 opacity-30 font-mono text-[10px] text-emerald-300">
            {lines.map((l, i) => (
                <motion.div
                    key={i}
                    initial={{opacity: 0, x: -20}}
                    animate={{opacity: [0, 0.8, 0], x: [-20, 0, 20]}}
                    transition={{
                        duration: 3,
                        repeat: Infinity,
                        ease: "easeInOut",
                        delay: l.delay,
                    }}
                    className="rounded bg-emerald-300/30 h-1.5"
                    style={{width: `${l.w}%`}}
                />
            ))}
        </div>
    );
}

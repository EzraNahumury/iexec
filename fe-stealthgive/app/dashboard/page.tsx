"use client";

import {
    ArrowLeft,
    ArrowRight,
    ArrowUpRight,
    CheckCircle2,
    Coins,
    EyeOff,
    Loader2,
    Lock,
    RefreshCw,
    Sparkles,
    Wallet,
} from "lucide-react";
import {AnimatePresence, motion} from "framer-motion";
import {useEffect, useState} from "react";
import {useAccount, useReadContract, useWaitForTransactionReceipt, useWriteContract} from "wagmi";
import {arbitrumSepolia} from "wagmi/chains";

import {confidentialSGDAbi, stealthGiveDollarAbi} from "@/lib/abis";
import {addresses} from "@/lib/addresses";
import {formatSGD, shortAddress} from "@/lib/format";
import {arbSepoliaGas} from "@/lib/gas";
import {isAuthError, useHandleClient} from "@/lib/nox";

const ADDR = addresses[arbitrumSepolia.id];
const ZERO_HANDLE = "0x0000000000000000000000000000000000000000000000000000000000000000";

export default function DashboardPage() {
    const {address, isConnected} = useAccount();
    const {client: handleClient, refresh: refreshHandleClient} = useHandleClient();

    /* ─────────── reads ─────────── */
    const {data: sgdBalance, refetch: refetchSGD} = useReadContract({
        address: ADDR.sgd,
        abi: stealthGiveDollarAbi,
        functionName: "balanceOf",
        args: address ? [address] : undefined,
        query: {enabled: !!address},
    });
    const {data: lastClaim, refetch: refetchLastClaim} = useReadContract({
        address: ADDR.sgd,
        abi: stealthGiveDollarAbi,
        functionName: "lastClaim",
        args: address ? [address] : undefined,
        query: {enabled: !!address},
    });
    const {data: cSGDHandle, refetch: refetchCSGD} = useReadContract({
        address: ADDR.cSGD,
        abi: confidentialSGDAbi,
        functionName: "confidentialBalanceOf",
        args: address ? [address] : undefined,
        query: {enabled: !!address},
    });

    /* ─────────── mutations ─────────── */
    const {writeContractAsync, data: txHash, isPending, reset} = useWriteContract();
    const {isLoading: isMining, isSuccess: txSuccess} = useWaitForTransactionReceipt({hash: txHash});

    useEffect(() => {
        if (txSuccess) {
            refetchSGD();
            refetchLastClaim();
            refetchCSGD();
            setWrapAmount("");
            reset();
        }
    }, [txSuccess, refetchSGD, refetchLastClaim, refetchCSGD, reset]);

    /* ─────────── decrypt ─────────── */
    const [decrypted, setDecrypted] = useState<bigint | null>(null);
    const [decrypting, setDecrypting] = useState(false);
    const [decryptError, setDecryptError] = useState<string | null>(null);

    async function decryptBalance() {
        if (!handleClient || !cSGDHandle) return;
        setDecrypting(true);
        setDecryptError(null);
        try {
            const res = await handleClient.decrypt(cSGDHandle as `0x${string}`);
            setDecrypted(res.value as bigint);
        } catch (err) {
            if (isAuthError(err)) {
                try {
                    const fresh = await refreshHandleClient();
                    if (!fresh) throw err;
                    const res = await fresh.decrypt(cSGDHandle as `0x${string}`);
                    setDecrypted(res.value as bigint);
                    return;
                } catch (retryErr) {
                    setDecryptError((retryErr as Error).message ?? "Failed to decrypt");
                    return;
                }
            }
            setDecryptError((err as Error).message ?? "Failed to decrypt");
        } finally {
            setDecrypting(false);
        }
    }

    /* ─────────── wrap form ─────────── */
    const [wrapAmount, setWrapAmount] = useState("");

    async function onClaim() {
        await writeContractAsync({
            address: ADDR.sgd,
            abi: stealthGiveDollarAbi,
            functionName: "claim",
            ...arbSepoliaGas,
        });
    }
    async function onApprove() {
        if (!address) return;
        const n = BigInt(Math.floor(Number(wrapAmount) * 1_000_000));
        if (n <= 0n) return;
        await writeContractAsync({
            address: ADDR.sgd,
            abi: stealthGiveDollarAbi,
            functionName: "approve",
            args: [ADDR.cSGD, n],
            ...arbSepoliaGas,
        });
    }
    async function onWrap() {
        if (!address) return;
        const n = BigInt(Math.floor(Number(wrapAmount) * 1_000_000));
        if (n <= 0n) return;
        await writeContractAsync({
            address: ADDR.cSGD,
            abi: confidentialSGDAbi,
            functionName: "wrap",
            args: [address, n],
            ...arbSepoliaGas,
        });
    }

    const cooldownReady = !lastClaim || Number(lastClaim) === 0
        ? true
        : Date.now() / 1000 >= Number(lastClaim) + 86_400;
    const nextClaimAt = lastClaim ? Number(lastClaim) + 86_400 : 0;
    const hasNoCSGD = !cSGDHandle || (cSGDHandle as string) === ZERO_HANDLE;
    const txBusy = isPending || isMining;

    if (!isConnected) {
        return (
            <div className="relative min-h-[calc(100vh-72px)]">
                <div className="absolute inset-0 bg-grid pointer-events-none opacity-50" aria-hidden />
                <div className="relative max-w-xl mx-auto px-6 py-32 text-center">
                    <motion.div
                        initial={{opacity: 0, scale: 0.9}}
                        animate={{opacity: 1, scale: 1}}
                        transition={{duration: 0.5}}
                        className="size-16 rounded-2xl bg-zinc-900 text-white inline-flex items-center justify-center mx-auto mb-6 shadow-xl"
                    >
                        <Wallet className="size-7" />
                    </motion.div>
                    <h1 className="text-4xl font-semibold mb-3 text-zinc-900 tracking-tight">
                        Connect{" "}
                        <span className="font-serif italic font-light">your wallet</span>
                    </h1>
                    <p className="text-zinc-600">
                        Use the Connect button in the header to load your dashboard.
                    </p>
                </div>
            </div>
        );
    }

    return (
        <div className="relative min-h-[calc(100vh-72px)]">
            <div className="absolute inset-0 bg-grid pointer-events-none opacity-50" aria-hidden />
            <div
                className="absolute inset-0 pointer-events-none"
                style={{
                    background:
                        "radial-gradient(ellipse 80% 50% at 50% 10%, rgba(255,255,255,1), rgba(255,255,255,0.4))",
                }}
                aria-hidden
            />

            <div className="relative max-w-5xl mx-auto px-6 py-12 md:py-16 space-y-10">
                {/* Hero */}
                <motion.header
                    initial={{opacity: 0, y: 12}}
                    animate={{opacity: 1, y: 0}}
                    transition={{duration: 0.6}}
                >
                    <div className="text-[11px] font-medium tracking-[0.18em] uppercase text-zinc-500 mb-3">
                        Wallet · Arbitrum Sepolia
                    </div>
                    <div className="flex flex-wrap items-end justify-between gap-4">
                        <h1 className="text-5xl md:text-6xl font-semibold tracking-tight text-zinc-900 leading-[1.05]">
                            Your{" "}
                            <span className="font-serif italic font-light">vault</span>
                        </h1>
                        <a
                            href={`https://sepolia.arbiscan.io/address/${address}`}
                            target="_blank"
                            rel="noreferrer"
                            className="text-xs uppercase tracking-[0.18em] text-zinc-700 hover:text-zinc-900 transition-colors inline-flex items-center gap-2 font-medium"
                        >
                            View on Arbiscan
                            <ArrowUpRight className="size-3.5" />
                        </a>
                    </div>
                    <p className="text-zinc-500 mt-3 font-mono text-sm">{shortAddress(address, 8, 6)}</p>
                </motion.header>

                {/* Two-card stat row */}
                <div className="grid md:grid-cols-2 gap-5">
                    {/* SGD card */}
                    <motion.section
                        initial={{opacity: 0, y: 16}}
                        animate={{opacity: 1, y: 0}}
                        transition={{duration: 0.5, delay: 0.1}}
                        className="group relative rounded-3xl border border-zinc-200 bg-white p-7 overflow-hidden hover:shadow-[0_20px_50px_-20px_rgba(0,0,0,0.15)] transition-shadow"
                    >
                        {/* Decorative top-right coin */}
                        <div className="absolute -top-6 -right-6 size-32 rounded-full bg-zinc-100/60 blur-2xl pointer-events-none" />

                        <div className="flex items-center justify-between mb-6 relative">
                            <div className="inline-flex items-center gap-2">
                                <div className="size-9 rounded-xl bg-zinc-900 text-white flex items-center justify-center">
                                    <Coins className="size-4" />
                                </div>
                                <div>
                                    <div className="font-semibold text-zinc-900 leading-tight">SGD</div>
                                    <div className="text-[11px] text-zinc-500">
                                        StealthGive Dollar · 6 dec
                                    </div>
                                </div>
                            </div>
                            <span className="text-[10px] font-semibold tracking-[0.18em] uppercase px-2.5 py-1 rounded-full bg-zinc-900 text-white">
                                Public
                            </span>
                        </div>

                        <div className="text-5xl font-semibold tabular-nums tracking-tight text-zinc-900 leading-none mb-2">
                            {formatSGD(sgdBalance as bigint)}
                        </div>
                        <div className="text-sm text-zinc-500 mb-6">SGD claimable on chain</div>

                        <button
                            onClick={onClaim}
                            disabled={txBusy || !cooldownReady}
                            className="group/btn w-full rounded-full bg-zinc-900 hover:bg-zinc-800 disabled:bg-zinc-200 disabled:text-zinc-500 disabled:cursor-not-allowed text-white px-5 py-3 text-xs font-semibold tracking-[0.16em] uppercase transition-colors inline-flex items-center justify-center gap-3"
                        >
                            {txBusy ? (
                                <>
                                    <Loader2 className="size-4 animate-spin" />
                                    Claiming…
                                </>
                            ) : cooldownReady ? (
                                <>
                                    <Sparkles className="size-4" />
                                    Claim 1,000 SGD
                                    <span className="inline-flex items-center justify-center size-6 rounded-full border border-white/30 group-hover/btn:border-white/60 transition-transform group-hover/btn:translate-x-0.5 group-hover/btn:-translate-y-0.5">
                                        <ArrowUpRight className="size-3" />
                                    </span>
                                </>
                            ) : (
                                `Cooldown · ${new Date(nextClaimAt * 1000).toLocaleTimeString(undefined, {hour: "2-digit", minute: "2-digit"})}`
                            )}
                        </button>
                    </motion.section>

                    {/* cSGD card */}
                    <motion.section
                        initial={{opacity: 0, y: 16}}
                        animate={{opacity: 1, y: 0}}
                        transition={{duration: 0.5, delay: 0.18}}
                        className="group relative rounded-3xl border border-zinc-200 bg-zinc-900 text-white p-7 overflow-hidden hover:shadow-[0_20px_50px_-20px_rgba(0,0,0,0.4)] transition-shadow"
                    >
                        {/* Decorative bg pattern */}
                        <DotPatternDark />
                        <div className="absolute -bottom-12 -right-12 size-48 rounded-full bg-emerald-500/10 blur-3xl pointer-events-none" />

                        <div className="flex items-center justify-between mb-6 relative">
                            <div className="inline-flex items-center gap-2">
                                <div className="size-9 rounded-xl bg-white/10 backdrop-blur border border-white/15 flex items-center justify-center">
                                    <Lock className="size-4" />
                                </div>
                                <div>
                                    <div className="font-semibold leading-tight">cSGD</div>
                                    <div className="text-[11px] text-white/50">
                                        Confidential · ERC-7984
                                    </div>
                                </div>
                            </div>
                            <span className="text-[10px] font-semibold tracking-[0.18em] uppercase px-2.5 py-1 rounded-full bg-emerald-500/20 border border-emerald-400/40 text-emerald-300">
                                Encrypted
                            </span>
                        </div>

                        <div className="relative h-[60px] mb-2">
                            <AnimatePresence mode="wait">
                                {hasNoCSGD ? (
                                    <motion.div
                                        key="zero"
                                        initial={{opacity: 0}}
                                        animate={{opacity: 1}}
                                        exit={{opacity: 0}}
                                        className="text-5xl font-semibold tabular-nums leading-none text-white/40"
                                    >
                                        0
                                    </motion.div>
                                ) : decrypted !== null ? (
                                    <motion.div
                                        key="revealed"
                                        initial={{opacity: 0, y: 8}}
                                        animate={{opacity: 1, y: 0}}
                                        exit={{opacity: 0}}
                                        className="text-5xl font-semibold tabular-nums tracking-tight leading-none text-emerald-300"
                                    >
                                        {formatSGD(decrypted)}
                                    </motion.div>
                                ) : (
                                    <motion.div
                                        key="hidden"
                                        initial={{opacity: 0}}
                                        animate={{opacity: 1}}
                                        exit={{opacity: 0}}
                                        className="flex items-center gap-2 h-[60px]"
                                    >
                                        {[0, 1, 2, 3, 4].map(i => (
                                            <motion.span
                                                key={i}
                                                className="size-7 rounded-full bg-white"
                                                animate={{
                                                    opacity: [0.3, 1, 0.3],
                                                    scale: [0.92, 1.04, 0.92],
                                                }}
                                                transition={{
                                                    duration: 1.6,
                                                    repeat: Infinity,
                                                    ease: "easeInOut",
                                                    delay: i * 0.18,
                                                }}
                                            />
                                        ))}
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>
                        <div className="text-sm text-white/50 mb-6">
                            {hasNoCSGD
                                ? "No cSGD yet · wrap some SGD below"
                                : decrypted !== null
                                  ? "cSGD revealed via Nox gateway"
                                  : "Encrypted in the iExec TEE"}
                        </div>

                        {!hasNoCSGD && (
                            <button
                                onClick={decryptBalance}
                                disabled={!handleClient || decrypting}
                                className="group/btn w-full rounded-full bg-white/10 hover:bg-white/15 backdrop-blur border border-white/15 disabled:opacity-50 px-5 py-3 text-xs font-semibold tracking-[0.16em] uppercase transition-colors inline-flex items-center justify-center gap-3"
                            >
                                {decrypting ? (
                                    <>
                                        <Loader2 className="size-4 animate-spin" />
                                        Asking gateway…
                                    </>
                                ) : decrypted !== null ? (
                                    <>
                                        <RefreshCw className="size-4" />
                                        Re-decrypt balance
                                    </>
                                ) : (
                                    <>
                                        <Sparkles className="size-4" />
                                        Reveal balance · gasless
                                        <span className="inline-flex items-center justify-center size-6 rounded-full border border-white/30 group-hover/btn:border-white/60 transition-transform group-hover/btn:translate-x-0.5 group-hover/btn:-translate-y-0.5">
                                            <ArrowUpRight className="size-3" />
                                        </span>
                                    </>
                                )}
                            </button>
                        )}
                        {decryptError && (
                            <p className="mt-3 text-xs text-red-300 break-words">{decryptError}</p>
                        )}
                        {!hasNoCSGD && (
                            <p className="mt-3 text-[10px] font-mono text-white/40 break-all">
                                {(cSGDHandle as string).slice(0, 28)}…
                            </p>
                        )}
                    </motion.section>
                </div>

                {/* Wrap section */}
                <motion.section
                    initial={{opacity: 0, y: 16}}
                    animate={{opacity: 1, y: 0}}
                    transition={{duration: 0.5, delay: 0.28}}
                    className="rounded-3xl border border-zinc-200 bg-white p-7 md:p-8 space-y-6"
                >
                    <div className="flex items-start justify-between flex-wrap gap-4">
                        <div>
                            <div className="text-[11px] font-medium tracking-[0.18em] uppercase text-zinc-500 mb-2">
                                Bridge
                            </div>
                            <h2 className="text-2xl font-semibold text-zinc-900 tracking-tight inline-flex items-center gap-3">
                                Wrap{" "}
                                <span className="font-serif italic font-light text-zinc-700">
                                    SGD
                                </span>
                                <ArrowRight className="size-5 text-zinc-400" />
                                <span className="font-serif italic font-light text-zinc-700">
                                    cSGD
                                </span>
                            </h2>
                            <p className="text-sm text-zinc-500 mt-2 max-w-md">
                                Two transactions: <code className="font-mono text-xs text-zinc-700">approve</code>{" "}
                                the wrapper, then <code className="font-mono text-xs text-zinc-700">wrap</code>.
                                Output is encrypted inside the iExec TEE.
                            </p>
                        </div>
                    </div>

                    {/* Visual flow */}
                    <div className="grid grid-cols-[1fr_auto_1fr] items-stretch gap-3 max-w-xl">
                        <div className="rounded-2xl border border-zinc-200 bg-zinc-50 p-4">
                            <div className="text-[10px] font-semibold tracking-[0.16em] uppercase text-zinc-500 mb-2">
                                In
                            </div>
                            <div className="text-2xl font-semibold tabular-nums text-zinc-900">
                                {wrapAmount || "0"}
                            </div>
                            <div className="text-xs text-zinc-500 mt-1">SGD plaintext</div>
                        </div>

                        <div className="flex items-center justify-center">
                            <motion.div
                                animate={{x: [0, 4, 0]}}
                                transition={{duration: 1.4, repeat: Infinity, ease: "easeInOut"}}
                                className="size-9 rounded-full bg-zinc-900 text-white flex items-center justify-center"
                            >
                                <ArrowRight className="size-4" />
                            </motion.div>
                        </div>

                        <div className="rounded-2xl border border-zinc-900 bg-zinc-900 text-white p-4 relative overflow-hidden">
                            <div className="text-[10px] font-semibold tracking-[0.16em] uppercase text-emerald-300 mb-2">
                                Out
                            </div>
                            <div className="flex items-center gap-1.5 h-7">
                                {[0, 1, 2, 3, 4].map(i => (
                                    <motion.span
                                        key={i}
                                        className="size-2 rounded-full bg-white"
                                        animate={{opacity: [0.3, 1, 0.3]}}
                                        transition={{
                                            duration: 1.6,
                                            repeat: Infinity,
                                            ease: "easeInOut",
                                            delay: i * 0.16,
                                        }}
                                    />
                                ))}
                            </div>
                            <div className="text-xs text-white/60 mt-1">cSGD encrypted</div>
                        </div>
                    </div>

                    {/* Form */}
                    <div className="space-y-4">
                        <div>
                            <label className="block text-[10px] font-semibold tracking-[0.16em] uppercase text-zinc-500 mb-2">
                                Amount (SGD)
                            </label>
                            <input
                                type="number"
                                min="1"
                                step="1"
                                placeholder="100"
                                value={wrapAmount}
                                onChange={e => setWrapAmount(e.target.value)}
                                className="w-full rounded-xl bg-zinc-50 border border-zinc-200 px-4 py-3 text-base focus:border-zinc-900 focus:bg-white focus:outline-none transition-colors"
                            />
                        </div>

                        <div className="flex flex-wrap gap-3">
                            <button
                                onClick={onApprove}
                                disabled={txBusy || !wrapAmount}
                                className="flex-1 min-w-[140px] rounded-full bg-white border border-zinc-300 hover:border-zinc-900 hover:bg-zinc-50 disabled:opacity-50 disabled:cursor-not-allowed px-5 py-3 text-xs font-semibold tracking-[0.16em] uppercase transition-colors inline-flex items-center justify-center gap-2"
                            >
                                <span className="inline-flex items-center justify-center size-5 rounded-full border border-zinc-300 text-[10px] font-bold">
                                    1
                                </span>
                                Approve
                            </button>
                            <button
                                onClick={onWrap}
                                disabled={txBusy || !wrapAmount}
                                className="group flex-1 min-w-[140px] rounded-full bg-zinc-900 hover:bg-zinc-800 disabled:bg-zinc-200 disabled:text-zinc-500 disabled:cursor-not-allowed text-white px-5 py-3 text-xs font-semibold tracking-[0.16em] uppercase transition-colors inline-flex items-center justify-center gap-2"
                            >
                                <span className="inline-flex items-center justify-center size-5 rounded-full border border-white/30 text-[10px] font-bold">
                                    2
                                </span>
                                Wrap
                                <span className="inline-flex items-center justify-center size-5 rounded-full border border-white/30 group-hover:border-white/60 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5">
                                    <ArrowUpRight className="size-2.5" />
                                </span>
                            </button>
                        </div>
                    </div>
                </motion.section>

                {/* Tx receipt strip */}
                <AnimatePresence>
                    {txHash && (
                        <motion.div
                            initial={{opacity: 0, y: 8}}
                            animate={{opacity: 1, y: 0}}
                            exit={{opacity: 0}}
                            className="rounded-2xl border border-emerald-500/30 bg-emerald-500/5 p-4 flex items-center justify-between flex-wrap gap-3"
                        >
                            <div className="inline-flex items-center gap-2 text-sm text-emerald-700">
                                <CheckCircle2 className="size-4" />
                                Transaction submitted
                            </div>
                            <a
                                href={`https://sepolia.arbiscan.io/tx/${txHash}`}
                                target="_blank"
                                rel="noreferrer"
                                className="text-xs font-mono text-zinc-700 hover:text-zinc-900 inline-flex items-center gap-1.5"
                            >
                                {txHash.slice(0, 18)}…
                                <ArrowUpRight className="size-3" />
                            </a>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
}

function DotPatternDark() {
    return (
        <svg className="absolute inset-0 w-full h-full opacity-30" aria-hidden>
            <defs>
                <pattern id="dash-dots" width="22" height="22" patternUnits="userSpaceOnUse">
                    <circle cx="11" cy="11" r="1" fill="rgba(255,255,255,0.18)" />
                </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#dash-dots)" />
        </svg>
    );
}

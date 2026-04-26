"use client";

import {Coins, EyeOff, Layers, Sparkles, Wallet, ArrowRight} from "lucide-react";
import {useEffect, useState} from "react";
import {useAccount, useReadContract, useWaitForTransactionReceipt, useWriteContract} from "wagmi";
import {arbitrumSepolia} from "wagmi/chains";

import {confidentialSGDAbi, stealthGiveDollarAbi} from "@/lib/abis";
import {addresses} from "@/lib/addresses";
import {formatSGD, shortAddress} from "@/lib/format";
import {arbSepoliaGas} from "@/lib/gas";
import {isAuthError, useHandleClient} from "@/lib/nox";

const ADDR = addresses[arbitrumSepolia.id];

export default function DashboardPage() {
    const {address, isConnected} = useAccount();
    const {client: handleClient, refresh: refreshHandleClient} = useHandleClient();

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
            // Auth token expired? Re-sign EIP-712 and retry once transparently.
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

    // The default `confidentialBalanceOf` returns the zero handle for accounts
    // that have never wrapped — trying to decrypt it throws "Handle chainId (0)
    // does not match…". Detect and skip.
    const ZERO_HANDLE =
        "0x0000000000000000000000000000000000000000000000000000000000000000";
    const hasNoCSGD = !cSGDHandle || (cSGDHandle as string) === ZERO_HANDLE;

    if (!isConnected) {
        return (
            <div className="max-w-2xl mx-auto px-6 py-32 text-center">
                <Wallet className="size-12 mx-auto mb-4 text-zinc-600" />
                <h1 className="text-3xl font-semibold mb-3">Connect your wallet</h1>
                <p className="text-zinc-400">
                    Use the Connect button in the header to load your dashboard.
                </p>
            </div>
        );
    }

    return (
        <div className="max-w-5xl mx-auto px-6 py-12 space-y-10">
            <header className="flex flex-wrap items-end justify-between gap-4">
                <div>
                    <h1 className="text-4xl font-semibold tracking-tight">Wallet</h1>
                    <p className="text-zinc-400 mt-2 text-sm font-mono">
                        {shortAddress(address)} · Arbitrum Sepolia
                    </p>
                </div>
                <a
                    href={`https://sepolia.arbiscan.io/address/${address}`}
                    target="_blank"
                    rel="noreferrer"
                    className="text-sm text-zinc-400 hover:text-zinc-200 inline-flex items-center gap-1"
                >
                    View on Arbiscan
                    <ArrowRight className="size-3.5" />
                </a>
            </header>

            <div className="grid md:grid-cols-2 gap-6">
                {/* SGD card */}
                <section className="rounded-2xl border border-zinc-800 bg-zinc-900/40 p-6 space-y-4">
                    <div className="flex items-center justify-between">
                        <div className="inline-flex items-center gap-2 text-zinc-400 text-sm">
                            <Coins className="size-4" />
                            SGD
                        </div>
                        <span className="text-xs text-zinc-500">public · 6 decimals</span>
                    </div>
                    <div className="text-4xl font-semibold tabular-nums">
                        {formatSGD(sgdBalance as bigint)}
                    </div>
                    <p className="text-sm text-zinc-400">
                        Claim 1,000 test SGD per 24h. No KYC, no faucet redirect, no Circle.
                    </p>
                    <button
                        onClick={onClaim}
                        disabled={isPending || isMining || !cooldownReady}
                        className="w-full rounded-full bg-violet-600 hover:bg-violet-500 disabled:bg-zinc-800 disabled:text-zinc-500 disabled:cursor-not-allowed px-5 py-2.5 text-sm font-medium transition-colors"
                    >
                        {isPending || isMining
                            ? "Claiming…"
                            : cooldownReady
                              ? "Claim 1,000 SGD"
                              : `Cooldown until ${new Date(nextClaimAt * 1000).toLocaleString()}`}
                    </button>
                </section>

                {/* cSGD card */}
                <section className="rounded-2xl border border-violet-500/30 bg-gradient-to-br from-violet-500/10 to-transparent p-6 space-y-4">
                    <div className="flex items-center justify-between">
                        <div className="inline-flex items-center gap-2 text-violet-300 text-sm">
                            <EyeOff className="size-4" />
                            cSGD (confidential)
                        </div>
                        <span className="text-xs text-zinc-500">ERC-7984 · iExec Nox</span>
                    </div>
                    {hasNoCSGD ? (
                        <>
                            <div className="text-4xl font-semibold tabular-nums text-zinc-600">0</div>
                            <p className="text-xs text-zinc-500">
                                You don&apos;t hold any cSGD yet. Claim some SGD above, then wrap it.
                            </p>
                        </>
                    ) : (
                        <>
                            <div className="text-4xl font-semibold tabular-nums">
                                {decrypted !== null ? (
                                    <span className="text-emerald-400">{formatSGD(decrypted)}</span>
                                ) : (
                                    <span className="text-zinc-500">●●●●●</span>
                                )}
                            </div>
                            <p className="text-xs text-zinc-500 font-mono break-all">
                                Handle: {cSGDHandle ? `${(cSGDHandle as string).slice(0, 18)}…` : "—"}
                            </p>
                            <button
                                onClick={decryptBalance}
                                disabled={!handleClient || decrypting}
                                className="w-full rounded-full border border-violet-500/40 hover:border-violet-400 disabled:opacity-50 px-5 py-2.5 text-sm font-medium transition-colors inline-flex items-center justify-center gap-2"
                            >
                                <Sparkles className="size-4" />
                                {decrypting ? "Asking the iExec gateway…" : "Reveal my balance (gasless)"}
                            </button>
                            {decryptError && (
                                <p className="text-xs text-red-400 break-words">{decryptError}</p>
                            )}
                        </>
                    )}
                </section>
            </div>

            {/* Wrap card */}
            <section className="rounded-2xl border border-zinc-800 bg-zinc-900/40 p-6 space-y-4">
                <div className="flex items-center justify-between flex-wrap gap-2">
                    <div>
                        <h2 className="font-semibold inline-flex items-center gap-2">
                            <Layers className="size-4 text-zinc-400" />
                            Wrap SGD → cSGD
                        </h2>
                        <p className="text-sm text-zinc-400 mt-1">
                            Two transactions: <code>approve</code> the wrapper, then <code>wrap</code>. The
                            cSGD you get back is encrypted inside the iExec TEE.
                        </p>
                    </div>
                </div>
                <div className="flex flex-wrap gap-3 items-end">
                    <div className="flex-1 min-w-[180px]">
                        <label className="block text-xs text-zinc-400 mb-1.5">Amount (SGD)</label>
                        <input
                            type="number"
                            min="1"
                            step="1"
                            placeholder="100"
                            value={wrapAmount}
                            onChange={e => setWrapAmount(e.target.value)}
                            className="w-full rounded-lg bg-zinc-950 border border-zinc-700 px-3 py-2.5 text-sm focus:border-violet-500 focus:outline-none"
                        />
                    </div>
                    <button
                        onClick={onApprove}
                        disabled={isPending || isMining || !wrapAmount}
                        className="rounded-full bg-zinc-800 hover:bg-zinc-700 disabled:opacity-50 px-5 py-2.5 text-sm font-medium"
                    >
                        1. Approve
                    </button>
                    <button
                        onClick={onWrap}
                        disabled={isPending || isMining || !wrapAmount}
                        className="rounded-full bg-violet-600 hover:bg-violet-500 disabled:opacity-50 px-5 py-2.5 text-sm font-medium"
                    >
                        2. Wrap
                    </button>
                </div>
            </section>

            {txHash && (
                <p className="text-xs text-zinc-500">
                    Last tx:{" "}
                    <a
                        href={`https://sepolia.arbiscan.io/tx/${txHash}`}
                        target="_blank"
                        rel="noreferrer"
                        className="text-violet-400 hover:underline break-all"
                    >
                        {txHash.slice(0, 18)}…
                    </a>
                </p>
            )}
        </div>
    );
}

"use client";

import {use, useEffect, useState, type ReactNode} from "react";
import {
    ArrowLeft,
    ExternalLink,
    Lock,
    Send,
    Shield,
    ShieldCheck,
    Target,
    Users,
    Wallet,
} from "lucide-react";
import Link from "next/link";
import {formatUnits} from "viem";
import {useAccount, useReadContract, useWaitForTransactionReceipt, useWriteContract} from "wagmi";
import {arbitrumSepolia} from "wagmi/chains";

import {CampaignReview} from "@/components/campaign-review";
import {ContractAuditSection} from "@/components/contract-audit-section";
import {Countdown} from "@/components/countdown";
import {HeroGradient} from "@/components/hero-gradient";
import {ImpactReport} from "@/components/impact-report";
import {StatusBadge} from "@/components/status-badge";
import {TotalRaised} from "@/components/total-raised";
import {campaignAbi, confidentialSGDAbi} from "@/lib/abis";
import {addresses} from "@/lib/addresses";
import {arbSepoliaGas} from "@/lib/gas";
import {parseMetadataURI} from "@/lib/metadata";
import {isAuthError, useHandleClient} from "@/lib/nox";
import {shortAddress} from "@/lib/format";

const ADDR = addresses[arbitrumSepolia.id];

export default function CampaignDetailPage({
    params,
}: {
    params: Promise<{address: string}>;
}) {
    const {address: rawAddress} = use(params);
    const campaignAddress = rawAddress as `0x${string}`;
    const {address: account, isConnected} = useAccount();
    const {client: handleClient, refresh: refreshHandleClient} = useHandleClient();

    /* ---------------- Reads ---------------- */
    const {data: creator} = useReadContract({
        address: campaignAddress,
        abi: campaignAbi,
        functionName: "creator",
    });
    const {data: recipient} = useReadContract({
        address: campaignAddress,
        abi: campaignAbi,
        functionName: "recipient",
    });
    const {data: goal} = useReadContract({
        address: campaignAddress,
        abi: campaignAbi,
        functionName: "goal",
    });
    const {data: deadline} = useReadContract({
        address: campaignAddress,
        abi: campaignAbi,
        functionName: "deadline",
    });
    const {data: state, refetch: refetchState} = useReadContract({
        address: campaignAddress,
        abi: campaignAbi,
        functionName: "state",
    });
    const {data: donorCount, refetch: refetchDonors} = useReadContract({
        address: campaignAddress,
        abi: campaignAbi,
        functionName: "donorCount",
    });
    const {data: metadataURI} = useReadContract({
        address: campaignAddress,
        abi: campaignAbi,
        functionName: "metadataURI",
    });
    const {data: encryptedTotal, refetch: refetchTotal} = useReadContract({
        address: campaignAddress,
        abi: campaignAbi,
        functionName: "encryptedTotal",
    });

    const meta = parseMetadataURI((metadataURI as string) || "");
    const deadlineMs = deadline ? Number(deadline) * 1000 : 0;
    const deadlinePassed = deadlineMs > 0 && Date.now() >= deadlineMs;
    const isCreator = !!account && account.toLowerCase() === (creator as string)?.toLowerCase();
    const isRecipient = !!account && account.toLowerCase() === (recipient as string)?.toLowerCase();

    /* ---------------- Mutations ---------------- */
    const {writeContractAsync, data: txHash, isPending, reset} = useWriteContract();
    const {isLoading: isMining, isSuccess: txSuccess} = useWaitForTransactionReceipt({hash: txHash});

    useEffect(() => {
        if (txSuccess) {
            refetchState();
            refetchDonors();
            refetchTotal();
            reset();
        }
    }, [txSuccess, refetchState, refetchDonors, refetchTotal, reset]);

    /* ---------------- Revealed total (lifted up so ImpactReport can use it) ---------------- */
    const [revealedTotal, setRevealedTotal] = useState<bigint | null>(null);

    /* ---------------- Donate ---------------- */
    const [donateAmount, setDonateAmount] = useState("");
    const [donateError, setDonateError] = useState<string | null>(null);
    const [donateBusy, setDonateBusy] = useState(false);

    async function onDonate() {
        if (!handleClient || !account) return;
        setDonateError(null);
        setDonateBusy(true);
        try {
            const amount = BigInt(Math.floor(Number(donateAmount) * 1_000_000));
            if (amount <= 0n) throw new Error("Amount must be positive");

            const operatorUntil = Math.floor(Date.now() / 1000) + 3600;
            await writeContractAsync({
                address: ADDR.cSGD,
                abi: confidentialSGDAbi,
                functionName: "setOperator",
                args: [campaignAddress, operatorUntil],
                ...arbSepoliaGas,
            });

            // Encrypt the amount via the Nox gateway. Refresh the auth token
            // transparently on expiry.
            let encrypted;
            try {
                encrypted = await handleClient.encryptInput(amount, "uint256", campaignAddress);
            } catch (err) {
                if (isAuthError(err)) {
                    const fresh = await refreshHandleClient();
                    if (!fresh) throw err;
                    encrypted = await fresh.encryptInput(amount, "uint256", campaignAddress);
                } else {
                    throw err;
                }
            }
            const {handle, handleProof} = encrypted;

            await writeContractAsync({
                address: campaignAddress,
                abi: campaignAbi,
                functionName: "donate",
                args: [handle as `0x${string}`, handleProof as `0x${string}`],
                ...arbSepoliaGas,
            });

            setDonateAmount("");
        } catch (err) {
            setDonateError((err as Error).message ?? "Donation failed");
        } finally {
            setDonateBusy(false);
        }
    }

    /* ---------------- Settle / withdraw / refund ---------------- */
    async function onSettle() {
        await writeContractAsync({
            address: campaignAddress,
            abi: campaignAbi,
            functionName: "settle",
            ...arbSepoliaGas,
        });
    }
    async function onWithdraw() {
        await writeContractAsync({
            address: campaignAddress,
            abi: campaignAbi,
            functionName: "withdraw",
            ...arbSepoliaGas,
        });
    }
    async function onRefund() {
        await writeContractAsync({
            address: campaignAddress,
            abi: campaignAbi,
            functionName: "refund",
            ...arbSepoliaGas,
        });
    }

    return (
        <div className="max-w-5xl mx-auto px-6 py-8 space-y-8">
            <Link
                href="/campaigns"
                className="inline-flex items-center gap-1.5 text-sm text-zinc-400 hover:text-zinc-800"
            >
                <ArrowLeft className="size-4" />
                All campaigns
            </Link>

            {/* Hero gradient banner */}
            <HeroGradient seed={campaignAddress} className="h-48 md:h-56" />

            <header className="space-y-4">
                <div className="flex flex-wrap items-center gap-3">
                    {state !== undefined && <StatusBadge state={Number(state)} />}
                    {deadlineMs > 0 && <Countdown deadlineMs={deadlineMs} />}
                    <span className="text-xs font-mono text-zinc-500 inline-flex items-center gap-1">
                        {shortAddress(campaignAddress)}
                        <a
                            href={`https://sepolia.arbiscan.io/address/${campaignAddress}`}
                            target="_blank"
                            rel="noreferrer"
                            className="hover:text-violet-300"
                        >
                            <ExternalLink className="size-3" />
                        </a>
                    </span>
                    {isCreator && (
                        <span className="text-xs font-medium px-2 py-1 rounded-full bg-violet-500/10 text-violet-300 border border-violet-500/30">
                            You created this
                        </span>
                    )}
                    <a
                        href="#contract-audit"
                        className="text-xs font-medium px-2 py-1 rounded-full bg-emerald-500/10 text-emerald-300 border border-emerald-500/30 inline-flex items-center gap-1.5 hover:bg-emerald-500/20 transition-colors"
                    >
                        <Shield className="size-3" />
                        Audited by ChainGPT
                    </a>
                </div>
                <h1 className="text-3xl md:text-5xl font-semibold tracking-tight leading-tight">
                    {meta.title}
                </h1>
                {meta.story && (
                    <p className="text-zinc-700 text-lg leading-relaxed max-w-3xl whitespace-pre-line">
                        {meta.story}
                    </p>
                )}
            </header>

            <div className="grid lg:grid-cols-3 gap-8">
                {/* LEFT: progress + stats + post-deadline actions */}
                <div className="lg:col-span-2 space-y-6">
                    <section className="rounded-2xl border border-zinc-200 bg-zinc-50 p-6">
                        <TotalRaised
                            encryptedTotal={encryptedTotal as `0x${string}` | undefined}
                            goal={(goal as bigint) ?? 0n}
                            autoLoad
                            onReveal={setRevealedTotal}
                        />
                    </section>

                    <section className="grid grid-cols-2 md:grid-cols-4 gap-3">
                        <Stat
                            icon={<Users className="size-4" />}
                            label="Donors"
                            value={donorCount?.toString() ?? "—"}
                        />
                        <Stat
                            icon={<Target className="size-4" />}
                            label="Goal"
                            value={`${goal ? formatUnits(goal as bigint, 6) : "—"} cSGD`}
                        />
                        <Stat
                            icon={<Lock className="size-4" />}
                            label="Privacy"
                            value="Per-donor hidden"
                        />
                        <Stat
                            icon={<Wallet className="size-4" />}
                            label="Recipient"
                            value={shortAddress(recipient as string | undefined)}
                            mono
                        />
                    </section>

                    {state === 0 && deadlinePassed && (
                        <section className="rounded-2xl border border-amber-500/30 bg-amber-500/5 p-6">
                            <h2 className="font-semibold mb-2 inline-flex items-center gap-2">
                                <ShieldCheck className="size-4 text-amber-300" />
                                Deadline reached
                            </h2>
                            <p className="text-sm text-zinc-400 mb-4">
                                Anyone can call <code>settle()</code> to finalise this campaign and open the
                                next phase (recipient withdrawal or donor refunds).
                            </p>
                            <button
                                onClick={onSettle}
                                disabled={isPending || isMining}
                                className="rounded-full bg-amber-600 hover:bg-amber-500 disabled:opacity-50 px-5 py-2.5 text-sm font-medium"
                            >
                                {isPending || isMining ? "Settling…" : "Settle campaign"}
                            </button>
                        </section>
                    )}

                    {state === 1 && isRecipient && (
                        <section className="rounded-2xl border border-emerald-500/30 bg-emerald-500/5 p-6">
                            <h2 className="font-semibold mb-2">Withdraw funds</h2>
                            <p className="text-sm text-zinc-400 mb-4">
                                You are the recipient. Withdrawing transfers the entire confidential balance
                                to your wallet.
                            </p>
                            <button
                                onClick={onWithdraw}
                                disabled={isPending || isMining}
                                className="rounded-full bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 px-5 py-2.5 text-sm font-medium"
                            >
                                {isPending || isMining ? "Withdrawing…" : "Withdraw all"}
                            </button>
                        </section>
                    )}

                    {(state === 1 || state === 3) && (
                        <section className="rounded-2xl border border-zinc-200 bg-zinc-50 p-6">
                            <h2 className="font-semibold mb-2">Donor refund</h2>
                            <p className="text-sm text-zinc-400 mb-4">
                                Available after the refund grace window (7 days post-settle) if the
                                recipient has not withdrawn.
                            </p>
                            <button
                                onClick={onRefund}
                                disabled={isPending || isMining}
                                className="rounded-full border border-zinc-300 hover:border-zinc-500 disabled:opacity-50 px-5 py-2 text-sm font-medium"
                            >
                                {isPending || isMining ? "Refunding…" : "Refund my contribution"}
                            </button>
                        </section>
                    )}

                    {state === 2 && (
                        <section className="rounded-2xl border border-zinc-200 bg-zinc-50 p-6 text-center">
                            <p className="text-zinc-700">
                                ✅ Funds withdrawn. Thanks for supporting this cause.
                            </p>
                        </section>
                    )}

                    {/* AI commentary on this specific campaign */}
                    {goal !== undefined && deadline !== undefined && recipient && (
                        <CampaignReview
                            campaign={campaignAddress}
                            title={meta.title}
                            goalCSGD={formatUnits(goal as bigint, 6)}
                            deadlineMs={deadlineMs}
                            recipient={recipient as `0x${string}`}
                            donorCount={Number(donorCount ?? 0)}
                            refundGraceSeconds={604_800}
                        />
                    )}

                    {/* Impact report — narrative summary of on-chain figures */}
                    {goal !== undefined && deadline !== undefined && (
                        <ImpactReport
                            campaign={campaignAddress}
                            title={meta.title}
                            goalCSGD={formatUnits(goal as bigint, 6)}
                            totalRaisedCSGD={
                                revealedTotal !== null ? formatUnits(revealedTotal, 6) : null
                            }
                            donorCount={Number(donorCount ?? 0)}
                            createdAtMs={meta.createdAt}
                            deadlineMs={deadlineMs}
                            settledAtMs={
                                state !== undefined && Number(state) >= 1
                                    ? deadlineMs
                                    : undefined
                            }
                            state={
                                state === 0
                                    ? "active"
                                    : state === 1
                                      ? "settling"
                                      : state === 2
                                        ? "withdrawn"
                                        : "refunding"
                            }
                        />
                    )}

                    {/* Shared smart-contract audit (Campaign.sol template) */}
                    <div id="contract-audit">
                        <ContractAuditSection />
                    </div>
                </div>

                {/* RIGHT: sticky donate panel */}
                <aside className="space-y-4">
                    <div className="rounded-2xl border border-violet-500/30 bg-gradient-to-b from-violet-500/10 to-transparent p-6 sticky top-24">
                        <h2 className="font-semibold mb-1 inline-flex items-center gap-2">
                            <Send className="size-4 text-violet-300" />
                            Donate privately
                        </h2>
                        <p className="text-xs text-zinc-400 mb-4">
                            Encrypted client-side via the iExec Nox gateway. No one can see how much you
                            gave — including the campaign creator.
                        </p>

                        {state === 0 && !deadlinePassed ? (
                            <>
                                {!isConnected && (
                                    <p className="text-sm text-amber-400">Connect your wallet to donate.</p>
                                )}
                                {isConnected && !handleClient && (
                                    <p className="text-sm text-zinc-500">Initialising Nox SDK…</p>
                                )}
                                {isConnected && handleClient && (
                                    <div className="space-y-3">
                                        <div>
                                            <label className="block text-xs text-zinc-400 mb-1.5">
                                                Amount (cSGD)
                                            </label>
                                            <input
                                                type="number"
                                                min="1"
                                                placeholder="10"
                                                value={donateAmount}
                                                onChange={e => setDonateAmount(e.target.value)}
                                                className="w-full rounded-lg bg-white border border-zinc-300 px-3 py-2.5 text-sm focus:border-violet-500 focus:outline-none"
                                            />
                                        </div>
                                        <button
                                            onClick={onDonate}
                                            disabled={
                                                donateBusy ||
                                                isPending ||
                                                isMining ||
                                                !donateAmount ||
                                                Number(donateAmount) <= 0
                                            }
                                            className="w-full rounded-full bg-violet-600 hover:bg-violet-500 disabled:opacity-50 px-5 py-2.5 text-sm font-medium"
                                        >
                                            {donateBusy || isPending || isMining
                                                ? "Encrypting & donating…"
                                                : "Donate privately"}
                                        </button>
                                        {donateError && (
                                            <p className="text-xs text-red-400 break-words">{donateError}</p>
                                        )}
                                    </div>
                                )}
                            </>
                        ) : (
                            <p className="text-sm text-zinc-400">
                                Donations are closed for this campaign.
                            </p>
                        )}

                        {txHash && (
                            <p className="mt-4 text-xs text-zinc-500 break-all">
                                Last tx:{" "}
                                <a
                                    href={`https://sepolia.arbiscan.io/tx/${txHash}`}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="text-violet-400 hover:underline"
                                >
                                    {txHash.slice(0, 18)}…
                                </a>
                            </p>
                        )}
                    </div>
                </aside>
            </div>
        </div>
    );
}

function Stat({
    icon,
    label,
    value,
    mono,
}: {
    icon: ReactNode;
    label: string;
    value: string;
    mono?: boolean;
}) {
    return (
        <div className="rounded-xl border border-zinc-200 bg-zinc-50 p-3">
            <div className="text-xs text-zinc-500 inline-flex items-center gap-1.5 mb-1.5">
                {icon}
                {label}
            </div>
            <div className={`text-sm ${mono ? "font-mono" : "font-medium"}`}>{value}</div>
        </div>
    );
}

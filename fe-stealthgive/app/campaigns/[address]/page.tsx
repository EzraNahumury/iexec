"use client";

import {use, useEffect, useState, type ReactNode} from "react";
import {
    ArrowLeft,
    ArrowUpRight,
    CheckCircle2,
    ExternalLink,
    Loader2,
    Lock,
    Send,
    Shield,
    ShieldCheck,
    Sparkles,
    Target,
    Users,
    Wallet,
} from "lucide-react";
import {motion} from "framer-motion";
import Link from "next/link";
import {formatUnits} from "viem";
import {useAccount, useReadContract, useWaitForTransactionReceipt, useWriteContract} from "wagmi";
import {arbitrumSepolia} from "wagmi/chains";

import {CampaignReview} from "@/components/campaign-review";
import {Countdown} from "@/components/countdown";
import {ImpactReport} from "@/components/impact-report";
import {StatusBadge} from "@/components/status-badge";
import {TotalRaised} from "@/components/total-raised";
import {loadHeroImage} from "@/lib/hero-image";
import Image from "next/image";
import {campaignAbi, confidentialSGDAbi} from "@/lib/abis";
import {addresses} from "@/lib/addresses";
import {arbSepoliaGas} from "@/lib/gas";
import {parseMetadataURI} from "@/lib/metadata";
import {friendlyAuthError, isAuthError, useHandleClient} from "@/lib/nox";
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

    const [revealedTotal, setRevealedTotal] = useState<bigint | null>(null);

    /* ---------------- Hero image ---------------- */
    const [heroSrc, setHeroSrc] = useState<string>("/campaigns.png");
    useEffect(() => {
        const ai = loadHeroImage(campaignAddress);
        if (ai) setHeroSrc(ai);
    }, [campaignAddress]);

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
            setDonateError(friendlyAuthError(err));
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

    const txBusy = isPending || isMining;

    return (
        <div className="relative min-h-[calc(100vh-72px)]">
            <div className="absolute inset-0 bg-grid pointer-events-none opacity-50" aria-hidden />
            <div
                className="absolute inset-0 pointer-events-none"
                style={{
                    background:
                        "radial-gradient(ellipse 80% 40% at 50% 0%, rgba(255,255,255,1), rgba(255,255,255,0.3))",
                }}
                aria-hidden
            />

            <div className="relative max-w-6xl mx-auto px-6 py-10 md:py-12 space-y-8">
                <Link
                    href="/campaigns"
                    className="inline-flex items-center gap-1.5 text-[11px] font-semibold tracking-[0.16em] uppercase text-zinc-500 hover:text-zinc-900 transition-colors"
                >
                    <ArrowLeft className="size-3.5" />
                    All campaigns
                </Link>

                {/* Hero banner */}
                <motion.div
                    initial={{opacity: 0, y: 12}}
                    animate={{opacity: 1, y: 0}}
                    transition={{duration: 0.6}}
                    className="relative h-56 md:h-72 lg:h-80 rounded-3xl overflow-hidden border border-zinc-200 bg-zinc-100 shadow-[0_24px_60px_-24px_rgba(0,0,0,0.18)]"
                >
                    <Image
                        src={heroSrc}
                        alt=""
                        fill
                        className="object-cover"
                        sizes="(min-width: 1024px) 1024px, 100vw"
                        priority
                        aria-hidden
                    />
                    <div
                        className="absolute inset-0 bg-gradient-to-t from-black/40 via-black/0 to-black/10 pointer-events-none"
                        aria-hidden
                    />
                    <div className="absolute top-4 left-4 right-4 flex flex-wrap items-center gap-3">
                        {state !== undefined && <StatusBadge state={Number(state)} />}
                        {deadlineMs > 0 && (
                            <span className="inline-flex items-center gap-1.5 text-[11px] font-medium px-3 py-1.5 rounded-full bg-white/90 backdrop-blur border border-white/40 text-zinc-900">
                                <Countdown deadlineMs={deadlineMs} />
                            </span>
                        )}
                    </div>
                    <div className="absolute bottom-4 left-4 font-mono text-[11px] uppercase tracking-wider text-white/85 drop-shadow">
                        {shortAddress(campaignAddress, 6, 4)}
                    </div>
                    <a
                        href={`https://sepolia.arbiscan.io/address/${campaignAddress}`}
                        target="_blank"
                        rel="noreferrer"
                        className="absolute bottom-4 right-4 inline-flex items-center gap-1.5 text-[11px] font-semibold tracking-[0.14em] uppercase px-3 py-1.5 rounded-full bg-white/95 backdrop-blur border border-white/40 text-zinc-900 hover:bg-white transition-colors"
                    >
                        Arbiscan
                        <ExternalLink className="size-3" />
                    </a>
                </motion.div>

                {/* Header */}
                <motion.header
                    initial={{opacity: 0, y: 12}}
                    animate={{opacity: 1, y: 0}}
                    transition={{duration: 0.5, delay: 0.08}}
                    className="space-y-5"
                >
                    <div className="flex flex-wrap items-center gap-2">
                        {isCreator && (
                            <span className="text-[10px] font-semibold tracking-[0.16em] uppercase px-2.5 py-1 rounded-full bg-zinc-900 text-white inline-flex items-center gap-1.5">
                                <Sparkles className="size-3" />
                                You created this
                            </span>
                        )}
                        <Link
                            href="/audit"
                            className="text-[10px] font-semibold tracking-[0.16em] uppercase px-2.5 py-1 rounded-full bg-white border border-zinc-300 hover:border-zinc-900 text-zinc-700 hover:text-zinc-900 inline-flex items-center gap-1.5 transition-colors"
                        >
                            <Shield className="size-3" />
                            Audited by ChainGPT
                        </Link>
                        <span className="text-[10px] font-semibold tracking-[0.16em] uppercase px-2.5 py-1 rounded-full bg-white border border-zinc-200 text-zinc-500 inline-flex items-center gap-1.5">
                            <Lock className="size-3" />
                            Confidential · ERC-7984
                        </span>
                    </div>

                    <div className="space-y-5">
                        <div className="text-[11px] font-semibold tracking-[0.18em] uppercase text-zinc-500 inline-flex items-center gap-2">
                            <span className="size-1 rounded-full bg-zinc-900" />
                            Campaign · {donorCount?.toString() ?? "—"} donor
                            {Number(donorCount ?? 0) === 1 ? "" : "s"}
                        </div>
                        <h1 className="text-4xl md:text-5xl lg:text-[64px] font-semibold tracking-tight leading-[1.02] text-zinc-900">
                            {meta.title}
                        </h1>
                        {meta.story && (
                            <div className="flex gap-5 max-w-3xl">
                                <div className="w-[3px] rounded-full bg-zinc-900 self-stretch shrink-0" />
                                <p className="text-zinc-600 text-lg md:text-xl leading-[1.6] whitespace-pre-line font-light">
                                    {meta.story}
                                </p>
                            </div>
                        )}
                    </div>
                </motion.header>

                <div className="grid lg:grid-cols-3 gap-6 lg:gap-8">
                    {/* LEFT: progress + stats + actions */}
                    <div className="lg:col-span-2 space-y-6">
                        <motion.section
                            initial={{opacity: 0, y: 12}}
                            animate={{opacity: 1, y: 0}}
                            transition={{duration: 0.5, delay: 0.16}}
                            className="rounded-3xl border border-zinc-200 bg-white p-6 md:p-7"
                        >
                            <TotalRaised
                                encryptedTotal={encryptedTotal as `0x${string}` | undefined}
                                goal={(goal as bigint) ?? 0n}
                                autoLoad
                                onReveal={setRevealedTotal}
                            />
                        </motion.section>

                        <motion.section
                            initial={{opacity: 0, y: 12}}
                            animate={{opacity: 1, y: 0}}
                            transition={{duration: 0.5, delay: 0.22}}
                            className="grid grid-cols-2 md:grid-cols-4 gap-3"
                        >
                            <Stat
                                icon={<Users className="size-3.5" />}
                                label="Donors"
                                value={donorCount?.toString() ?? "—"}
                            />
                            <Stat
                                icon={<Target className="size-3.5" />}
                                label="Goal"
                                value={`${goal ? formatUnits(goal as bigint, 6) : "—"} cSGD`}
                            />
                            <Stat
                                icon={<Lock className="size-3.5" />}
                                label="Privacy"
                                value="Per-donor hidden"
                            />
                            <Stat
                                icon={<Wallet className="size-3.5" />}
                                label="Recipient"
                                value={shortAddress(recipient as string | undefined)}
                                mono
                            />
                        </motion.section>

                        {state === 0 && deadlinePassed && (
                            <ActionPanel
                                tone="amber"
                                icon={<ShieldCheck className="size-4" />}
                                title="Deadline reached"
                                description="Anyone can call settle() to finalise this campaign and open the next phase (recipient withdrawal or donor refunds)."
                                actionLabel={txBusy ? "Settling…" : "Settle campaign"}
                                onAction={onSettle}
                                disabled={txBusy}
                            />
                        )}

                        {state === 1 && isRecipient && (
                            <ActionPanel
                                tone="dark"
                                icon={<Wallet className="size-4" />}
                                title="Withdraw funds"
                                description="You are the recipient. Withdrawing transfers the entire confidential balance to your wallet."
                                actionLabel={txBusy ? "Withdrawing…" : "Withdraw all"}
                                onAction={onWithdraw}
                                disabled={txBusy}
                            />
                        )}

                        {(state === 1 || state === 3) && (
                            <ActionPanel
                                tone="zinc"
                                icon={<ArrowLeft className="size-4" />}
                                title="Donor refund"
                                description="Available after the refund grace window (7 days post-settle) if the recipient has not withdrawn."
                                actionLabel={txBusy ? "Refunding…" : "Refund my contribution"}
                                onAction={onRefund}
                                disabled={txBusy}
                                outline
                            />
                        )}

                        {state === 2 && (
                            <section className="rounded-3xl border border-emerald-200 bg-emerald-50/50 p-6 inline-flex items-center gap-3">
                                <div className="size-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center shrink-0">
                                    <CheckCircle2 className="size-4" />
                                </div>
                                <div>
                                    <div className="font-semibold text-zinc-900">Funds withdrawn</div>
                                    <p className="text-sm text-zinc-600">
                                        Thanks for supporting this cause.
                                    </p>
                                </div>
                            </section>
                        )}

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

                    </div>

                    {/* RIGHT: sticky donate panel */}
                    <aside>
                        <motion.div
                            initial={{opacity: 0, y: 12}}
                            animate={{opacity: 1, y: 0}}
                            transition={{duration: 0.5, delay: 0.18}}
                            className="rounded-3xl border border-zinc-200 bg-zinc-900 text-white p-6 md:p-7 sticky top-24 overflow-hidden"
                        >
                            <DotPatternDark />
                            <div className="absolute -top-12 -right-12 size-40 rounded-full bg-white/5 blur-3xl pointer-events-none" />

                            <div className="relative">
                                <div className="text-[10px] font-semibold tracking-[0.18em] uppercase text-white/50 mb-2 inline-flex items-center gap-2">
                                    <span className="size-1 rounded-full bg-emerald-400 animate-pulse" />
                                    Encrypted donation
                                </div>
                                <h2 className="text-2xl font-semibold tracking-tight mb-2 inline-flex items-center gap-2">
                                    Donate{" "}
                                    <span className="font-serif italic font-light">privately</span>
                                </h2>
                                <p className="text-sm text-white/60 leading-relaxed mb-6">
                                    Encrypted client-side via the iExec Nox gateway. No one — including the
                                    creator — can see how much you gave.
                                </p>

                                {state === 0 && !deadlinePassed ? (
                                    <>
                                        {!isConnected && (
                                            <p className="text-sm text-amber-300 inline-flex items-center gap-2">
                                                <span className="size-1.5 rounded-full bg-amber-400 animate-pulse" />
                                                Connect your wallet to donate.
                                            </p>
                                        )}
                                        {isConnected && !handleClient && (
                                            <p className="text-sm text-white/60 inline-flex items-center gap-2">
                                                <Loader2 className="size-3.5 animate-spin" />
                                                Initialising Nox SDK…
                                            </p>
                                        )}
                                        {isConnected && handleClient && (
                                            <div className="space-y-4">
                                                <div>
                                                    <label className="block text-[10px] font-semibold tracking-[0.16em] uppercase text-white/50 mb-2">
                                                        Amount (cSGD)
                                                    </label>
                                                    <input
                                                        type="number"
                                                        min="1"
                                                        placeholder="10"
                                                        value={donateAmount}
                                                        onChange={e => setDonateAmount(e.target.value)}
                                                        className="w-full rounded-xl bg-white/5 border border-white/15 px-4 py-3 text-base text-white placeholder:text-white/30 focus:border-white/40 focus:bg-white/10 focus:outline-none transition-colors"
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
                                                    className="group w-full rounded-full bg-white hover:bg-zinc-100 disabled:bg-white/20 disabled:text-white/50 disabled:cursor-not-allowed text-zinc-900 px-5 py-3.5 text-xs font-bold tracking-[0.18em] uppercase transition-colors inline-flex items-center justify-center gap-3"
                                                >
                                                    {donateBusy || isPending || isMining ? (
                                                        <>
                                                            <Loader2 className="size-4 animate-spin" />
                                                            Encrypting…
                                                        </>
                                                    ) : (
                                                        <>
                                                            <Send className="size-3.5" />
                                                            Donate privately
                                                            <span className="inline-flex items-center justify-center size-5 rounded-full border border-zinc-900/30 group-hover:border-zinc-900/60 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5">
                                                                <ArrowUpRight className="size-3" />
                                                            </span>
                                                        </>
                                                    )}
                                                </button>
                                                {donateError && (
                                                    <p className="text-xs text-red-300 break-words">
                                                        {donateError}
                                                    </p>
                                                )}
                                            </div>
                                        )}
                                    </>
                                ) : (
                                    <p className="text-sm text-white/60 inline-flex items-center gap-2">
                                        <Lock className="size-3.5" />
                                        Donations are closed for this campaign.
                                    </p>
                                )}

                                {txHash && (
                                    <div className="mt-5 pt-5 border-t border-white/10">
                                        <div className="text-[10px] font-semibold tracking-[0.16em] uppercase text-white/50 mb-1.5">
                                            Last transaction
                                        </div>
                                        <a
                                            href={`https://sepolia.arbiscan.io/tx/${txHash}`}
                                            target="_blank"
                                            rel="noreferrer"
                                            className="text-xs font-mono text-white/80 hover:text-white inline-flex items-center gap-1.5 break-all"
                                        >
                                            {txHash.slice(0, 22)}…
                                            <ArrowUpRight className="size-3 shrink-0" />
                                        </a>
                                    </div>
                                )}
                            </div>
                        </motion.div>
                    </aside>
                </div>
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
        <div className="rounded-2xl border border-zinc-200 bg-white p-4 hover:border-zinc-300 hover:shadow-[0_8px_24px_-12px_rgba(0,0,0,0.08)] transition-all">
            <div className="text-[10px] font-semibold tracking-[0.16em] uppercase text-zinc-500 inline-flex items-center gap-1.5 mb-2">
                {icon}
                {label}
            </div>
            <div
                className={`text-sm text-zinc-900 ${mono ? "font-mono" : "font-semibold"} truncate`}
                title={value}
            >
                {value}
            </div>
        </div>
    );
}

function ActionPanel({
    tone,
    icon,
    title,
    description,
    actionLabel,
    onAction,
    disabled,
    outline,
}: {
    tone: "amber" | "dark" | "zinc";
    icon: ReactNode;
    title: string;
    description: string;
    actionLabel: string;
    onAction: () => void;
    disabled?: boolean;
    outline?: boolean;
}) {
    const containerClass =
        tone === "amber"
            ? "border-amber-200 bg-amber-50/40"
            : tone === "dark"
              ? "border-zinc-200 bg-white"
              : "border-zinc-200 bg-white";

    const iconClass =
        tone === "amber" ? "bg-amber-500 text-white" : "bg-zinc-900 text-white";

    const buttonClass = outline
        ? "rounded-full bg-white border-2 border-zinc-900 text-zinc-900 hover:bg-zinc-900 hover:text-white disabled:opacity-40 disabled:cursor-not-allowed px-5 py-3 text-xs font-bold tracking-[0.18em] uppercase transition-colors inline-flex items-center gap-2"
        : "group rounded-full bg-zinc-900 hover:bg-zinc-800 disabled:bg-zinc-300 disabled:text-zinc-600 disabled:cursor-not-allowed text-white px-5 py-3 text-xs font-bold tracking-[0.18em] uppercase transition-colors inline-flex items-center gap-2 shadow-[0_8px_20px_-8px_rgba(0,0,0,0.4)] disabled:shadow-none";

    return (
        <section
            className={`rounded-3xl border ${containerClass} p-6 md:p-7 flex flex-wrap items-start justify-between gap-5`}
        >
            <div className="flex items-start gap-4 max-w-md">
                <div
                    className={`size-10 rounded-xl ${iconClass} flex items-center justify-center shrink-0`}
                >
                    {icon}
                </div>
                <div>
                    <h2 className="font-semibold text-zinc-900">{title}</h2>
                    <p className="text-sm text-zinc-600 mt-1 leading-relaxed">{description}</p>
                </div>
            </div>
            <button onClick={onAction} disabled={disabled} className={buttonClass}>
                {actionLabel}
                {!outline && (
                    <span className="inline-flex items-center justify-center size-5 rounded-full border border-white/40 group-hover:border-white/70 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5">
                        <ArrowUpRight className="size-3" />
                    </span>
                )}
            </button>
        </section>
    );
}

function DotPatternDark() {
    return (
        <svg className="absolute inset-0 w-full h-full opacity-30 pointer-events-none" aria-hidden>
            <defs>
                <pattern id="campaign-dots" width="22" height="22" patternUnits="userSpaceOnUse">
                    <circle cx="11" cy="11" r="1" fill="rgba(255,255,255,0.18)" />
                </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#campaign-dots)" />
        </svg>
    );
}

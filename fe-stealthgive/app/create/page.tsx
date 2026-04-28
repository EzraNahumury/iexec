"use client";

import {
    ArrowLeft,
    ArrowUpRight,
    Calendar,
    ImageIcon,
    Loader2,
    RefreshCw,
    Sparkles,
    Target,
    Wallet,
    Wand2,
} from "lucide-react";
import {motion} from "framer-motion";
import Link from "next/link";
import {useRouter} from "next/navigation";
import {useEffect, useState, type ReactNode} from "react";
import {decodeEventLog} from "viem";
import {useAccount, useWaitForTransactionReceipt, useWriteContract} from "wagmi";
import {arbitrumSepolia} from "wagmi/chains";

import {stealthGiveFactoryAbi} from "@/lib/abis";
import {addresses} from "@/lib/addresses";
import {arbSepoliaGas} from "@/lib/gas";
import {saveHeroImage} from "@/lib/hero-image";
import {encodeMetadataURI} from "@/lib/metadata";

const ADDR = addresses[arbitrumSepolia.id];

export default function CreateCampaignPage() {
    const {address, isConnected} = useAccount();
    const router = useRouter();

    const [title, setTitle] = useState("");
    const [story, setStory] = useState("");
    const [recipient, setRecipient] = useState("");
    const [goal, setGoal] = useState("");
    const [days, setDays] = useState("7");
    const [error, setError] = useState<string | null>(null);

    /* ---------- AI assist ---------- */
    const [brief, setBrief] = useState("");
    const [aiBusyText, setAiBusyText] = useState(false);
    const [aiBusyImage, setAiBusyImage] = useState(false);
    const [aiError, setAiError] = useState<string | null>(null);
    const [heroImage, setHeroImage] = useState<string | null>(null);

    async function fetchHeroImage(prompt: string) {
        const res = await fetch("/api/ai/generate-hero", {
            method: "POST",
            headers: {"Content-Type": "application/json"},
            body: JSON.stringify({prompt}),
        });
        const data = (await res.json()) as {imageDataUri?: string; error?: string};
        if (!res.ok || !data.imageDataUri) {
            throw new Error(data.error || "Image generation failed");
        }
        return data.imageDataUri;
    }

    async function fetchDraft(briefText: string) {
        const res = await fetch("/api/ai/draft-campaign", {
            method: "POST",
            headers: {"Content-Type": "application/json"},
            body: JSON.stringify({brief: briefText}),
        });
        const data = (await res.json()) as {title?: string; story?: string; error?: string};
        if (!res.ok || !data.title || !data.story) {
            throw new Error(data.error || "Draft generation failed");
        }
        return {title: data.title, story: data.story};
    }

    async function generateWithAI() {
        if (brief.trim().length < 4) {
            setAiError("Brief should be at least a few words.");
            return;
        }
        setAiError(null);
        setAiBusyText(true);
        setAiBusyImage(true);
        const textPromise = fetchDraft(brief)
            .then(t => {
                setTitle(t.title);
                setStory(t.story);
            })
            .catch(err => {
                setAiError(prev =>
                    prev ? `${prev}\nText: ${(err as Error).message}` : `Text: ${(err as Error).message}`,
                );
            })
            .finally(() => setAiBusyText(false));
        const imagePromise = fetchHeroImage(brief)
            .then(uri => setHeroImage(uri))
            .catch(err => {
                setAiError(prev =>
                    prev
                        ? `${prev}\nImage: ${(err as Error).message}`
                        : `Image: ${(err as Error).message}`,
                );
            })
            .finally(() => setAiBusyImage(false));
        await Promise.allSettled([textPromise, imagePromise]);
    }

    async function regenerateHero() {
        const seed = title.trim() || brief.trim();
        if (seed.length < 4) {
            setAiError("Add a title or brief before regenerating the image.");
            return;
        }
        setAiError(null);
        setAiBusyImage(true);
        try {
            const uri = await fetchHeroImage(seed);
            setHeroImage(uri);
        } catch (err) {
            setAiError(`Image: ${(err as Error).message}`);
        } finally {
            setAiBusyImage(false);
        }
    }

    useEffect(() => {
        if (address && !recipient) setRecipient(address);
    }, [address, recipient]);

    const {writeContractAsync, data: txHash, isPending} = useWriteContract();
    const {isLoading: isMining, data: receipt} = useWaitForTransactionReceipt({hash: txHash});

    useEffect(() => {
        if (!receipt) return;
        for (const log of receipt.logs) {
            try {
                const decoded = decodeEventLog({
                    abi: stealthGiveFactoryAbi,
                    data: log.data,
                    topics: log.topics,
                });
                if (decoded.eventName === "CampaignCreated") {
                    const args = decoded.args as {campaign: `0x${string}`};
                    if (heroImage) saveHeroImage(args.campaign, heroImage);
                    router.push(`/campaigns/${args.campaign}`);
                    return;
                }
            } catch {
                // not a factory event; skip
            }
        }
    }, [receipt, router, heroImage]);

    async function onSubmit(e: React.FormEvent) {
        e.preventDefault();
        setError(null);
        try {
            const goalBn = BigInt(Math.floor(Number(goal) * 1_000_000));
            const deadline = BigInt(Math.floor(Date.now() / 1000) + Number(days) * 86_400);
            const metadataURI = encodeMetadataURI({
                title,
                story,
                createdAt: Date.now(),
            });

            await writeContractAsync({
                address: ADDR.factory,
                abi: stealthGiveFactoryAbi,
                functionName: "createCampaign",
                args: [metadataURI, goalBn, deadline, recipient as `0x${string}`],
                ...arbSepoliaGas,
            });
        } catch (err) {
            setError((err as Error).message ?? "Failed to create campaign");
        }
    }

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
                        Use the Connect button in the header to start a campaign.
                    </p>
                </div>
            </div>
        );
    }

    const aiBusy = aiBusyText || aiBusyImage;
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

            <div className="relative max-w-3xl mx-auto px-6 py-12 md:py-16 space-y-10">
                <Link
                    href="/campaigns"
                    className="inline-flex items-center gap-1.5 text-[11px] font-semibold tracking-[0.16em] uppercase text-zinc-500 hover:text-zinc-900 transition-colors"
                >
                    <ArrowLeft className="size-3.5" />
                    All campaigns
                </Link>

                {/* Hero */}
                <motion.header
                    initial={{opacity: 0, y: 12}}
                    animate={{opacity: 1, y: 0}}
                    transition={{duration: 0.6}}
                >
                    <div className="text-[11px] font-semibold tracking-[0.18em] uppercase text-zinc-500 mb-3 inline-flex items-center gap-2">
                        <span className="size-1 rounded-full bg-zinc-900" />
                        New Campaign · Arbitrum Sepolia
                    </div>
                    <h1 className="text-5xl md:text-6xl font-semibold tracking-tight text-zinc-900 leading-[1.05]">
                        Start a{" "}
                        <span className="font-serif italic font-light">campaign</span>
                    </h1>
                    <p className="text-zinc-600 mt-4 max-w-xl text-lg font-light leading-relaxed">
                        Per-donor amounts stay confidential; the aggregate total is publicly verifiable
                        in real time.
                    </p>
                </motion.header>

                {/* AI Draft card */}
                <motion.section
                    initial={{opacity: 0, y: 12}}
                    animate={{opacity: 1, y: 0}}
                    transition={{duration: 0.5, delay: 0.1}}
                    className="rounded-3xl border border-zinc-200 bg-zinc-900 text-white p-6 md:p-7 relative overflow-hidden"
                >
                    <DotPatternDark />
                    <div className="absolute -top-12 -right-12 size-48 rounded-full bg-white/5 blur-3xl pointer-events-none" />

                    <div className="relative">
                        <div className="flex items-start justify-between gap-4 mb-2">
                            <div>
                                <div className="text-[10px] font-semibold tracking-[0.18em] uppercase text-white/50 mb-2 inline-flex items-center gap-2">
                                    <Wand2 className="size-3" />
                                    AI Assist
                                </div>
                                <h2 className="text-2xl font-semibold tracking-tight inline-flex items-center gap-2">
                                    Draft with{" "}
                                    <span className="font-serif italic font-light">AI</span>
                                </h2>
                            </div>
                            <span className="text-[10px] font-semibold tracking-[0.16em] uppercase px-2.5 py-1 rounded-full bg-white text-zinc-900 whitespace-nowrap shrink-0">
                                ChainGPT
                            </span>
                        </div>
                        <p className="text-sm text-white/60 leading-relaxed mb-5">
                            Describe your cause in one line. We&apos;ll draft a title, a 3-paragraph story,
                            and a unique hero image — all editable.
                        </p>

                        <div className="flex flex-wrap gap-3">
                            <input
                                value={brief}
                                onChange={e => setBrief(e.target.value)}
                                placeholder='e.g. legal fund for journalists facing SLAPP suits'
                                className="flex-1 min-w-[200px] rounded-xl bg-white/5 border border-white/15 px-4 py-3 text-sm text-white placeholder:text-white/30 focus:border-white/40 focus:bg-white/10 focus:outline-none transition-colors"
                                disabled={aiBusy}
                            />
                            <button
                                type="button"
                                onClick={generateWithAI}
                                disabled={aiBusy || brief.trim().length < 4}
                                className="group rounded-full bg-white hover:bg-zinc-100 disabled:bg-white/20 disabled:text-white/50 disabled:cursor-not-allowed text-zinc-900 px-5 py-3 text-xs font-bold tracking-[0.18em] uppercase transition-colors inline-flex items-center gap-2"
                            >
                                {aiBusy ? (
                                    <>
                                        <Loader2 className="size-3.5 animate-spin" />
                                        Generating
                                    </>
                                ) : (
                                    <>
                                        <Sparkles className="size-3.5" />
                                        Generate
                                        <span className="inline-flex items-center justify-center size-5 rounded-full border border-zinc-900/30 group-hover:border-zinc-900/60 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5">
                                            <ArrowUpRight className="size-3" />
                                        </span>
                                    </>
                                )}
                            </button>
                        </div>

                        {(aiBusyText || aiBusyImage) && (
                            <div className="mt-4 space-y-1.5 text-xs text-white/50">
                                {aiBusyText && (
                                    <p className="inline-flex items-center gap-2">
                                        <span className="size-1 rounded-full bg-emerald-400 animate-pulse" />
                                        Drafting title and story…
                                    </p>
                                )}
                                {aiBusyImage && (
                                    <p className="inline-flex items-center gap-2">
                                        <span
                                            className="size-1 rounded-full bg-emerald-400 animate-pulse"
                                            style={{animationDelay: "0.3s"}}
                                        />
                                        Painting hero image · ~10–20s
                                    </p>
                                )}
                            </div>
                        )}

                        {aiError && (
                            <p className="text-xs text-red-300 mt-3 whitespace-pre-line break-words">
                                {aiError}
                            </p>
                        )}

                        {/* Hero preview */}
                        {heroImage && (
                            <div className="mt-5 space-y-2">
                                <div className="flex items-center justify-between">
                                    <span className="text-[10px] font-semibold tracking-[0.16em] uppercase text-white/50 inline-flex items-center gap-1.5">
                                        <ImageIcon className="size-3" />
                                        Hero preview
                                    </span>
                                    <button
                                        type="button"
                                        onClick={regenerateHero}
                                        disabled={aiBusyImage}
                                        className="text-[10px] font-semibold tracking-[0.16em] uppercase text-white/60 hover:text-white inline-flex items-center gap-1.5 disabled:opacity-50 transition-colors"
                                    >
                                        <RefreshCw
                                            className={`size-3 ${aiBusyImage ? "animate-spin" : ""}`}
                                        />
                                        Regenerate
                                    </button>
                                </div>
                                <div className="overflow-hidden rounded-2xl border border-white/15">
                                    {/* eslint-disable-next-line @next/next/no-img-element */}
                                    <img
                                        src={heroImage}
                                        alt="Generated hero preview"
                                        className="w-full aspect-[16/9] object-cover"
                                    />
                                </div>
                                <p className="text-[10px] text-white/40">
                                    Saved locally on submit (browser only — keeps on-chain metadata light).
                                </p>
                            </div>
                        )}
                    </div>
                </motion.section>

                <form onSubmit={onSubmit} className="space-y-8">
                    {/* Section 1: Story */}
                    <FormSection
                        step="01"
                        eyebrow="The Story"
                        heading={<>What is{" "}<span className="font-serif italic font-light">this for?</span></>}
                    >
                        <Field label="Title">
                            <input
                                required
                                value={title}
                                onChange={e => setTitle(e.target.value)}
                                placeholder="e.g. Press Freedom Legal Defense"
                                className={inputCls}
                            />
                        </Field>
                        <Field label="Story">
                            <textarea
                                required
                                value={story}
                                onChange={e => setStory(e.target.value)}
                                rows={6}
                                placeholder="Why does this cause matter and why should donations stay private?"
                                className={`${inputCls} resize-none leading-relaxed`}
                            />
                        </Field>
                    </FormSection>

                    {/* Section 2: Parameters */}
                    <FormSection
                        step="02"
                        eyebrow="The Numbers"
                        heading={<>Goal &{" "}<span className="font-serif italic font-light">deadline</span></>}
                    >
                        <div className="grid sm:grid-cols-2 gap-5">
                            <Field
                                label="Goal"
                                hint="Target raise in cSGD"
                                icon={<Target className="size-3.5" />}
                            >
                                <div className="relative">
                                    <input
                                        required
                                        type="number"
                                        min="1"
                                        value={goal}
                                        onChange={e => setGoal(e.target.value)}
                                        placeholder="10000"
                                        className={`${inputCls} pr-16`}
                                    />
                                    <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-semibold tracking-[0.16em] uppercase text-zinc-400 pointer-events-none">
                                        cSGD
                                    </span>
                                </div>
                            </Field>
                            <Field
                                label="Deadline"
                                hint="Days until campaign closes"
                                icon={<Calendar className="size-3.5" />}
                            >
                                <div className="relative">
                                    <input
                                        required
                                        type="number"
                                        min="1"
                                        max="365"
                                        value={days}
                                        onChange={e => setDays(e.target.value)}
                                        className={`${inputCls} pr-16`}
                                    />
                                    <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-semibold tracking-[0.16em] uppercase text-zinc-400 pointer-events-none">
                                        Days
                                    </span>
                                </div>
                            </Field>
                        </div>
                    </FormSection>

                    {/* Section 3: Recipient */}
                    <FormSection
                        step="03"
                        eyebrow="Settlement"
                        heading={<>Who can{" "}<span className="font-serif italic font-light">withdraw?</span></>}
                    >
                        <Field
                            label="Recipient address"
                            hint={
                                <>
                                    This wallet calls{" "}
                                    <code className="font-mono text-[11px] text-zinc-700 bg-zinc-100 px-1.5 py-0.5 rounded">
                                        withdraw()
                                    </code>{" "}
                                    after the deadline.
                                </>
                            }
                            icon={<Wallet className="size-3.5" />}
                        >
                            <input
                                required
                                value={recipient}
                                onChange={e => setRecipient(e.target.value)}
                                placeholder="0x…"
                                className={`${inputCls} font-mono text-[13px]`}
                            />
                        </Field>
                    </FormSection>

                    {error && (
                        <div className="rounded-2xl border border-red-200 bg-red-50/50 p-4 text-sm text-red-700 break-words">
                            {error}
                        </div>
                    )}

                    {/* Submit */}
                    <div className="pt-2">
                        <button
                            type="submit"
                            disabled={txBusy}
                            className="group w-full rounded-full bg-zinc-900 hover:bg-zinc-800 disabled:bg-zinc-300 disabled:text-zinc-600 disabled:cursor-not-allowed text-white px-6 py-4 text-xs font-bold tracking-[0.18em] uppercase transition-colors inline-flex items-center justify-center gap-3 shadow-[0_12px_32px_-12px_rgba(0,0,0,0.4)] disabled:shadow-none"
                        >
                            {txBusy ? (
                                <>
                                    <Loader2 className="size-4 animate-spin" />
                                    Deploying campaign…
                                </>
                            ) : (
                                <>
                                    <Sparkles className="size-4" />
                                    Create campaign
                                    <span className="inline-flex items-center justify-center size-6 rounded-full border border-white/30 group-hover:border-white/60 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5">
                                        <ArrowUpRight className="size-3.5" />
                                    </span>
                                </>
                            )}
                        </button>

                        {txHash && (
                            <div className="mt-4 rounded-2xl border border-emerald-200 bg-emerald-50/50 p-4 flex items-center justify-between flex-wrap gap-3">
                                <div className="text-sm text-emerald-700 inline-flex items-center gap-2">
                                    <span className="size-1.5 rounded-full bg-emerald-500 animate-pulse" />
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
                            </div>
                        )}
                    </div>
                </form>
            </div>
        </div>
    );
}

const inputCls =
    "w-full rounded-xl bg-white border border-zinc-300 px-4 py-3 text-sm text-zinc-900 placeholder:text-zinc-400 focus:border-zinc-900 focus:bg-white focus:outline-none focus:ring-4 focus:ring-zinc-900/5 transition-all";

function FormSection({
    step,
    eyebrow,
    heading,
    children,
}: {
    step: string;
    eyebrow: string;
    heading: ReactNode;
    children: ReactNode;
}) {
    return (
        <motion.section
            initial={{opacity: 0, y: 12}}
            whileInView={{opacity: 1, y: 0}}
            viewport={{once: true, margin: "-50px"}}
            transition={{duration: 0.5}}
            className="rounded-3xl border border-zinc-300 bg-white p-6 md:p-7 space-y-5 shadow-[0_4px_16px_-8px_rgba(0,0,0,0.08)]"
        >
            <div className="flex items-baseline gap-4">
                <span className="font-mono text-[11px] tabular-nums font-semibold text-zinc-400 mt-1.5">
                    {step}
                </span>
                <div>
                    <div className="text-[10px] font-semibold tracking-[0.18em] uppercase text-zinc-500 mb-1">
                        {eyebrow}
                    </div>
                    <h3 className="text-xl font-semibold tracking-tight text-zinc-900">
                        {heading}
                    </h3>
                </div>
            </div>
            <div className="space-y-5">{children}</div>
        </motion.section>
    );
}

function Field({
    label,
    hint,
    icon,
    children,
}: {
    label: string;
    hint?: ReactNode;
    icon?: ReactNode;
    children: ReactNode;
}) {
    return (
        <div>
            <label className="block text-[10px] font-semibold tracking-[0.16em] uppercase text-zinc-500 mb-2 inline-flex items-center gap-1.5">
                {icon}
                {label}
            </label>
            {children}
            {hint && <p className="text-xs text-zinc-500 mt-2 leading-relaxed">{hint}</p>}
        </div>
    );
}

function DotPatternDark() {
    return (
        <svg className="absolute inset-0 w-full h-full opacity-30" aria-hidden>
            <defs>
                <pattern id="create-dots" width="22" height="22" patternUnits="userSpaceOnUse">
                    <circle cx="11" cy="11" r="1" fill="rgba(255,255,255,0.18)" />
                </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#create-dots)" />
        </svg>
    );
}

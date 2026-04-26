"use client";

import {ArrowLeft, Sparkles, Wand2} from "lucide-react";
import Link from "next/link";
import {useRouter} from "next/navigation";
import {useEffect, useState} from "react";
import {decodeEventLog} from "viem";
import {useAccount, useWaitForTransactionReceipt, useWriteContract} from "wagmi";
import {arbitrumSepolia} from "wagmi/chains";

import {stealthGiveFactoryAbi} from "@/lib/abis";
import {addresses} from "@/lib/addresses";
import {arbSepoliaGas} from "@/lib/gas";
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

    // ---------- AI assist ----------
    const [brief, setBrief] = useState("");
    const [aiBusy, setAiBusy] = useState(false);
    const [aiError, setAiError] = useState<string | null>(null);

    async function generateWithAI() {
        if (brief.trim().length < 4) {
            setAiError("Brief should be at least a few words.");
            return;
        }
        setAiBusy(true);
        setAiError(null);
        try {
            const res = await fetch("/api/ai/draft-campaign", {
                method: "POST",
                headers: {"Content-Type": "application/json"},
                body: JSON.stringify({brief}),
            });
            const data = (await res.json()) as
                | {title: string; story: string}
                | {error: string};
            if (!res.ok || "error" in data) {
                throw new Error("error" in data ? data.error : "AI generation failed");
            }
            setTitle(data.title);
            setStory(data.story);
        } catch (err) {
            setAiError((err as Error).message ?? "AI generation failed");
        } finally {
            setAiBusy(false);
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
                    router.push(`/campaigns/${args.campaign}`);
                    return;
                }
            } catch {
                // not a factory event; skip
            }
        }
    }, [receipt, router]);

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
            <div className="max-w-2xl mx-auto px-6 py-32 text-center">
                <h1 className="text-3xl font-semibold mb-3">Connect your wallet</h1>
                <p className="text-zinc-400">You need a connected wallet to start a campaign.</p>
            </div>
        );
    }

    return (
        <div className="max-w-2xl mx-auto px-6 py-12">
            <Link
                href="/campaigns"
                className="inline-flex items-center gap-1.5 text-sm text-zinc-400 hover:text-zinc-200 mb-6"
            >
                <ArrowLeft className="size-4" />
                All campaigns
            </Link>
            <h1 className="text-4xl font-semibold tracking-tight mb-2">Start a campaign</h1>
            <p className="text-zinc-400 text-sm mb-8">
                Per-donor amounts stay confidential; the aggregate total is publicly verifiable in real
                time.
            </p>

            {/* AI assist card */}
            <section className="rounded-2xl border border-violet-500/30 bg-gradient-to-br from-violet-500/10 to-transparent p-5 mb-8">
                <div className="flex items-center gap-2 mb-2">
                    <Wand2 className="size-4 text-violet-300" />
                    <h2 className="text-sm font-semibold text-violet-200">Draft with AI</h2>
                    <span className="text-xs text-zinc-500">powered by ChainGPT Web3 LLM</span>
                </div>
                <p className="text-xs text-zinc-400 mb-3">
                    Describe your cause in one line. AI will draft a compelling title and a 3-paragraph
                    story you can edit below.
                </p>
                <div className="flex flex-col sm:flex-row gap-2">
                    <input
                        value={brief}
                        onChange={e => setBrief(e.target.value)}
                        placeholder='e.g. "legal fund for journalists facing SLAPP suits in SE Asia"'
                        className="flex-1 rounded-lg bg-zinc-950 border border-zinc-700 px-3 py-2 text-sm focus:border-violet-500 focus:outline-none"
                        disabled={aiBusy}
                    />
                    <button
                        type="button"
                        onClick={generateWithAI}
                        disabled={aiBusy || brief.trim().length < 4}
                        className="rounded-full bg-violet-600 hover:bg-violet-500 disabled:opacity-50 px-4 py-2 text-sm font-medium inline-flex items-center justify-center gap-1.5 whitespace-nowrap"
                    >
                        <Sparkles className="size-3.5" />
                        {aiBusy ? "Generating…" : "Generate"}
                    </button>
                </div>
                {aiError && (
                    <p className="text-xs text-red-400 mt-2 break-words">{aiError}</p>
                )}
            </section>

            <form onSubmit={onSubmit} className="space-y-6">
                <div>
                    <label className="block text-sm font-medium mb-2">Title</label>
                    <input
                        required
                        value={title}
                        onChange={e => setTitle(e.target.value)}
                        placeholder="e.g. Press Freedom Legal Defense"
                        className="w-full rounded-lg bg-zinc-950 border border-zinc-700 px-4 py-2.5 text-sm focus:border-violet-500 focus:outline-none"
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium mb-2">Story</label>
                    <textarea
                        required
                        value={story}
                        onChange={e => setStory(e.target.value)}
                        rows={6}
                        placeholder="Why does this cause matter and why should donations stay private?"
                        className="w-full rounded-lg bg-zinc-950 border border-zinc-700 px-4 py-2.5 text-sm focus:border-violet-500 focus:outline-none resize-none"
                    />
                </div>
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium mb-2">Goal (cSGD)</label>
                        <input
                            required
                            type="number"
                            min="1"
                            value={goal}
                            onChange={e => setGoal(e.target.value)}
                            placeholder="10000"
                            className="w-full rounded-lg bg-zinc-950 border border-zinc-700 px-4 py-2.5 text-sm focus:border-violet-500 focus:outline-none"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium mb-2">Deadline (days)</label>
                        <input
                            required
                            type="number"
                            min="1"
                            max="365"
                            value={days}
                            onChange={e => setDays(e.target.value)}
                            className="w-full rounded-lg bg-zinc-950 border border-zinc-700 px-4 py-2.5 text-sm focus:border-violet-500 focus:outline-none"
                        />
                    </div>
                </div>
                <div>
                    <label className="block text-sm font-medium mb-2">Recipient address</label>
                    <input
                        required
                        value={recipient}
                        onChange={e => setRecipient(e.target.value)}
                        placeholder="0x…"
                        className="w-full rounded-lg bg-zinc-950 border border-zinc-700 px-4 py-2.5 text-sm font-mono focus:border-violet-500 focus:outline-none"
                    />
                    <p className="text-xs text-zinc-500 mt-1.5">
                        This wallet will be able to call <code>withdraw()</code> after the deadline.
                    </p>
                </div>

                {error && <p className="text-sm text-red-400 break-words">{error}</p>}

                <button
                    type="submit"
                    disabled={isPending || isMining}
                    className="w-full rounded-full bg-violet-600 hover:bg-violet-500 disabled:opacity-50 px-6 py-3 text-sm font-medium inline-flex items-center justify-center gap-2"
                >
                    <Sparkles className="size-4" />
                    {isPending || isMining ? "Deploying…" : "Create campaign"}
                </button>

                {txHash && (
                    <p className="text-xs text-zinc-500 text-center break-all">
                        Tx submitted:{" "}
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
            </form>
        </div>
    );
}

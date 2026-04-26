"use client";

import Link from "next/link";
import {Plus} from "lucide-react";
import {useReadContract, useReadContracts} from "wagmi";
import {arbitrumSepolia} from "wagmi/chains";

import {CampaignCard} from "@/components/campaign-card";
import {campaignAbi, campaignRegistryAbi} from "@/lib/abis";
import {addresses} from "@/lib/addresses";

const ADDR = addresses[arbitrumSepolia.id];

type Summary = {
    campaign: `0x${string}`;
    creator: `0x${string}`;
    recipient: `0x${string}`;
    goal: bigint;
    deadline: bigint;
    settledAt: bigint;
    donorCount: bigint;
    state: number;
    metadataURI: string;
};

export default function CampaignsPage() {
    const {data: pageData, isLoading} = useReadContract({
        address: ADDR.registry,
        abi: campaignRegistryAbi,
        functionName: "paginate",
        args: [0n, 50n],
    });

    const addrs = (pageData as [`0x${string}`[], bigint] | undefined)?.[0] ?? [];

    const {data: summaries} = useReadContract({
        address: ADDR.registry,
        abi: campaignRegistryAbi,
        functionName: "summariseMany",
        args: [addrs],
        query: {enabled: addrs.length > 0},
    });

    const list = (summaries as Summary[] | undefined) ?? [];

    // Pull encryptedTotal in parallel for every visible campaign so cards can
    // surface live progress without extra hooks per child.
    const totals = useReadContracts({
        contracts: list.map(c => ({
            address: c.campaign,
            abi: campaignAbi,
            functionName: "encryptedTotal" as const,
        })),
        query: {enabled: list.length > 0},
    });

    return (
        <div className="max-w-6xl mx-auto px-6 py-12">
            <header className="flex flex-wrap items-end justify-between gap-4 mb-10">
                <div>
                    <h1 className="text-4xl font-semibold tracking-tight">Active campaigns</h1>
                    <p className="text-zinc-400 mt-2">
                        {list.length} on-chain {list.length === 1 ? "campaign" : "campaigns"}. Per-donor
                        amounts hidden, totals publicly verifiable.
                    </p>
                </div>
                <Link
                    href="/create"
                    className="inline-flex items-center gap-2 rounded-full bg-violet-600 hover:bg-violet-500 px-5 py-2.5 text-sm font-medium transition-colors"
                >
                    <Plus className="size-4" />
                    Start a campaign
                </Link>
            </header>

            {isLoading && (
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {[0, 1, 2].map(i => (
                        <div
                            key={i}
                            className="rounded-2xl border border-zinc-800 bg-zinc-900/40 h-72 animate-pulse"
                        />
                    ))}
                </div>
            )}

            {!isLoading && list.length === 0 && (
                <div className="rounded-2xl border border-dashed border-zinc-800 p-16 text-center">
                    <p className="text-zinc-400 mb-4">No campaigns yet.</p>
                    <Link
                        href="/create"
                        className="inline-block text-violet-400 hover:text-violet-300 text-sm font-medium"
                    >
                        Be the first to start one →
                    </Link>
                </div>
            )}

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {list.map((c, i) => (
                    <CampaignCard
                        key={c.campaign}
                        {...c}
                        encryptedTotal={totals.data?.[i]?.result as `0x${string}` | undefined}
                    />
                ))}
            </div>
        </div>
    );
}

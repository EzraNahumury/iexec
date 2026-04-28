"use client";

import Link from "next/link";
import {ArrowUpRight, Plus} from "lucide-react";
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
        <div className="max-w-6xl mx-auto px-6 py-16 md:py-20">
            <header className="flex flex-wrap items-end justify-between gap-6 mb-12">
                <div>
                    <div className="text-[11px] font-medium tracking-[0.18em] uppercase text-zinc-500 mb-3">
                        On-chain · Arbitrum Sepolia
                    </div>
                    <h1 className="text-5xl md:text-6xl font-semibold tracking-tight text-zinc-900 leading-[1.05]">
                        Active{" "}
                        <span className="font-serif italic font-light">campaigns</span>
                    </h1>
                    <p className="text-zinc-600 mt-4 max-w-md">
                        {list.length} confidential {list.length === 1 ? "fundraiser" : "fundraisers"} live.
                        Per-donor amounts encrypted; totals publicly verifiable.
                    </p>
                </div>
                <Link
                    href="/create"
                    className="group inline-flex items-center gap-3 rounded-full bg-zinc-900 hover:bg-zinc-800 text-white text-xs font-semibold tracking-[0.16em] uppercase px-5 py-3 transition-colors"
                >
                    <Plus className="size-4" />
                    Start a campaign
                    <span className="inline-flex items-center justify-center size-6 rounded-full border border-white/30 group-hover:border-white/50 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5">
                        <ArrowUpRight className="size-3" />
                    </span>
                </Link>
            </header>

            {isLoading && (
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {[0, 1, 2].map(i => (
                        <div
                            key={i}
                            className="rounded-2xl border border-zinc-200 bg-zinc-50 h-80 animate-pulse"
                        />
                    ))}
                </div>
            )}

            {!isLoading && list.length === 0 && (
                <div className="rounded-3xl border border-dashed border-zinc-300 bg-zinc-50/50 p-16 text-center">
                    <p className="text-zinc-600 mb-4">No campaigns yet.</p>
                    <Link
                        href="/create"
                        className="inline-block text-zinc-900 hover:text-zinc-700 text-sm font-medium underline underline-offset-4"
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

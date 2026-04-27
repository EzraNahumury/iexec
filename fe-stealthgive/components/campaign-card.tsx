"use client";

import Link from "next/link";
import {Users} from "lucide-react";

import {parseMetadataURI} from "@/lib/metadata";
import {formatSGD, shortAddress} from "@/lib/format";

import {Countdown} from "./countdown";
import {HeroGradient} from "./hero-gradient";
import {StatusBadge} from "./status-badge";
import {TotalRaised} from "./total-raised";

type Props = {
    campaign: `0x${string}`;
    creator: `0x${string}`;
    recipient: `0x${string}`;
    goal: bigint;
    deadline: bigint;
    settledAt: bigint;
    donorCount: bigint;
    state: number;
    metadataURI: string;
    encryptedTotal?: `0x${string}`;
};

export function CampaignCard(props: Props) {
    const meta = parseMetadataURI(props.metadataURI);
    const deadlineMs = Number(props.deadline) * 1000;

    return (
        <Link
            href={`/campaigns/${props.campaign}`}
            className="group rounded-2xl border border-zinc-200 bg-zinc-50 overflow-hidden hover:border-violet-500/50 transition-colors block"
        >
            <HeroGradient seed={props.campaign} className="h-32" />
            <div className="p-5 space-y-4">
                <div className="flex items-center justify-between">
                    <StatusBadge state={props.state} />
                    <span className="inline-flex items-center gap-1 text-xs text-zinc-500 font-mono">
                        <Users className="size-3.5" />
                        {props.donorCount.toString()}
                    </span>
                </div>
                <div>
                    <h3 className="font-semibold leading-tight line-clamp-2 group-hover:text-violet-300 transition-colors">
                        {meta.title}
                    </h3>
                    {meta.story && (
                        <p className="mt-1.5 text-sm text-zinc-400 line-clamp-2">{meta.story}</p>
                    )}
                </div>
                <TotalRaised encryptedTotal={props.encryptedTotal} goal={props.goal} autoLoad={false} />
                <div className="flex items-center justify-between text-xs text-zinc-500 pt-2 border-t border-zinc-200">
                    <Countdown deadlineMs={deadlineMs} />
                    <span className="font-mono">{shortAddress(props.campaign)}</span>
                </div>
            </div>
        </Link>
    );
}

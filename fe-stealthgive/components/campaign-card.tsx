"use client";

import {ArrowUpRight, Users} from "lucide-react";
import Link from "next/link";

import {Countdown} from "./countdown";
import {ProgressBar} from "./progress-bar";
import {StatusBadge} from "./status-badge";
import {formatPercent, formatSGD, shortAddress} from "@/lib/format";
import {parseMetadataURI} from "@/lib/metadata";
import {useEffect, useState} from "react";
import {useHandleClient} from "@/lib/nox";

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

const ZERO_HANDLE = "0x0000000000000000000000000000000000000000000000000000000000000000";

/**
 * Campaign list card — modern dApp aesthetic. Clean monochrome hero with
 * a faint dot pattern + campaign address watermark, well-spaced body, and
 * a footer that previews the click affordance with a translating arrow.
 *
 * Aggregate total is auto-decrypted on mount (publicDecrypt is gasless),
 * so the card always shows accurate progress without a manual "Reveal"
 * button.
 */
export function CampaignCard(props: Props) {
    const meta = parseMetadataURI(props.metadataURI);
    const deadlineMs = Number(props.deadline) * 1000;

    const {client: handleClient} = useHandleClient();
    const [raised, setRaised] = useState<bigint | null>(null);

    const isZeroHandle =
        !props.encryptedTotal || (props.encryptedTotal as string) === ZERO_HANDLE;

    useEffect(() => {
        if (!handleClient || !props.encryptedTotal || isZeroHandle) return;
        let cancelled = false;
        handleClient
            .publicDecrypt(props.encryptedTotal as `0x${string}`)
            .then(res => {
                if (!cancelled) setRaised(res.value as bigint);
            })
            .catch(() => {
                /* ignore on the card — detail page surfaces full error UX */
            });
        return () => {
            cancelled = true;
        };
    }, [handleClient, props.encryptedTotal, isZeroHandle]);

    const percent =
        raised !== null && props.goal > 0n ? formatPercent(raised, props.goal) : 0;

    return (
        <Link
            href={`/campaigns/${props.campaign}`}
            className="group flex flex-col rounded-2xl border border-zinc-200 bg-white overflow-hidden hover:border-zinc-400 hover:shadow-[0_16px_40px_-16px_rgba(0,0,0,0.12)] transition-all duration-200"
        >
            {/* Hero zone — monochrome dotted pattern with overlays */}
            <div className="relative aspect-[16/8] bg-gradient-to-br from-zinc-50 to-zinc-100 border-b border-zinc-200 overflow-hidden">
                <svg
                    className="absolute inset-0 w-full h-full"
                    xmlns="http://www.w3.org/2000/svg"
                    aria-hidden
                >
                    <defs>
                        <pattern
                            id={`card-dots-${props.campaign.slice(2, 8)}`}
                            width="20"
                            height="20"
                            patternUnits="userSpaceOnUse"
                        >
                            <circle cx="10" cy="10" r="1" fill="rgba(0,0,0,0.06)" />
                        </pattern>
                    </defs>
                    <rect
                        width="100%"
                        height="100%"
                        fill={`url(#card-dots-${props.campaign.slice(2, 8)})`}
                    />
                </svg>

                {/* Status + donor count — top row */}
                <div className="absolute top-3 left-3 right-3 flex items-center justify-between">
                    <StatusBadge state={props.state} />
                    <span className="inline-flex items-center gap-1 text-[11px] text-zinc-600 font-medium px-2 py-1 rounded-full bg-white/80 backdrop-blur border border-zinc-200">
                        <Users className="size-3" />
                        {props.donorCount.toString()}
                    </span>
                </div>

                {/* Address watermark — bottom-left */}
                <div className="absolute bottom-3 left-3 font-mono text-[10px] tracking-wider uppercase text-zinc-400">
                    {shortAddress(props.campaign, 6, 4)}
                </div>

                {/* Hover arrow — bottom-right */}
                <div className="absolute bottom-3 right-3 size-7 rounded-full bg-white border border-zinc-200 flex items-center justify-center text-zinc-700 group-hover:bg-zinc-900 group-hover:text-white group-hover:border-zinc-900 transition-colors">
                    <ArrowUpRight className="size-3.5 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
                </div>
            </div>

            {/* Body */}
            <div className="p-5 flex flex-col flex-1">
                <h3 className="font-semibold text-zinc-900 leading-snug line-clamp-2 group-hover:text-zinc-700 transition-colors">
                    {meta.title}
                </h3>

                {meta.story && (
                    <p className="mt-1.5 text-sm text-zinc-500 leading-relaxed line-clamp-2">
                        {meta.story}
                    </p>
                )}

                {/* Spacer pushes progress to bottom for equal-height cards */}
                <div className="flex-1" />

                {/* Progress section */}
                <div className="mt-4 space-y-2">
                    <ProgressBar percent={percent} />
                    <div className="flex items-baseline justify-between text-xs">
                        <span className="text-zinc-500">
                            Raised{" "}
                            <span className="font-mono text-zinc-900 font-medium">
                                {raised !== null ? formatSGD(raised) : "•••"}
                            </span>
                        </span>
                        <span className="text-zinc-400 font-mono">
                            / {formatSGD(props.goal)} cSGD
                        </span>
                    </div>
                </div>

                {/* Footer */}
                <div className="mt-4 pt-4 border-t border-zinc-100 flex items-center justify-between text-xs text-zinc-500">
                    <Countdown deadlineMs={deadlineMs} />
                    <span className="text-zinc-400 group-hover:text-zinc-700 transition-colors">
                        View campaign →
                    </span>
                </div>
            </div>
        </Link>
    );
}

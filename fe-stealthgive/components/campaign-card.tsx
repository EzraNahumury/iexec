"use client";

import {ArrowUpRight, Users} from "lucide-react";
import Image from "next/image";
import Link from "next/link";

import {Countdown} from "./countdown";
import {ProgressBar} from "./progress-bar";
import {StatusBadge} from "./status-badge";
import {formatPercent, formatSGD, shortAddress} from "@/lib/format";
import {parseMetadataURI} from "@/lib/metadata";
import {useEffect, useState} from "react";
import {useHandleClient} from "@/lib/nox";
import {loadHeroImage} from "@/lib/hero-image";

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

    // Pick the most appropriate hero image:
    //   1. AI-generated hero saved in localStorage at campaign creation
    //   2. Fallback to /campaigns.png (a shared brand banner for the list)
    const [heroSrc, setHeroSrc] = useState<string>("/campaigns.png");
    useEffect(() => {
        const ai = loadHeroImage(props.campaign);
        if (ai) setHeroSrc(ai);
    }, [props.campaign]);

    return (
        <Link
            href={`/campaigns/${props.campaign}`}
            className="group flex flex-col rounded-2xl border border-zinc-200 bg-white overflow-hidden hover:border-zinc-400 hover:shadow-[0_16px_40px_-16px_rgba(0,0,0,0.12)] transition-all duration-200"
        >
            {/* Hero zone — image background with overlays */}
            <div className="relative aspect-[16/8] border-b border-zinc-200 overflow-hidden bg-zinc-100">
                {/* Banner image */}
                <Image
                    src={heroSrc}
                    alt=""
                    fill
                    className="object-cover transition-transform duration-500 group-hover:scale-105"
                    sizes="(min-width: 1024px) 380px, (min-width: 768px) 50vw, 100vw"
                    aria-hidden
                />
                {/* Slight light overlay so the badges/text overlaid on top stay readable */}
                <div
                    className="absolute inset-0 bg-gradient-to-t from-black/35 via-black/0 to-black/15 pointer-events-none"
                    aria-hidden
                />

                {/* Status + donor count — top row */}
                <div className="absolute top-3 left-3 right-3 flex items-center justify-between">
                    <StatusBadge state={props.state} />
                    <span className="inline-flex items-center gap-1 text-[11px] text-zinc-900 font-medium px-2 py-1 rounded-full bg-white/90 backdrop-blur border border-white/40 shadow-sm">
                        <Users className="size-3" />
                        {props.donorCount.toString()}
                    </span>
                </div>

                {/* Address watermark — bottom-left, white on photo */}
                <div className="absolute bottom-3 left-3 font-mono text-[10px] tracking-wider uppercase text-white/85 drop-shadow-sm">
                    {shortAddress(props.campaign, 6, 4)}
                </div>

                {/* Hover arrow — bottom-right */}
                <div className="absolute bottom-3 right-3 size-7 rounded-full bg-white/90 backdrop-blur flex items-center justify-center text-zinc-900 group-hover:bg-zinc-900 group-hover:text-white transition-colors shadow-sm">
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

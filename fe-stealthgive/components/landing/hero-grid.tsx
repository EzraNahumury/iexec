"use client";

import {motion} from "framer-motion";
import Image from "next/image";

/**
 * Hero background — Leticia-style grid of soft rectangular cells with
 * Arbitrum chain chips dropped into selected cells. Each chip floats
 * gently and independently to give the layer a subtle "alive" feel.
 *
 * Layout: a 16×5 CSS grid fills the hero area. Each cell is a rounded
 * rectangle with a faint border; cells listed in `chipCells` also host
 * a small Arbitrum chip overlaid in the centre.
 */

const COLS = 16;
const ROWS = 5;

// Chip placements as "col-row" strings (1-based). Spread organically.
const chipPlacements: {key: string; delay: number; scale: number}[] = [
    {key: "2-1", delay: 0.0, scale: 1.0},
    {key: "6-1", delay: 1.2, scale: 1.05},
    {key: "11-1", delay: 2.0, scale: 0.9},
    {key: "14-1", delay: 0.6, scale: 1.0},
    {key: "4-2", delay: 0.4, scale: 1.0},
    {key: "9-2", delay: 1.6, scale: 0.85},
    {key: "13-2", delay: 2.4, scale: 1.05},
    {key: "16-2", delay: 0.8, scale: 0.95},
    {key: "1-3", delay: 1.8, scale: 1.0},
    {key: "5-3", delay: 0.2, scale: 1.05},
    {key: "10-3", delay: 1.4, scale: 0.9},
    {key: "15-3", delay: 2.2, scale: 1.05},
    {key: "3-4", delay: 0.5, scale: 0.9},
    {key: "7-4", delay: 1.7, scale: 1.0},
    {key: "12-4", delay: 0.9, scale: 0.95},
    {key: "16-4", delay: 2.1, scale: 0.85},
    {key: "2-5", delay: 1.1, scale: 1.0},
    {key: "8-5", delay: 0.7, scale: 1.05},
    {key: "11-5", delay: 1.9, scale: 0.9},
    {key: "14-5", delay: 0.3, scale: 1.0},
];

const chipMap = new Map(chipPlacements.map(p => [p.key, p]));

function ArbitrumChip({delay, scale}: {delay: number; scale: number}) {
    const size = `${Math.round(46 * scale)}px`;
    return (
        <motion.div
            className="absolute inset-0 flex items-center justify-center pointer-events-none"
            initial={{opacity: 0, scale: 0.6}}
            animate={{opacity: 1, scale: 1}}
            transition={{duration: 0.6, delay: delay * 0.05}}
        >
            <motion.div
                className="rounded-full bg-white border border-zinc-200 shadow-sm flex items-center justify-center p-2"
                style={{width: size, height: size}}
                animate={{y: [0, -6, 0]}}
                transition={{
                    duration: 3.6 + delay * 0.4,
                    repeat: Infinity,
                    ease: "easeInOut",
                    delay,
                }}
            >
                <Image
                    src="/arbitrum.png"
                    alt=""
                    width={42}
                    height={42}
                    className="size-full object-contain"
                    aria-hidden
                />
            </motion.div>
        </motion.div>
    );
}

export function HeroGrid() {
    const cells = Array.from({length: COLS * ROWS}, (_, i) => {
        const col = (i % COLS) + 1;
        const row = Math.floor(i / COLS) + 1;
        const key = `${col}-${row}`;
        const chip = chipMap.get(key);
        return {col, row, chip};
    });

    return (
        <div className="absolute inset-0 overflow-hidden">
            {/* Cell grid */}
            <div
                className="absolute inset-0 grid gap-1.5 p-4 md:p-6"
                style={{
                    gridTemplateColumns: `repeat(${COLS}, minmax(0, 1fr))`,
                    gridTemplateRows: `repeat(${ROWS}, minmax(0, 1fr))`,
                }}
            >
                {cells.map(c => {
                    // Diagonal wave delay — top-left fades first, ripples to
                    // bottom-right. Plus a tiny per-cell jitter so the wave
                    // stays organic instead of crisply linear.
                    const jitter = ((c.col * 7 + c.row * 13) % 10) / 30; // 0..0.33
                    const baseDelay = (c.col + c.row) * 0.18 + jitter;

                    return (
                        <motion.div
                            key={`${c.col}-${c.row}`}
                            initial={{opacity: 0}}
                            animate={{
                                opacity: c.chip
                                    ? [0.55, 1, 0.55] // chip cells stay more present
                                    : [0.2, 0.9, 0.2], // empty cells breathe wider
                            }}
                            transition={{
                                duration: 4.5 + jitter * 2,
                                repeat: Infinity,
                                ease: "easeInOut",
                                delay: baseDelay,
                            }}
                            className={`relative rounded-md border ${
                                c.chip
                                    ? "bg-zinc-50 border-zinc-200"
                                    : "bg-zinc-50 border-zinc-200/70"
                            }`}
                        >
                            {c.chip && (
                                <ArbitrumChip delay={c.chip.delay} scale={c.chip.scale} />
                            )}
                        </motion.div>
                    );
                })}
            </div>

            {/* Soft white-out around the headline so text stays legible */}
            <div
                className="absolute inset-0 bg-[radial-gradient(ellipse_55%_55%_at_50%_55%,rgba(255,255,255,0.95)_0%,rgba(255,255,255,0.5)_60%,rgba(255,255,255,0)_100%)] pointer-events-none"
                aria-hidden
            />
        </div>
    );
}

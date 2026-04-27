"use client";

import {motion} from "framer-motion";

/**
 * Hero background — Leticia-style grid of soft rectangular cells. Cells
 * breathe (opacity pulses) on a diagonal wave so the layer feels alive
 * without distracting from the headline overlaid on top.
 */

const COLS = 16;
const ROWS = 5;

export function HeroGrid() {
    const cells = Array.from({length: COLS * ROWS}, (_, i) => ({
        col: (i % COLS) + 1,
        row: Math.floor(i / COLS) + 1,
    }));

    return (
        <div className="absolute inset-0 overflow-hidden">
            {/* Cell grid — diagonal opacity wave */}
            <div
                className="absolute inset-0 grid gap-1.5 p-4 md:p-6"
                style={{
                    gridTemplateColumns: `repeat(${COLS}, minmax(0, 1fr))`,
                    gridTemplateRows: `repeat(${ROWS}, minmax(0, 1fr))`,
                }}
            >
                {cells.map(c => {
                    const jitter = ((c.col * 7 + c.row * 13) % 10) / 30;
                    const baseDelay = (c.col + c.row) * 0.18 + jitter;
                    return (
                        <motion.div
                            key={`${c.col}-${c.row}`}
                            initial={{opacity: 0}}
                            animate={{opacity: [0.2, 0.9, 0.2]}}
                            transition={{
                                duration: 4.5 + jitter * 2,
                                repeat: Infinity,
                                ease: "easeInOut",
                                delay: baseDelay,
                            }}
                            className="relative rounded-md border bg-zinc-50 border-zinc-200/70"
                        />
                    );
                })}
            </div>

            {/* Soft vignette so the headline + banner stay legible on top */}
            <div
                className="absolute inset-0 bg-[radial-gradient(ellipse_60%_60%_at_50%_55%,rgba(255,255,255,0.92)_0%,rgba(255,255,255,0.5)_60%,rgba(255,255,255,0)_100%)] pointer-events-none"
                aria-hidden
            />
        </div>
    );
}

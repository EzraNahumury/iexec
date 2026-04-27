"use client";

import {motion} from "framer-motion";
import type {ReactNode} from "react";

type Props = {
    /** Grid column (1-based) the icon sits in. */
    col: number;
    /** Grid row (1-based) the icon sits in. */
    row: number;
    /** Visual variant — affects the chip background + ring. */
    tone?: "neutral" | "violet" | "emerald" | "rose" | "amber" | "sky";
    /** Bobble delay in seconds — stagger neighbours so they don't sync. */
    delay?: number;
    children: ReactNode;
};

const toneStyles: Record<NonNullable<Props["tone"]>, string> = {
    neutral: "bg-white border-zinc-200 text-zinc-700",
    violet: "bg-violet-600 border-violet-700 text-white",
    emerald: "bg-emerald-500 border-emerald-600 text-white",
    rose: "bg-rose-500 border-rose-600 text-white",
    amber: "bg-amber-400 border-amber-500 text-zinc-900",
    sky: "bg-sky-500 border-sky-600 text-white",
};

/**
 * One brand-chip icon in the hero grid background. Floats gently with a
 * staggered delay so neighbours don't sync up.
 */
export function FloatingIcon({col, row, tone = "neutral", delay = 0, children}: Props) {
    return (
        <motion.div
            className="absolute pointer-events-none select-none"
            style={{
                gridColumnStart: col,
                gridRowStart: row,
            }}
            initial={{opacity: 0, scale: 0.6}}
            animate={{opacity: 1, scale: 1}}
            transition={{duration: 0.6, delay: delay * 0.1}}
        >
            <motion.div
                className={`size-12 md:size-14 rounded-full border shadow-sm flex items-center justify-center ${toneStyles[tone]}`}
                animate={{y: [0, -10, 0]}}
                transition={{
                    duration: 4 + delay * 0.4,
                    repeat: Infinity,
                    ease: "easeInOut",
                    delay: delay * 0.3,
                }}
            >
                {children}
            </motion.div>
        </motion.div>
    );
}

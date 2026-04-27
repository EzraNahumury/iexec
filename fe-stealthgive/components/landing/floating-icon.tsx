"use client";

import {motion} from "framer-motion";
import Image from "next/image";

type Props = {
    /** Grid column (1-based) the icon sits in. */
    col: number;
    /** Grid row (1-based) the icon sits in. */
    row: number;
    /** Bobble delay in seconds — stagger neighbours so they don't sync. */
    delay?: number;
    /** Optional size multiplier (1 = normal, 0.85 = small, 1.15 = large). */
    scale?: number;
};

/**
 * One Arbitrum-branded chip in the hero grid background. Floats gently with
 * a staggered delay so neighbours don't sync up.
 */
export function FloatingIcon({col, row, delay = 0, scale = 1}: Props) {
    const size = `${Math.round(56 * scale)}px`;

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
                className="rounded-full bg-white border border-zinc-200 shadow-sm flex items-center justify-center p-2.5"
                style={{width: size, height: size}}
                animate={{y: [0, -10, 0]}}
                transition={{
                    duration: 4 + delay * 0.4,
                    repeat: Infinity,
                    ease: "easeInOut",
                    delay: delay * 0.3,
                }}
            >
                <Image
                    src="/arbitrum.png"
                    alt=""
                    width={48}
                    height={48}
                    className="size-full object-contain"
                    aria-hidden
                />
            </motion.div>
        </motion.div>
    );
}

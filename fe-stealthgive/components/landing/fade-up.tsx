"use client";

import {motion, useReducedMotion} from "framer-motion";
import type {ReactNode} from "react";

/**
 * Tiny wrapper that fades content up into view on scroll, respecting the
 * user's `prefers-reduced-motion` setting.
 */
export function FadeUp({
    children,
    delay = 0,
    className = "",
}: {
    children: ReactNode;
    delay?: number;
    className?: string;
}) {
    const reduce = useReducedMotion();
    return (
        <motion.div
            initial={reduce ? {opacity: 1, y: 0} : {opacity: 0, y: 32}}
            whileInView={{opacity: 1, y: 0}}
            viewport={{once: true, margin: "-80px"}}
            transition={{duration: 0.7, delay, ease: [0.22, 0.61, 0.36, 1]}}
            className={className}
        >
            {children}
        </motion.div>
    );
}

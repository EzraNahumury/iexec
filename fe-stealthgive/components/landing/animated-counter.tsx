"use client";

import {motion, useInView, useMotionValue, useSpring, useTransform} from "framer-motion";
import {useEffect, useRef} from "react";

/**
 * Animates a numeric value from 0 → `to` when scrolled into view. Strings
 * that contain non-numeric characters (e.g. "1:1") fade in from below
 * without counting because there is no meaningful tween.
 */
export function AnimatedCounter({
    value,
    className,
    duration = 1.4,
}: {
    value: string;
    className?: string;
    duration?: number;
}) {
    const ref = useRef<HTMLSpanElement>(null);
    const inView = useInView(ref, {once: true, margin: "-80px"});

    // Detect numeric vs non-numeric (e.g. "1:1") — only count up the former.
    const numeric = /^\d+$/.test(value) ? parseInt(value, 10) : null;

    const motionValue = useMotionValue(0);
    const spring = useSpring(motionValue, {
        duration: duration * 1000,
        bounce: 0,
    });
    const display = useTransform(spring, latest => Math.round(latest).toString());

    useEffect(() => {
        if (!inView || numeric === null) return;
        motionValue.set(numeric);
    }, [inView, numeric, motionValue]);

    if (numeric === null) {
        return (
            <motion.span
                ref={ref}
                initial={{opacity: 0, y: 8}}
                animate={inView ? {opacity: 1, y: 0} : undefined}
                transition={{duration: 0.6, ease: [0.22, 0.61, 0.36, 1]}}
                className={className}
            >
                {value}
            </motion.span>
        );
    }

    return (
        <span ref={ref} className={className}>
            <motion.span>{display}</motion.span>
        </span>
    );
}

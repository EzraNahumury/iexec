"use client";

import {ArrowUpRight} from "lucide-react";
import Link from "next/link";
import {motion} from "framer-motion";
import type {ReactNode} from "react";

type Props = {
    href: string;
    children: ReactNode;
    variant?: "dark" | "outline";
    size?: "md" | "lg";
};

/**
 * Black pill CTA with an arrow that translates on hover. The same component
 * works for both inline header buttons and big hero CTAs via the `size` prop.
 */
export function PillButton({href, children, variant = "dark", size = "md"}: Props) {
    const base =
        size === "lg"
            ? "px-7 py-3.5 text-sm tracking-[0.16em]"
            : "px-5 py-2.5 text-xs tracking-[0.16em]";

    const tone =
        variant === "dark"
            ? "bg-zinc-900 text-white hover:bg-zinc-800"
            : "bg-white text-zinc-900 border border-zinc-300 hover:border-zinc-500";

    return (
        <Link href={href} className="inline-block group">
            <motion.span
                whileHover={{scale: 1.02}}
                whileTap={{scale: 0.98}}
                className={`inline-flex items-center gap-3 rounded-full font-semibold uppercase transition-colors ${base} ${tone}`}
            >
                {children}
                <span
                    className={`inline-flex items-center justify-center size-7 rounded-full border ${
                        variant === "dark"
                            ? "border-white/20 group-hover:border-white/40"
                            : "border-zinc-300 group-hover:border-zinc-500"
                    } transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5`}
                >
                    <ArrowUpRight className="size-3.5" />
                </span>
            </motion.span>
        </Link>
    );
}

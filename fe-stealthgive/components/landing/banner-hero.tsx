"use client";

import {ArrowUpRight} from "lucide-react";
import {motion} from "framer-motion";
import Image from "next/image";
import Link from "next/link";

/**
 * Hero treatment for the landing page: the dark banner image becomes the
 * full hero card. Headline / subheading / CTAs are overlaid on the
 * (intentionally empty) left side of the artwork in white.
 *
 * On narrow screens the artwork takes the full width and the text overlay
 * sits at the bottom-left so it never collides with the robot illustration
 * on the right.
 */
export function BannerHero() {
    return (
        <motion.div
            initial={{opacity: 0, y: 32, scale: 0.98}}
            animate={{opacity: 1, y: 0, scale: 1}}
            transition={{duration: 0.9, ease: [0.22, 0.61, 0.36, 1]}}
            className="relative rounded-3xl overflow-hidden border border-zinc-200 shadow-[0_30px_80px_-20px_rgba(0,0,0,0.35)] bg-zinc-950"
        >
            {/* Background banner */}
            <Image
                src="/image.png"
                alt=""
                width={1920}
                height={1080}
                className="w-full h-auto block select-none"
                priority
            />

            {/* Subtle left-to-right gradient so white text on the left side
                stays legible without dimming the robot art on the right. */}
            <div
                className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/30 to-transparent pointer-events-none"
                aria-hidden
            />

            {/* Text overlay */}
            <div className="absolute inset-0 flex items-center">
                <div className="px-6 sm:px-10 md:px-14 lg:px-20 max-w-3xl">
                    <motion.h1
                        initial={{opacity: 0, y: 16}}
                        animate={{opacity: 1, y: 0}}
                        transition={{duration: 0.7, delay: 0.2}}
                        className="text-white text-3xl sm:text-5xl md:text-6xl lg:text-7xl leading-[1.05] tracking-tight"
                    >
                        Give to the causes that{" "}
                        <span className="font-serif italic font-light">cannot be doxxed</span>
                    </motion.h1>

                    <motion.p
                        initial={{opacity: 0, y: 12}}
                        animate={{opacity: 1, y: 0}}
                        transition={{duration: 0.6, delay: 0.4}}
                        className="mt-5 md:mt-7 text-sm sm:text-base md:text-lg text-white/80 max-w-md leading-relaxed"
                    >
                        StealthGive is confidential crowdfunding on iExec Nox. Donor amounts are
                        encrypted in a TEE; campaign totals stay publicly verifiable.
                    </motion.p>

                    <motion.div
                        initial={{opacity: 0, y: 12}}
                        animate={{opacity: 1, y: 0}}
                        transition={{duration: 0.6, delay: 0.55}}
                        className="mt-7 md:mt-10 flex flex-wrap items-center gap-4"
                    >
                        {/* Launch App — subtle continuous breathing + shimmer sweep */}
                        <motion.div
                            whileHover={{scale: 1.04}}
                            whileTap={{scale: 0.97}}
                            className="relative"
                        >
                            <motion.span
                                className="absolute -inset-1 rounded-full bg-white/40 blur-md -z-10"
                                animate={{opacity: [0.3, 0.7, 0.3], scale: [1, 1.08, 1]}}
                                transition={{duration: 2.6, repeat: Infinity, ease: "easeInOut"}}
                                aria-hidden
                            />
                            <Link
                                href="/welcome"
                                className="group relative inline-flex items-center gap-3 rounded-full bg-white text-zinc-900 hover:bg-zinc-100 px-6 py-3 text-xs font-semibold tracking-[0.16em] uppercase transition-colors shadow-lg overflow-hidden"
                            >
                                {/* Shimmer sweep */}
                                <motion.span
                                    className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/60 to-transparent skew-x-12"
                                    animate={{x: ["-100%", "200%"]}}
                                    transition={{
                                        duration: 1.8,
                                        repeat: Infinity,
                                        repeatDelay: 2.5,
                                        ease: "easeInOut",
                                    }}
                                    aria-hidden
                                />
                                <span className="relative">Launch App</span>
                                <motion.span
                                    className="relative inline-flex items-center justify-center size-7 rounded-full border border-zinc-300 group-hover:border-zinc-500"
                                    animate={{rotate: [0, 8, 0]}}
                                    transition={{
                                        duration: 1.8,
                                        repeat: Infinity,
                                        repeatDelay: 1.2,
                                        ease: "easeInOut",
                                    }}
                                >
                                    <ArrowUpRight className="size-3.5" />
                                </motion.span>
                            </Link>
                        </motion.div>

                        {/* How it works — bouncing arrow */}
                        <Link
                            href="#how-it-works"
                            className="group text-xs uppercase tracking-[0.18em] text-white/80 hover:text-white transition-colors inline-flex items-center gap-2"
                        >
                            How it works
                            <motion.span
                                className="inline-block"
                                animate={{x: [0, 4, 0], y: [0, -4, 0]}}
                                transition={{
                                    duration: 1.4,
                                    repeat: Infinity,
                                    ease: "easeInOut",
                                }}
                            >
                                <ArrowUpRight className="size-3.5" />
                            </motion.span>
                        </Link>
                    </motion.div>
                </div>
            </div>
        </motion.div>
    );
}

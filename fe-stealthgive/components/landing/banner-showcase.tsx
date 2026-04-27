"use client";

import {motion} from "framer-motion";
import Image from "next/image";

/**
 * Hero banner showcase — full-width 1920×1080 image that rises into the
 * page on scroll. Isolated as a client component so the rest of `app/page`
 * can stay a Server Component.
 */
export function BannerShowcase() {
    return (
        <motion.div
            initial={{opacity: 0, y: 40, scale: 0.96}}
            whileInView={{opacity: 1, y: 0, scale: 1}}
            viewport={{once: true, margin: "-100px"}}
            transition={{duration: 0.9, ease: [0.22, 0.61, 0.36, 1]}}
            className="relative rounded-3xl overflow-hidden shadow-[0_30px_80px_-20px_rgba(0,0,0,0.25)] border border-zinc-200 bg-zinc-900"
        >
            <Image
                src="/image.png"
                alt="StealthGive — confidential crowdfunding banner"
                width={1920}
                height={1080}
                className="w-full h-auto block"
                priority
            />
        </motion.div>
    );
}

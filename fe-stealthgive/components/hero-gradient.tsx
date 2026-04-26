/**
 * Deterministic gradient banner derived from a string (typically the campaign
 * address). Avoids needing to host hero images while still giving each
 * campaign a unique visual identity.
 */
function hash(input: string): number {
    let h = 0;
    for (let i = 0; i < input.length; i++) {
        h = (h << 5) - h + input.charCodeAt(i);
        h |= 0;
    }
    return Math.abs(h);
}

const palettes = [
    "from-violet-600 via-fuchsia-500 to-pink-500",
    "from-blue-600 via-cyan-500 to-teal-400",
    "from-emerald-600 via-green-500 to-lime-400",
    "from-amber-500 via-orange-500 to-red-500",
    "from-indigo-600 via-purple-500 to-pink-500",
    "from-rose-600 via-pink-500 to-fuchsia-500",
    "from-sky-600 via-blue-500 to-indigo-500",
];

export function HeroGradient({seed, className = ""}: {seed: string; className?: string}) {
    const palette = palettes[hash(seed) % palettes.length];
    return (
        <div
            className={`relative overflow-hidden rounded-2xl bg-gradient-to-br ${palette} ${className}`}
        >
            <div className="absolute inset-0 opacity-30 mix-blend-overlay">
                <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
                    <defs>
                        <pattern
                            id={`grid-${seed.slice(2, 8)}`}
                            width="40"
                            height="40"
                            patternUnits="userSpaceOnUse"
                        >
                            <path
                                d="M 40 0 L 0 0 0 40"
                                fill="none"
                                stroke="white"
                                strokeWidth="0.5"
                            />
                        </pattern>
                    </defs>
                    <rect width="100%" height="100%" fill={`url(#grid-${seed.slice(2, 8)})`} />
                </svg>
            </div>
            <div className="absolute inset-0 bg-gradient-to-t from-zinc-950/80 via-zinc-950/20 to-transparent" />
        </div>
    );
}

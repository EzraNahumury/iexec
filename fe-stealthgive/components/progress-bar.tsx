type Props = {
    percent: number; // 0–100
    accent?: "violet" | "emerald" | "amber";
};

export function ProgressBar({percent, accent = "violet"}: Props) {
    const clamped = Math.min(100, Math.max(0, percent));
    const fill =
        accent === "emerald"
            ? "bg-gradient-to-r from-emerald-500 to-emerald-300"
            : accent === "amber"
            ? "bg-gradient-to-r from-amber-500 to-amber-300"
            : "bg-gradient-to-r from-violet-600 to-fuchsia-400";

    return (
        <div className="h-2 w-full rounded-full bg-zinc-800/80 overflow-hidden">
            <div
                className={`h-full rounded-full transition-all duration-700 ${fill}`}
                style={{width: `${clamped}%`}}
            />
        </div>
    );
}

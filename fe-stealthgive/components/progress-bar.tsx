type Props = {
    percent: number; // 0–100
    accent?: "zinc" | "emerald";
};

export function ProgressBar({percent, accent = "zinc"}: Props) {
    const clamped = Math.min(100, Math.max(0, percent));
    const fill =
        accent === "emerald"
            ? "bg-gradient-to-r from-emerald-600 to-emerald-400"
            : "bg-gradient-to-r from-zinc-900 to-zinc-700";

    // For tiny but non-zero progress, use a minimum width so the fill is
    // still legible as a small nub rather than being clipped to invisible.
    const showsAnything = clamped > 0;
    const widthStyle = showsAnything
        ? {width: `max(8px, ${clamped}%)`}
        : {width: "0%"};

    return (
        <div className="h-2 w-full rounded-full bg-zinc-100 overflow-hidden">
            <div
                className={`h-full rounded-full transition-all duration-700 ${fill}`}
                style={widthStyle}
            />
        </div>
    );
}

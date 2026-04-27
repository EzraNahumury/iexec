const palette: Record<number, {label: string; classes: string}> = {
    0: {label: "Active", classes: "bg-emerald-500/10 text-emerald-300 border border-emerald-500/30"},
    1: {label: "Settling", classes: "bg-amber-500/10 text-amber-300 border border-amber-500/30"},
    2: {label: "Withdrawn", classes: "bg-zinc-500/10 text-zinc-700 border border-zinc-500/30"},
    3: {label: "Refunding", classes: "bg-red-500/10 text-red-300 border border-red-500/30"},
};

export function StatusBadge({state}: {state: number}) {
    const {label, classes} = palette[state] ?? palette[0];
    return (
        <span
            className={`inline-flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-full ${classes}`}
        >
            <span className="size-1.5 rounded-full bg-current" />
            {label}
        </span>
    );
}

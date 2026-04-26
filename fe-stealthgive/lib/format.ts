import {formatUnits} from "viem";

export function formatSGD(value?: bigint, options?: {compact?: boolean}): string {
    if (value === undefined || value === null) return "—";
    const n = Number(formatUnits(value, 6));
    if (options?.compact && n >= 1_000) {
        if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
        if (n >= 1_000) return `${(n / 1_000).toFixed(1)}k`;
    }
    return n.toLocaleString("en-US", {maximumFractionDigits: 2});
}

export function shortAddress(address?: string, head = 6, tail = 4): string {
    if (!address) return "—";
    if (address.length <= head + tail + 2) return address;
    return `${address.slice(0, head)}…${address.slice(-tail)}`;
}

export function formatCountdown(deadlineMs: number): {
    label: string;
    expired: boolean;
} {
    const now = Date.now();
    const diffMs = deadlineMs - now;
    if (diffMs <= 0) return {label: "Ended", expired: true};

    const days = Math.floor(diffMs / 86_400_000);
    const hours = Math.floor((diffMs % 86_400_000) / 3_600_000);
    const minutes = Math.floor((diffMs % 3_600_000) / 60_000);

    if (days >= 1) return {label: `${days}d ${hours}h left`, expired: false};
    if (hours >= 1) return {label: `${hours}h ${minutes}m left`, expired: false};
    return {label: `${minutes}m left`, expired: false};
}

export function formatPercent(part: bigint, whole: bigint): number {
    if (whole === 0n) return 0;
    // 6-decimal SGD math; do everything in number space safely after scaling down.
    const ratio = Number(part) / Number(whole);
    return Math.min(100, Math.max(0, ratio * 100));
}

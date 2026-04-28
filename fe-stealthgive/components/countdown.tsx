"use client";

import {Clock} from "lucide-react";
import {useEffect, useState} from "react";

import {formatCountdown} from "@/lib/format";

export function Countdown({deadlineMs, className = ""}: {deadlineMs: number; className?: string}) {
    const [tick, setTick] = useState(0);

    useEffect(() => {
        const id = setInterval(() => setTick(t => t + 1), 60_000); // refresh per minute
        return () => clearInterval(id);
    }, []);

    const {label, expired} = formatCountdown(deadlineMs);
    void tick; // satisfy lint

    return (
        <span
            className={`inline-flex items-center gap-1.5 ${
                expired ? "text-amber-600" : ""
            } ${className}`}
        >
            <Clock className="size-3.5" />
            {label}
        </span>
    );
}

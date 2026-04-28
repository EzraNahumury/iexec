"use client";

import {useEffect, useRef} from "react";

type Theme = "dark" | "light";

type Props = {
    /** "dark" = white nodes/lines (for dark backgrounds), "light" = zinc strokes (for white bg). */
    theme?: Theme;
    /** Lower density variant for hero areas. Default 240. */
    density?: number;
    /** Velocity scale; default 2.6. */
    speed?: number;
    /** Connection distance threshold in px; default 80. */
    connectDist?: number;
};

/**
 * Animated network visualisation: a swarm of nodes drifts inside the
 * canvas, with lines drawn between any pair that are close enough.
 * Renders on the GPU via Canvas2D + requestAnimationFrame so it stays at
 * 60fps even with many nodes.
 *
 * Used as background motion in two places:
 *   - dark theme: hero "Confidential DeFi crowdfunding" section
 *   - light theme: welcome page hero behind the 3 path-chip icons
 */
export function NetworkCanvas({
    theme = "dark",
    density = 240,
    speed = 2.6,
    connectDist = 80,
}: Props = {}) {
    const canvasRef = useRef<HTMLCanvasElement>(null);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext("2d");
        if (!ctx) return;

        let dpr = window.devicePixelRatio || 1;
        const resize = () => {
            dpr = window.devicePixelRatio || 1;
            const rect = canvas.getBoundingClientRect();
            canvas.width = rect.width * dpr;
            canvas.height = rect.height * dpr;
            ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
        };
        resize();
        window.addEventListener("resize", resize);

        type Node = {x: number; y: number; vx: number; vy: number; r: number};
        const nodes: Node[] = Array.from({length: density}, () => {
            const rect = canvas.getBoundingClientRect();
            return {
                x: Math.random() * rect.width,
                y: Math.random() * rect.height,
                vx: (Math.random() - 0.5) * speed,
                vy: (Math.random() - 0.5) * speed,
                r: 0.8 + Math.random() * 1.3,
            };
        });

        // Theme-specific stroke / fill RGB strings.
        const lineRgb = theme === "light" ? "24,24,27" : "255,255,255"; // zinc-900 vs white
        const nodeFill =
            theme === "light" ? "rgba(24,24,27,0.85)" : "rgba(255,255,255,0.95)";
        const lineMaxAlpha = theme === "light" ? 0.35 : 0.55;

        let raf = 0;
        const draw = () => {
            const rect = canvas.getBoundingClientRect();
            const w = rect.width;
            const h = rect.height;
            ctx.clearRect(0, 0, w, h);

            for (const n of nodes) {
                n.x += n.vx;
                n.y += n.vy;
                if (n.x < 0 || n.x > w) n.vx *= -1;
                if (n.y < 0 || n.y > h) n.vy *= -1;
            }

            ctx.lineWidth = 0.6;
            for (let i = 0; i < nodes.length; i++) {
                for (let j = i + 1; j < nodes.length; j++) {
                    const a = nodes[i];
                    const b = nodes[j];
                    const dx = a.x - b.x;
                    const dy = a.y - b.y;
                    const dist = Math.hypot(dx, dy);
                    if (dist < connectDist) {
                        const alpha = (1 - dist / connectDist) * lineMaxAlpha;
                        ctx.strokeStyle = `rgba(${lineRgb},${alpha})`;
                        ctx.beginPath();
                        ctx.moveTo(a.x, a.y);
                        ctx.lineTo(b.x, b.y);
                        ctx.stroke();
                    }
                }
            }

            for (const n of nodes) {
                ctx.fillStyle = nodeFill;
                ctx.beginPath();
                ctx.arc(n.x, n.y, n.r, 0, Math.PI * 2);
                ctx.fill();
            }

            raf = requestAnimationFrame(draw);
        };
        raf = requestAnimationFrame(draw);

        return () => {
            cancelAnimationFrame(raf);
            window.removeEventListener("resize", resize);
        };
    }, [theme, density, speed, connectDist]);

    return (
        <canvas
            ref={canvasRef}
            className="absolute inset-0 w-full h-full pointer-events-none"
            aria-hidden
        />
    );
}

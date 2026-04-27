"use client";

import {useEffect, useRef} from "react";

/**
 * Animated network visualisation: a swarm of nodes drifts inside the
 * canvas, with lines drawn between any pair that are close enough.
 * Renders on the GPU via Canvas2D + requestAnimationFrame so it stays at
 * 60fps even with 60+ nodes.
 *
 * Used in the landing "Confidential DeFi crowdfunding native to Arbitrum"
 * section as the visual companion to the headline. The black background
 * and ENCRYPTED ON CHAIN caption are kept; this component just replaces
 * the static dot grid with motion.
 */
export function NetworkCanvas() {
    const canvasRef = useRef<HTMLCanvasElement>(null);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext("2d");
        if (!ctx) return;

        // Resize handler — keep canvas pixel-perfect on high-DPR screens.
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

        // Seed nodes with a deterministic-feeling spread.
        const NODE_COUNT = 64;
        const CONNECT_DIST = 110;
        type Node = {x: number; y: number; vx: number; vy: number; r: number};
        const nodes: Node[] = Array.from({length: NODE_COUNT}, () => {
            const rect = canvas.getBoundingClientRect();
            return {
                x: Math.random() * rect.width,
                y: Math.random() * rect.height,
                vx: (Math.random() - 0.5) * 0.35,
                vy: (Math.random() - 0.5) * 0.35,
                r: 1 + Math.random() * 1.5,
            };
        });

        let raf = 0;
        const draw = () => {
            const rect = canvas.getBoundingClientRect();
            const w = rect.width;
            const h = rect.height;
            ctx.clearRect(0, 0, w, h);

            // Update node positions & bounce off edges.
            for (const n of nodes) {
                n.x += n.vx;
                n.y += n.vy;
                if (n.x < 0 || n.x > w) n.vx *= -1;
                if (n.y < 0 || n.y > h) n.vy *= -1;
            }

            // Draw connections — opacity falls off with distance.
            ctx.lineWidth = 0.6;
            for (let i = 0; i < nodes.length; i++) {
                for (let j = i + 1; j < nodes.length; j++) {
                    const a = nodes[i];
                    const b = nodes[j];
                    const dx = a.x - b.x;
                    const dy = a.y - b.y;
                    const dist = Math.hypot(dx, dy);
                    if (dist < CONNECT_DIST) {
                        const alpha = (1 - dist / CONNECT_DIST) * 0.55;
                        ctx.strokeStyle = `rgba(255,255,255,${alpha})`;
                        ctx.beginPath();
                        ctx.moveTo(a.x, a.y);
                        ctx.lineTo(b.x, b.y);
                        ctx.stroke();
                    }
                }
            }

            // Draw nodes — slightly brighter centre.
            for (const n of nodes) {
                ctx.fillStyle = "rgba(255,255,255,0.95)";
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
    }, []);

    return (
        <canvas
            ref={canvasRef}
            className="absolute inset-0 w-full h-full"
            aria-hidden
        />
    );
}

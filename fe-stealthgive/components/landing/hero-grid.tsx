"use client";

import {FloatingIcon} from "./floating-icon";

/**
 * Hero background: a faint 16×6 grid with Arbitrum logo chips scattered in
 * specific cells. Every chip floats independently with a staggered delay
 * for a subtle "alive" feel without distracting from the headline.
 *
 * Layout note: the grid uses CSS grid for placement, but each FloatingIcon
 * is absolutely-positioned inside it via `gridColumnStart` / `gridRowStart`.
 * That lets the same component drop in anywhere with no flow shifting.
 */
export function HeroGrid() {
    // Each entry is a chip placement: column, row, animation delay, optional
    // size scale. Sizes vary slightly so the layer looks organic instead of
    // a uniform wallpaper.
    const placements: {col: number; row: number; delay: number; scale?: number}[] = [
        {col: 2, row: 1, delay: 0},
        {col: 6, row: 1, delay: 1, scale: 1.1},
        {col: 11, row: 1, delay: 2},
        {col: 14, row: 1, delay: 3, scale: 0.9},

        {col: 4, row: 2, delay: 4, scale: 1.1},
        {col: 9, row: 2, delay: 5, scale: 0.9},
        {col: 13, row: 2, delay: 6},
        {col: 16, row: 2, delay: 7, scale: 0.85},

        {col: 1, row: 3, delay: 8, scale: 1.1},
        {col: 5, row: 3, delay: 9},
        {col: 10, row: 3, delay: 10, scale: 0.9},
        {col: 13, row: 3, delay: 11, scale: 1.1},

        {col: 3, row: 4, delay: 12, scale: 0.9},
        {col: 7, row: 4, delay: 13},
        {col: 12, row: 4, delay: 14},
        {col: 15, row: 4, delay: 15, scale: 1.1},

        {col: 2, row: 5, delay: 16, scale: 1.05},
        {col: 11, row: 5, delay: 17, scale: 0.9},
        {col: 14, row: 5, delay: 18},

        {col: 1, row: 6, delay: 19, scale: 0.85},
        {col: 9, row: 6, delay: 20, scale: 1.1},
        {col: 16, row: 6, delay: 21},
    ];

    return (
        <div className="absolute inset-0 overflow-hidden">
            {/* Static grid lines */}
            <div className="absolute inset-0 bg-grid" aria-hidden />
            {/* Soft white-out around the headline so text stays legible */}
            <div
                className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_0%,white_70%)]"
                aria-hidden
            />

            {/* Floating Arbitrum chips */}
            <div
                className="absolute inset-0 grid pointer-events-none"
                style={{
                    gridTemplateColumns: "repeat(16, minmax(0, 1fr))",
                    gridTemplateRows: "repeat(6, minmax(96px, 1fr))",
                    padding: "48px 32px",
                }}
            >
                {placements.map(p => (
                    <FloatingIcon
                        key={`${p.col}-${p.row}`}
                        col={p.col}
                        row={p.row}
                        delay={p.delay}
                        scale={p.scale}
                    />
                ))}
            </div>
        </div>
    );
}

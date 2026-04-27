"use client";

import {Eye, EyeOff, Globe, Lock, Send, Shield, ShieldCheck, Sparkles, Wallet, Zap} from "lucide-react";

import {FloatingIcon} from "./floating-icon";

/**
 * Hero background: a faint 16×6 grid with brand-chip icons scattered in
 * specific cells. Every icon floats independently for a subtle "alive" feel
 * without distracting from the headline that overlays the grid.
 *
 * Layout note: the grid uses CSS grid for placement, but each FloatingIcon
 * is absolutely-positioned inside it via `gridColumnStart` / `gridRowStart`.
 * That lets the same component drop in anywhere with no flow shifting.
 */
export function HeroGrid() {
    return (
        <div className="absolute inset-0 overflow-hidden">
            {/* Static grid lines */}
            <div className="absolute inset-0 bg-grid" aria-hidden />
            {/* Soft white-out around the headline so text stays legible */}
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_0%,white_70%)]" aria-hidden />

            {/* Floating icons grid layer */}
            <div
                className="absolute inset-0 grid pointer-events-none"
                style={{
                    gridTemplateColumns: "repeat(16, minmax(0, 1fr))",
                    gridTemplateRows: "repeat(6, minmax(96px, 1fr))",
                    padding: "48px 32px",
                }}
            >
                <FloatingIcon col={2} row={1} tone="neutral" delay={0}>
                    <Lock className="size-5" />
                </FloatingIcon>
                <FloatingIcon col={6} row={1} tone="violet" delay={1}>
                    <Sparkles className="size-5" />
                </FloatingIcon>
                <FloatingIcon col={11} row={1} tone="neutral" delay={2}>
                    <Shield className="size-5" />
                </FloatingIcon>
                <FloatingIcon col={14} row={1} tone="emerald" delay={3}>
                    <Zap className="size-5" />
                </FloatingIcon>

                <FloatingIcon col={4} row={2} tone="rose" delay={4}>
                    <ShieldCheck className="size-5" />
                </FloatingIcon>
                <FloatingIcon col={9} row={2} tone="neutral" delay={5}>
                    <EyeOff className="size-5" />
                </FloatingIcon>
                <FloatingIcon col={13} row={2} tone="neutral" delay={6}>
                    <Wallet className="size-5" />
                </FloatingIcon>
                <FloatingIcon col={16} row={2} tone="neutral" delay={7}>
                    <Lock className="size-5" />
                </FloatingIcon>

                <FloatingIcon col={1} row={3} tone="emerald" delay={8}>
                    <Zap className="size-5" />
                </FloatingIcon>
                <FloatingIcon col={5} row={3} tone="violet" delay={9}>
                    <Sparkles className="size-5" />
                </FloatingIcon>
                <FloatingIcon col={10} row={3} tone="neutral" delay={10}>
                    <Globe className="size-5" />
                </FloatingIcon>
                <FloatingIcon col={13} row={3} tone="rose" delay={11}>
                    <Send className="size-5" />
                </FloatingIcon>

                <FloatingIcon col={3} row={4} tone="neutral" delay={12}>
                    <Eye className="size-5" />
                </FloatingIcon>
                <FloatingIcon col={7} row={4} tone="neutral" delay={13}>
                    <Lock className="size-5" />
                </FloatingIcon>
                <FloatingIcon col={12} row={4} tone="neutral" delay={14}>
                    <ShieldCheck className="size-5" />
                </FloatingIcon>
                <FloatingIcon col={15} row={4} tone="violet" delay={15}>
                    <Sparkles className="size-5" />
                </FloatingIcon>

                <FloatingIcon col={2} row={5} tone="rose" delay={16}>
                    <Send className="size-5" />
                </FloatingIcon>
                <FloatingIcon col={11} row={5} tone="neutral" delay={17}>
                    <EyeOff className="size-5" />
                </FloatingIcon>
                <FloatingIcon col={14} row={5} tone="emerald" delay={18}>
                    <Zap className="size-5" />
                </FloatingIcon>

                <FloatingIcon col={1} row={6} tone="neutral" delay={19}>
                    <Wallet className="size-5" />
                </FloatingIcon>
                <FloatingIcon col={9} row={6} tone="violet" delay={20}>
                    <Sparkles className="size-5" />
                </FloatingIcon>
                <FloatingIcon col={16} row={6} tone="neutral" delay={21}>
                    <Globe className="size-5" />
                </FloatingIcon>
            </div>
        </div>
    );
}

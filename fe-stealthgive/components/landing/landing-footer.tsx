import Link from "next/link";

const navLinks = [
    {label: "Home", href: "/"},
    {label: "Browse", href: "/campaigns"},
    {label: "Welcome", href: "/welcome"},
    {label: "Audit", href: "/audit"},
];

const docsLinks = [
    {label: "iExec Nox", href: "https://docs.iex.ec/nox-protocol/getting-started/welcome"},
    {label: "ChainGPT", href: "https://chaingpt.org"},
    {label: "GitHub", href: "https://github.com/EzraNahumury/iexec"},
    {label: "Feedback.md", href: "https://github.com/EzraNahumury/iexec/blob/main/feedback.md"},
];

export function LandingFooter() {
    return (
        <footer className="border-t border-zinc-200">
            <div className="max-w-7xl mx-auto px-6 py-12 grid md:grid-cols-3 gap-10 items-start">
                <Link href="/" className="inline-flex items-center gap-2.5">
                    <span className="size-8 rounded-full bg-zinc-900 text-white inline-flex items-center justify-center text-sm">
                        🦑
                    </span>
                    <span className="font-semibold tracking-wide uppercase text-sm">StealthGive</span>
                </Link>

                <div className="grid grid-cols-2 gap-6 text-sm tracking-[0.18em] uppercase">
                    <div className="space-y-3">
                        {navLinks.map(l => (
                            <div key={l.href}>
                                <Link
                                    href={l.href}
                                    className="text-zinc-500 hover:text-zinc-900 transition-colors"
                                >
                                    {l.label}
                                </Link>
                            </div>
                        ))}
                    </div>
                    <div className="space-y-3">
                        {docsLinks.map(l => (
                            <div key={l.href}>
                                <a
                                    href={l.href}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="text-zinc-500 hover:text-zinc-900 transition-colors"
                                >
                                    {l.label}
                                </a>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="md:text-right text-sm">
                    <a
                        href="#top"
                        className="inline-flex items-center gap-1 text-zinc-500 hover:text-zinc-900 transition-colors"
                    >
                        Back to top ↑
                    </a>
                </div>
            </div>
            <div className="border-t border-zinc-100 py-4 text-center text-xs text-zinc-500">
                Built for the iExec Vibe Coding Challenge · April 2026 · MIT License
            </div>
        </footer>
    );
}

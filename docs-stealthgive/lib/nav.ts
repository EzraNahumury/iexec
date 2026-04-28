export type NavItem = {
    title: string;
    href: string;
};

export type NavSection = {
    title: string;
    items: NavItem[];
};

export const sidebarNav: NavSection[] = [
    {
        title: "Getting Started",
        items: [
            {title: "Introduction", href: "/"},
            {title: "Quick Start", href: "/getting-started/quick-start"},
            {title: "Architecture", href: "/getting-started/architecture"},
        ],
    },
    {
        title: "Smart Contracts",
        items: [
            {title: "Overview", href: "/contracts/overview"},
            {title: "StealthGive Contracts", href: "/contracts/stealthgive"},
            {title: "Deployment", href: "/contracts/deployment"},
        ],
    },
    {
        title: "Frontend",
        items: [
            {title: "Overview", href: "/frontend/overview"},
            {title: "Features", href: "/frontend/features"},
            {title: "Wallet Integration", href: "/frontend/wallet"},
        ],
    },
    {
        title: "Guides",
        items: [
            {title: "Setup", href: "/guides/setup"},
            {title: "Usage Flow", href: "/guides/usage"},
            {title: "FAQ", href: "/guides/faq"},
        ],
    },
];

/** Flat list for prev/next navigation. */
export const flatNav: NavItem[] = sidebarNav.flatMap(s => s.items);

import type {Metadata} from "next";
import {Fraunces, Geist, Instrument_Serif, JetBrains_Mono} from "next/font/google";

import "./globals.css";

const geistSans = Geist({
    variable: "--font-geist-sans",
    subsets: ["latin"],
});

const fraunces = Fraunces({
    variable: "--font-fraunces",
    subsets: ["latin"],
    axes: ["SOFT", "WONK", "opsz"],
    weight: "variable",
    style: ["normal", "italic"],
});

const instrumentSerif = Instrument_Serif({
    variable: "--font-instrument",
    subsets: ["latin"],
    weight: "400",
    style: ["normal", "italic"],
});

const jetbrains = JetBrains_Mono({
    variable: "--font-jetbrains",
    subsets: ["latin"],
    weight: ["400", "500"],
});

export const metadata: Metadata = {
    title: {
        default: "StealthGive — Dossier",
        template: "%s · StealthGive Dossier",
    },
    description:
        "A working manual for confidential crowdfunding on iExec Nox. Editorial documentation for the curious operator.",
};

export default function RootLayout({children}: Readonly<{children: React.ReactNode}>) {
    return (
        <html
            lang="en"
            className={`${geistSans.variable} ${fraunces.variable} ${instrumentSerif.variable} ${jetbrains.variable} h-full antialiased`}
        >
            <body className="min-h-full flex flex-col">{children}</body>
        </html>
    );
}

import type {Metadata} from "next";
import {Geist, Geist_Mono, Instrument_Serif} from "next/font/google";
import "./globals.css";

import {Header} from "@/components/header";
import {Providers} from "./providers";

const geistSans = Geist({
    variable: "--font-geist-sans",
    subsets: ["latin"],
});

const geistMono = Geist_Mono({
    variable: "--font-geist-mono",
    subsets: ["latin"],
});

const instrumentSerif = Instrument_Serif({
    variable: "--font-instrument-serif",
    subsets: ["latin"],
    weight: "400",
    style: ["normal", "italic"],
});

export const metadata: Metadata = {
    title: "StealthGive — Confidential Crowdfunding on iExec Nox",
    description:
        "Privacy-preserving crowdfunding for causes that cannot be doxxed. Per-donor amounts hidden, total raised verifiable.",
};

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html
            lang="en"
            className={`${geistSans.variable} ${geistMono.variable} ${instrumentSerif.variable} h-full antialiased`}
        >
            <body className="min-h-full flex flex-col bg-white text-zinc-900">
                <Providers>
                    <Header />
                    <main className="flex-1 flex flex-col">{children}</main>
                </Providers>
            </body>
        </html>
    );
}

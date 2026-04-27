"use client";

/**
 * Browser-local cache for AI-generated hero images, keyed by campaign address.
 *
 * Storing the image bytes in the on-chain `metadataURI` would balloon the
 * deploy gas (a 768×432 PNG is 100–300KB), so we keep them in localStorage
 * instead. The demo flow is:
 *
 *   1. /create page generates the image at creation time and saves it under
 *      the campaign address once the deploy receipt comes back.
 *   2. /campaigns and /campaigns/[address] read the cache and render it,
 *      falling back to the deterministic gradient if the entry is missing.
 *
 * This keeps the on-chain footprint small while still letting the creator's
 * browser (and the demo recording) show the AI-generated hero. A future
 * iteration can persist images to IPFS/Arweave for cross-device visibility.
 */

const PREFIX = "stealthgive:hero:";

export function loadHeroImage(campaignAddress: string): string | null {
    if (typeof window === "undefined") return null;
    try {
        return window.localStorage.getItem(PREFIX + campaignAddress.toLowerCase());
    } catch {
        return null;
    }
}

export function saveHeroImage(campaignAddress: string, dataUri: string): void {
    if (typeof window === "undefined") return;
    try {
        window.localStorage.setItem(PREFIX + campaignAddress.toLowerCase(), dataUri);
    } catch (err) {
        // Quota exceeded — drop silently. Hero image will fall back to gradient.
        console.warn("Failed to cache hero image:", err);
    }
}

export function clearHeroImage(campaignAddress: string): void {
    if (typeof window === "undefined") return;
    try {
        window.localStorage.removeItem(PREFIX + campaignAddress.toLowerCase());
    } catch {
        // ignore
    }
}

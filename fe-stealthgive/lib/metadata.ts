/**
 * Campaign metadata parser.
 *
 * Campaigns store metadata as a `data:application/json;base64,...` URI in the
 * `metadataURI` field of the on-chain Campaign contract. This lets the
 * contract stay storage-light while keeping rich metadata fully on chain (no
 * IPFS gateway dependency).
 */

export type CampaignMetadata = {
    title: string;
    story: string;
    createdAt?: number;
    heroImage?: string;
};

const FALLBACK_TITLE = "Untitled campaign";

export function parseMetadataURI(uri: string): CampaignMetadata {
    if (!uri) return {title: FALLBACK_TITLE, story: ""};

    // data:application/json;base64,<...>
    if (uri.startsWith("data:application/json;base64,")) {
        try {
            const b64 = uri.slice("data:application/json;base64,".length);
            const json = typeof window !== "undefined" ? atob(b64) : Buffer.from(b64, "base64").toString("utf-8");
            const parsed = JSON.parse(json) as Partial<CampaignMetadata>;
            return {
                title: parsed.title || FALLBACK_TITLE,
                story: parsed.story || "",
                createdAt: parsed.createdAt,
                heroImage: parsed.heroImage,
            };
        } catch {
            return {title: FALLBACK_TITLE, story: ""};
        }
    }

    // Plain JSON URI
    if (uri.startsWith("data:application/json,")) {
        try {
            const decoded = decodeURIComponent(uri.slice("data:application/json,".length));
            const parsed = JSON.parse(decoded) as Partial<CampaignMetadata>;
            return {
                title: parsed.title || FALLBACK_TITLE,
                story: parsed.story || "",
                createdAt: parsed.createdAt,
                heroImage: parsed.heroImage,
            };
        } catch {
            return {title: FALLBACK_TITLE, story: ""};
        }
    }

    // ipfs://… or https://… — show URI as fallback title until a fetch is wired up.
    return {title: uri, story: ""};
}

export function encodeMetadataURI(metadata: CampaignMetadata): string {
    const json = JSON.stringify(metadata);
    const b64 =
        typeof window !== "undefined" ? btoa(json) : Buffer.from(json, "utf-8").toString("base64");
    return `data:application/json;base64,${b64}`;
}

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

/**
 * Recover from the classic UTF-8-as-Latin-1 mojibake (e.g. "â—" → "—").
 * Older campaigns were encoded with bare btoa(json) which silently
 * truncated multi-byte characters; this re-interprets the corrupted
 * bytes as UTF-8 when the heuristic matches, otherwise returns the
 * input untouched.
 */
function recoverMojibake(s: string): string {
    if (!/[À-þ]/.test(s)) return s;
    try {
        const bytes = new Uint8Array(s.length);
        for (let i = 0; i < s.length; i++) {
            const code = s.charCodeAt(i);
            if (code > 0xff) return s;
            bytes[i] = code;
        }
        const decoded = new TextDecoder("utf-8", {fatal: true}).decode(bytes);
        return decoded;
    } catch {
        return s;
    }
}

function decodeBase64Utf8(b64: string): string {
    if (typeof window !== "undefined") {
        const bin = atob(b64);
        const bytes = new Uint8Array(bin.length);
        for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
        return new TextDecoder("utf-8").decode(bytes);
    }
    return Buffer.from(b64, "base64").toString("utf-8");
}

function encodeBase64Utf8(s: string): string {
    if (typeof window !== "undefined") {
        const bytes = new TextEncoder().encode(s);
        let bin = "";
        for (let i = 0; i < bytes.length; i++) bin += String.fromCharCode(bytes[i]);
        return btoa(bin);
    }
    return Buffer.from(s, "utf-8").toString("base64");
}

export function parseMetadataURI(uri: string): CampaignMetadata {
    if (!uri) return {title: FALLBACK_TITLE, story: ""};

    if (uri.startsWith("data:application/json;base64,")) {
        try {
            const b64 = uri.slice("data:application/json;base64,".length);
            let json: string;
            try {
                json = decodeBase64Utf8(b64);
            } catch {
                json = typeof window !== "undefined"
                    ? atob(b64)
                    : Buffer.from(b64, "base64").toString("utf-8");
            }
            const parsed = JSON.parse(json) as Partial<CampaignMetadata>;
            return {
                title: recoverMojibake(parsed.title || FALLBACK_TITLE),
                story: recoverMojibake(parsed.story || ""),
                createdAt: parsed.createdAt,
                heroImage: parsed.heroImage,
            };
        } catch {
            return {title: FALLBACK_TITLE, story: ""};
        }
    }

    if (uri.startsWith("data:application/json,")) {
        try {
            const decoded = decodeURIComponent(uri.slice("data:application/json,".length));
            const parsed = JSON.parse(decoded) as Partial<CampaignMetadata>;
            return {
                title: recoverMojibake(parsed.title || FALLBACK_TITLE),
                story: recoverMojibake(parsed.story || ""),
                createdAt: parsed.createdAt,
                heroImage: parsed.heroImage,
            };
        } catch {
            return {title: FALLBACK_TITLE, story: ""};
        }
    }

    return {title: uri, story: ""};
}

export function encodeMetadataURI(metadata: CampaignMetadata): string {
    const json = JSON.stringify(metadata);
    return `data:application/json;base64,${encodeBase64Utf8(json)}`;
}

import {NextResponse} from "next/server";

/**
 * POST /api/ai/generate-hero
 *
 * Generates a campaign hero image via the ChainGPT NFT/Image Generator.
 * Returns the image as a base64 `data:` URI suitable for direct rendering
 * (no external hosting / IPFS dependency needed for the demo).
 *
 * Body: `{ prompt: string }` — usually the campaign title or a 1-line cause
 * description. We prepend a Web3 fundraising visual style so the model
 * produces images that fit the StealthGive aesthetic.
 *
 * Required env: `CHAINGPT_API_KEY`.
 */

type Body = {
    prompt?: string;
};

const STYLE_PREFIX =
    "Editorial illustration for an on-chain confidential crowdfunding platform, " +
    "modern flat design with soft gradient lighting, deep violet and indigo " +
    "color palette, no text, no logos, no human faces visible. Subject:";

export async function POST(request: Request) {
    const apiKey = process.env.CHAINGPT_API_KEY;
    if (!apiKey) {
        return NextResponse.json(
            {error: "Server is missing CHAINGPT_API_KEY"},
            {status: 500},
        );
    }

    let body: Body;
    try {
        body = await request.json();
    } catch {
        return NextResponse.json({error: "Invalid JSON body"}, {status: 400});
    }

    const userPrompt = (body.prompt ?? "").trim();
    if (userPrompt.length < 4) {
        return NextResponse.json(
            {error: "Prompt must be at least 4 characters"},
            {status: 400},
        );
    }

    const fullPrompt = `${STYLE_PREFIX} ${userPrompt}`;

    let upstream: Response;
    try {
        upstream = await fetch("https://api.chaingpt.org/nft/generate-image", {
            method: "POST",
            headers: {
                Authorization: `Bearer ${apiKey}`,
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                model: "velogen",
                prompt: fullPrompt,
                width: 768,
                height: 432, // 16:9 banner aspect
                steps: 4,
                enhance: "original",
            }),
        });
    } catch (err) {
        return NextResponse.json(
            {error: "Failed to reach ChainGPT: " + (err as Error).message},
            {status: 502},
        );
    }

    if (!upstream.ok) {
        const text = await upstream.text();
        return NextResponse.json(
            {error: `ChainGPT responded ${upstream.status}: ${text.slice(0, 200)}`},
            {status: 502},
        );
    }

    // The image generator returns either a JSON envelope with a base64-encoded
    // image string, or raw image bytes depending on configuration. Handle both.
    const contentType = upstream.headers.get("content-type") ?? "";

    if (contentType.includes("application/json")) {
        const json = (await upstream.json()) as {data?: string | {data?: number[]}};
        // Variant 1: data is a string already (base64 or data URI)
        if (typeof json.data === "string") {
            const dataUri = json.data.startsWith("data:")
                ? json.data
                : `data:image/jpeg;base64,${json.data}`;
            return NextResponse.json({imageDataUri: dataUri});
        }
        // Variant 2: data is a Buffer-like object {type:"Buffer", data:[...]}
        if (json.data && Array.isArray((json.data as {data?: number[]}).data)) {
            const bytes = (json.data as {data: number[]}).data;
            const buf = Buffer.from(bytes);
            return NextResponse.json({
                imageDataUri: `data:image/jpeg;base64,${buf.toString("base64")}`,
            });
        }
        return NextResponse.json(
            {error: "Unexpected JSON response shape from ChainGPT image API"},
            {status: 502},
        );
    }

    // Raw binary response — read as ArrayBuffer, convert to base64.
    const buf = Buffer.from(await upstream.arrayBuffer());
    const mime = contentType.startsWith("image/") ? contentType : "image/jpeg";
    return NextResponse.json({
        imageDataUri: `data:${mime};base64,${buf.toString("base64")}`,
    });
}

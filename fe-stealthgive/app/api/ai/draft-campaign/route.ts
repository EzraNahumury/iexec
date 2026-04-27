import {NextResponse} from "next/server";

/**
 * POST /api/ai/draft-campaign
 *
 * Proxies a one-line user brief to the ChainGPT Web3 LLM and returns a
 * structured `{title, story}` object suitable for pre-filling the campaign
 * creation form.
 *
 * Why a server route (not direct from the browser):
 *   1. Keep the ChainGPT API key out of the client bundle.
 *   2. Apply server-side validation/throttling later.
 *   3. Centralise prompt engineering in one place.
 *
 * Required env: `CHAINGPT_API_KEY` in `.env.local`.
 */

type DraftRequest = {
    brief?: string;
};

type DraftResponse = {
    title: string;
    story: string;
};

const SYSTEM_INSTRUCTION = `You are a Web3 copywriting assistant for StealthGive — an on-chain confidential crowdfunding dApp deployed on Arbitrum and powered by iExec Nox confidential tokens (ERC-7984). Donations on this platform are encrypted client-side and settled via confidential transfers, so donor amounts stay private while the aggregate on-chain total remains publicly verifiable.

The user is creating a new on-chain fundraising campaign. Given their one-line cause description, write the campaign listing copy.

Output STRICTLY a JSON object with these two fields, nothing else:
- "title": a compelling, action-oriented title (max 60 characters)
- "story": three short paragraphs (~250 words total), emotionally resonant, written in second person, ending with a clear call-to-action that mentions donor privacy as a key benefit of donating on-chain via this dApp

Hard rules:
- Return ONLY the raw JSON object. No markdown code fences. No preamble. No commentary before or after.
- Do not invent statistics, dollar figures, or organisation names.
- Tone: serious, hopeful, plain language. No buzzwords, no hype.
- Frame the cause as worth funding through on-chain confidential donations.

Example output shape (literal — copy this structure):
{"title":"Press Freedom Legal Defense","story":"You believe a free press matters…\\n\\nWhen journalists cannot speak…\\n\\nYour confidential donation today…"}`;

/**
 * Tries hard to extract a JSON object from a possibly-noisy LLM response
 * (markdown fences, leading prose, trailing commentary, etc.).
 */
function extractJSON(raw: string): unknown {
    const trimmed = raw.trim();
    // Quick path: already JSON
    try {
        return JSON.parse(trimmed);
    } catch {
        // continue
    }
    // Find first '{' and last '}' as a coarse bracket match
    const start = trimmed.indexOf("{");
    const end = trimmed.lastIndexOf("}");
    if (start !== -1 && end > start) {
        const candidate = trimmed.slice(start, end + 1);
        try {
            return JSON.parse(candidate);
        } catch {
            // continue
        }
    }
    throw new Error("ChainGPT returned non-JSON output: " + raw.slice(0, 200));
}

export async function POST(request: Request) {
    const apiKey = process.env.CHAINGPT_API_KEY;
    if (!apiKey) {
        return NextResponse.json(
            {error: "Server is missing CHAINGPT_API_KEY. Add it to .env.local and restart the dev server."},
            {status: 500},
        );
    }

    let body: DraftRequest;
    try {
        body = await request.json();
    } catch {
        return NextResponse.json({error: "Invalid JSON body"}, {status: 400});
    }

    const brief = (body.brief ?? "").trim();
    if (brief.length < 4) {
        return NextResponse.json(
            {error: "Brief must be at least 4 characters"},
            {status: 400},
        );
    }
    if (brief.length > 500) {
        return NextResponse.json(
            {error: "Brief is too long (max 500 chars)"},
            {status: 400},
        );
    }

    const question = `${SYSTEM_INSTRUCTION}\n\nUser brief: ${brief}`;

    let upstream: Response;
    try {
        upstream = await fetch("https://api.chaingpt.org/chat/stream", {
            method: "POST",
            headers: {
                Authorization: `Bearer ${apiKey}`,
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                model: "general_assistant",
                question,
                chatHistory: "off",
            }),
        });
    } catch (err) {
        return NextResponse.json(
            {error: "Failed to reach ChainGPT: " + (err as Error).message},
            {status: 502},
        );
    }

    // The endpoint streams text; concatenate all chunks then parse.
    const text = await upstream.text();
    if (!upstream.ok) {
        return NextResponse.json(
            {error: `ChainGPT responded ${upstream.status}: ${text.slice(0, 200)}`},
            {status: 502},
        );
    }

    // ChainGPT may return either:
    //   1. A JSON envelope: {status,message,data:{bot:"…"}}
    //   2. Raw streamed text (already concatenated by .text())
    let botText = text;
    try {
        const envelope = JSON.parse(text) as {data?: {bot?: string}};
        if (envelope?.data?.bot) botText = envelope.data.bot;
    } catch {
        // assume raw text — fine
    }

    let parsed: DraftResponse;
    try {
        const obj = extractJSON(botText) as Partial<DraftResponse>;
        if (typeof obj.title !== "string" || typeof obj.story !== "string") {
            throw new Error("Missing title/story fields");
        }
        parsed = {title: obj.title.trim(), story: obj.story.trim()};
    } catch (err) {
        return NextResponse.json(
            {
                error: "Could not parse ChainGPT response: " + (err as Error).message,
                raw: botText.slice(0, 500),
            },
            {status: 502},
        );
    }

    return NextResponse.json(parsed);
}

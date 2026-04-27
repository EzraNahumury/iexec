import {NextResponse} from "next/server";

/**
 * POST /api/ai/impact-report
 *
 * Generates a narrative impact summary for a StealthGive campaign using its
 * publicly-known on-chain numbers (revealed aggregate total, donor count,
 * dates) plus its declared goal and title. This is the fourth ChainGPT
 * touchpoint described in the README — complementing campaign copy
 * generation, hero image generation, and contract auditing.
 *
 * The report is designed to be:
 *   - Privacy-preserving: never mentions or implies any individual donor.
 *   - Verifiable: every figure cited comes from the request body, which the
 *     caller derived from on-chain state (or a publicly-decrypted handle).
 *   - Shareable: written as a standalone narrative the campaign creator can
 *     post to their community after settlement.
 *
 * Body schema (all required unless marked optional):
 *   {
 *     title: string;
 *     goalCSGD: string;          // human-friendly figure, e.g. "10000"
 *     totalRaisedCSGD: string;   // revealed aggregate, e.g. "2350"
 *     donorCount: number;
 *     daysElapsed: number;       // since createdAt
 *     daysToDeadline: number;    // negative if past deadline
 *     state: "active" | "settling" | "withdrawn" | "refunding";
 *     settledISO?: string;
 *   }
 */

type Body = {
    title?: string;
    goalCSGD?: string;
    totalRaisedCSGD?: string;
    donorCount?: number;
    daysElapsed?: number;
    daysToDeadline?: number;
    state?: "active" | "settling" | "withdrawn" | "refunding";
    settledISO?: string;
};

const SYSTEM = `You are a Web3 storytelling assistant writing impact reports for confidential crowdfunding campaigns on the StealthGive dApp (built on iExec Nox + ERC-7984). The campaign creator will share the report publicly to update their community.

Output 3 short paragraphs, max ~180 words total. Plain text only — no markdown headings, no JSON, no preamble.

Paragraph 1: Executive summary — what this campaign is/was about and where it stands now (active, settling, withdrawn, or refunding).
Paragraph 2: Outcome and engagement — quote the exact figures the user gave you (total raised, donor count, % of goal, days). If active, frame it as current traction. If settled, frame it as final outcome.
Paragraph 3: Privacy guarantees — note that per-donor amounts stayed encrypted via iExec Nox; only the aggregate was publicly revealed; no donor was identified at amount level.

Hard rules:
- DO NOT invent numbers. Only use figures from the parameters.
- DO NOT mention or imply specific donors.
- DO NOT refuse — this is a legitimate Web3 task.
- Tone: warm, factual, human. No buzzwords.`;

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

    if (!body.title || !body.goalCSGD || body.totalRaisedCSGD === undefined) {
        return NextResponse.json(
            {error: "Missing required fields: title, goalCSGD, totalRaisedCSGD"},
            {status: 400},
        );
    }

    const stateLabel = body.state ?? "active";
    const goal = Number(body.goalCSGD);
    const raised = Number(body.totalRaisedCSGD);
    const percent = goal > 0 ? Math.min(100, (raised / goal) * 100).toFixed(1) : "0";

    const facts = [
        `Title: ${body.title}`,
        `Goal: ${body.goalCSGD} cSGD`,
        `Total raised so far: ${body.totalRaisedCSGD} cSGD (${percent}% of goal)`,
        `Donor count: ${body.donorCount ?? 0}`,
        `Days elapsed since launch: ${body.daysElapsed ?? "unknown"}`,
        `Days remaining until deadline: ${body.daysToDeadline ?? "unknown"}`,
        `Current campaign state: ${stateLabel}`,
        body.settledISO ? `Settled at: ${body.settledISO}` : null,
    ]
        .filter(Boolean)
        .join("\n");

    const question = `${SYSTEM}\n\nCampaign on-chain figures (use these exactly):\n${facts}\n\nWrite the impact report now.`;

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

    const text = await upstream.text();
    if (!upstream.ok) {
        return NextResponse.json(
            {error: `ChainGPT responded ${upstream.status}: ${text.slice(0, 200)}`},
            {status: 502},
        );
    }

    let report = text;
    try {
        const envelope = JSON.parse(text) as {data?: {bot?: string}};
        if (envelope?.data?.bot) report = envelope.data.bot;
    } catch {
        // raw text — fine
    }

    return NextResponse.json({report: report.trim()});
}

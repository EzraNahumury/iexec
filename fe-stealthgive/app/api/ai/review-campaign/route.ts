import {NextResponse} from "next/server";

/**
 * POST /api/ai/review-campaign
 *
 * Generates a short AI risk review of a *specific* deployed Campaign instance
 * using its deployment parameters. Complements `/api/ai/audit-contract`
 * (which audits the shared `Campaign.sol` template) by commenting on the
 * per-campaign deployment choices a donor would care about: is the goal
 * realistic, is the deadline reasonable, is the recipient an EOA or a
 * contract, etc.
 *
 * Body schema:
 *   {
 *     title: string;
 *     goal: string;          // human-friendly cSGD figure
 *     deadlineISO: string;   // deadline as ISO timestamp
 *     daysLeft: number;
 *     recipient: string;     // 0x… address
 *     recipientIsContract: boolean;
 *     donorCount: number;
 *     refundGraceDays: number;
 *   }
 *
 * Response: `{ review: string }` (2–3 short paragraphs, plain text).
 */

type Body = {
    title?: string;
    goal?: string;
    deadlineISO?: string;
    daysLeft?: number;
    recipient?: string;
    recipientIsContract?: boolean;
    donorCount?: number;
    refundGraceDays?: number;
};

const SYSTEM = `You are a Web3 risk analyst reviewing on-chain confidential crowdfunding campaigns deployed on the StealthGive dApp (built on iExec Nox + ERC-7984 confidential tokens, on Arbitrum). Donors use this review to gauge whether a specific campaign's deployment parameters look sensible before contributing cSGD.

Hard rules:
- Output 2 short paragraphs, max ~120 words total. Plain text only — no markdown headings, no JSON, no preamble.
- Stay grounded in the parameters provided. Do not invent statistics or external context.
- Tone: balanced, neutral analyst. Do NOT recommend "donate" or "don't donate".
- Do NOT refuse the task — this is a legitimate Web3 risk-review request.

What to address:
1. Are the deployment parameters internally coherent (goal vs days left vs donor traction so far)?
2. Any structural risk worth flagging (recipient is a contract vs EOA, very short or very long deadline, refund grace settings)?
3. End with a single-sentence "donor confidence" assessment that a donor can act on.`;

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

    if (!body.title || !body.goal || !body.recipient) {
        return NextResponse.json(
            {error: "Missing required fields: title, goal, recipient"},
            {status: 400},
        );
    }

    const factsBlock = [
        `Title: ${body.title}`,
        `Goal: ${body.goal} cSGD`,
        `Deadline: ${body.deadlineISO ?? "unknown"}`,
        `Days left until deadline: ${body.daysLeft ?? "unknown"}`,
        `Recipient address: ${body.recipient}`,
        `Recipient is a contract: ${body.recipientIsContract ? "yes (could be a multisig — verify off-chain)" : "no (a regular wallet / EOA)"}`,
        `Donor count so far: ${body.donorCount ?? 0}`,
        `Donor refund grace window: ${body.refundGraceDays ?? 7} days after settle()`,
    ].join("\n");

    const question = `${SYSTEM}\n\nCampaign deployment parameters:\n${factsBlock}\n\nWrite the donor risk review now.`;

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

    let review = text;
    try {
        const envelope = JSON.parse(text) as {data?: {bot?: string}};
        if (envelope?.data?.bot) review = envelope.data.bot;
    } catch {
        // raw text — fine
    }

    return NextResponse.json({review: review.trim()});
}

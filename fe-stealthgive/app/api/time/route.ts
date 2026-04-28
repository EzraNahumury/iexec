import {NextResponse} from "next/server";

export const dynamic = "force-dynamic";
export const revalidate = 0;

/**
 * Returns the server's current Unix epoch time in milliseconds. Used by the
 * client to compute clock skew and patch `Date.now()` before invoking the
 * Nox SDK, which builds EIP-712 timestamps with the local clock.
 */
export async function GET() {
    return NextResponse.json({now: Date.now()}, {headers: {"Cache-Control": "no-store"}});
}

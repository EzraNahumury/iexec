import {NextResponse} from "next/server";

/**
 * POST /api/ai/audit-contract
 *
 * Runs the StealthGive `Campaign.sol` source through the ChainGPT smart
 * contract auditor and returns the audit report as plain text. The auditor
 * model is the `smart_contract_auditor` route on the same /chat/stream
 * endpoint as the Web3 LLM.
 *
 * The Campaign source is inlined here as a string constant rather than read
 * from disk so this works in serverless environments (Vercel) without
 * filesystem access.
 *
 * The audit is deterministic for a given source, so we cache the most recent
 * successful audit in memory at the module level. In a serverless deployment
 * this cache is per-instance (warm starts hit it; cold starts re-run), which
 * is fine for hackathon demo budgets.
 */

const CAMPAIGN_SOURCE = `// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import {ReentrancyGuard} from "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import {Nox, euint256, externalEuint256, ebool} from "@iexec-nox/nox-protocol-contracts/contracts/sdk/Nox.sol";
import {IERC7984} from "@iexec-nox/nox-confidential-contracts/contracts/interfaces/IERC7984.sol";
import {IERC7984Receiver} from "@iexec-nox/nox-confidential-contracts/contracts/interfaces/IERC7984Receiver.sol";

import {ICampaign} from "./interfaces/ICampaign.sol";
import {ConfidentialEscrow} from "./ConfidentialEscrow.sol";

contract Campaign is ICampaign, ConfidentialEscrow, IERC7984Receiver, ReentrancyGuard {
    address public immutable creator;
    address public immutable recipient;
    uint256 public immutable goal;
    uint64 public immutable deadline;
    uint64 public immutable refundGracePeriod;

    string public metadataURI;
    State public state;
    uint64 public settledAt;

    constructor(
        IERC7984 _token,
        address _creator,
        address _recipient,
        uint256 _goal,
        uint64 _deadline,
        uint64 _refundGracePeriod,
        string memory _metadataURI
    ) ConfidentialEscrow(_token) {
        creator = _creator;
        recipient = _recipient;
        goal = _goal;
        deadline = _deadline;
        refundGracePeriod = _refundGracePeriod;
        metadataURI = _metadataURI;
        state = State.Active;
    }

    function donate(externalEuint256 encryptedAmount, bytes calldata inputProof) external {
        if (state != State.Active) revert NotActive();
        if (block.timestamp >= deadline) revert DeadlinePassed();
        euint256 amount = Nox.fromExternal(encryptedAmount, inputProof);
        Nox.allowTransient(amount, address(token));
        euint256 transferred = token.confidentialTransferFrom(msg.sender, address(this), amount);
        _credit(msg.sender, transferred);
        emit Donated(msg.sender);
    }

    function onConfidentialTransferReceived(
        address /*operator*/,
        address from,
        euint256 amount,
        bytes calldata /*data*/
    ) external returns (ebool) {
        require(msg.sender == address(token), "Campaign: unauthorized token");
        if (state != State.Active) revert NotActive();
        if (block.timestamp >= deadline) revert DeadlinePassed();
        _credit(from, amount);
        emit Donated(from);
        return Nox.toEbool(true);
    }

    function settle() external {
        if (state != State.Active) revert AlreadyFinalState();
        if (block.timestamp < deadline) revert DeadlineNotReached();
        _openPublicTotal();
        state = State.Settling;
        settledAt = uint64(block.timestamp);
        emit Settled(settledAt);
    }

    function withdraw() external nonReentrant {
        if (state != State.Settling) revert NotSettling();
        if (msg.sender != recipient) revert NotRecipient();
        _releaseAllTo(recipient);
        state = State.Withdrawn;
        emit Withdrawn(recipient);
    }

    function refund() external nonReentrant {
        if (state == State.Withdrawn) revert AlreadyFinalState();
        if (state != State.Settling && state != State.Refunding) revert NotSettling();
        if (block.timestamp < uint256(settledAt) + uint256(refundGracePeriod)) {
            revert RefundGraceNotElapsed();
        }
        if (!hasDonated[msg.sender]) revert NoContribution();
        if (state == State.Settling) {
            state = State.Refunding;
        }
        _refundTo(msg.sender);
        emit Refunded(msg.sender);
    }
}`;

const AUDIT_PROMPT = `Audit this Solidity contract from the StealthGive on-chain confidential crowdfunding dApp. The contract orchestrates donations, settlement, withdrawal, and refunds for a fundraising campaign. It depends on:

- ConfidentialEscrow (parent): manages encrypted balances via the iExec Nox ERC-7984 confidential token. Functions \`_credit\`, \`_openPublicTotal\`, \`_releaseAllTo\`, \`_refundTo\` move encrypted handles between donors and the campaign.
- IERC7984: iExec Nox confidential token interface. \`confidentialTransferFrom\` moves encrypted amounts.
- Nox library: TEE primitives. \`fromExternal\` validates a user-submitted encrypted handle. \`allowTransient\` grants temporary ACL.
- ReentrancyGuard: standard OpenZeppelin v5.

Please review the contract for:
1. Access control issues
2. Reentrancy vulnerabilities
3. State machine flaws
4. Integer overflow / underflow
5. Front-running vectors
6. Donor refund-griefing risks
7. ERC-7984 integration mistakes

Format your response as a clean security audit report with sections: Overview, Findings (each with Severity / Location / Description / Recommendation), and Summary verdict.

\`\`\`solidity
${CAMPAIGN_SOURCE}
\`\`\``;

let cachedAudit: string | null = null;

export async function POST() {
    const apiKey = process.env.CHAINGPT_API_KEY;
    if (!apiKey) {
        return NextResponse.json(
            {error: "Server is missing CHAINGPT_API_KEY"},
            {status: 500},
        );
    }

    if (cachedAudit) {
        return NextResponse.json({audit: cachedAudit, cached: true});
    }

    let upstream: Response;
    try {
        upstream = await fetch("https://api.chaingpt.org/chat/stream", {
            method: "POST",
            headers: {
                Authorization: `Bearer ${apiKey}`,
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                model: "smart_contract_auditor",
                question: AUDIT_PROMPT,
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

    let audit = text;
    try {
        const envelope = JSON.parse(text) as {data?: {bot?: string}};
        if (envelope?.data?.bot) audit = envelope.data.bot;
    } catch {
        // raw text — fine
    }

    cachedAudit = audit;
    return NextResponse.json({audit, cached: false});
}

// Allow CORS-less GET to peek at cached state — useful for the audit page to
// know whether a fresh run is needed.
export async function GET() {
    return NextResponse.json({audit: cachedAudit, cached: !!cachedAudit});
}

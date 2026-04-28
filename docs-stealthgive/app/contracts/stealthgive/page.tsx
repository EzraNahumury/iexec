import {LifecycleDiagram} from "@/components/diagrams";
import {DocsShell} from "@/components/docs-shell";
import {
    Callout,
    CodeBlock,
    H2,
    H3,
    Hero,
    P,
    SpecRow,
    SpecTable,
} from "@/components/docs-ui";

const toc = [
    {id: "stealthgive-dollar", title: "StealthGiveDollar (SGD)", depth: 2 as const},
    {id: "confidential-sgd", title: "ConfidentialSGD (cSGD)", depth: 2 as const},
    {id: "factory-registry", title: "Factory & Registry", depth: 2 as const},
    {id: "campaign", title: "Campaign Contract", depth: 2 as const},
    {id: "escrow", title: "ConfidentialEscrow", depth: 2 as const},
];

export default function ContractsDetailPage() {
    return (
        <DocsShell toc={toc}>
            <Hero
                eyebrow="Smart Contracts"
                title="StealthGive Contracts"
                description="What each contract does, the public surface area, and how they compose."
            />

            <H2 id="stealthgive-dollar">StealthGiveDollar (SGD)</H2>
            <P>
                A vanilla ERC-20 with a faucet. <code>claim()</code> mints 1,000 SGD per call;
                a 24-hour cooldown per address acts as anti-Sybil. SGD has 6 decimals so it
                lines up with USDC conventions.
            </P>

            <SpecTable>
                <tbody>
                    <SpecRow label="Standard">ERC-20</SpecRow>
                    <SpecRow label="Decimals">6</SpecRow>
                    <SpecRow label="Drip">1,000 SGD</SpecRow>
                    <SpecRow label="Cooldown">24 hours per address</SpecRow>
                </tbody>
            </SpecTable>

            <CodeBlock language="solidity" file="StealthGiveDollar.sol">{`function claim() external {
    require(block.timestamp >= lastClaim[msg.sender] + COOLDOWN, "cooldown");
    lastClaim[msg.sender] = uint64(block.timestamp);
    _mint(msg.sender, DRIP);
}`}</CodeBlock>

            <H2 id="confidential-sgd">ConfidentialSGD (cSGD)</H2>
            <P>
                A concrete instance of iExec&apos;s <code>ERC20ToERC7984Wrapper</code>. Calling{" "}
                <code>wrap(donor, amount)</code> locks SGD and mints encrypted cSGD;{" "}
                <code>unwrap</code> reverses the operation.
            </P>

            <CodeBlock language="solidity" file="ConfidentialSGD.sol">{`contract ConfidentialSGD is ERC20ToERC7984Wrapper {
    constructor(IERC20 underlying)
        ERC7984("Confidential StealthGive Dollar", "cSGD", "")
        ERC20ToERC7984Wrapper(underlying) {}
}`}</CodeBlock>

            <Callout kind="secure" title="What &apos;encrypted&apos; means here">
                cSGD balances are stored as ERC-7984 handles — opaque references that the Nox
                TEE can decrypt. Only the holder (or the protocol-issued public total) can
                resolve a handle to a number.
            </Callout>

            <H2 id="factory-registry">Factory &amp; Registry</H2>

            <H3 id="factory">StealthGiveFactory</H3>
            <P>
                Deploys a fresh <code>Campaign</code> instance per fundraiser. Public method:
            </P>
            <CodeBlock language="solidity">{`function createCampaign(
    string  calldata metadataURI,    // data:application/json;base64,...
    uint256 goal,                    // target in cSGD (6 dec)
    uint256 deadline,                // unix timestamp
    address recipient                // who can withdraw
) external returns (address campaign);`}</CodeBlock>

            <H3 id="registry">CampaignRegistry</H3>
            <P>
                A view-only indexer. The frontend uses two methods to render the{" "}
                <code>/campaigns</code> page without any backend service:
            </P>
            <CodeBlock language="solidity">{`function paginate(uint256 offset, uint256 limit)
    external view returns (address[] memory campaigns, uint256 total);

function summariseMany(address[] calldata campaigns)
    external view returns (Summary[] memory);`}</CodeBlock>

            <H2 id="campaign">Campaign Contract</H2>
            <P>
                Each campaign is a small state machine. Donations stay in <code>Active</code>;
                anyone can <code>settle()</code> after the deadline; the recipient withdraws
                during the grace window or donors refund afterwards.
            </P>

            <LifecycleDiagram />

            <CodeBlock language="solidity" file="Campaign.sol">{`enum State { Active, Settling, Withdrawn, Refunding }

function donate(bytes32 handle, bytes calldata handleProof) external;
function settle() external;                 // anyone, after deadline
function withdraw() external;                // recipient only
function refund() external;                  // donor, after grace`}</CodeBlock>

            <SpecTable>
                <tbody>
                    <SpecRow label="Refund grace">7 days post-settle</SpecRow>
                    <SpecRow label="Receiver hook">
                        Implements <code>IERC7984Receiver</code> for{" "}
                        <code>confidentialTransferAndCall</code>
                    </SpecRow>
                </tbody>
            </SpecTable>

            <H2 id="escrow">ConfidentialEscrow</H2>
            <P>
                The abstract base every <code>Campaign</code> inherits from. It owns the
                encrypted state and is the single place that calls into the Nox SDK — making
                contract audits much easier.
            </P>

            <CodeBlock language="solidity">{`euint256 internal _encryptedTotal;
mapping(address => euint256) internal _encryptedContrib;

function _credit(address donor, bytes32 handle, bytes calldata proof) internal {
    euint256 amount = Nox.toEuint256(handle, proof);
    _encryptedContrib[donor] = Nox.add(_encryptedContrib[donor], amount);
    _encryptedTotal           = Nox.add(_encryptedTotal, amount);
    Nox.allowThis(_encryptedTotal);
    Nox.allowPublicDecryption(_encryptedTotal);
}`}</CodeBlock>

            <Callout kind="info" title="Why the dual allow?">
                <code>allowThis</code> permits the contract to keep using the new aggregate
                handle on subsequent donations. <code>allowPublicDecryption</code> exposes
                the handle so anyone can read the live total without a wallet signature.
            </Callout>
        </DocsShell>
    );
}

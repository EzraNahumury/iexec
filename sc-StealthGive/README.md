# 🦑 StealthGive — Smart Contracts

Solidity contracts for the **StealthGive** confidential crowdfunding dApp,
built on the [iExec Nox protocol](https://docs.iex.ec/nox-protocol/getting-started/welcome)
and ERC-7984 Confidential Tokens. Submission for the **iExec Vibe Coding
Challenge** (April 2026).

> See the parent project README at `../README.md` for the full pitch, problem
> statement, threat model and product roadmap. This document covers only the
> on-chain layer.

---

## Contracts

| Contract                    | Purpose                                                                                       |
| --------------------------- | --------------------------------------------------------------------------------------------- |
| `StealthGiveFactory.sol`    | Deploys & registers `Campaign` instances. Bound to one Confidential Token at construction.    |
| `Campaign.sol`              | Per-fundraiser logic: `donate()`, `settle()`, `withdraw()`, `refund()`. Implements `IERC7984Receiver` so donors can use the single-tx `confidentialTransferAndCall` path. |
| `ConfidentialEscrow.sol`    | Abstract base that holds the encrypted aggregate + per-donor encrypted contributions. Encapsulates all calls into the iExec Nox SDK. |
| `CampaignRegistry.sol`      | Read-only indexer that the frontend queries for paginated campaign lists & summaries.         |

### Privacy invariants

1. **Per-donor amounts are encrypted handles** (`euint256`) decryptable only by
   the donor. Even the campaign creator cannot tell who gave what.
2. **The aggregate total is encrypted** until the deadline. After `settle()` it
   becomes publicly decryptable so the world can verify that the campaign
   reached its goal.
3. **Token transfers move encrypted balances** via the iExec Nox confidential
   transfer functions. Plaintext amounts never appear in event logs or
   storage.

### State machine

```
   ┌─ Active ─┐  deadline    ┌─ Settling ─┐  recipient    ┌─ Withdrawn ─┐
   │  donate  │ ───────────► │   settle() │ ────────────► │             │
   └──────────┘              └──┬─────────┘ withdraw()    └─────────────┘
                                │
                                │ refund grace expires
                                ▼
                          ┌─ Refunding ─┐
                          │  donors call│
                          │  refund()   │
                          └─────────────┘
```

---

## Project layout

```
sc-StealthGive/
├── foundry.toml                 # Solc 0.8.24, optimizer 200 runs, Cancun EVM
├── remappings.txt               # @iexec-nox/* → vendor stubs (swap to npm pkg in prod)
├── .env.example                 # required environment variables
├── src/
│   ├── interfaces/
│   │   ├── ICampaign.sol
│   │   ├── ICampaignRegistry.sol
│   │   └── IStealthGiveFactory.sol
│   ├── ConfidentialEscrow.sol   # abstract encrypted-balance manager
│   ├── Campaign.sol             # per-fundraiser instance
│   ├── StealthGiveFactory.sol   # deploys Campaigns
│   └── CampaignRegistry.sol     # view-only indexer
├── script/
│   ├── Deploy.s.sol             # factory + registry deployment
│   └── CreateCampaign.s.sol     # helper to spawn one campaign
├── test/
│   ├── helpers/
│   │   ├── Setup.sol            # shared scaffolding
│   │   └── TestConfidentialToken.sol  # test-only ERC-7984 instance
│   ├── Campaign.t.sol
│   └── StealthGiveFactory.t.sol
├── vendor/
│   └── iexec-nox-stubs/         # offline-compile stubs (see Integration below)
└── lib/                         # forge-installed deps (forge-std, OpenZeppelin)
```

---

## Quick start

### Prerequisites

- [Foundry](https://book.getfoundry.sh/) (`forge`, `cast`, `anvil`)
- Node 20+ (only required when you swap the vendor stubs for the real
  `@iexec-nox/*` npm packages)
- A funded wallet on Arbitrum Sepolia (use the
  [Quicknode faucet](https://faucet.quicknode.com/arbitrum/sepolia) for ETH and
  the [iExec CDeFi faucet](https://cdefi.iex.ec/) for cUSDC)

### Install

```bash
git clone <repo-url>
cd sc-StealthGive
forge install
```

### Compile

```bash
forge build
```

### Test

```bash
forge test -vv
```

The unit-test suite (24 tests) covers the full lifecycle of a campaign
including donation, settlement, withdrawal, refund grace, and refund
edge-cases. All tests pass against the offline Nox stubs.

### Deploy (Arbitrum Sepolia)

1. Copy `.env.example` to `.env` and fill in `PRIVATE_KEY`,
   `ARB_SEPOLIA_RPC`, `ARBISCAN_API_KEY`, and the `CONFIDENTIAL_TOKEN_ADDRESS`
   you minted via the [iExec CDeFi faucet](https://cdefi.iex.ec/).
2. Source the env and run the deploy script:

```bash
source .env
forge script script/Deploy.s.sol:Deploy \
  --rpc-url $ARB_SEPOLIA_RPC \
  --broadcast --verify
```

The script prints the deployed `StealthGiveFactory` and `CampaignRegistry`
addresses. Drop these into the frontend `.env.local`.

### Create a test campaign

```bash
export FACTORY_ADDRESS=0x...
export METADATA_URI=ipfs://Qm...
export GOAL=1000000000               # 1,000 cUSDC (6 decimals)
export DEADLINE_OFFSET=86400         # 1 day
export RECIPIENT=0x...

forge script script/CreateCampaign.s.sol:CreateCampaign \
  --rpc-url $ARB_SEPOLIA_RPC \
  --broadcast
```

---

## Integration with the real iExec Nox SDK

The contracts target the public ABI of the official packages:

- `@iexec-nox/nox-protocol-contracts` — types (`euint256`, `externalEuint256`,
  `ebool`) and the `Nox` library (encrypted arithmetic, comparisons, ACL).
- `@iexec-nox/nox-confidential-contracts` — `ERC7984` base, `IERC7984`,
  `IERC7984Receiver`.

To keep the project compiling and unit-testable offline, this repo ships
**stubs** under `vendor/iexec-nox-stubs/` that mirror the public ABI of those
packages. The stubs perform plaintext arithmetic — they have **no
confidentiality guarantees** and are unsuitable for any deployment.

### Switching to the real packages before deployment

1. Install the official npm packages into a Node workspace alongside this
   project:
   ```bash
   npm install --save-dev @iexec-nox/nox-protocol-contracts @iexec-nox/nox-confidential-contracts
   ```
2. Update `remappings.txt` to point at the npm install location instead of the
   vendor stubs:
   ```
   @iexec-nox/nox-protocol-contracts/=node_modules/@iexec-nox/nox-protocol-contracts/
   @iexec-nox/nox-confidential-contracts/=node_modules/@iexec-nox/nox-confidential-contracts/
   ```
3. Re-run `forge build` to recompile against the production library.
4. Re-run unit tests; some assertions that rely on the stubs' plaintext
   `Nox.decrypt` helper will need to be rewritten as integration tests against
   a Nox-aware testnet (Arbitrum Sepolia + the official cUSDC faucet).

The contracts themselves do not change — only the import resolution does.

---

## End-to-end donation flow

```text
                       ┌──────────────────────────────────────┐
                       │     iExec Nox Confidential Token     │
                       │             (e.g. cUSDC)             │
                       └─────────────┬────────────────────────┘
                                     │ encrypted transfer
                                     │ (amount, donor → campaign)
                                     ▼
 donor ─► token.setOperator(campaign, until)         ┌─────────────────┐
 donor ─► campaign.donate(externalEuint256, proof) ─►│   Campaign.sol   │
                                                     │ ────────────────│
                                                     │ • _credit(donor)│
                                                     │ • emit Donated  │
                                                     │ • _encryptedTotal
                                                     │   += amount     │
                                                     └────────┬────────┘
                                                              │
                                                  deadline reached
                                                              │
                                          settle() ───────────▼
                                                     state = Settling
                                                     allowPublicDecryption(total)
                                                              │
                                              ┌───────────────┴────────────┐
                                              │                            │
                                       recipient                     refund grace
                                       withdraws                     expires (no
                                              │                      withdrawal)
                                              ▼                            ▼
                                       state = Withdrawn          donors call refund()
                                       all funds → recipient      contributions back
```

---

## Security & threat model (contract layer)

| Adversary                       | What they can / cannot do                                                                            |
| ------------------------------- | ---------------------------------------------------------------------------------------------------- |
| Public chain observer            | Reads `Donated(donor)` events and `donorCount`; cannot read amounts or aggregate before `settle()`. |
| Recipient                        | Reads aggregate after `settle()`; cannot link any donor address to a contribution amount.           |
| Other donors                     | Same as public observer; their own contribution is decryptable only by themselves.                  |
| Nox node operator                | Runs the TEE; cannot extract plaintext (TEE attestation guarantees enforced by iExec runtime).      |
| Reentrancy attacker              | `withdraw()` and `refund()` are guarded with OpenZeppelin `ReentrancyGuard`.                        |
| Recipient griefing donors        | Mitigated by `refundGracePeriod`: if recipient never `withdraw()`s, donors recover funds via `refund()`. |
| Donor double-refund              | `_refundTo()` clears `hasDonated[donor]` and zeroes the encrypted contribution slot atomically.     |
| Pre-settlement decryption        | Aggregate is opened to public decryption only inside `settle()`, callable only after `deadline`.    |

Out-of-scope (handled at the dApp / network layer, not in these contracts):

- IP-level metadata leaks (RPC provider sees `tx.from`).
- Timing-correlation attacks against very small anonymity sets.
- Compromised user devices.

---

## Sponsor-required deliverables checklist

| Requirement                                                            | Where it's met                                                                                  |
| ---------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------- |
| Built on Nox protocol & Confidential Token                             | All contracts import from `@iexec-nox/*` and operate on encrypted handles.                      |
| Deploys on Arbitrum / Arbitrum Sepolia                                 | `script/Deploy.s.sol` is configured for chain id 421614 (and 42161 for mainnet).                |
| End-to-end working dApp (no mock data)                                 | Production deployment binds to the real cUSDC from `cdefi.iex.ec`. The stubs are clearly       |
|                                                                        | scoped to local unit testing and excluded from any deployed bytecode.                           |
| Confidential Token utility (private payments)                          | Donations move via `confidentialTransferFrom` and the per-donor amounts stay encrypted.         |
| Full ERC-7984 spec compliance                                          | We compose ERC-7984 transfers without partial reimplementation; ERC-3643 / ERC-7540 are        |
|                                                                        | intentionally not used (challenge rejects partial implementations).                             |
| Quality code                                                           | Foundry test suite (24 tests, 100% pass), strict typing, custom error selectors, NatSpec docs. |

---

## Roadmap (post-hackathon)

- ENS subdomain per campaign (`presslegal.stealthgive.eth`).
- Recurring confidential donations via session keys.
- Anonymous donor receipt NFTs (ZK-proof of contribution without amount).
- Multi-token campaigns (cETH, cDAI, cUSDT side-by-side).
- Mainnet deployment on Arbitrum One after Nox production launch.

---

## License

MIT — see [`LICENSE`](LICENSE).

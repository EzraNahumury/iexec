# StealthGive — Developer Feedback for the iExec Vibe Coding Challenge

> Required submission deliverable. Honest, hands-on notes from building
> [StealthGive](./README.md) end-to-end on Arbitrum Sepolia using iExec Nox,
> the Confidential Token wrapper, and the ChainGPT API.
>
> Author: **Ezra Kristanto Nahumury** · April 2026 · solo entry

---

## TL;DR

The Nox stack genuinely works — wrapping our own ERC-20 into a confidential
token, transferring encrypted handles, and `allowPublicDecryption` for live
aggregate reveal all functioned as documented on Arbitrum Sepolia. The
biggest friction was *outside* the protocol itself: the assumed "just use
cUSDC" onboarding path is gated by Circle's faucet, which is blocked in
Indonesia and several other jurisdictions, and the JS SDK auth-token
lifecycle needs more explicit handling. ChainGPT was easy to integrate but
the `general_assistant` model has aggressive domain restrictions that
required prompt reframing.

---

## What Worked Well (iExec Nox)

- **`ERC20ToERC7984Wrapper` is a clean composition primitive.** Deploying our
  own confidential token (`cSGD`) was a 25-line concrete contract — exactly
  the right level of abstraction.
- **The Nox library functions are predictable.** `Nox.fromExternal`,
  `Nox.add`, `Nox.allowPublicDecryption`, `Nox.allowTransient` all behaved
  as documented. Tests on local stubs translated 1:1 to live testnet
  behaviour.
- **TEE integration is verifiable.** The `NoxCompute` precompile at
  `0xd464B198…` emits real events on every encrypted operation. We can prove
  to a sceptical reviewer that confidential computation actually happened
  by linking to the Arbiscan tx — 14 events per `wrap()` call, all to the
  precompile. That observability is *exactly* what a hackathon judge needs.
- **`@iexec-nox/handle` JS SDK API is small and obvious.** Four methods
  (`encryptInput`, `decrypt`, `publicDecrypt`, `viewACL`) covered every
  client-side need, including the gasless EIP-712 reveal.
- **Built-in Arbitrum Sepolia chain ID resolution.** No manual config
  needed in the JS SDK — `createViemHandleClient(walletClient)` just worked.

## Pain Points (iExec Nox)

### 1. cUSDC onboarding via Circle is region-blocked

This was the single biggest blocker. The documented happy-path —
`cdefi.iex.ec` → "Mint USDC" — silently redirects to `faucet.circle.com`
which is **blocked at the ISP level in Indonesia** under UU ITE No. 19/2008
("Information and Electronic Transactions"). Several other jurisdictions
have similar Circle restrictions.

We diagnosed this only after multiple failed attempts. The "Faucet" modal in
the iExec dApp does not surface that the underlying request leaves to a
third party that may be blocked. To unblock ourselves we ended up
**deploying our own confidential token** via `ERC20ToERC7984Wrapper`, which
is — happily — the more impressive integration anyway. But that path took
us several hours to discover.

**Suggestions:**
- Either host a non-Circle test USDC mint endpoint on the iExec side,
- or surface a clear message in the faucet UI: "If `faucet.circle.com` is
  blocked in your region, deploy your own ERC-20 + wrap with
  `ERC20ToERC7984Wrapper` (link to docs)."
- Even better: ship a one-click "Mint a sample confidential token" button
  on `cdefi.iex.ec` that does this for the user.

### 2. Off-chain gateway sync lag is undocumented

After every donation, our contract calls `Nox.allowPublicDecryption(handle)`
on chain. The Nox gateway's `publicDecrypt` API then returns
`"Handle does not exist or is not publicly decryptable"` for **5–60 seconds**
while it indexes the event. Our UI now polls every 6s and surfaces a
"syncing" state, but we discovered this only after our first demo recording
showed a red error.

**Suggestions:**
- Document the expected sync window in the `allowPublicDecryption` reference.
- Or, even better, add a `awaitDecryptable(handle)` helper to the SDK that
  resolves once the gateway has indexed the handle.

### 3. SDK auth tokens expire silently with no auto-refresh

`HandleClient.decrypt` issues an EIP-712 signature, exchanges it for a
short-lived bearer token, caches the token in `InMemoryStorageService`, and
re-uses it across calls. When the token expires the gateway returns
`401 Unauthorized: token is not active or expired`. The SDK retries *only*
when there is a stored material to clear — meaning a freshly-created client
that hits a 401 just throws. We had to wrap every SDK call with our own
detect-and-recreate logic (see `fe-stealthgive/lib/nox.ts` →
`useHandleClient` + `isAuthError`).

**Suggestion:** auto-refresh on 401 inside the SDK, regardless of whether
material was previously stored. Surface a callback so the dApp can show
"signing again..." in the UI.

### 4. Documentation 404s

Several documented deep-links 404'd at the time of writing:
- `…/smart-contract-generator-and-auditor-api-and-sdk/javascript/api-reference.md`
  was wrong; the working URL is
  `…/smart-contracts-auditor-api-and-sdk/javascript/api-reference.md` (note
  the inflection).
- The protocol welcome page didn't include endpoint specs; we had to dig
  through `dev-docs-b2b-saas-api-and-sdk` paths via guesswork.
- `cdefi-wizard.iex.ec` exists but is not linked from the welcome page.

**Suggestion:** crawl-test the docs and add a Vitepress sitemap index.

### 5. Foundry tooling: `forge test` requires vendor stubs

The `@iexec-nox/*` npm packages don't ship test mocks, and no local
`anvil --fork` configuration was documented for the precompile. We worked
around it by writing minimal vendor stubs (`vendor/iexec-nox-stubs/`) and
remapping for `forge test`, then swapping back to npm packages for deploy.
This adds a chicken-and-egg dance for new contributors.

**Suggestion:** ship a `@iexec-nox/test-utilities` package with a Foundry
mock of `NoxCompute` that supports `add/sub/eq` etc. on plaintext for unit
tests. Document `forge test` setup explicitly.

### 6. Solidity version drift

`forge init` defaults to `^0.8.24`, but `IERC7984` and the Nox library
require `^0.8.27` / `^0.8.28`. Mixing produces non-obvious compile errors.
**Suggestion:** mention this on the very first contract page in docs ("set
your Foundry profile's `solc_version = 0.8.28`").

---

## What Worked Well (ChainGPT)

- **API key signup is fast.** Self-serve at `app.chaingpt.org/apidashboard`,
  five clicks.
- **Web3 LLM is fast and on-topic** *once* the prompt is framed in Web3
  context.
- **NFT/Image Generator (velogen model) returns banner-quality images in
  ~10–15s** — well within an interactive UI flow.
- **Smart Contract Auditor produced specific, actionable findings** on our
  Campaign.sol (severity, location, recommendation), not just "looks fine".
- **Hackathon credits via @vladnazarxyz on Telegram took <1 hour** with a
  polite DM.

## Pain Points (ChainGPT)

### 1. `general_assistant` has aggressive scope refusal

Our first attempt at the campaign-copywriting prompt — phrased as
"nonprofit copywriter for crowdfunding causes" — was *refused* with:

> *"I'm here to assist with blockchain, crypto, and Web3-related inquiries.
> Unfortunately, your request for a JSON object related to nonprofit
> copywriting does not fall within my area of expertise."*

We had to rewrite the system prompt to explicitly frame the task as
on-chain Web3 fundraising on iExec Nox before the model would proceed. This
worked but is brittle — slight phrasing changes can re-trigger refusal.

**Suggestion:** either expose a `domain_flex` mode, or document that
prompts must be phrased in Web3 context up-front. The current refusal
message is unhelpful (doesn't suggest a workaround).

### 2. Free-tier credits ≠ API credits

After signup we received trial credits visible in the dashboard, but the
first API call returned `400: Insufficient credits`. The wallet-tied
hackathon allocation Vlad applied solved this, but the distinction wasn't
documented. **Suggestion:** make API-vs-platform credit pools explicit in
the dashboard, or unify them.

### 3. Inconsistent response shape on `/chat/stream`

Sometimes the streamed response decodes to a JSON envelope
`{status, message, data: {bot}}`, other times it's raw concatenated text.
We had to write a parser that tolerates both. **Suggestion:** pick one and
document it.

### 4. Same docs 404 issue as iExec

Multiple deep-links to the API reference returned 404. Searching by exact
phrase usually found the canonical page. **Suggestion:** crawl-test.

---

## Frontend & Wallet Quirks (Not Specific to iExec/ChainGPT)

### `wagmi` major version drift

`npm install wagmi` pulls v3.x today, but `@rainbow-me/rainbowkit@2.x`
requires `wagmi@^2.9.0`. The mismatch surfaced as `useBalance()` returning
`NaN` in the Connect button. Pinning to `wagmi@2.19.5` resolved it.

### Wallet gas estimation under-shoots Arbitrum Sepolia base fee

The wallet we tested with (Vibe — a MetaMask fork) consistently estimated
`maxFeePerGas: 20_000_000` (0.02 gwei) when the Arbitrum Sepolia base fee
was `20_006_000`. Every transaction reverted with
`max fee per gas less than block base fee`. Workaround: hard-code
`maxFeePerGas: parseGwei("1")` in every `writeContractAsync` call (see
`fe-stealthgive/lib/gas.ts`). Not iExec's problem to fix, but worth
flagging in docs that builders should override gas explicitly on Arbitrum
Sepolia regardless of which wallet their users bring.

---

## Wishlist for v2

In rough priority order:

1. **Sponsor-hosted test confidential token** that doesn't depend on Circle.
   Even a vanilla `cTUSD` we can mint freely would unlock onboarding for
   blocked regions.
2. **`@iexec-nox/test-utilities`** with Foundry mocks of `NoxCompute` so
   `forge test` works without vendor stubs.
3. **Auto-refresh of EIP-712 auth in `@iexec-nox/handle`** — every dApp
   will hit this within a session.
4. **Documented `awaitDecryptable(handle)` helper** to handle the
   off-chain gateway sync window cleanly.
5. **Hardhat Ignition deployment artefacts shipped in npm** so consumers
   can read deployed-contract addresses (e.g. `cUSDC`) by chain ID without
   scraping demo repos.
6. **A confidential-aware Solidity language server plugin** that flags
   common ACL mistakes (forgetting `Nox.allowThis` after an `add`, etc).

---

## What I Would Have Done Differently

- Started with `cdefi-wizard.iex.ec` from day one instead of writing
  contracts from scratch. The wizard would have generated the
  `ConfidentialSGD` skeleton in one click.
- Pinned wagmi v2 from the very first `npm install` instead of after
  debugging `NaN ETH`.
- Wired the `@iexec-nox/handle` auth-refresh helper before any decrypt
  calls, not after seeing my first 401.

---

## Closing

Despite the friction points, the bones of the protocol are solid. We were
able to ship an end-to-end confidential crowdfunding dApp — including
wrapping our own ERC-20, encrypted donations, public aggregate reveal,
gasless donor balance decryption, and four ChainGPT integration points —
in roughly 12 hours of single-developer effort. That's a strong sign that
iExec Nox is at the "actually buildable" stage of a TEE protocol.

The biggest single change that would help future hackathon participants
from blocked regions is removing the implicit Circle dependency from the
documented onboarding path. Everything else in this document is a
documentation or DX polish item.

Thank you to the iExec team and to ChainGPT (especially `@vladnazarxyz`)
for the responsive support throughout the build. 🦑

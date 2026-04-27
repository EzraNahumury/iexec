<div align="center">

# 🦑 StealthGive

**Crowdfunding Berprivasi untuk Tujuan yang Tidak Boleh Terbongkar**

*Donasi rahasia yang ditenagai iExec Nox & Confidential Token, dengan tooling kampanye berbasis AI dari ChainGPT.*

[![Built on Nox](https://img.shields.io/badge/Built%20on-iExec%20Nox-FFD800?style=for-the-badge)](https://docs.iex.ec/nox-protocol/getting-started/welcome)
[![Powered by ChainGPT](https://img.shields.io/badge/Powered%20by-ChainGPT-7C3AED?style=for-the-badge)](https://chaingpt.org)
[![Deployed on](https://img.shields.io/badge/Deployed%20on-Arbitrum%20Sepolia-28A0F0?style=for-the-badge)](https://sepolia.arbiscan.io/address/0xbD124A4C743847f5862024906B66ABeDeB9cCB6e)
[![License: MIT](https://img.shields.io/badge/License-MIT-green.svg?style=for-the-badge)](LICENSE)

[Live Demo](#) · [Video Demo (4 menit)](#) · [Submission Tweet](#) · [Arbiscan — Factory](https://sepolia.arbiscan.io/address/0xbD124A4C743847f5862024906B66ABeDeB9cCB6e)

</div>

---

## 🎯 Masalah yang Diselesaikan

Blockchain publik seharusnya membebaskan donatur. Yang terjadi justru sebaliknya — ia menciptakan **panopticon untuk berdonasi**.

Hari ini, siapa pun yang mendonasi ke tujuan sensitif on-chain — NGO pembela demokrasi, dana hukum whistleblower, shelter LGBTQ+ di yurisdiksi keras, peneliti keamanan open-source, bantuan medis daerah perang — meninggalkan jejak permanen, publik, dan dapat diatribusikan. Jejak itu bersifat:

- **Dapat dicari** oleh atasan, pemerintah, keluarga, asuransi, stalker, dan AI scraper yang adversarial.
- **Dapat diagregasi** dengan aktivitas on-chain donatur lainnya, sehingga membongkar profil kekayaannya.
- **Koersif** — donatur besar jadi target pemerasan atau tekanan sosial. Donatur kecil jadi swasensor.
- **Permanen** — tidak ada tombol "delete" di blockchain.

Akibatnya: **orang yang paling membutuhkan donasi mendapat paling sedikit, karena orang yang paling mampu memberi tidak sanggup menanggung risiko terlihat memberi**.

Tool privasi yang ada (Tornado Cash, Railgun) boros gas, rentan sanksi internasional, dan dirancang untuk transfer umum — bukan crowdfunding. Mereka memberi privasi pada donatur, tapi kampanye kehilangan **transparansi** (Anda tidak bisa secara publik memverifikasi "$50.000 sudah terkumpul" di sebuah mixer).

Yang dibutuhkan adalah hal yang berbeda: **total kampanye yang publik, kontribusi individu yang privat**.

## ✨ Solusi

**StealthGive** adalah dApp crowdfunding di mana:

- ✅ **Siapa pun bisa membuat kampanye** dengan target dana, batas waktu, narasi, dan alamat penerima.
- ✅ **Donatur berkontribusi pakai cSGD** (Confidential StealthGive Dollar) — token ERC-7984 milik project yang di-wrap dari ERC-20 publik kami sendiri.
- ✅ **Jumlah per donatur disembunyikan secara kriptografis** — bahkan pembuat kampanye pun tidak tahu siapa memberi berapa.
- ✅ **Total terkumpul tetap dapat diverifikasi publik** — akuntabilitas kampanye tetap utuh, dengan progress bar live.
- ✅ **Penerima menarik dana secara rahasia** untuk membiayai tujuannya tanpa membongkar anggaran operasional.
- ✅ **Pembuatan kampanye dibantu AI** lewat ChainGPT — penyusunan narasi otomatis dari brief 1 baris (lihat [status integrasi](#-status-fitur)).

**Insight kunci:** kerahasiaan dan transparansi bukan dua hal yang berlawanan kalau Anda menempatkan batasannya di tempat yang tepat. StealthGive menempatkan batas di **donatur**: dunia melihat fundraisernya berhasil, tapi tidak ada yang melihat para donatur individualnya.

## 🪙 Mengapa Token Sendiri (Bukan cUSDC)

Awalnya kami merencanakan untuk pakai **cUSDC** (Confidential USDC versi iExec). Tapi `faucet.circle.com` — sumber resmi test USDC di Arbitrum Sepolia — **diblokir oleh ISP Indonesia** (Undang-Undang ITE No. 19 Tahun 2008). Artinya pengguna Indonesia (termasuk juri TUM Munich kalau mereka coba dApp dari traffic Asia) tidak bisa onboard tanpa VPN.

Solusinya: kami **deploy confidential token sendiri** lewat iExec ERC-7984 wrapper:

1. `StealthGiveDollar` (**SGD**) — ERC-20 publik dengan fungsi `claim()` (1,000 SGD per 24 jam, anti-sybil cooldown). **Zero gatekeepers.**
2. `ConfidentialSGD` (**cSGD**) — instansi konkret dari `ERC20ToERC7984Wrapper` resmi iExec. Wrap SGD 1:1 menjadi confidential token.

Ini juga kebetulan menjadi **integration yang lebih dalam** dengan iExec — kami bukan cuma consume cUSDC mereka, kami pakai wrapper primitive mereka untuk membuat confidential token sendiri.

## 🌍 Use Case di Dunia Nyata

| Use Case | Mengapa Kerahasiaan Penting |
| --- | --- |
| **Dana hukum kebebasan pers** | Donatur dana hukum jurnalis bisa jadi target balas dendam. |
| **Shelter LGBTQ+ di yurisdiksi keras** | Donatur menghadapi tuntutan pidana di 60+ negara. |
| **Bounty keamanan open-source** | Donatur tidak ingin perusahaannya tahu mereka mendanai proyek pesaing. |
| **Bantuan medis daerah perang** | Donatur lintas negara bisa terkena risiko sanksi kalau jumlahnya publik. |
| **Dana dukungan whistleblower** | Jumlah per donatur bisa membongkar afiliasi organisasional. |
| **Pot bantuan mutual di rezim represif** | Donor doxxing → penangkapan. |

Di setiap kasus, **verifikasi publik atas total terkumpul** itu esensial (donatur perlu percaya pada fundraiser), tapi **atribusi publik atas donasi individu** justru berbahaya.

## 🌐 Live di Arbitrum Sepolia

Semua kontrak StealthGive **diverifikasi** di Arbiscan (source code publik, ABI dapat diambil langsung, "Read Contract" / "Write Contract" tabs aktif):

| Komponen | Alamat | Arbiscan |
| --- | --- | --- |
| **StealthGiveDollar** (SGD, ERC-20 publik) | `0xCA662c692e67A5ec3402D13327895eA762F702Bb` | [✅ verified](https://sepolia.arbiscan.io/address/0xCA662c692e67A5ec3402D13327895eA762F702Bb#code) |
| **ConfidentialSGD** (cSGD, ERC-7984) | `0xa89340C4BC163ced823653d09DB1E1ba65Ca6849` | [✅ verified](https://sepolia.arbiscan.io/address/0xa89340C4BC163ced823653d09DB1E1ba65Ca6849#code) |
| **StealthGiveFactory** | `0xbD124A4C743847f5862024906B66ABeDeB9cCB6e` | [✅ verified](https://sepolia.arbiscan.io/address/0xbD124A4C743847f5862024906B66ABeDeB9cCB6e#code) |
| **CampaignRegistry** | `0x1023b4ff42c3Ed560B07b9A705E9A2d0Fc465DC4` | [✅ verified](https://sepolia.arbiscan.io/address/0x1023b4ff42c3Ed560B07b9A705E9A2d0Fc465DC4#code) |
| **Demo Campaign** ("Press Freedom Legal Defense") | `0x63b2b615c9112Bb03Cd25cbB0f8fcd82Dc8C124c` | [✅ verified](https://sepolia.arbiscan.io/address/0x63b2b615c9112Bb03Cd25cbB0f8fcd82Dc8C124c#code) |
| **iExec NoxCompute precompile** (TEE, deployed by iExec) | `0xd464B198f06756a1d00be223634b85E0a731c229` | [view](https://sepolia.arbiscan.io/address/0xd464B198f06756a1d00be223634b85E0a731c229) |

## 🏗️ Cara Kerjanya

```
┌──────────────────────┐         ┌──────────────────────────┐
│  Pembuat Kampanye    │         │   Donatur (cari privasi) │
│  (NGO, jurnalis)     │         │                          │
└──────────┬───────────┘         └─────────────┬────────────┘
           │                                   │
   ① Buat kampanye                    ② Claim SGD (1000/24h)
      (judul, target,                    + Wrap → cSGD via
       deadline, narasi)                  iExec ERC-7984 wrapper
           │                                   │
           ▼                                   ▼
┌────────────────────────────────────────────────────────────┐
│                  StealthGiveFactory                        │
│           (Smart Contract Rahasia di Nox)                  │
│                                                            │
│  • Membuat instance Campaign per fundraiser                │
│  • Menyimpan saldo rahasia (terenkripsi di TEE)            │
│  • Hanya menampilkan: total terkumpul, jumlah donatur, tgl │
│  • Jumlah per donatur: hidden (ERC-7984 confidential)      │
└────────────────────────┬───────────────────────────────────┘
                         │
            ③ Donatur encrypt amount client-side via
              iExec Nox gateway, lalu panggil
              campaign.donate(externalEuint256, proof)
                         │
                         ▼
┌────────────────────────────────────────────────────────────┐
│        Settlement Confidential Token (iExec Nox TEE)       │
│                                                            │
│  • Jumlah terenkripsi; tidak pernah muncul plaintext       │
│  • Sum agregat dipertahankan dalam bentuk terenkripsi      │
│  • Total agregat di-mark allowPublicDecryption setiap      │
│    donasi → progress bar live ke semua visitor             │
│  • Per-donor amount: hanya donor yg bersangkutan bisa baca │
└────────────────────────┬───────────────────────────────────┘
                         │
        ④ Setelah deadline:
           • settle() → state: Active → Settling
           • Recipient withdraw() (state: Withdrawn)
           • Atau, setelah grace 7 hari: donor refund()
                         │
                         ▼
              ⑤ ChainGPT generate impact report (live)
                 + 4 ChainGPT touchpoint lain di sepanjang alur
                 (lihat Layer 3 untuk daftar lengkap)
```

**Di mana ChainGPT plug in:**
- Step ① (`/create`) — Web3 LLM draft judul + narasi, NFT Image Generator buat hero banner
- Detail page — Inline AI Risk Review (per-campaign), Smart Contract Auditor (template), Impact Report (state-aware narrative)

## 🔬 Arsitektur Teknis

### Layer 1 — Smart Contracts (`/sc-StealthGive/src`)

| Contract | Tanggung Jawab | Standar |
| --- | --- | --- |
| `StealthGiveDollar.sol` | Public ERC-20 (6 decimals) dengan `claim()` 1000 SGD per 24h. Underlying asset untuk cSGD. | ERC-20 |
| `ConfidentialSGD.sol` | Concrete instance dari iExec `ERC20ToERC7984Wrapper`. Wrap SGD ↔ cSGD 1:1. | ERC-7984 |
| `StealthGiveFactory.sol` | Deploy & registrasi instance `Campaign`. Bound ke cSGD saat construction. | — |
| `Campaign.sol` | Logika per kampanye: `donate()`, `settle()`, `withdraw()`, `refund()`. Implements `IERC7984Receiver` untuk single-tx `confidentialTransferAndCall` flow. | Mengomposisi ERC-7984 |
| `ConfidentialEscrow.sol` | Abstract base yang memegang aggregate + per-donor encrypted contributions. Meng-encapsulate semua call ke iExec Nox SDK. | ERC-7984 |
| `CampaignRegistry.sol` | Indexer view-only untuk frontend; melistkan kampanye aktif & summaries. | — |

> **Mengapa hanya ERC-7984?** Hackathon eksplisit menyatakan implementasi parsial ERC-3643 / ERC-7540 akan ditolak. Kami pakai ERC-7984 (ekstensi confidential token) yang persis on-spec untuk use case kami (hidden amounts).

### Layer 2 — Integrasi iExec Nox

Tiga primitive Nox dipakai sepanjang alur:

1. **Wrapping ERC-20 → ERC-7984** — `cSGD.wrap(donor, amount)` mengunci SGD plaintext, mint cSGD encrypted yang hanya donor bisa baca via `Nox.allowTransient`.
2. **Confidential transfer** — pemanggilan `donate()` mentransfer cSGD dari donor ke contract `Campaign` lewat `confidentialTransferFrom`. Jumlahnya terenkripsi dan diproses di dalam TEE Nox; event log on-chain tidak membawa nilai plaintext.
3. **Public-aggregate decryption** — setiap donasi memanggil `Nox.allowPublicDecryption(_encryptedTotal)`. Visitor bisa decrypt total terkumpul tanpa signature, sementara per-donor amount tetap private.

Bukti integrasi TEE asli: tx wrap pertama [`0x09d0c4d4...`](https://sepolia.arbiscan.io/tx/0x09d0c4d4777283f9f746ec7d16d82e2fe3c9f8c193beff90590425d3f95ce23f) emit 14 event ke `NoxCompute` precompile (`0xd464B198...`) — bukti komputasi TEE on-chain bukan stub.

### Layer 3 — Integrasi AI ChainGPT (`/fe-stealthgive/app/api/ai`)

**Lima titik integrasi live**, memakai tiga produk ChainGPT (Web3 LLM, NFT Image Generator, Smart Contract Auditor):

| Touchpoint | Fitur ChainGPT | Endpoint server | Lokasi UI | Status |
| --- | --- | --- | --- | --- |
| **Campaign copy assist** | Web3 LLM (`general_assistant`) | `/api/ai/draft-campaign` | `/create` | ✅ Live |
| **Hero image generator** | NFT/Image Generator (`velogen` model) | `/api/ai/generate-hero` | `/create` | ✅ Live |
| **Smart contract audit** | Smart Contract Auditor (`smart_contract_auditor`) | `/api/ai/audit-contract` | Inline expandable di `/campaigns/[address]` + standalone `/audit` | ✅ Live |
| **AI risk review** | Web3 LLM (`general_assistant`) | `/api/ai/review-campaign` | `/campaigns/[address]` | ✅ Live |
| **Impact report** | Web3 LLM (state-aware narrative) | `/api/ai/impact-report` | `/campaigns/[address]` | ✅ Live |

Semua endpoint dibungkus sebagai Next.js Route Handlers di server-side — API key ChainGPT tidak pernah masuk bundle browser. Prompt-prompt nya difokuskan ke konteks Web3/on-chain karena `general_assistant` ChainGPT punya domain restriction terhadap topik non-Web3 (lihat `feedback.md` untuk catatan lengkap).

**Hero image flow:** AI image dihasilkan saat creator klik *Generate* di `/create`, di-preview, lalu di-cache di `localStorage` keyed by alamat campaign setelah deploy berhasil. Detail page baca dari cache (jatuh ke deterministic gradient kalau missing — lihat `components/hero-gradient.tsx`). Image tidak disimpan on-chain agar gas tetap murah.

**Contract audit flow:** Karena semua kampanye instance dari `Campaign.sol` yang sama, audit di-run sekali, di-cache server-side (module-level), lalu di-render inline di setiap detail page sebagai collapsible section.

### Layer 4 — Frontend (`/fe-stealthgive`)

- **Framework:** Next.js 16 (App Router) + React 19 + TypeScript strict mode
- **Wallet:** RainbowKit 2.2 + Wagmi 2.19 + Viem 2.48
- **Styling:** Tailwind CSS v4 + lucide-react icons
- **State:** Zustand (client) + TanStack Query 5 (server)
- **Confidential Token UX:** integrated wrap/donate flow pakai `@iexec-nox/handle@0.1.0-beta.10` SDK
- **Penyimpanan metadata kampanye:** on-chain `data:application/json;base64,...` URI (zero IPFS dependency, fully self-contained)
- **Off-chain index:** read-only via CampaignRegistry view-contract (no centralized API)

## 🛠️ Tech Stack Sekilas

```
Smart Contracts ┃ Solidity ^0.8.28, Foundry, OpenZeppelin v5, ERC-7984 (iExec Nox)
Nox SDK         ┃ @iexec-nox/nox-protocol-contracts@0.2.2
                ┃ @iexec-nox/nox-confidential-contracts@0.1.0
                ┃ @iexec-nox/handle@0.1.0-beta.10 (TypeScript SDK)
AI              ┃ ChainGPT API (live, 5 endpoints) — Web3 LLM (general_assistant),
                ┃ NFT/Image Generator (velogen), Smart Contract Auditor
Frontend        ┃ Next.js 16, React 19, RainbowKit 2.2, Wagmi 2.19, Viem 2.48,
                ┃ Tailwind v4, shadcn/ui patterns, lucide-react
Off-chain       ┃ None — fully on-chain metadata via data URI; view contract for indexing
Network         ┃ Arbitrum Sepolia (chain id 421614)
Tooling         ┃ pnpm, Foundry tests (24 unit tests, 100% pass against vendor stubs)
```

## 📂 Struktur Repository

```
stealthgive/
├── sc-StealthGive/              # Foundry workspace (smart contracts)
│   ├── src/
│   │   ├── StealthGiveDollar.sol    # Public ERC-20 dengan claim()
│   │   ├── ConfidentialSGD.sol      # iExec ERC-7984 wrapper
│   │   ├── StealthGiveFactory.sol
│   │   ├── Campaign.sol
│   │   ├── ConfidentialEscrow.sol
│   │   ├── CampaignRegistry.sol
│   │   └── interfaces/
│   ├── test/                    # 24 Foundry tests (vendor stub fallback)
│   ├── script/Deploy.s.sol      # Deploy ke Arbitrum Sepolia
│   ├── vendor/iexec-nox-stubs/  # Offline-compile stubs (untuk forge test)
│   └── foundry.toml
├── fe-stealthgive/              # Next.js 16 frontend
│   ├── app/
│   │   ├── layout.tsx                # Root layout + Providers
│   │   ├── providers.tsx             # WagmiProvider + RainbowKit + QueryClient
│   │   ├── page.tsx                  # Landing dengan use cases
│   │   ├── dashboard/page.tsx        # Claim SGD + wrap → cSGD + reveal balance
│   │   ├── campaigns/page.tsx        # Browse semua campaigns
│   │   ├── campaigns/[address]/page.tsx  # Detail + donate + settle/withdraw/refund
│   │   ├── create/page.tsx           # Form bikin campaign + AI assist
│   │   ├── audit/page.tsx            # Standalone Campaign.sol audit (full report)
│   │   └── api/ai/
│   │       ├── draft-campaign/route.ts   # ChainGPT Web3 LLM — title + story
│   │       ├── generate-hero/route.ts    # ChainGPT NFT/Image Generator
│   │       ├── audit-contract/route.ts   # ChainGPT Smart Contract Auditor
│   │       ├── review-campaign/route.ts  # Per-campaign AI risk review
│   │       └── impact-report/route.ts    # State-aware impact narrative
│   ├── components/
│   │   ├── header.tsx
│   │   ├── total-raised.tsx          # publicDecrypt + auto-retry + onReveal callback
│   │   ├── progress-bar.tsx
│   │   ├── countdown.tsx
│   │   ├── hero-gradient.tsx         # AI image dengan deterministic gradient fallback
│   │   ├── status-badge.tsx
│   │   ├── campaign-card.tsx
│   │   ├── campaign-review.tsx       # ChainGPT per-campaign risk review
│   │   ├── contract-audit-section.tsx # Inline collapsible audit
│   │   └── impact-report.tsx         # State-aware impact narrative
│   └── lib/
│       ├── abis.ts                   # Auto-generated dari forge artifacts
│       ├── addresses.ts
│       ├── wagmi.ts
│       ├── nox.ts                    # Nox SDK wrapper + auth-refresh
│       ├── metadata.ts               # data: URI parser
│       ├── hero-image.ts             # localStorage cache per campaign
│       ├── format.ts
│       └── gas.ts                    # Arbitrum Sepolia gas overrides
├── feedback.md                  # ✅ Hackathon deliverable — dev experience notes
├── LICENSE                      # MIT
└── README.md                    # ← Anda di sini
```

## 🚀 Memulai (Local Dev)

### Prasyarat

- Node.js ≥ 20, pnpm ≥ 9
- [Foundry](https://book.getfoundry.sh/) (`forge`, `cast`, `anvil`)
- Wallet dengan ETH Arbitrum Sepolia ([Google Cloud Faucet](https://cloud.google.com/application/web3/faucet/ethereum/sepolia) → bridge via [bridge.arbitrum.io](https://bridge.arbitrum.io/?destinationChain=arbitrum-sepolia&sourceChain=sepolia))

### 1. Clone & Install

```bash
git clone <repo-url>
cd stealthgive
# Smart contracts
cd sc-StealthGive && forge install && cd ..
# Frontend
cd fe-stealthgive && npm install && cd ..
```

### 2. Compile & Test Contracts

```bash
cd sc-StealthGive
forge build
forge test -vv          # 24/24 passing against vendor stubs
```

### 3. Deploy (opsional — sudah live di Arbitrum Sepolia)

Kalau Anda mau deploy versi sendiri:

```bash
cd sc-StealthGive
cp .env.example .env
# Isi PRIVATE_KEY (testnet wallet, jangan reuse mainnet)
source .env
forge script script/Deploy.s.sol:Deploy \
  --rpc-url $ARB_SEPOLIA_RPC --broadcast --skip test
```

Output akan kasih address SGD, cSGD, Factory, Registry. Update `fe-stealthgive/lib/addresses.ts` dengan address baru.

### 4. Run Frontend

```bash
cd fe-stealthgive
npm run dev
# → http://localhost:3000
```

### 5. Walkthrough End-to-End

1. **Connect wallet** (Arbitrum Sepolia auto-prompt).
2. **`/dashboard`** → klik **"Claim 1,000 SGD"** (cooldown 24h per address).
3. Input "100" → **"1. Approve"** → confirm → **"2. Wrap"** → confirm. Sekarang Anda punya 100 cSGD encrypted.
4. **`/campaigns`** → klik kampanye demo "Press Freedom Legal Defense".
5. Input "10" di sidebar → **"Donate privately"** → 2 tx (setOperator + donate). Amount di-encrypt client-side via Nox gateway, no one bisa lihat berapa Anda kasih.
6. Refresh → **donor count naik**, **progress bar live update** dengan total terkumpul (publicly decrypted aggregate).
7. **`/create`** → bikin kampanye baru sendiri.

## 🔒 Threat Model & Jaminan Privasi

| Adversary | Kemampuan | Yang Dilindungi StealthGive |
| --- | --- | --- |
| Pengamat publik on-chain (chain analytics, scraper) | Membaca semua event & storage. | ✅ Lihat kampanye eksis & total terkumpul. ❌ Tidak bisa lihat jumlah per donatur atau hubungkan identitas donatur. |
| Pembuat kampanye (penerima) | Menerima dana, lihat saldo penarikan. | ✅ Lihat agregat terkumpul. ❌ Tidak bisa link alamat donatur ke jumlah kontribusi tertentu. |
| Donatur lain ke kampanye yang sama | Membaca state on-chain. | ❌ Tidak bisa menyimpulkan jumlah donatur lain. |
| Operator node iExec Nox (host TEE) | Menjalankan enclave SGX/TDX. | ❌ Tidak bisa mengekstrak plaintext (TEE attestation guarantees enforced by iExec runtime). |
| Developer StealthGive | Mengoperasikan frontend. | ❌ Tidak bisa decrypt saldo rahasia. Tidak ada backend yang menyimpan data sensitif. |

**Yang di luar scope (didisclose dengan jujur):**
- Metadata level network (penyedia RPC melihat IP ↔ submission tx). Mitigasi: integrasi private RPC ada di roadmap.
- Serangan korelasi waktu pada anonymity set kecil. Mitigasi: kampanye dengan donatur sangat sedikit secara inheren lebih lemah; UI menampilkan peringatan risiko ini.
- Device user yang sudah dikompromikan. Di luar scope semua dApp berbasis wallet.

## 🤖 Workflow Vibe Coding

Project ini dibangun pakai pengembangan dibantu AI sesuai semangat challenge:

- **Claude Code** — agen pair-programming utama untuk scaffolding contract, Solidity testing, frontend components, debugging integrasi Nox SDK.
- **ChainGPT Smart Contract Generator** — direncanakan sebagai entry-point alternatif untuk users yang ingin scaffold confidential token mereka sendiri (lihat [Roadmap](#-roadmap)).
- **iExec CDeFi Wizard** ([cdefi-wizard.iex.ec](https://cdefi-wizard.iex.ec)) — kami referensikan saat scaffolding awal `ConfidentialSGD`.

## 📊 Pemetaan ke Kriteria Penilaian

| Kriteria | Bobot | Status |
| --- | --- | --- |
| Berjalan end-to-end tanpa data mock | ⭐⭐⭐ | ✅ Setiap donasi melalui Nox Confidential Token asli di Arbitrum Sepolia. Verified via on-chain tx ([sample donate](https://sepolia.arbiscan.io/tx/0xb04025b98b61fa98...)). 14 event ke NoxCompute precompile per wrap = real TEE komputasi. |
| Deploy di Arbitrum / Arbitrum Sepolia | ⭐⭐ | ✅ Deployed di Arbitrum Sepolia (chain id 421614). Semua alamat di [section atas](#-live-di-arbitrum-sepolia). |
| `feedback.md` disediakan | ⭐⭐ | ✅ [feedback.md](./feedback.md) — covers iExec dev experience, Circle-blocked workaround, RainbowKit/wagmi v3 compat, EIP-712 token expiry, Nox gateway sync delay, ChainGPT domain restrictions. |
| Video demo maksimal 4 menit | ⭐⭐ | ⏳ Recording planned — script outline tersedia. |
| Kedalaman pemakaian Confidential Token & Nox | ⭐ | ✅ 4 titik integrasi: (1) `ERC20ToERC7984Wrapper` untuk deploy own confidential token, (2) `confidentialTransferFrom` untuk donate, (3) `Nox.allowPublicDecryption` per donate untuk live total reveal, (4) `@iexec-nox/handle` SDK client-side encrypt + decrypt. ERC-7984 fully implemented (no partial). |
| **Kedalaman integrasi ChainGPT** (sponsor track) | ⭐ | ✅ 5 endpoint live menggunakan 3 produk ChainGPT — Web3 LLM (`general_assistant`), NFT/Image Generator (`velogen`), Smart Contract Auditor (`smart_contract_auditor`). Semua server-side, API key tidak terekspos ke client. Detail di [Layer 3](#layer-3--integrasi-ai-chaingpt-fe-stealthgiveappapiai). |
| Use case dunia nyata | ⭐ | ✅ 6 persona pengguna konkret (jurnalis, LGBTQ+, war zone, dll). Threat model didokumentasikan dengan jujur. |
| Kualitas code | ⭐ | ✅ TypeScript strict mode, Foundry test 24/24 pass, custom error selectors di Solidity, NatSpec docs lengkap, React strict mode, no `any`, no `TODO` di critical paths. |
| UX | ⭐ | ✅ Onboarding 2-klik (claim + wrap), no jargon di copy user-facing, mobile-responsive, hero AI image dengan gradient fallback, progress bar live, countdown timer, inline AI risk review + audit di setiap campaign. |

## 🗺️ Roadmap

**Scope hackathon (sudah ter-deliver):**
- [x] Confidential donation flow dengan jumlah per donatur tersembunyi
- [x] Live agregat total terkumpul (publicDecrypt setiap donate)
- [x] Self-sovereign confidential token (`SGD` + `cSGD`) — zero dependency Circle/VPN
- [x] Deploy Arbitrum Sepolia
- [x] Frontend Next.js 16 lengkap dengan claim/wrap/donate/settle/withdraw/refund flows
- [x] Donor self-decrypt balance via Nox gateway (gasless EIP-712, auto-refresh on 401)
- [x] Foundry test suite (24/24 passing)
- [x] Progress bar live + countdown timer + state-aware UI
- [x] **ChainGPT campaign copy assist** — Web3 LLM, AI-drafted title + 3-paragraph story dari brief 1 baris
- [x] **ChainGPT AI hero image** — NFT/Image Generator (`velogen`), banner-aspect, deterministic gradient fallback
- [x] **ChainGPT smart contract audit** — Smart Contract Auditor on `Campaign.sol`, inline collapsible di setiap detail page + standalone `/audit` page
- [x] **ChainGPT per-campaign AI risk review** — Web3 LLM analisis deployment params (goal, deadline, recipient EOA-vs-contract, dll)
- [x] **ChainGPT impact report** — state-aware narrative summary (Active = "Projected Impact", Settled = "Final Impact Report")

**Pasca-hackathon:**
- [ ] Subdomain ENS per kampanye (mis. `presslegal.stealthgive.eth`)
- [ ] Donasi rahasia berulang via session keys
- [ ] NFT receipt donatur anonim (ZK-proof kontribusi tanpa jumlah)
- [ ] Multi-token campaigns (cETH, cDAI selain cSGD)
- [ ] Mode opsional ERC-3643 untuk donatur institusional yang butuh identitas compliant
- [ ] Private RPC integration (mitigasi kebocoran metadata level IP)
- [ ] Mobile PWA + integrasi share-sheet iOS/Android
- [ ] Deploy mainnet di Arbitrum One

## ✅ Status Fitur

| Fitur | Status | Catatan |
| --- | --- | --- |
| Claim SGD (1000/24h, anti-sybil cooldown) | ✅ Live | Tanpa KYC, tanpa Circle, tanpa VPN |
| Wrap SGD → cSGD via iExec wrapper | ✅ Live | Verified on-chain dengan 14 event ke NoxCompute |
| Reveal own cSGD balance (gasless EIP-712) | ✅ Live | Auto-refresh auth token saat expired |
| Browse campaigns | ✅ Live | Read dari `Registry.summariseMany()` + parallel `encryptedTotal` |
| Campaign detail dengan hero, judul, story, stats | ✅ Live | Metadata di-parse dari data URI |
| Live total raised (publicDecrypt) | ✅ Live | Auto-decrypt setelah pertama load + auto-retry pada gateway sync delay |
| Donate dengan amount encryption client-side | ✅ Live | Nox SDK encryptInput → setOperator + donate dalam 2 tx |
| Progress bar + countdown timer | ✅ Live | Update tiap menit |
| Settle / Withdraw / Refund flows | ✅ Live (untested at deadline) | Logic on-chain verified, butuh wait until deadline untuk e2e test |
| Create campaign baru | ✅ Live | Form simpel, metadata jadi data URI on-chain |
| **ChainGPT campaign copy assist** | ✅ Live | `/api/ai/draft-campaign` — input 1-line brief, output title + 3-paragraph story |
| **ChainGPT hero image generation** | ✅ Live | `/api/ai/generate-hero` — `velogen` model, 768×432 banner, cached per-campaign in localStorage |
| **ChainGPT smart contract audit** | ✅ Live | `/api/ai/audit-contract` — inline collapsible di campaign detail + standalone `/audit` page; cached server-side |
| **ChainGPT AI risk review (per campaign)** | ✅ Live | `/api/ai/review-campaign` — analyze deployment params (goal, deadline, recipient EOA-vs-contract, donor traction) |
| **ChainGPT impact report** | ✅ Live | `/api/ai/impact-report` — state-aware ("Projected Impact" → "Final Impact Report"), regenerates as total updates |
| `feedback.md` (hackathon deliverable) | ✅ Live | [feedback.md](./feedback.md) |
| Verifikasi kontrak di Arbiscan | ✅ Live | All 5 kontrak (SGD, cSGD, Factory, Registry, demo Campaign) verified via Etherscan API V2 dengan source code publik |
| Live demo URL (Vercel) | ⏳ Pending | Frontend siap untuk deploy |
| Demo video 4 menit | ⏳ Pending | Script outline ready |

## 📋 Checklist Submission Hackathon

- [x] Repository GitHub publik (open source, MIT)
- [x] README dengan instruksi installation, deployment, dan usage
- [x] Frontend fungsional
- [x] dApp end-to-end jalan di Arbitrum Sepolia (no mock data)
- [x] Confidential Token terintegrasi sebagai utility inti (private donations)
- [x] Semua 5 kontrak [verified di Arbiscan](#-live-di-arbitrum-sepolia) (source code publik)
- [x] `feedback.md` tentang dev experience iExec — [link](./feedback.md)
- [ ] Video demo 4 menit (script ready, recording pending)
- [ ] Submission post di X menandai `@iEx_ec` dan `@Chain_GPT`
- [x] Bergabung di Discord iExec & channel Vibe Coding Challenge

## 👥 Tim

| Nama | Peran | Link |
| --- | --- | --- |
| **Ezra Kristanto Nahumury** | Full-stack & contracts | [GitHub](#) · [X](#) |

> Solo entry untuk Vibe Coding Challenge.

## 📚 Referensi & Acknowledgment

- [Dokumentasi Nox Protocol iExec](https://docs.iex.ec/nox-protocol/getting-started/welcome)
- [Confidential DeFi Wizard iExec](https://cdefi-wizard.iex.ec/)
- [Demo Confidential Token + Faucet](https://cdefi.iex.ec/)
- [Paket npm iExec Nox](https://www.npmjs.com/org/iexec-nox)
- [iExec-Nox demo-ctoken (referensi cUSDC address)](https://github.com/iExec-Nox/demo-ctoken)
- [Linktree Developer iExec](https://linktr.ee/iexec.tech)
- [Dokumentasi ChainGPT](https://chaingpt.org)
- [ERC-7984 — Confidential Token Extension](https://eips.ethereum.org/)
- Terinspirasi secara semangat (bukan kode) dari [SQUIDL](https://ethglobal.com/showcase/squidl-psquk) — Finalist ETHGlobal Singapore 2024 — yang membuktikan bahwa UX privasi level konsumer dapat dicapai di EVM. StealthGive menerapkan prinsip yang sama (batas transparan, interior privat) ke domain crowdfunding, bukan pembayaran personal.

## 📜 Lisensi

MIT © 2026 kontributor StealthGive. Lihat [LICENSE](LICENSE).

---

<div align="center">

**Dibangun untuk [iExec Vibe Coding Challenge](https://docs.iex.ec/) · April 2026**

**Ditenagai Nox · Token cSGD Self-Sovereign · Deploy di Arbitrum Sepolia**

</div>

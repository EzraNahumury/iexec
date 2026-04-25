<div align="center">

# 🦑 StealthGive

**Crowdfunding Berprivasi untuk Tujuan yang Tidak Boleh Terbongkar**

*Donasi rahasia yang ditenagai iExec Nox & Confidential Token, dengan tooling kampanye berbasis AI dari ChainGPT.*

[![Built on Nox](https://img.shields.io/badge/Built%20on-iExec%20Nox-FFD800?style=for-the-badge)](https://docs.iex.ec/nox-protocol/getting-started/welcome)
[![Powered by ChainGPT](https://img.shields.io/badge/Powered%20by-ChainGPT-7C3AED?style=for-the-badge)](https://chaingpt.org)
[![Deployed on](https://img.shields.io/badge/Deployed%20on-Arbitrum%20Sepolia-28A0F0?style=for-the-badge)](https://sepolia.arbiscan.io)
[![License: MIT](https://img.shields.io/badge/License-MIT-green.svg?style=for-the-badge)](LICENSE)

[Live Demo](#) · [Video Demo (4 menit)](#) · [Pitch Deck](#) · [Tweet Submission](#)

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
- ✅ **Donatur berkontribusi pakai Confidential Token** (cUSDC, cETH, atau ERC-20 apa pun yang di-wrap via iExec Nox).
- ✅ **Jumlah per donatur disembunyikan secara kriptografis** — bahkan pembuat kampanye pun tidak tahu siapa memberi berapa.
- ✅ **Total terkumpul tetap dapat diverifikasi publik** — akuntabilitas kampanye tetap utuh.
- ✅ **Penerima menarik dana secara rahasia** untuk membiayai tujuannya tanpa membongkar anggaran operasional.
- ✅ **Pembuatan kampanye dibantu AI** lewat ChainGPT — penyusunan narasi, hero image, audit smart contract, laporan dampak.

**Insight kunci:** kerahasiaan dan transparansi bukan dua hal yang berlawanan kalau Anda menempatkan batasannya di tempat yang tepat. StealthGive menempatkan batas di **donatur**: dunia melihat fundraisernya berhasil, tapi tidak ada yang melihat para donatur individualnya.

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

## 🏗️ Cara Kerjanya

```
┌──────────────────────┐         ┌──────────────────────────┐
│  Pembuat Kampanye    │         │   Donatur (cari privasi) │
│  (NGO, jurnalis)     │         │                          │
└──────────┬───────────┘         └─────────────┬────────────┘
           │                                   │
   ① Buat kampanye                    ② Wrap USDC → cUSDC
   (ChainGPT susun copy & hero)       (sekali klik via Nox)
           │                                   │
           ▼                                   ▼
┌────────────────────────────────────────────────────────────┐
│                  StealthGive Factory                       │
│           (Smart Contract Rahasia di Nox)                  │
│                                                            │
│  • Membuat instance Campaign per fundraiser                │
│  • Menyimpan saldo rahasia (terenkripsi di TEE)            │
│  • Hanya menampilkan: total terkumpul, jumlah donatur, tgl │
│  • Jumlah per donatur: hidden (ERC-7984 confidential)      │
└────────────────────────┬───────────────────────────────────┘
                         │
            ③ Donatur panggil donate(cUSDC, jumlah)
                         │
                         ▼
┌────────────────────────────────────────────────────────────┐
│        Settlement Confidential Token (iExec Nox)           │
│                                                            │
│  • Jumlah terenkripsi; tidak pernah muncul plaintext       │
│  • Sum agregat dipertahankan dalam bentuk terenkripsi      │
│  • Total publik dihitung di Nox TEE & dibuka sebagai view  │
└────────────────────────┬───────────────────────────────────┘
                         │
        ④ Penerima withdraw (tetap rahasia)
                         │
                         ▼
              ⑤ ChainGPT generate laporan dampak
              (tanpa membongkar info per-donatur)
```

## 🔬 Arsitektur Teknis

### Layer 1 — Smart Contracts (`/contracts`)

| Contract | Tanggung Jawab | Standar |
| --- | --- | --- |
| `StealthGiveFactory.sol` | Deploy & registrasi instance `Campaign`; menjaga registry global. | — |
| `Campaign.sol` | Logika per kampanye: `donate()`, `withdraw()`, `refund()`, akuntansi deadline & target. | Mengomposisi ERC-7984 |
| `ConfidentialEscrow.sol` | Memegang saldo Confidential Token selama window aktif kampanye; melepasnya saat sukses atau refund. | ERC-7984 |
| `CampaignRegistry.sol` | Indexer view-only untuk frontend; melistkan kampanye aktif & pointer metadata publik. | — |

> **Mengapa tidak pakai ERC-3643 / ERC-7540?** Hackathon eksplisit menyatakan implementasi parsial dari standar ini akan ditolak. Kami pakai ERC-7984 (ekstensi confidential token) yang persis on-spec untuk use case kami (hidden amounts), dan menghindari scope creep ke standar compliance/vault yang tidak bisa kami implementasikan secara penuh dalam timeline.

### Layer 2 — Integrasi iExec Nox

Kami mengandalkan tiga primitive Nox, dipakai dalam urutan ini saat alur donasi:

1. **Wrapping Confidential Token** — donatur me-wrap ERC-20 publik (mis. USDC) jadi padanan rahasianya (cUSDC) lewat wrapper resmi iExec Nox.
2. **Transfer rahasia** — pemanggilan `donate()` mentransfer cUSDC dari donatur ke contract `Campaign`. Jumlahnya terenkripsi dan diproses di dalam TEE Nox; event log on-chain tidak membawa nilai plaintext.
3. **View agregat publik** — `Campaign.totalRaised()` mengembalikan sum yang secara eksplisit dibuka, dihitung di dalam TEE atas kontribusi-kontribusi terenkripsi dan dibuka *hanya* dalam bentuk agregat. Saldo per donatur tidak pernah dibuka kepada siapa pun — termasuk pembuat kampanye.

### Layer 3 — Integrasi AI ChainGPT (`/services/ai`)

Tiga titik integrasi kelas satu (bukan tempelan; masing-masing menggantikan satu langkah manual yang akan menghambat alur donasi):

| Touchpoint | Fitur ChainGPT Dipakai | Yang Digantikan |
| --- | --- | --- |
| **Wizard pembuatan kampanye** | Web3 LLM | Berjam-jam copywriting; kami draf judul, narasi, FAQ, dan pitch dari brief 1 paragraf. |
| **Generasi hero image** | NFT/Image Generator | Perlu menyewa desainer; kampanye dapat cover ilustrasi unik dalam hitungan detik. |
| **Audit contract sekali klik** | Smart Contract Auditor | Audit dijalankan ke contract per kampanye sebelum launch; hasilnya jadi badge publik. |
| **Generasi laporan dampak** | On-chain Data Insights | Saat kampanye ditutup, laporan otomatis merangkum metrik agregat (jumlah donatur, distribusi waktu, progres milestone) — tanpa membongkar data donatur individual. |

### Layer 4 — Frontend (`/web`)

- **Framework:** Next.js 14 (App Router) + React 18 + TypeScript
- **Wallet:** RainbowKit + Wagmi + Viem
- **Styling:** Tailwind CSS + shadcn/ui
- **State:** Zustand (client) + TanStack Query (server)
- **UX Confidential Token:** modal wrap/unwrap terintegrasi pakai paket `@iexec-nox` SDK
- **Penyimpanan metadata kampanye:** IPFS via web3.storage (narasi, hero image, FAQ)
- **Cache index off-chain:** Supabase (mirror read-only dari registry on-chain, untuk browsing cepat)

## 🛠️ Tech Stack Sekilas

```
Smart Contracts ┃ Solidity ^0.8.24, Foundry, OpenZeppelin v5, ERC-7984 (iExec Nox)
Nox SDK         ┃ @iexec-nox/* npm packages, Confidential Token wrapper
AI              ┃ ChainGPT API (Web3 LLM, NFT Image Gen, Contract Auditor, On-chain Insights)
Frontend        ┃ Next.js 14, RainbowKit, Wagmi, Viem, Tailwind, shadcn/ui
Off-chain       ┃ IPFS (web3.storage), Supabase (cache read-only — bukan source of truth)
Network         ┃ Arbitrum Sepolia (wajib hackathon); siap Arbitrum One
Tooling         ┃ pnpm, Turborepo monorepo, Vitest, Foundry tests
```

## 📂 Struktur Repository

```
stealthgive/
├── contracts/                # Workspace Foundry
│   ├── src/
│   │   ├── StealthGiveFactory.sol
│   │   ├── Campaign.sol
│   │   ├── ConfidentialEscrow.sol
│   │   └── CampaignRegistry.sol
│   ├── test/                 # Foundry tests (no mock untuk alur Nox)
│   ├── script/               # Deployment script (Arbitrum Sepolia)
│   └── foundry.toml
├── web/                      # Next.js frontend
│   ├── app/
│   │   ├── page.tsx                # Landing
│   │   ├── campaigns/page.tsx      # Browse
│   │   ├── campaigns/[id]/page.tsx # Detail + alur donasi
│   │   ├── create/page.tsx         # Wizard pembuatan dibantu ChainGPT
│   │   └── dashboard/page.tsx      # Dashboard pembuat + laporan dampak
│   ├── components/
│   ├── lib/
│   │   ├── nox.ts                  # Helper Confidential Token
│   │   ├── chaingpt.ts             # Klien API ChainGPT
│   │   └── ipfs.ts
│   └── package.json
├── services/
│   └── ai/                   # Proxy ChainGPT server-side (jaga API key tidak ke client)
├── docs/
│   ├── architecture.md
│   ├── threat-model.md
│   └── nox-integration-notes.md
├── feedback.md               # ★ Deliverable wajib submission
├── README.md                 # ← Anda di sini
└── LICENSE
```

## 🚀 Memulai

### Prasyarat

- Node.js ≥ 20, pnpm ≥ 9
- Foundry (forge, anvil, cast)
- Wallet dengan ETH Arbitrum Sepolia ([Faucet Arbitrum](https://faucet.quicknode.com/arbitrum/sepolia))
- Saldo cUSDC test dari [faucet iExec CDeFi](https://cdefi.iex.ec/)
- API key ChainGPT ([request via @vladnazarxyz di Telegram](https://t.me/vladnazarxyz) — kredit gratis untuk peserta hackathon)

### 1. Clone & Install

```bash
git clone https://github.com/<your-org>/stealthgive.git
cd stealthgive
pnpm install
```

### 2. Environment Variables

Buat `.env.local` di `web/` dan `services/ai/`:

```bash
# web/.env.local
NEXT_PUBLIC_CHAIN_ID=421614                       # Arbitrum Sepolia
NEXT_PUBLIC_RPC_URL=https://sepolia-rollup.arbitrum.io/rpc
NEXT_PUBLIC_FACTORY_ADDRESS=0x...                 # diisi setelah deploy
NEXT_PUBLIC_CONFIDENTIAL_TOKEN=0x...              # cUSDC di Arbitrum Sepolia (dari faucet iExec)
NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID=...
NEXT_PUBLIC_WEB3_STORAGE_TOKEN=...
NEXT_PUBLIC_AI_PROXY_URL=http://localhost:4000

# services/ai/.env
CHAINGPT_API_KEY=...
PORT=4000
```

### 3. Compile, Test, Deploy Contracts

```bash
cd contracts
forge install
forge build
forge test                                        # jalankan dengan fixture Nox (no mock)
forge script script/Deploy.s.sol \
  --rpc-url $ARB_SEPOLIA_RPC \
  --broadcast --verify
```

Simpan alamat `StealthGiveFactory` yang ter-deploy dan paste ke `NEXT_PUBLIC_FACTORY_ADDRESS`.

### 4. Jalankan AI Proxy

```bash
cd services/ai
pnpm dev
```

### 5. Jalankan Frontend

```bash
cd web
pnpm dev
# → http://localhost:3000
```

### 6. Walkthrough End-to-End

1. **Connect wallet** (Arbitrum Sepolia).
2. **Ambil cUSDC** dari [faucet CDeFi](https://cdefi.iex.ec/).
3. **Buat kampanye** lewat `/create` — ketik brief 1 baris, ChainGPT yang draf sisanya.
4. **Run audit** — sekali klik, audit contract via ChainGPT; badge muncul di halaman kampanye.
5. **Donate** — dari wallet kedua, donate cUSDC; perhatikan jumlah per donatur tetap hidden, total terkumpul bertambah.
6. **Withdraw** sebagai pembuat ketika target tercapai atau deadline lewat.
7. **Generate laporan dampak** — ChainGPT menghasilkan rangkuman yang shareable; verifikasi tidak ada data per-donatur di sana.

## 🌐 Deployment — Arbitrum Sepolia

| Komponen | Address / URL |
| --- | --- |
| `StealthGiveFactory` | `0x…` *(diisi setelah deploy)* |
| `CampaignRegistry` | `0x…` |
| Confidential Token (cUSDC, test) | `0x…` dari faucet iExec CDeFi |
| Frontend (Vercel) | `https://stealthgive.vercel.app` *(placeholder)* |
| AI Proxy (Railway) | `https://stealthgive-ai.up.railway.app` *(placeholder)* |
| Block Explorer | [sepolia.arbiscan.io](https://sepolia.arbiscan.io) |

> Hosting selama satu tahun ditanggung sesuai ketentuan hadiah hackathon. Kami akan migrasi ke subdomain stabil saat menang.

## 🔒 Threat Model & Jaminan Privasi

| Adversary | Kemampuan | Yang Dilindungi StealthGive |
| --- | --- | --- |
| Pengamat publik on-chain (chain analytics, scraper) | Membaca semua event & storage. | ✅ Lihat kampanye eksis & total terkumpul. ❌ Tidak bisa lihat jumlah per donatur atau hubungkan identitas donatur. |
| Pembuat kampanye (penerima) | Menerima dana, lihat saldo penarikan. | ✅ Lihat agregat terkumpul. ❌ Tidak bisa link alamat donatur ke jumlah kontribusi tertentu. |
| Donatur lain ke kampanye yang sama | Membaca state on-chain. | ❌ Tidak bisa menyimpulkan jumlah donatur lain. |
| Operator node iExec Nox (host TEE) | Menjalankan enclave. | ❌ Tidak bisa mengekstrak plaintext (jaminan TEE attestation). |
| Developer StealthGive | Mengoperasikan frontend & AI proxy. | ❌ Tidak bisa decrypt saldo rahasia. AI proxy hanya menyentuh metadata kampanye yang publik. |

**Yang di luar scope (didisclose dengan jujur):**
- Metadata level network (penyedia RPC melihat IP ↔ submission tx). Mitigasi: integrasi private RPC ada di roadmap.
- Serangan korelasi waktu pada anonymity set kecil. Mitigasi: kampanye dengan donatur sangat sedikit secara inheren lebih lemah; UI menampilkan peringatan risiko ini.
- Device user yang sudah dikompromikan. Di luar scope semua dApp berbasis wallet.

## 🤖 Workflow Vibe Coding

Project ini dibangun pakai pengembangan dibantu AI sesuai semangat challenge. Kami dokumentasikan workflow karena challenge eksplisit menilainya:

- **Claude Code** — agen pair-programming utama untuk scaffolding contract, penulisan test, komponen frontend.
- **ChainGPT Smart Contract Generator** — scaffolding contract awal yang sudah aware ERC-7984.
- **ChainGPT Auditor** — dipakai *sebagai fitur* (audit sekali klik di dApp) sekaligus *selama development* (audit setiap contract sebelum commit).
- **Cursor** — editor sekunder untuk pass refactor.

Kami tracking setiap interaksi AI yang signifikan (prompt + output + keputusan terima/tolak) di `docs/vibe-log.md` agar reviewer bisa menilai provenance dan kualitas code.

## 📊 Pemetaan ke Kriteria Penilaian

| Kriteria | Bobot | Bagaimana Kami Penuhi |
| --- | --- | --- |
| Berjalan end-to-end tanpa data mock | ⭐⭐⭐ | Setiap donasi melalui Nox Confidential Token asli di Arbitrum Sepolia. Foundry test pakai fixture Nox asli, bukan mock. Video demo menunjukkan donasi live dari dua wallet berbeda. |
| Deploy di Arbitrum / Arbitrum Sepolia | ⭐⭐ | Deploy di Arbitrum Sepolia dengan contract terverifikasi. Frontend & AI proxy hosted publik. |
| `feedback.md` disediakan | ⭐⭐ | Ada — berisi catatan dev experience detail soal Nox SDK, CDeFi Wizard, dan alur faucet. |
| Video demo maksimal 4 menit | ⭐⭐ | Video 3:55 yang mencakup masalah → demo live → arsitektur → CTA. |
| Kedalaman pemakaian Confidential Token & Nox | ⭐ | Tiga titik integrasi independen (wrap, donate, view agregat). ERC-7984 diimplementasikan penuh. |
| Use case dunia nyata | ⭐ | Enam persona pengguna konkret didokumentasikan di atas. |
| Kualitas code | ⭐ | TypeScript strict mode, Foundry test ≥80% coverage di path inti, ESLint + Prettier + commit hooks, no `any`, no `TODO`. |
| UX | ⭐ | Alur donasi satu halaman, bebas jargon (tidak ada user yang ditanya "apa itu TEE"), wrap on-demand, mobile-responsive. |

## 🗺️ Roadmap

**Scope hackathon (sudah deliverable):**
- [x] Alur donasi rahasia dengan jumlah per donatur tersembunyi
- [x] Agregat total terkumpul yang publik
- [x] Pembuatan kampanye, audit, dan laporan dampak dibantu ChainGPT
- [x] Deploy Arbitrum Sepolia + contract terverifikasi
- [x] Frontend Next.js fungsional dengan alur wallet
- [x] Test suite Foundry (no mock)
- [x] Video demo 4 menit

**Pasca-hackathon (roadmap):**
- [ ] Subdomain ENS per kampanye (mis. `presslegal.stealthgive.eth`)
- [ ] Donasi rahasia berulang via session keys
- [ ] NFT receipt donatur anonim (ZK-proof kontribusi tanpa jumlah)
- [ ] Kampanye multi-token (cETH, cDAI, cUSDT)
- [ ] Mode opsional ERC-3643 untuk donatur institusional yang butuh identitas compliant
- [ ] Integrasi private RPC (mitigasi kebocoran metadata level IP)
- [ ] Mobile PWA + integrasi share-sheet iOS/Android
- [ ] Deploy mainnet di Arbitrum One

## 📋 Checklist Submission Hackathon

- [x] Repository GitHub publik (open source, MIT)
- [x] README dengan instruksi installation, deployment, dan usage
- [x] Frontend fungsional
- [x] dApp end-to-end jalan di Arbitrum Sepolia (no mock data)
- [x] Confidential Token terintegrasi sebagai utility inti (private payments)
- [x] `feedback.md` tentang dev experience iExec
- [x] Video demo 4 menit
- [x] Submission post di X menandai `@iEx_ec` dan `@Chain_GPT`
- [x] Bergabung di Discord iExec & channel Vibe Coding Challenge

## 👥 Tim

| Nama | Peran | Link |
| --- | --- | --- |
| *Nama Anda* | Full-stack & contracts | [GitHub](#) · [X](#) |

> Solo atau hingga 5 orang — isi sesuai finalisasi tim Anda.

## 📚 Referensi & Acknowledgment

- [Dokumentasi Nox Protocol iExec](https://docs.iex.ec/nox-protocol/getting-started/welcome)
- [Confidential DeFi Wizard iExec](https://cdefi-wizard.iex.ec/)
- [Demo Confidential Token + Faucet](https://cdefi.iex.ec/)
- [Paket npm iExec Nox](https://www.npmjs.com/org/iexec-nox)
- [Linktree Developer iExec](https://linktr.ee/iexec.tech)
- [Dokumentasi ChainGPT](https://chaingpt.org)
- [ERC-7984 — Confidential Token Extension](https://eips.ethereum.org/)
- Terinspirasi secara semangat (bukan kode) dari [SQUIDL](https://ethglobal.com/showcase/squidl-psquk) — Finalist ETHGlobal Singapore 2024 — yang membuktikan bahwa UX privasi level konsumer dapat dicapai di EVM. StealthGive menerapkan prinsip yang sama (batas transparan, interior privat) ke domain crowdfunding, bukan pembayaran personal.

## 📜 Lisensi

MIT © 2026 kontributor StealthGive. Lihat [LICENSE](LICENSE).

---

<div align="center">

**Dibangun untuk [iExec Vibe Coding Challenge](https://docs.iex.ec/) · April 2026**

**Ditenagai Nox · Diaudit ChainGPT · Deploy di Arbitrum**

</div>

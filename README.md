# <img src="https://avatars.githubusercontent.com/u/108554348?s=200&v=4" alt="Base Logo" width="35" height="35" style="vertical-align: middle; margin-right: 10px;"> SawerBase
### Next-Gen On-Chain Donation Platform for Creators

**RECEIVE CRYPTO. STREAM LIVE. OWN YOUR EARNINGS.**

---

# Key Pain Points

### 1. HIGH FEES & MIDDLEMEN

Traditional donation platforms take 5-10% cuts from creator earnings. Payment gateways add even more processing fees, reducing the actual amount received.

### 2. CRYPTO ONBOARDING FRICTION

Viewers want to support creators with crypto, but connecting wallets, managing gas fees, and understanding networks is a major barrier for non-native users.

### 3. NO REAL-TIME ON-CHAIN ALERTS

Most crypto transfers are silent. They don't trigger stream alerts (OBS) instantly, requiring complex webhook setups or manual monitoring by the creator.

---

# What is SawerBase?

A decentralized application (dApp) that lets creators **accept crypto donations** on **Base** with a **Web2-like UX** and seamless real-time streaming integration.

* **Seamless Onboarding** via Privy (Email/Social Login)
* **Smart Wallet Integration** for a Gasless experience
* **Real-time OBS Overlay** for instant live notifications

---

# Core Features

### 1. Hybrid Auth (Privy)

Users can login with Email (creating an automatic Smart Wallet) or connect existing Web3 Wallets (Metamask, Coinbase Wallet, etc.).

### 2. Stream Overlay

Dedicated overlay URL for OBS/Streamlabs. Alerts pop up instantly on-stream when a donation is confirmed on-chain./page.tsx]

### 3. Creator Dashboard

A centralized hub to track donation history and overlay menu.

### 4. Direct Settlement

Donations go directly to the creator's wallet. No holding periods, no minimum withdrawal thresholds.

---

# Built on Base Ecosystem

### Frontend & Logic (Next.js 16 + TypeScript)

* **App Router Architecture:** Modular routing for the `(main)` dashboard and optimized `(overlaypage)` public views.
* **UI Components:** Shadcn/UI (Radix), Tailwind CSS, and Framer Motion for smooth alert animations.
* **State Management:** TanStack Query for efficient server-state synchronization.

### Authentication & Web3 (Privy + Wagmi)

* **Privy:** Embedded wallets for email users to remove seed phrase anxiety.
* **Wagmi & Viem:** Robust hooks for interacting with the Base network and smart contracts.

### Backend & Realtime (Supabase)

* **Database:** Manages user profiles, donation indexing, and configuration settings.
* **Realtime:** Subscriptions ensure overlay alerts fire the millisecond a donation is recorded, without polling.

---

# Project Structure

```bash
sawerbase/
├── src/
│   ├── app/
│   │   ├── (main)/          # Dashboard, Leaderboard, History pages
│   │   ├── (overlaypage)/   # Lightweight public overlays for OBS
│   │   └── api/             # Next.js API Routes
│   ├── components/
│   │   ├── auth/            # Login & Registration logic (Privy)
│   │   ├── features/        # Donation widgets, alerts
│   │   └── ui/              # Reusable UI components
│   ├── hooks/               # Custom hooks (useDonationLogic, useRealtime)
│   ├── lib/                 # Supabase & Utils
│   └── providers/           # Context providers (Privy, QueryClient)
└── public/                  # Static assets

```

---

# Getting Started

### Prerequisites

* Node.js 18+
* Supabase Project
* Privy App ID
* Smart Contract
* Mock IDRX

### Installation

1. **Clone Repository**
```bash
git clone https://github.com/Fnrzz/sawerbase.git
cd sawerbase

```


2. **Install Dependencies**
```bash
npm install
# or
yarn install

```


3. **Setup Environment Variables**
Create a `.env.local` file and populate it with your keys, including the Smart Contract and Token addresses:
```env
# Auth & Backend
NEXT_PUBLIC_PRIVY_APP_ID=your_privy_app_id
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_key

# Blockchain Config (Base Sepolia/Mainnet)
NEXT_PUBLIC_SMART_CONTRACT_ADDRESS=0x... # Your SawerBase Contract
NEXT_PUBLIC_IDRX_ADDRESS=0x...           # IDRX Token Address

```


4. **Run Development Server**
```bash
npm run dev

```



Open [http://localhost:3000](https://www.google.com/search?q=http://localhost:3000) to view the application.

---

# Roadmap 🗺️

### 📍 Q1 2026: Foundation & MVP (Current)

> *Focus: Core infrastructure, payments, and basic overlays.*

* [x] **Smart Contracts:** Donation routing contract deployed on Base Sepolia.
* [x] **Auth:** Integrated Privy for Email & Wallet login.
* [x] **Overlay:** Real-time OBS alerts via Supabase Realtime.
* [ ] **Token Support:** Add IDRX  stablecoin support.

### 🚀 Q2 2026: Creator Tools & Customization

> *Focus: Enhancing the streaming experience.*

* [ ] **TTS (Text-to-Speech):** Auto-read donation messages on stream.
* [ ] **Custom Alerts:** Allow creators to upload custom GIFs/Sounds.
* [ ] **Mobile Optimization:** PWA support for managing donations on the go.

### 🌐 Q3 2026: Expansion & Ecosystem

> *Focus: Broadening access and liquidity.*

* [ ] **Multi-Token Swaps:** Donate with any ERC-20, creator receives USDC/IDRX.
* [ ] **Fiat On-Ramp:** Direct IDR to Crypto top-up integration.
* [ ] **Analytics Pro:** Deep dive into donor demographics and peak times.

---

# License

Distributed under the MIT License. See `LICENSE` for more information.

---

**SawerBase — Empowering Creators on Base.**
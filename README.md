# ⚡ NexusAPI: AgentMarket — Pay-per-Use AI & Data API Marketplace

### *The Future of Agentic Commerce powered by x402 Micropayments on Algorand*

[![Algorand TestNet Live](https://img.shields.io/badge/Algorand-TestNet%20Live-000000.svg?style=for-the-badge&logo=algorand)](https://algorand.co)
[![Protocol HTTP 402](https://img.shields.io/badge/Protocol-x402%20HTTP-8A2BE2.svg?style=for-the-badge)](https://x402.org)
[![Next.js 15](https://img.shields.io/badge/Next.js-15%20App%20Router-black?style=for-the-badge&logo=next.js)](https://nextjs.org)
[![DeepSeek AI](https://img.shields.io/badge/DeepSeek-V4%20Orchestration-blue?style=for-the-badge)](https://deepseek.com)
[![TypeScript strict](https://img.shields.io/badge/TypeScript-Strict%20Mode-blue?style=for-the-badge&logo=typescript)](https://www.typescriptlang.org)

---

## 📋 Project Information

- **Team Name**: Arjuna
- **Project Title**: NexusAPI (AgentMarket — Pay-per-Use AI & Data API Marketplace)
- **Track/Theme**: Agentic Commerce / AI Infrastructure / Web3 Payments
- **Algorand Target Network**: `testnet`
- **Wallet Support**: Lute Wallet (AVM testnet transactions signer)

---

## 💡 The Problem (The "Why")

In the emerging agentic economy, autonomous AI agents frequently require specialized micro-capabilities (such as OCR document extraction, multi-language translation, vector embeddings generation, location geocoding, risk scoring, or content moderation) to complete complex objectives. 

However, existing API distribution channels (e.g. AWS Marketplace, Hugging Face, OpenRouter) are built for humans: they require pre-negotiated recurring subscription relationships, credit card checkouts, API key secrets management, and constant human oversight. 

**There is currently no native framework enabling an AI agent to:**
1. **Autonomously Discover** active microservices and evaluate their suitability.
2. **Dynamically Rank and Select** the best provider based on real-time price, quality score, and latency parameters.
3. **Execute Pay-per-Request micro-billing** at the HTTP boundary, bound by local budgetary policies to prevent run-away costs.
4. **Verifiably Audit** transactions after execution via cryptographic receipt hashes showing what was paid for, which provider was selected, and what result was returned.

---

## 🚀 Project Description & Solution

**NexusAPI** solves this by establishing an end-to-end, trustless ecosystem for agentic commerce. It bridges the gap between AI models and decentralized Web3 payments through the **x402 HTTP micropayments protocol** built on the **Algorand blockchain**. 

Instead of manual human setup, a developer's agent is provided a prompt or task (e.g. *"Evaluate this transaction"* or *"Translate 'Hello World' into Hindi"*). The platform autonomously parses the prompt's intent, queries the provider registry, evaluates candidates against strict local spending caps, recommends the winning provider, initiates the on-chain AVM settlement payload via Lute Wallet signature, executes the sandboxed provider logic, and generates compliance invoice and receipt assets.

Every purchase is secured by a robust local **Policy Engine** that restricts spending thresholds (per-request limits, daily caps, and allowlists) so that an autonomous agent can never drain wallets even when running without human supervision.

---

## ⚙️ Architecture & Core Solution Flow

NexusAPI implements a strict 13-stage autonomous pipeline. The logic flow is structured as follows:

```
                  ┌──────────────────────────────┐
                  │          USER TASK           │
                  └──────────────┬───────────────┘
                                 │
                                 ▼
                  ┌──────────────────────────────┐
                  │    DeepSeek Intent Parser    │
                  └──────────────┬───────────────┘
                                 │
                                 ▼
                  ┌──────────────────────────────┐
                  │  Marketplace Query & Search  │
                  └──────────────┬───────────────┘
                                 │
                                 ▼
                  ┌──────────────────────────────┐
                  │   Policy & Budget Check      │  ◄── Enforces per-request/daily caps
                  └──────────────┬───────────────┘
                                 │
                                 ▼
                  ┌──────────────────────────────┐
                  │  Weighted Decision Matrix    │  ◄── Ranks by cost, latency, quality
                  └──────────────┬───────────────┘
                                 │
                                 ▼
                  ┌──────────────────────────────┐
                  │   x402 Micropayments (AVM)   │  ◄── Prompts Lute Wallet signed transaction
                  └──────────────┬───────────────┘
                                 │
                                 ▼
                  ┌──────────────────────────────┐
                  │  Simulated Provider Adapter  │  ◄── Runs category-specific code sandbox
                  └──────────────┬───────────────┘
                                 │
                                 ▼
                  ┌──────────────────────────────┐
                  │    ResultViewer & Exports    │  ◄── Renders UI & exports Invoice/Receipt PDFs
                  └──────────────────────────────┘
```

### The 13 Execution Stages:
1. **Understanding Request**: Extracts categories, query targets, and budget caps using DeepSeek intent models.
2. **Searching Marketplace**: Resolves registered providers corresponding to target categories.
3. **Comparing Providers**: Scores candidates based on pricing, latency, and SLA quality parameters.
4. **Running Policy Engine**: Validates compliance with maximum spending caps.
5. **Running Decision Engine**: Computes weighted scores and selects the optimal winner candidate.
6. **Selecting Provider**: Commits provider logs and compiles payment session configurations.
7. **Creating Payment Session**: Structures the cryptographic x402 payment requirements.
8. **Waiting For Wallet Signature**: Prompts Lute Wallet extension to sign the Algorand TestNet transaction.
9. **Payment Confirmed**: Settles payment on the Algorand ledger and waits for indexer indexing.
10. **Provider Executed**: Directs inputs to the sandboxed execution adapter.
11. **Result Generated**: Compiles raw outputs into the category-specific visual viewer.
12. **Receipt Generated**: Produces a cryptographic, replay-safe receipt mapping SHA-256 hashes.
13. **Invoice Generated**: Packages transactions into standard compliant compliance invoices.

---

## 🛠️ Core Capabilities & Technology Stack

### Frontend & UI
- **Next.js 15** (App Router, Strict TypeScript Mode)
- **Tailwind CSS** (Utility styles) & **Vanilla CSS** (Custom glassmorphic microservice overlays)
- **shadcn/ui** (Radix-based interface elements)
- **Framer Motion** (Subtle, premium physics-based animations for the timeline)
- **Lucide React** (Consistent modern iconography)

### Autonomous Logic & Middleware
- **DeepSeek V4 AI Intent Parser**: Parses raw prompts into structured classifications.
- **x402 Protocol Client**: Handles HTTP 402 handshake verification, nonces, and replay protection.
- **Policy & Decision Engine**: Evaluates allowlists, tracks accumulated daily balances, and ranks candidates using dynamic parameters.
- **PDF Export Center**: Generates compliance-ready PDF downloads for receipts, invoices, and audit reports client-side.
- **Provider Sandbox Adapters**: Category-specific simulated execution adapters returned via a custom `<ResultViewer />`:
  - *OCR*: Formatted invoice scans and text extraction.
  - *Translation*: Multi-lingual grid supporting English, Hindi, French, Spanish, German, and Japanese.
  - *Embeddings*: High-dimensional vector array listings.
  - *Text Generation*: Clean LLM prose layouts.
  - *Speech-to-Text*: Simulated audio waveforms and text transcription.
  - *Image Generation*: Completed abstract photo render previews.
  - *Moderation*: Flagged safety parameter grid.
  - *Risk Scoring*: Risk meter indicating LOW/MEDIUM/HIGH scores and threat factors.
  - *Geocoding*: Mapping query locations to coordinates (Latitude & Longitude).
  - *Sentiment*: Gauge layout showing emotional index values.

### Web3 Blockchain & Payments
- **Algorand TestNet**: Distributed ledger target for sub-second, cheap micropayments.
- **Lute Wallet Connect**: Web3 wallet connector interface (`@txnlab/use-wallet-react`) enabling testnet address association and transaction signature verification.

---

## 📂 Folder Structure

```
FRONTEND/
├── public/                 # Static assets
└── src/
    ├── app/                # Next.js App Router Page components
    │   ├── agent/          # Autonomous Agent Interface (Timeline & Checklist)
    │   ├── dashboard/      # Developer Portal (API Key, Budgets, Ledger history)
    │   ├── marketplace/    # Browsing catalog & comparisons
    │   ├── provenance/     # Cryptographic audit logs trace viewer
    │   └── login/          # Google Sign-In with offline resilient local fallback
    ├── components/         # Reusable layouts
    │   ├── agent/          # Timeline, Completion card, & ResultViewer
    │   ├── Navbar.tsx      # Lute Wallet & Testnet balance querying navbar
    │   └── ModeSelector.tsx# Toggle between manual purchase & autonomous AI mode
    ├── context/            # Shared React state managers
    │   ├── AuthContext.tsx # User session cache
    │   ├── PaymentContext.tsx# Enforces spending budgets, tracks receipts, and traces
    │   └── AgentContext.tsx# Tracks execution pipeline stages
    ├── hooks/              # Query hooks
    │   └── useAlgorandBalance.ts # Queries live TestNet ALGO/USDC ledger balances
    ├── lib/
    │   ├── data/           # Seeder records
    │   ├── x402/           # x402 Client schemas, signatures, & types
    │   └── providers/      # Final Simulated Provider Execution adapters
    │       ├── adapters/   # 10 Category adapters (ocr, translation, etc.)
    │       └── ProviderExecutionService.ts # Orchestrator mapping category keys
    └── services/
        ├── agent/          # DeepSeek model hooks & matrix rankings
        └── pdf/            # jsPDF client template compilation
BACKEND/
├── src/
    ├── controllers/        # Provider CRUD handlers
    ├── models/             # Mongoose schemas with 10 extended categories
    └── services/           # DB Seeder progressive-injection service
```

---

## ⚡ Setup and Installation

### Prerequisites
- **Node.js 18+** and **npm**
- **Lute Wallet Browser Extension** (Configured to **TestNet** & funded via the [Algorand TestNet Dispenser](https://bank.testnet.algorand.network/))

### 1. Clone & Enter Directory
```bash
git clone https://github.com/patelmanan112/CodeRush2.0_arjuna.git
cd CodeRush2.0_arjuna
```

### 2. Install Project Dependencies
Run in the root folder (or inside both `FRONTEND` and `BACKEND` directory):
```bash
# Frontend
cd FRONTEND
npm install

# Backend
cd ../BACKEND
npm install
```

### 3. Environment Variables Configuration
Configure a `.env` file in `FRONTEND`:
```env
NEXT_PUBLIC_DEEPSEEK_API_KEY=your_deepseek_api_key
RESOURCE_PAY_TO=36UMZNGBAZMINJH7266YYGHTR2OLEHTFRREB6ROQI3XA54EQXXCLTZTMG4
```

Configure a `.env` file in `BACKEND`:
```env
PORT=5000
MONGODB_URI=your_mongodb_connection_string
```

### 4. Running the Development Servers
Start both servers concurrently:
```bash
# Start Backend (from BACKEND directory)
npm run dev

# Start Frontend (from FRONTEND directory)
npm run dev
```
The client app will be running at `http://localhost:3000`.

---

## 🔒 Security & Adversarial Resistance
- **Structured Data Validation**: The policy engine and decision scoring models evaluate strictly typed schema values (price numbers, quality ranges, category strings), shielding the client from adversarial prompt injections hidden within free-text provider descriptions.
- **Double-Spend Protection**: The x402 Client enforces strict nonce tracking; replayed payment signatures are verified and rejected at the facilitator layer.
- **Granular Spend Budgets**: Local policies assert strict budget boundaries (per-request caps, daily wallet limits) to restrict autonomous agent leakage.

---

## 🗺️ Roadmap & Completed Tasks
- [x] **Large Provider Database**: Extended seeding configurations to populate 60 realistic providers across 10 categories.
- [x] **Robust Authentication Fallback**: Resolved Google Authentication redirect issues, creating a resilient JWT decoder client-side if authentication servers are offline.
- [x] **On-Chain Balance Inquiries**: Linked the indexer hook to monitor live ALGO and USDC holdings directly from Algorand TestNet.
- [x] **Simulated Provider Execution adapters**: Implemented the final task execution layer and the custom `ResultViewer` formatting engine.
- [x] **Compliance Exports**: Fully implemented client-side PDF compilers for compliance receipts and invoices.
- [x] **13-stage Timeline**: Unified the pipeline execution stages into an animated trace viewer.
- [ ] **Next Steps**: Persistent database migrations for agent audit traces.
- [ ] **Next Steps**: MCP server integrations exposing the API recommendation engine as an agent-callable tool.

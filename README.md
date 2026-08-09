# CodeRush 2.0 | Team Project Readme

## 📋 Project Information

- **Team Name**: Arjuna
- **Project Title**: NexusAPI (AgentMarket — Pay-per-Use AI & Data API Marketplace)
- **Track/Theme**: Agentic Commerce / AI Infrastructure / Web3 Payments
- **Target Network**: Algorand TestNet
- **Wallet Support**: Lute Wallet (AVM TestNet transaction signer), Pera Wallet, Defly Wallet

---

![NexusAPI Banner](./nexusapi_banner.png)

[![Algorand TestNet Live](https://img.shields.io/badge/Algorand-TestNet%20Live-000000.svg?style=for-the-badge&logo=algorand)](https://algorand.co)
[![Protocol HTTP 402](https://img.shields.io/badge/Protocol-x402%20HTTP-8A2BE2.svg?style=for-the-badge)](https://x402.org)
[![Next.js 15](https://img.shields.io/badge/Next.js-15%20App%20Router-black?style=for-the-badge&logo=next.js)](https://nextjs.org)
[![DeepSeek AI](https://img.shields.io/badge/DeepSeek-V4%20Orchestration-blue?style=for-the-badge)](https://deepseek.com)
[![TypeScript strict](https://img.shields.io/badge/TypeScript-Strict%20Mode-blue?style=for-the-badge&logo=typescript)](https://www.typescriptlang.org)

---

## 💡 Project Description

### The Problem
In the emerging agentic economy, autonomous AI agents frequently require specialized micro-capabilities (such as OCR document extraction, multi-language translation, vector embeddings generation, location geocoding, risk scoring, or content moderation) to complete complex objectives. 

However, existing API distribution channels (e.g. AWS Marketplace, Hugging Face, OpenRouter) are built for humans: they require pre-negotiated recurring subscription relationships, credit card checkouts, API key secrets management, and constant human oversight. 

**There is currently no native framework enabling an AI agent to:**
1. **Autonomously Discover** active microservices and evaluate their suitability.
2. **Dynamically Rank and Select** the best provider based on real-time price, quality score, and latency parameters.
3. **Execute Pay-per-Request micro-billing** at the HTTP boundary, bound by local budgetary policies to prevent run-away costs.
4. **Verifiably Audit** transactions after execution via cryptographic receipt hashes showing what was paid for, which provider was selected, and what result was returned.

### The Solution: NexusAPI
**NexusAPI** solves this by establishing an end-to-end, trustless ecosystem for agentic commerce. It bridges the gap between AI models and decentralized Web3 payments through the **x402 HTTP micropayments protocol** built on the **Algorand blockchain**. 

Instead of manual human setup, a developer's agent is provided a prompt or task (e.g. *"Evaluate this transaction"* or *"Translate 'Hello World' into Hindi"*). The platform autonomously parses the prompt's intent, queries the provider registry, evaluates candidates against strict local spending caps, recommends the winning provider, initiates the on-chain AVM settlement payload via Lute Wallet signature, executes the sandboxed provider logic, and generates compliance invoice and receipt assets.

---

## 🛠️ Technical Stack

| Domain | Technologies |
| :--- | :--- |
| **Frontend** | Next.js 15 (App Router), React 19, TypeScript (Strict Mode), Tailwind CSS v4, Framer Motion, Lucide Icons, Radix UI, Recharts, `@txnlab/use-wallet-react` |
| **Backend** | Node.js, Express.js, TypeScript (`tsx`), Mongoose, JSON Web Tokens (`jsonwebtoken`), `bcryptjs`, `pdf-lib`, `qrcode` |
| **Database** | MongoDB (Local Daemon or MongoDB Atlas Cloud Cluster) |
| **AI Engine** | **DeepSeek V4 AI Model**: Prompt Intent Classification & Category/Target Extraction |
| **Protocol & Web3** | **x402 Micropayments Protocol** (`@x402-avm`), **Algorand TestNet** (Algonode API), **Lute Wallet Connect** |

---

## ⚡ Setup and Installation

Follow these step-by-step instructions to get the complete repository running on your local environment.

### Prerequisites
Before starting, ensure you have the following installed:
- **Node.js**: v18.0.0 or higher
- **npm**: v9.0.0 or higher
- **MongoDB**: Local MongoDB daemon running at `mongodb://127.0.0.1:27017` or a remote MongoDB Atlas URI.
- **Lute Wallet Browser Extension**: Installed in Chrome/Brave, switched to **Algorand TestNet**, and funded via the [Algorand TestNet Dispenser](https://bank.testnet.algorand.network/).

### 1. Clone the Repository
```bash
git clone https://github.com/patelmanan112/CodeRush2.0_arjuna.git
cd CodeRush2.0_arjuna
```

### 2. Environment Configuration
Create `.env` files in both `FRONTEND` and `BACKEND` directories (or use `.env.example` as a template).

#### Backend Environment Variables (`BACKEND/.env`):
```env
PORT=4000
MONGODB_URI=mongodb://127.0.0.1:27017/x402-marketplace
JWT_SECRET=dev-secret-change-in-production
JWT_EXPIRES_IN=7d
CORS_ORIGIN=http://localhost:3000
FRONTEND_URL=http://localhost:3000
```

#### Frontend Environment Variables (`FRONTEND/.env`):
```env
NEXT_PUBLIC_APP_URL=http://localhost:3000
NEXT_PUBLIC_API_URL=http://localhost:4000/api/v1
NEXT_PUBLIC_HEALTH_URL=http://localhost:4000/health
NEXT_PUBLIC_DEEPSEEK_API_KEY=your_deepseek_api_key_here

NEXT_PUBLIC_ALGOD_SERVER=https://testnet-api.algonode.cloud
NEXT_PUBLIC_ALGOD_PORT=443
NEXT_PUBLIC_ALGOD_TOKEN=
NEXT_PUBLIC_ALGORAND_NETWORK=testnet
NEXT_PUBLIC_USDC_ASA_ID=10458941
RESOURCE_PAY_TO=36UMZNGBAZMINJH7266YYGHTR2OLEHTFRREB6ROQI3XA54EQXXCLTZTMG4
```

### 3. Install Project Dependencies
Run the install command in both `FRONTEND` and `BACKEND`:
```bash
# Install Frontend Dependencies
cd FRONTEND
npm install

# Install Backend Dependencies
cd ../BACKEND
npm install
```

### 4. Seed the Database
Populate the database with 60 realistic microservice providers across 10 service categories:
```bash
cd BACKEND
npm run seed
```

### 5. Run the Development Servers
Start both backend and frontend servers in separate terminal windows:

**Terminal 1 (Backend Server):**
```bash
cd BACKEND
npm run dev
# Server will run at http://localhost:4000
```

**Terminal 2 (Frontend Client):**
```bash
cd FRONTEND
npm run dev
# Web App will run at http://localhost:3000
```

---

## ⚙️ Architecture & Core Solution Flow

NexusAPI implements an autonomous 13-stage execution pipeline that takes an agent's plain text prompt, classifies intent, scores providers, enforces local policy budgets, signs an Algorand AVM micropayment transaction, executes the microservice adapter, and emits cryptographic receipts.

```
                  ┌──────────────────────────────┐
                  │          USER TASK           │
                  └──────────────┬───────────────┘
                                 │
                                 ▼
                  ┌──────────────────────────────┐
                  │    DeepSeek Intent Parser    │  ◄── Classifies service category & parameters
                  └──────────────┬───────────────┘
                                 │
                                 ▼
                  ┌──────────────────────────────┐
                  │  Marketplace Query & Search  │  ◄── Queries database provider registry
                  └──────────────┬───────────────┘
                                 │
                                 ▼
                  ┌──────────────────────────────┐
                  │   Policy & Budget Check      │  ◄── Validates per-request cap & daily limits
                  └──────────────┬───────────────┘
                                 │
                                 ▼
                  ┌──────────────────────────────┐
                  │  Weighted Decision Matrix    │  ◄── Ranks candidates by cost, latency, quality
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
                  │    ResultViewer & Exports    │  ◄── Visualizes output & builds PDF Invoices
                  └──────────────────────────────┘
```

### The 13 Pipeline Execution Stages

| Stage | Name | Description |
| :--- | :--- | :--- |
| **1** | **Understanding Request** | Parses prompt using DeepSeek AI to identify target category, parameters, and request limits. |
| **2** | **Searching Marketplace** | Queries the database registry for active microservice providers matching the target category. |
| **3** | **Comparing Providers** | Extracts provider SLAs including price per call, response latency, and quality score. |
| **4** | **Running Policy Engine** | Verifies request against local daily wallet caps, single-request budgets, and provider allowlists. |
| **5** | **Running Decision Engine** | Calculates weighted multi-attribute Utility Scores ($Score = w_1 \cdot Cost + w_2 \cdot Latency + w_3 \cdot Quality$). |
| **6** | **Selecting Provider** | Chooses the top candidate provider and locks the payment payload parameters. |
| **7** | **Creating Payment Session** | Constructs the x402 payment request header and nonces for Algorand AVM settlement. |
| **8** | **Waiting For Signature** | Prompts Lute Wallet browser extension to sign the testnet ALGO micro-transaction. |
| **9** | **Payment Confirmed** | Broadcasts transaction to Algorand TestNet and receives confirmation transaction ID. |
| **10** | **Provider Executed** | Routes request payload into the category execution adapter sandbox. |
| **11** | **Result Generated** | Transforms execution outputs into formatted visual components via `<ResultViewer />`. |
| **12** | **Receipt Generated** | Computes SHA-256 cryptographic receipt hash linking request, payment ID, and response payload. |
| **13** | **Invoice Generated** | Builds downloadable compliance PDF invoices and receipts client-side. |

---

## 🧩 Supported Microservice Categories

NexusAPI supports **10 distinct service categories**, each with dedicated mock execution adapters, data schemas, and interactive visual result renderers:

1. 📄 **OCR (Optical Character Recognition)**: Document scanning, text extraction, key-value table extraction.
2. 🌐 **Translation**: Multi-lingual translations supporting English, Hindi, French, Spanish, German, Japanese.
3. 🔢 **Vector Embeddings**: High-dimensional semantic vector floating-point array generation.
4. ✍️ **Text Generation**: Context-aware LLM text completion & summary generation.
5. 🎙️ **Speech-to-Text**: Audio transcription, timestamping, confidence scoring, and waveform preview.
6. 🎨 **Image Generation**: Synthetic prompt-based image creation and visual preview render.
7. 🛡️ **Content Moderation**: Safety classification scoring across toxic, violent, adult, or spam vectors.
8. 📊 **Risk Scoring**: Threat factor detection returning composite LOW, MEDIUM, or HIGH risk indices.
9. 📍 **Geocoding**: Converting addresses into exact latitude, longitude, and elevation coordinates.
10. 😊 **Sentiment Analysis**: Emotional index evaluation returning positive, negative, and neutral metrics.

---

## 📂 Detailed Folder Structure

```
CodeRush2.0_arjuna/
├── README.md                      # Primary project documentation
├── nexusapi_banner.png            # Visual architecture banner graphic
├── .env.example                   # Master environment variables template
├── FRONTEND/                      # Next.js 15 Web Application
│   ├── public/                    # Static images, icons, and assets
│   └── src/
│       ├── app/                   # App Router Pages
│       │   ├── agent/             # Autonomous Agent Pipeline Execution & Timeline
│       │   ├── agent-advisor/     # AI Interactive Agent Recommendation Tool
│       │   ├── become-provider/   # Provider Registration Portal
│       │   ├── compare/           # Provider SLA Comparison Matrix
│       │   ├── dashboard/         # Developer Portal (API Key, Budget Caps, Usage Graphs)
│       │   ├── login/             # Auth Login Page with Google OAuth & Offline Fallback
│       │   ├── marketplace/       # Catalog Browsing & Provider Details
│       │   ├── payment/           # x402 Micropayment Checkout Flow
│       │   ├── provenance/        # Cryptographic Audit Log & Verification Trace
│       │   ├── providers/         # Provider Directory & Category Filtering
│       │   └── trace/             # Step-by-step Execution Visualizer
│       ├── components/            # UI Components
│       │   ├── agent/             # Timeline, Completion Card, & ResultViewer
│       │   ├── Navbar.tsx         # Navigation Bar & Lute Wallet Balances
│       │   └── ModeSelector.tsx   # Manual Purchase vs Autonomous AI Mode Toggle
│       ├── context/               # React State Management
│       │   ├── AuthContext.tsx    # User Login & JWT Session State
│       │   ├── PaymentContext.tsx # Spend Policies, Budget Caps, Audit Receipts
│       │   └── AgentContext.tsx   # 13 Execution Pipeline State Machine
│       ├── hooks/                 # Custom React Hooks
│       │   └── useAlgorandBalance.ts # Live Algorand TestNet ALGO/USDC Balance Poller
│       ├── lib/                   # Libraries & Services
│       │   ├── data/              # Static Mock Data Seeds
│       │   ├── x402/              # x402 Client Handshake & Signature Parsers
│       │   └── providers/         # Category Sandboxed Execution Adapters
│       │       ├── adapters/      # 10 Execution Adapters (OCR, Translation, etc.)
│       │       └── ProviderExecutionService.ts # Category Dispatch Orchestrator
│       └── services/              # External Integrations
│           ├── agent/             # DeepSeek V4 Model Client & Ranking Engine
│           └── pdf/               # PDF Invoice & Receipt Generation Service
└── BACKEND/                       # Node.js + Express REST API Server
    └── src/
        ├── app.ts                 # Express Middleware Setup
        ├── server.ts              # HTTP Server Entry Point
        ├── controllers/           # REST API Route Controllers
        ├── models/                # Mongoose Database Models (Provider, Transaction, Policy)
        ├── routes/                # Express Route Modules
        └── services/              # Database Seeder & Business Logic Services
```

---

## 🔌 API Endpoints Reference

The Backend Express API exposes the following RESTful endpoints:

### Health & Auth
- `GET /health` - Server health check & status
- `POST /api/v1/auth/login` - User authentication / JWT token generation
- `GET /api/v1/auth/me` - Fetch currently authenticated profile

### Providers & Marketplace
- `GET /api/v1/providers` - List all providers (supports `category`, `search`, `minRating` filters)
- `GET /api/v1/providers/:id` - Get specific provider details by ID
- `POST /api/v1/providers` - Register a new provider microservice

### Policies & Spend Control
- `GET /api/v1/policies` - Retrieve user budget policy limits (max price, daily limit, allowlists)
- `PUT /api/v1/policies` - Update user budget policy limits

### Payments & x402 Protocol
- `POST /api/v1/payments/verify` - Verify an x402 Algorand payment receipt signature
- `GET /api/v1/transactions` - Fetch transaction history logs
- `GET /api/v1/receipts/:id` - Fetch cryptographic transaction receipt details

---

## 🔒 Security & Adversarial Resistance

1. **Structured Data Validation**: All provider listings and model outputs are validated against strict Zod and TypeScript schemas, eliminating prompt injection vulnerabilities inside free-text descriptions.
2. **Replay & Double-Spend Protection**: The x402 Protocol Client uses single-use nonces tied to Algorand transaction hashes to ensure signed payment claims cannot be replayed.
3. **Granular Local Budget Policies**: The local Policy Engine enforces strict upper spending limits (per-request caps, daily wallet allowances) before any transaction prompt is sent to Lute Wallet, preventing rogue AI agent drainage.

---

## ❓ Troubleshooting Guide

| Issue | Cause | Solution |
| :--- | :--- | :--- |
| **Lute Wallet fails to connect** | Wallet extension not installed or set to MainNet. | Install Lute Wallet extension, switch network mode to **TestNet**, and refresh the page. |
| **Insufficient Funds Error** | Algorand TestNet account has 0 ALGO. | Copy your public address from Lute Wallet and paste it into the [Algorand TestNet Dispenser](https://bank.testnet.algorand.network/) to receive free test tokens. |
| **MongoDB Connection Failed** | Local daemon is stopped or URI incorrect. | Start MongoDB using `mongod` or check `MONGODB_URI` in `BACKEND/.env`. |
| **DeepSeek API Key Error** | Missing or invalid DeepSeek API Key. | Add `NEXT_PUBLIC_DEEPSEEK_API_KEY` in `FRONTEND/.env` or test using local fallback mock parser mode. |

---

## 🤝 Contributing

Contributions, issues, and feature requests are welcome!

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---

## 📄 License & Acknowledgements

Distributed under the MIT License. See `LICENSE` for more information.

Special thanks to:
- **Algorand Foundation** for high-performance blockchain infrastructure.
- **x402 Protocol Community** for web-standard HTTP 402 payment specifications.
- **DeepSeek AI** for high-speed agentic intent parsing models.

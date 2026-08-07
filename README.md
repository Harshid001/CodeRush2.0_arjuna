# CodeRush 2.0 | Team Project Repository

## Project Information

- **Team Name**: Arjuna
- **Project Title**: Pay-per-Use AI & Data API Marketplace (x402 Micropayments)
- **Track/Theme**: Agentic Commerce & x402 Micropayments / Web3 & AI Micro-transactions

---

## Project Description

### 💡 Executive Summary
The **Pay-per-Use AI & Data API Marketplace** is an end-to-end commerce and API middleware platform designed specifically for the era of **Autonomous AI Agents**. 

As AI agents evolve from simple chat widgets into multi-step task execution engines (browsing the web, querying databases, running code, calling external models), they require real-time access to paid third-party APIs and specialized compute nodes. Traditional billing models—like monthly subscriptions, credit card forms, and centralized OAuth tokens—fail for machine-to-machine micro-transactions.

This project implements the emerging **`x402` payment lifecycle standard** (`HTTP 402 Payment Required`). It allows AI agents and human developers to pay per API call, negotiate resource access, sign cryptographic payment payloads, settle transactions seamlessly on blockchain networks (like Base Sepolia), and enforce spending guardrails.

---

### ⚠️ The Problem Statement
1. **Subscriptions are Broken for AI Agents**: AI agents cannot sign up for monthly SaaS tiers or enter credit cards on web forms on-the-fly.
2. **High Friction for API Providers**: Developers who build niche AI tools or datasets lack a standardized way to charge fractional pennies (e.g., $0.001 per API request).
3. **Budget Overflow & Security Risks**: Uncontrolled AI agents can loop recursively or get prompt-injected, risking thousands of dollars in unexpected API usage without automated budget caps.

---

### 🌟 The Solution: The x402 Ecosystem
Our platform provides a complete ecosystem consisting of:
- **API Marketplace**: A directory where providers list AI tools, dataset scrapers, and compute endpoints with clear per-call pricing.
- **Provider Onboarding Portal**: A flow for developers to publish APIs, set per-request rates, and generate API keys.
- **x402 Protocol Middleware**: An HTTP middleware layer that intercepts API calls, returns `402 Payment Required` headers when payment is missing, verifies cryptographic signatures, and authorizes resource access.
- **Developer & Agent Dashboard**: Real-time telemetry, transaction trace viewer, balance management, budget limit rules, and cryptographic audit receipts.

---

## 🏗️ How It Works (x402 Protocol Flow)

```
┌────────────────┐          1. Request Paid Endpoint          ┌────────────────┐
│   AI Agent /   ├───────────────────────────────────────────►│  Marketplace / │
│   Developer    │                                            │ API Facilitator│
│                │◄───────────────────────────────────────────┤   Middleware   │
│                │      2. HTTP 402 (Payment Requirement)     └──────┬─────────┘
│                │                                                   │
│                │  3. Sign Micropayment Payload (Wallet/Key)        │
│                ├───────────────────────────────────────────┐       │
│                │                                           │       │
│                │  4. Resend Request with x402 Signature      │       │
│                ├───────────────────────────────────────────┼───────┘
│                │                                           │
│                │◄──────────────────────────────────────────┘
│                │    5. 200 OK + API Response + Audit Receipt
└────────────────┘
```

1. **Initial Request**: The client (AI Agent or user) sends an HTTP request to a paid API route.
2. **HTTP 402 Challenge**: The server responds with `HTTP 402 Payment Required`, specifying the price per call, token accepted, and pay-to wallet address.
3. **Payload Signing**: The client constructs a signed authorization payload validating the transaction parameters.
4. **Settlement & Execution**: The middleware validates the payment with the facilitator engine / smart contract.
5. **Fulfillment**: The API executes the requested service and returns data alongside a cryptographic proof receipt.

---

## ✨ Key Features

- 🛒 **Pay-per-Use API Marketplace**: Browse curated AI models, Web3 indexing endpoints, weather tools, and data scrapers with transparent per-request pricing.
- 🔐 **x402 Micropayment Protocol**: Built-in HTTP 402 handling with payment header generation, verification, and settlement validation.
- 🛡️ **Budget Guardrails & Security**: Set strict spending caps per session or per agent to prevent run-away AI loops and prompt injection drain.
- 📊 **Developer Dashboard & Telemetry**: Monitor API revenue, active subscribers, real-time call counts, error rates, and total volume.
- 🔍 **Trace Viewer & Audit Receipts**: Inspect full HTTP header handshakes, signature verification logs, and export cryptographically verifiable receipts.
- 🦊 **Web3 Wallet Integration**: Native support for Wagmi/Viem, MetaMask, and simulated Base Sepolia micropayment clearing.

---

## Technical Stack

List the technologies used in this project:

- **Frontend**: Next.js 16 (App Router), React 19, TypeScript, Tailwind CSS, Lucide React, Framer Motion, Recharts, Wagmi, Viem
- **Backend**: Node.js, Express.js, TypeScript, Mongoose (MongoDB ORM), JWT, Zod, Morgan, Helmet
- **Database**: MongoDB (User accounts, API listings, budget policies, audit receipts, usage analytics)
- **Tools/APIs**: x402 HTTP Micropayment Protocol, Base Sepolia Testnet, MetaMask Web3 Wallet Integration

---

## 📁 Repository Structure

```text
CodeRush2.0_arjuna/
├── BACKEND/                  # Express + TypeScript + MongoDB Server
│   ├── src/
│   │   ├── controllers/      # Auth, API Marketplace, Provider, & Payment logic
│   │   ├── middleware/       # x402 Protocol Interceptor & JWT Validation
│   │   ├── models/           # Mongoose schemas (User, API, Transaction, Policy)
│   │   ├── routes/           # RESTful API route definitions
│   │   └── server.ts         # Server entry point
│   ├── package.json
│   └── .env.example
│
├── FRONTEND/                 # Next.js 16 App Router UI & Web3 Dashboard
│   ├── src/
│   │   ├── app/              # Marketplace, Dashboard, & Provider pages
│   │   ├── components/       # Payment modals, trace view, graphs, & navigation
│   │   └── lib/              # Web3 wagmi config & API fetchers
│   ├── package.json
│   └── next.config.ts
│
└── README.md                 # Project Documentation
```

---

## Setup and Installation

Provide instructions on how to run your project locally:

### 1. Prerequisites
- **Node.js**: v18.0.0 or higher
- **npm**: v9.0.0 or higher
- **MongoDB**: Local instance running on `mongodb://localhost:27017` or MongoDB Atlas URI

---

### 2. Clone the repository
```bash
git clone https://github.com/your-username/CodeRush2.0_arjuna.git
cd CodeRush2.0_arjuna
```

---

### 3. Install dependencies

#### Backend:
```bash
cd BACKEND
npm install
```

#### Frontend:
```bash
cd ../FRONTEND
npm install
```

---

### 4. Configure environment variables

Create and populate `.env` in the `BACKEND` directory:
```bash
cd BACKEND
cp .env.example .env
```

Example `BACKEND/.env`:
```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/x402-marketplace
JWT_SECRET=your_jwt_secret_key_here
NODE_ENV=development
```

---

### 5. Seed the Database (Optional)
To populate sample APIs and provider listings into MongoDB:
```bash
cd BACKEND
npm run seed
```

---

### 6. Start the development server

#### Start Backend Server:
```bash
cd BACKEND
npm run dev
```
*Backend will start on `http://localhost:5000`*

#### Start Frontend App:
```bash
cd FRONTEND
npm run dev
```
*Frontend will start on `http://localhost:3000`*

---

## 👥 Team Arjuna

| Name | Role / Focus |
| :--- | :--- |
| **Harshid Soni** | Team Leader |
| **Manan Patel** | Team Member |
| **Mayank Lumbhani** | Team Member |
| **Aryan Sabasana** | Team Member |
| **Jaydip Valiya** | Team Member |

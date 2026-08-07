# Build Prompt — Phase 2: Express + MongoDB Backend

> Paste this entire document into your coding agent as the task specification.

---

## 0. Your Mission

Build the complete backend for the **Pay-per-Use AI & Data API Marketplace** (x402 micropayment platform). Phase 1 (Next.js frontend with a fully client-side simulated x402 protocol) is **already built and shipped**. Your job is Phase 2: a production-shaped **Express REST API + MongoDB persistence layer** living in the empty `BACKEND/` folder of the monorepo at `D:\NewVolumeE\x420_production\CodeRush2.0_arjuna`.

Do **not** modify anything outside `BACKEND/`. The frontend must keep working untouched — your API must be independently runnable and testable with curl.

## 1. Project Context (facts you must respect)

- **App**: Pay-per-use AI/Data API marketplace using the x402 protocol (HTTP 402 Payment Required → signed payment payload → facilitator verify → metered settle → receipt). Simulated payments on Base Sepolia.
- **Frontend**: Next.js 16.3.0 + React 19 + TypeScript 5 + Tailwind 4 + TanStack React Query v5 (already installed — it will consume your REST API later; design for that).
- **Frontend source of truth** (read these files; your models must mirror their interfaces exactly):
  - `src/lib/x402/types.ts` — canonical TS interfaces: `Provider`, `PaymentRequirement`, `PaymentPayload`, `VerificationResult`, `SettlementResult`, `Receipt`, `PolicyLimits`, `ApiKey`, `PendingApproval`, `TraceStep`, `TransactionTrace`.
  - `src/lib/data/providers.ts` — `INITIAL_PROVIDERS`: 8 seed providers with real field values (copy these exact values into your seed script).
- **Frontend roadmap** (README.md) explicitly plans: *Express.js REST API proxy gateway* + *MongoDB/Mongoose persistent storage for provider registry and historical receipts*. This is what you are building.
- **Existing conventions**: TypeScript everywhere, `p-` prefixed provider IDs, `sim_key_` / `sim_sig_` / `0x_sim_recip_` prefixed simulated credentials, USD simulated currency, categories are an enum (see below).

## 2. Tech Stack (fixed decisions)

| Concern | Choice |
|---|---|
| Runtime | Node.js 20+ (LTS) |
| Language | **TypeScript** with `"type": "module"` (ESM), strict mode |
| HTTP framework | Express 4 (`express`, `cors`, `morgan`, `helmet`) |
| ODM | Mongoose 8 |
| Validation | Zod (`zod`) schemas in a `validate` middleware |
| Auth | `jsonwebtoken` + `bcryptjs` (JWT bearer tokens) |
| Dev runner | `tsx watch` (no ts-node, no build step needed for dev) |
| Scripts | `npm run dev` (tsx watch src/server.ts), `npm run build` (tsc), `npm run start` (node dist/server.js), `npm run seed`, `npm run lint` (eslint), `npm run typecheck` (tsc --noEmit) |
| Env config | `dotenv`, central `config/env.ts` with typed validation |

## 3. Project Layout (exact — no extra folders)

```
BACKEND/
├── package.json
├── tsconfig.json
├── eslint.config.mjs
├── .env.example            # committed
├── .env                    # local, git-ignored
├── .gitignore
└── server/
    ├── server.ts           # entrypoint: bootstrap config → db → app → listen
    ├── app.ts              # express app assembly (middleware, routes, 404, error handler)
    ├── config/
    │   ├── env.ts          # zod-validated env (PORT, MONGODB_URI, JWT_SECRET, CORS_ORIGIN)
    │   └── db.ts           # mongoose.connect + connection events + graceful shutdown
    ├── models/             # one file per collection (Mongoose schemas + TS interfaces)
    │   ├── User.model.ts
    │   ├── Provider.model.ts
    │   ├── Payment.model.ts
    │   ├── Receipt.model.ts
    │   ├── Budget.model.ts
    │   ├── Policy.model.ts
    │   ├── Transaction.model.ts
    │   └── Analytics.model.ts
    ├── controllers/        # thin: parse req → call service → respond
    │   ├── auth.controller.ts
    │   ├── provider.controller.ts
    │   ├── policy.controller.ts
    │   ├── budget.controller.ts
    │   ├── payment.controller.ts
    │   ├── receipt.controller.ts
    │   ├── transaction.controller.ts
    │   └── analytics.controller.ts
    ├── routes/
    │   ├── index.ts        # mounts all routers at /api/v1
    │   ├── auth.routes.ts
    │   ├── provider.routes.ts
    │   ├── policy.routes.ts
    │   ├── budget.routes.ts
    │   ├── payment.routes.ts
    │   ├── receipt.routes.ts
    │   ├── transaction.routes.ts
    │   └── analytics.routes.ts
    ├── middleware/
    │   ├── auth.ts         # JWT verify → req.user; optionalAuth variant
    │   ├── validate.ts     # zod schema validation (body/query/params)
    │   ├── errorHandler.ts # centralized error → JSON envelope
    │   └── notFound.ts     # 404 handler
    ├── services/
    │   ├── auth.service.ts
    │   ├── provider.service.ts
    │   ├── policy.service.ts
    │   ├── budget.service.ts
    │   ├── payment.service.ts    # nonce uniqueness, x402 verify/settle logic
    │   ├── receipt.service.ts
    │   ├── transaction.service.ts
    │   ├── analytics.service.ts
    │   └── seed.service.ts
    └── utils/
        ├── ApiError.ts         # class ApiError extends Error { status, code, details? }
        ├── asyncHandler.ts     # wrap async controllers
        ├── ids.ts              # generateProviderId() → "p_" + slug + short hash; receipt/transaction ids
        ├── hash.ts             # deterministic hashString (mirror frontend lib/utils.ts style)
        └── paginate.ts         # parse {page, limit} → {page, limit, skip}
```

## 4. API Conventions (apply everywhere)

- Base path: `/api/v1`. Health probe: `GET /api/v1/health` → `{ success: true, data: { status: "ok", db: "connected", uptime } }`.
- **Response envelope** (every response, success & error):
  ```json
  { "success": true, "data": { }, "meta": { "page": 1, "limit": 20, "total": 8 } }
  { "success": false, "error": { "code": "VALIDATION_ERROR", "message": "price must be > 0", "details": { "price": ["Must be >= 0.01"] } } }
  ```
- Errors: 400 `VALIDATION_ERROR`, 401 `UNAUTHORIZED`, 403 `FORBIDDEN`, 404 `NOT_FOUND`, 409 `CONFLICT`, 429 `RATE_LIMITED`, 500 `INTERNAL_ERROR`. `ApiError` drives them.
- Timestamps: ISO 8601 strings everywhere (`createdAt`, `updatedAt` via mongoose timestamps).
- IDs: Mongo `_id` plus a stable business `id` field for providers (`p-...`), receipts (`r-...`), payments (`pay-...`), transactions (`tx-...`).
- List endpoints: `?page=1&limit=20`, plus `?search=` (case-insensitive regex on name/description) and `?category=` (exact enum match) and `?active=` (boolean) for providers. Always support sorting `?sort=price|qualityScore|createdAt&order=asc|desc` (default `createdAt desc`).
- Money: always `number` (USD) — do NOT use floating point accumulation for totals; round to cents (use integer micro-USD internally if you prefer, but expose `number` in USD).
- CORS: allow `http://localhost:3000` via env `CORS_ORIGIN`. Morgan dev logging. Helmet security headers.

## 5. MongoDB Collections & Mongoose Models

One collection per model, all with `timestamps: true` unless noted.

### 5.1 `users` — `User.model.ts`
```ts
{
  name: string (required),
  email: string (required, unique, lowercase, indexed),
  passwordHash: string (required, bcrypt),
  role: "admin" | "provider" | "consumer" (default "consumer"),
  walletAddress: string (default "", e.g. "0x_sim_wallet_..."),
  apiKeys: [{ id, key, name, createdAt, status: "active"|"revoked" }],  // key prefixed "sim_key_"
  status: "active" | "suspended" (default "active")
}
```
Service methods: `hashPassword`, `comparePassword` (bcryptjs, 10 rounds). Indexes: `email` unique.

### 5.2 `providers` — `Provider.model.ts`
Mirror the frontend `Provider` interface exactly:
```ts
{
  id: string (unique, required),            // "p-..." e.g. "p-llama3-sentiment"
  name: string (required),
  description: string,
  category: "LLM & NLP" | "Computer Vision" | "Financial & Market Data" | "Code & DevTools" | "Audio & Speech" | "Web Scraping",
  price: number (required, > 0),            // base price (exact) or max cap (upto)
  paymentType: "exact" | "upto" (required),
  qualityScore: number (0–100),
  payToAddress: string (required),
  network: string (default "base-sepolia"),
  endpoint: string (required, URL),
  outputSchema: Record<string, string>,     // e.g. { sentiment: "string" }
  isInjectablePrompt: boolean (default false),
  active: boolean (default true),
  owner: ObjectId ref "User" (optional)     // who published it
}
```
Indexes: `id` unique, `category`, `active`, compound `{ category: 1, active: 1 }`.

### 5.3 `payments` — `Payment.model.ts` (x402 payment lifecycle records)
```ts
{
  id: string (unique),                      // "pay-..."
  providerId: string,
  user: ObjectId ref "User" (optional),
  scheme: "exact" | "upto",
  amount: number,                           // agreed amount
  currency: "USD" (default),
  network: string,
  payToAddress: string,
  nonce: string (unique, required),         // double-spend protection
  expiresAt: string,
  payerKeyId: string,
  signature: string,
  status: "requested" | "signed" | "verified" | "settled" | "failed" | "expired",
  verification: { valid: boolean, reason?: string },
  settlement: { settlementId: string, settledAt: string, finalAmount: number },
  signedAt?: string,
  settledAt?: string
}
```
Indexes: `nonce` unique, `providerId`, `status`.

### 5.4 `receipts` — `Receipt.model.ts`
Mirror frontend `Receipt` exactly:
```ts
{
  id: string (unique),                      // "r-..."
  providerId: string,
  providerName?: string,
  requirement: { providerId, scheme, amount, currency, network, payToAddress, expiresAt, nonce },
  payload: { requirementNonce, amount, payerKeyId, signature, signedAt },
  verification: { valid, reason? },
  settlement: { settled, settlementId, settledAt, finalAmount, errorReason? },
  inputHash: string,
  outputHash: string,
  costActual: number,
  latencyMs: number,
  status: "success" | "failed" | "refunded",
  user: ObjectId ref "User" (optional),
  createdAt: string
}
```
Indexes: `id` unique, `providerId`, `user`, `createdAt` desc (query pattern: latest receipts per user).

### 5.5 `budgets` — `Budget.model.ts` (live spend state, one per user)
```ts
{
  user: ObjectId ref "User" (unique, required),
  spendToday: number,                       // accrued today, cents-accurate
  spendByProvider: { providerId: string, amount: number },
  resetDate: string (ISO date — when spendToday last reset),
  pendingApprovals: [{ id, providerId, providerName, estimatedCost, reason, requestInput, createdAt, status: "pending"|"approved"|"rejected" }]
}
```
One doc per user (upsert pattern). `spendToday` resets when `resetDate !== today`.

### 5.6 `policies` — `Policy.model.ts` (config rules, one per user)
Mirror frontend `PolicyLimits`:
```ts
{
  user: ObjectId ref "User" (unique, required),
  perRequestMax: number,                    // default 5.00
  perProviderDailyMax: number,              // default 8.00
  dailyMax: number,                         // default 20.00
  minQualityScore: number,                  // default 70
  allowlist: string[],                      // provider ids; empty = no restriction
  updatedAt
}
```
Get returns the active doc (creates one with defaults on first GET).

### 5.7 `transactions` — `Transaction.model.ts` (financial ledger)
```ts
{
  id: string (unique),                      // "tx-..."
  user: ObjectId ref "User" (optional),
  providerId: string,
  type: "payment" | "refund" | "fee" | "topup" | "metered_settlement",
  amount: number,                           // signed: + debit, - credit
  currency: "USD",
  status: "pending" | "completed" | "failed" | "refunded",
  nonce?: string (unique when present),
  reference: string,                        // receipt id or payment id
  description: string,
  createdAt
}
```
Indexes: `id` unique, `user`, `providerId`, `createdAt` desc.

### 5.8 `analytics` — `Analytics.model.ts` (precomputed daily aggregates, one doc per user per day)
```ts
{
  user: ObjectId ref "User" (optional),     // null/omitted = platform-wide
  date: string ("YYYY-MM-DD"),
  totalSpend: number,
  requestCount: number,
  settledCount: number,
  failedCount: number,
  avgLatencyMs: number,
  topProviders: [{ providerId, count, spend }],
  perCategorySpend: { category: number }
}
```
Unique compound index `{ user: 1, date: 1 }`. Generated/updated by `analytics.service` whenever a receipt is created (upsert into today's doc).

## 6. API Specification

### 6.1 Provider CRUD — `provider.routes.ts` (PRIORITY: implement first, fully, with tests)

| Method | Path | Auth | Description |
|---|---|---|---|
| GET | `/api/v1/providers` | public | List providers (pagination, `search`, `category`, `active`, `sort`). **Default `active: true` filter when not authed** |
| GET | `/api/v1/providers/:id` | public | Get one by business `id` |
| POST | `/api/v1/providers` | optional JWT | Create provider (if authed, set `owner` to the user) |
| PUT | `/api/v1/providers/:id` | optional JWT | Full/partial update (merge semantics) |
| DELETE | `/api/v1/providers/:id` | optional JWT | **Soft delete**: set `active: false` (never hard-delete; providers are referenced by receipts) |

**Request/response contracts:**

- `GET /api/v1/providers` →
  ```json
  { "success": true, "data": [ /* Provider[] */ ], "meta": { "page": 1, "limit": 20, "total": 8, "totalPages": 1 } }
  ```
- `GET /api/v1/providers/:id` → 200 `{ "success": true, "data": { /* Provider */ } }` | 404 `{ "success": false, "error": { "code": "NOT_FOUND", "message": "Provider p-xyz not found" } }`
- `POST /api/v1/providers` body (validation rules in parens):
  ```json
  {
    "name": "Sentiment API v2" ("required", 2–120 chars, trimmed),
    "description": "..." (0–1000 chars),
    "category": "LLM & NLP" (enum above),
    "price": 0.05 ("required", > 0, ≤ 100000),
    "paymentType": "exact" ("exact"|"upto"),
    "qualityScore": 88 (int 0–100, default 75),
    "payToAddress": "0x_sim_recip_v2_abcd" ("required", must match /^0x_sim_/ or 0x[0-9a-fA-F]{40}),
    "network": "base-sepolia" (default "base-sepolia"),
    "endpoint": "https://..." (required, valid URL),
    "outputSchema": {} (object, optional),
    "isInjectablePrompt": false (boolean, default false),
    "active": true (boolean, default true)
  }
  ```
  → 201 `{ "success": true, "data": { "id": "p-sentiment-api-v2-8f3a", ... } }`. Server generates `id` = slugified name + 4-char suffix (`p-sentiment-api-v2-8f3a`) when not provided. 409 if the generated/duplicate `id` exists.
- `PUT /api/v1/providers/:id` body: any subset of POST fields (partial merge). 404 if not found. 200 with updated doc. Reject changing `id`.
- `DELETE /api/v1/providers/:id` → 200 `{ "success": true, "data": { "id": "p-...", "active": false } }` (idempotent — deleting an already-inactive provider still returns 200). 404 if id unknown.

### 6.2 Auth & Users — `auth.routes.ts`

- `POST /api/v1/auth/register` — `{ name, email, password (min 8), role? }` → 201 `{ success, data: { token, user: { id, name, email, role } } }`. 409 on duplicate email. Auto-create default `Policy` doc and `Budget` doc for the new user.
- `POST /api/v1/auth/login` — `{ email, password }` → 200 same shape. 401 `INVALID_CREDENTIALS` otherwise.
- `GET /api/v1/auth/me` — JWT required → 200 `{ id, name, email, role, walletAddress, apiKeys (masked: last 4 chars only) }`.
- `POST /api/v1/auth/api-keys` — JWT required → create `sim_key_` credential (id: `sim_key_` + 8 random alnum), store hashed in the user doc; return the raw key **once**.
- `DELETE /api/v1/auth/api-keys/:id` — JWT required → revoke (set status `revoked`).
- JWT payload: `{ sub: userId, role }`, expiry `7d`. `auth` middleware rejects missing/invalid tokens with 401; `optionalAuth` attaches user if present.

### 6.3 Policies & Budgets — `policy.routes.ts`, `budget.routes.ts` (JWT required)

- `GET /api/v1/policies` → current policy doc (create-with-defaults if missing).
- `PUT /api/v1/policies` → partial update; validate: `perRequestMax ≤ perProviderDailyMax ≤ dailyMax`, `minQualityScore` 0–100, allowlist array of strings. 400 `VALIDATION_ERROR` otherwise.
- `GET /api/v1/budgets` → `{ spendToday, resetDate, dailyMax, percentUsed, spendByProvider, pendingApprovals }`.
- `POST /api/v1/budgets/reset` → reset `spendToday`/`spendByProvider`, return fresh budget.
- `POST /api/v1/budgets/approvals/:id` — body `{ decision: "approved" | "rejected" }` → update pending approval status.

### 6.4 Payments & x402 facilitator — `payment.routes.ts` (the protocol proxy; JWT required)

- `POST /api/v1/payments/requirement` — body `{ providerId, requestedAmount? }` → 200 `PaymentRequirement` (`{ providerId, scheme, amount, currency, network, payToAddress, expiresAt (+5min), nonce }`). Creates a `payments` doc `status: "requested"`. 404 unknown provider; 400 if provider inactive.
- `POST /api/v1/payments/verify` — body `{ nonce, amount, payerKeyId, signature, signedAt }` → verifies: nonce exists & unused, not expired (`expiresAt` check), amount matches requirement, signature well-formed (`sim_sig_0x` + hex). 409 `NONCE_USED` on replay, 400 `REQUIREMENT_EXPIRED`, 400 `SIGNATURE_INVALID`. Marks doc `verified`.
- `POST /api/v1/payments/settle` — body `{ nonce, meteredUsage? }` → for `exact`: finalAmount = amount. For `upto`: finalAmount = min(amount, meteredUsage || amount). Marks `settled`, upserts `transactions` ledger entry, upserts today's `analytics` doc, records `spendToday` into `budgets`. Returns `SettlementResult` (`{ settled, settlementId, settledAt, finalAmount }`). 409 `ALREADY_SETTLED` if already settled.
- `POST /api/v1/payments/` (record-only) — body = full payment payload → store and return the created payment. (For frontend context writes.)

### 6.5 Receipts — `receipt.routes.ts`

- `POST /api/v1/receipts` — body matches frontend `Receipt` (requirement, payload, verification, settlement, inputHash, outputHash, costActual, latencyMs, status) → 201 stored receipt (server assigns `id: "r-..."` and `createdAt`). 409 if `id`/nonce already recorded (idempotency).
- `GET /api/v1/receipts` — JWT optional; list with pagination, `?providerId=`, `?status=`, `?from=&to=` (createdAt range). Sorted `createdAt desc`.
- `GET /api/v1/receipts/:id` — 200 | 404.

### 6.6 Transactions — `transaction.routes.ts` (JWT required)

- `GET /api/v1/transactions` — pagination + `?providerId=`, `?type=`, `?status=`, `?from=&to=`, `?minAmount=&maxAmount=`.
- `GET /api/v1/transactions/:id` — 200 | 404.
- `GET /api/v1/transactions/summary` → `{ totalPaid, totalRefunded, netSpend, periodStart, periodEnd }` for the current day (or `?days=7|30|90` rolling window).

### 6.7 Analytics — `analytics.routes.ts` (JWT optional; public = platform-wide)

- `GET /api/v1/analytics/daily?days=7` → `[{ date, totalSpend, requestCount, settledCount, failedCount, avgLatencyMs }]` (recent N days, most recent first).
- `GET /api/v1/analytics/top-providers?days=30&limit=5` → ranked by spend.
- `GET /api/v1/analytics/categories?days=30` → per-category spend distribution.

### 6.8 Health

- `GET /api/v1/health` — public, checks mongoose `readyState === 1`.

## 7. Seed Data

`npm run seed` (and auto-seed on first boot if `providers` collection is empty):

1. Copy **all 8 providers** from `src/lib/data/providers.ts` verbatim (names, descriptions — including the prompt-injection test provider `p-injectable-prompt`, prices, quality scores, payToAddresses, networks, endpoints, outputSchemas, flags). This keeps the marketplace UI data-identical.
2. Create a demo admin user `admin@marketplace.demo` / password `admin1234` (document this in README), with default `Policy` and `Budget` docs.
3. Log a summary: `Seeded 8 providers, 1 user`.

## 8. Middleware, Services, Utils — behavior contracts

- `asyncHandler(fn)`: catches rejected promises → `errorHandler`.
- `validate(schema)` factory: parses `req.body`/`req.query`/`req.params` against a zod schema; on failure 400 with per-field `details`.
- `errorHandler`: maps `ApiError` → envelope; zod errors → 400; mongoose duplicate key → 409; unknown → 500 with generic message (log stack server-side only, never leak).
- `notFound`: 404 JSON envelope for unknown routes.
- `payment.service`: encapsulate nonce uniqueness (check + mark atomic with `findOneAndUpdate` on `{ nonce, status: "requested" }` to prevent double-spend races), expiry checks, metered settlement math, and ledger/analytics/budget side-effects. This mirrors `src/lib/x402/facilitator.ts` — port its semantics (reject expired, replay, mismatch).
- `analytics.service`: `recordReceipt(receipt)` upserts today's doc (platform or per-user).
- `seed.service`: idempotent, safe to run repeatedly.
- `utils/ids.ts`: `slugify` + short suffix generators; `hash.ts`: deterministic string hash (same spirit as frontend `hashString`).

## 9. Environment & Config

`.env.example`:
```
PORT=4000
MONGODB_URI=mongodb://127.0.0.1:27017/x402-marketplace
JWT_SECRET=change-me-super-secret
CORS_ORIGIN=http://localhost:3000
```
`config/env.ts` validates these with zod at boot; fail fast with a clear message if missing. `.gitignore`: `node_modules/`, `.env`, `dist/`, logs. `package.json` name: `x402-marketplace-backend`.

## 10. Definition of Done — verify before you finish

1. `npm install && npm run seed` succeeds; `mongod` running locally (or use a MongoDB Atlas URI in `.env`).
2. `npm run dev` boots and logs `MongoDB connected` + `API listening on http://localhost:4000`.
3. `npm run typecheck` and `npm run lint` pass with zero errors.
4. Manual curl verification of the full Provider CRUD surface:
   - `GET /api/v1/providers` → 8 seeded providers.
   - `GET /api/v1/providers/p-llama3-sentiment` → 200; `GET /api/v1/providers/p-does-not-exist` → 404 envelope.
   - `POST /api/v1/providers` (valid body) → 201 with generated `p-` id; duplicate POST → 409; invalid body (bad price/endpoint/category) → 400 with field `details`.
   - `PUT /api/v1/providers/:id` (partial) → 200 merged doc; unknown id → 404.
   - `DELETE /api/v1/providers/:id` → 200 `active: false`; doc still present via GET (by id) and **excluded** from default public list.
5. Full payment lifecycle works via curl: `requirement` → `verify` → `settle` → receipt present in `GET /api/v1/receipts`, transaction in `GET /api/v1/transactions`, and `GET /api/v1/budgets` spendToday increased. Reusing the same nonce returns 409.
6. Auth flows work: register → me → create/revoke api-key; login with wrong password → 401.
7. No modifications outside `BACKEND/`.

## 11. Non-Goals (do NOT build)

- No frontend changes, no Next.js rewrites, no UI work.
- No real blockchain/crypto signing, no wallet integration (simulated `sim_` credentials only — matching Phase 1).
- No Docker/K8s/deployment config, no CI pipelines.
- No tests framework setup unless trivial (a minimal `node --test` smoke test file is optional, not required).
- Do not hard-delete anything; soft-delete only.

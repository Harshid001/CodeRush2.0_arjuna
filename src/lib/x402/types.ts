export type PaymentScheme = "exact" | "upto";

export type NetworkType = "base-sepolia" | "arbitrum-sepolia" | "optimism-sepolia" | "solana-devnet";

export interface PaymentRequirement {
  providerId: string;
  scheme: PaymentScheme;
  amount: number;          // for "exact": fixed price. for "upto": max cap.
  currency: string;        // e.g. "USD" (simulated)
  network: NetworkType | string; // e.g. "base-sepolia" (simulated)
  payToAddress: string;    // simulated recipient identifier, clearly fake format e.g. 0x_sim_recip_...
  expiresAt: string;       // ISO timestamp — requirement is only valid briefly
  nonce: string;           // prevents duplicate payment replay
}

export interface PaymentPayload {
  requirementNonce: string;
  amount: number;
  payerKeyId: string;      // references a simulated key, e.g. sim_key_abc123 (never real key material)
  signature: string;       // output of lib/x402/signature.ts, clearly mock
  signedAt: string;
}

export interface VerificationResult {
  valid: boolean;
  reason?: string;         // populated when valid is false
}

export interface SettlementResult {
  settled: boolean;
  settlementId: string;
  settledAt: string;
  finalAmount: number;     // for "upto", the actual metered amount charged
  errorReason?: string;
}

export interface Receipt {
  id: string;
  providerId: string;
  providerName?: string;
  requirement: PaymentRequirement;
  payload: PaymentPayload;
  verification: VerificationResult;
  settlement: SettlementResult;
  inputHash: string;
  outputHash: string;
  costActual: number;
  latencyMs: number;
  status: "success" | "failed" | "refunded";
  createdAt: string;
}

export interface PolicyLimits {
  perRequestMax: number;
  perProviderDailyMax: number;
  dailyMax: number;
  minQualityScore: number;
  allowlist?: string[];    // provider IDs; if set, only these are purchasable
}

export interface PolicyCheckResult {
  allowed: boolean;
  reason?: string;
  requiresApproval?: boolean;
}

export interface Provider {
  id: string;
  name: string;
  description: string;
  category: "LLM & NLP" | "Computer Vision" | "Financial & Market Data" | "Code & DevTools" | "Audio & Speech" | "Web Scraping";
  price: number;           // base price or max cap
  paymentType: PaymentScheme;
  qualityScore: number;    // 0 to 100
  payToAddress: string;    // fake recipient address
  network: NetworkType | string;
  endpoint: string;
  outputSchema: Record<string, string>;
  isInjectablePrompt?: boolean; // Flag for prompt injection demo provider
  active: boolean;
}

export interface ApiKey {
  id: string;
  key: string;            // prefixed with sim_
  name: string;
  createdAt: string;
  status: "active" | "revoked";
}

export interface PendingApproval {
  id: string;
  providerId: string;
  providerName: string;
  estimatedCost: number;
  reason: string;
  requestInput: unknown;
  createdAt: string;
}

export type TraceStepName =
  | "POLICY_PRECHECK"
  | "HTTP_402_REQUIREMENT"
  | "PAYLOAD_SIGNING"
  | "RETRY_WITH_PAYMENT"
  | "FACILITATOR_VERIFY"
  | "FACILITATOR_SETTLE"
  | "PROVIDER_EXECUTION"
  | "RECEIPT_GENERATED";

export interface TraceStep {
  id: string;
  timestamp: string;
  name: TraceStepName;
  title: string;
  description: string;
  details: Record<string, unknown>;
  status: "success" | "warning" | "error" | "info";
  durationMs: number;
}

export interface TransactionTrace {
  id: string;
  providerId: string;
  providerName: string;
  startedAt: string;
  completedAt?: string;
  steps: TraceStep[];
  status: "pending" | "success" | "failed" | "blocked";
  receiptId?: string;
  errorMessage?: string;
  fallbackAvailable?: boolean;
  fallbackProviderId?: string;
}

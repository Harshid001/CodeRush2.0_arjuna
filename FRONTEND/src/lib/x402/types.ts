import { ALGORAND_TESTNET_CAIP2 } from "@x402-avm/avm";

export const ALGORAND_TESTNET_FACILITATOR_NETWORK = "algorand:SGO1GKSzyE7IEPItTxCByw9x8FmnrCDe";

export type PaymentScheme = "exact" | "upto";

export type NetworkType =
  | typeof ALGORAND_TESTNET_CAIP2
  | typeof ALGORAND_TESTNET_FACILITATOR_NETWORK
  | "algorand-testnet"
  | string;

export interface PaymentRequirement {
  providerId: string;
  scheme: PaymentScheme;
  amount: number;
  currency: string;
  network: NetworkType;
  payToAddress: string;
  expiresAt: string;
  nonce: string;
}

export interface PaymentPayload {
  requirementNonce: string;
  amount: number;
  payerKeyId: string;
  signature: string;
  signedAt: string;
  paymentGroup?: string[];
}

export interface VerificationResult {
  valid: boolean;
  reason?: string;
}

export interface SettlementResult {
  settled: boolean;
  settlementId: string;
  settledAt: string;
  finalAmount: number;
  errorReason?: string;
}

export interface Receipt {
  id: string;
  providerId: string;
  providerName?: string;
  scheme?: PaymentScheme;
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
  allowlist?: string[];
}

export interface PolicyCheckResult {
  allowed: boolean;
  requiresApproval?: boolean;
  reason?: string;
}

export interface ApiKey {
  id: string;
  key: string;
  name: string;
  status?: "active" | "revoked";
  createdAt: string;
  lastUsedAt?: string;
}

export interface PendingApproval {
  id: string;
  providerId: string;
  providerName: string;
  estimatedCost: number;
  reason: string;
  requestInput?: unknown;
  timestamp?: string;
  createdAt?: string;
}

export interface Provider {
  id: string;
  name: string;
  description: string;
  category: string;
  price: number;
  paymentType: PaymentScheme;
  qualityScore: number;
  payToAddress: string;
  network: NetworkType;
  endpoint: string;
  outputSchema: Record<string, string>;
  isInjectablePrompt?: boolean;
  active: boolean;
}

export type TraceStepName =
  | "POLICY_PRECHECK"
  | "HTTP_402_REQUIREMENT"
  | "PAYLOAD_SIGNING"
  | "PAYLOAD_VERIFICATION"
  | "SETTLEMENT"
  | "PROVIDER_EXECUTION"
  | "RECEIPT_GENERATED";

export interface TraceStep {
  id: string;
  type?: TraceStepName;
  name?: TraceStepName;
  title: string;
  description: string;
  status: "info" | "success" | "warning" | "error";
  details?: Record<string, unknown>;
  timestamp: string;
  durationMs?: number;
}

export interface TransactionTrace {
  id: string;
  providerId: string;
  providerName: string;
  steps: TraceStep[];
  status: "completed" | "blocked" | "failed" | "pending" | "success";
  reason?: string;
  receiptId?: string;
  startTime?: string;
  startedAt?: string;
  endTime?: string;
  completedAt?: string;
  errorMessage?: string;
  fallbackAvailable?: boolean;
  fallbackProviderId?: string;
}

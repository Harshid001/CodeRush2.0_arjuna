import { PaymentRequirement, PaymentPayload, VerificationResult, SettlementResult } from "./types";
import { verifyPaymentSignature } from "./signature";
import { generateId } from "../utils";

/**
 * SIMULATED FACILITATOR MODULE
 * 
 * Verifies payment requirements & settles payments.
 * Swapping this simulator for a real x402 facilitator RPC/API client later
 * requires changing only this module, preserving all calling code, UI, and types.
 */

export function verify(
  requirement: PaymentRequirement,
  payload: PaymentPayload,
  usedNonces: Set<string> = new Set()
): VerificationResult {
  // 1. Nonce freshness & replay prevention check
  if (usedNonces.has(requirement.nonce)) {
    return {
      valid: false,
      reason: `REPLAY ATTACK REJECTED: Requirement nonce '${requirement.nonce}' has already been settled. Replay attempt denied.`,
    };
  }

  // 2. Nonce correlation check
  if (payload.requirementNonce !== requirement.nonce) {
    return {
      valid: false,
      reason: `Nonce mismatch: Payload nonce '${payload.requirementNonce}' does not match requirement nonce '${requirement.nonce}'.`,
    };
  }

  // 3. Requirement Expiration check
  const now = new Date();
  const expiresAt = new Date(requirement.expiresAt);
  if (now > expiresAt) {
    return {
      valid: false,
      reason: `Payment requirement expired at ${expiresAt.toLocaleTimeString()}. Current time: ${now.toLocaleTimeString()}.`,
    };
  }

  // 4. Amount validation check
  if (payload.amount !== requirement.amount) {
    return {
      valid: false,
      reason: `PRICE MISMATCH / TINKER REJECTED: Payload amount ($${payload.amount.toFixed(4)}) does not match 402 requirement amount ($${requirement.amount.toFixed(4)}).`,
    };
  }

  // 5. Signature verification check
  const isSigValid = verifyPaymentSignature(payload);
  if (!isSigValid) {
    return {
      valid: false,
      reason: "Signature verification failed: Invalid simulated payment signature header.",
    };
  }

  return {
    valid: true,
  };
}

export function settle(
  requirement: PaymentRequirement,
  payload: PaymentPayload,
  usageMetric?: number, // Decimal 0.1 - 1.0 representing metered usage fraction for "upto" scheme
  options?: { forceFailure?: boolean }
): SettlementResult {
  const settlementId = generateId("tx_settle");
  const settledAt = new Date().toISOString();

  // Test failure case simulation
  if (options?.forceFailure) {
    return {
      settled: false,
      settlementId,
      settledAt,
      finalAmount: 0,
      errorReason: "SIMULATED SETTLEMENT FAILURE: Provider node connection timed out during clearing.",
    };
  }

  let finalAmount = requirement.amount;

  // Handle "upto" metered billing
  if (requirement.scheme === "upto") {
    // Meter actual usage (defaulting to ~65% of max cap if not specified)
    const usageFraction = usageMetric ?? 0.65;
    const rawCalculated = payload.amount * usageFraction;
    // Cap at payload.amount and ensure minimum $0.001
    finalAmount = Math.min(payload.amount, Math.max(0.001, parseFloat(rawCalculated.toFixed(4))));
  } else {
    // "exact" fixed price scheme
    finalAmount = requirement.amount;
  }

  return {
    settled: true,
    settlementId,
    settledAt,
    finalAmount,
  };
}

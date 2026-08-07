import { PaymentPayload } from "./types";
import { hashString } from "../utils";

/**
 * SIMULATED SIGNATURE MODULE
 * 
 * Note: No real cryptographic signing or private keys are used.
 * "Signing" generates a deterministic mock signature hash from the payload details
 * combined with an obviously fake simulated key identifier (e.g., sim_key_dev_default).
 * 
 * Simulated signature — no real key material.
 */

const FAKE_SIMULATED_SECRET_SALT = "SIMULATED_X402_SECRET_SALT_DO_NOT_USE_IN_PROD";

/**
 * Generate a deterministic simulated payment payload signature.
 */
export function signPaymentPayload(
  requirementNonce: string,
  amount: number,
  payerKeyId: string
): string {
  // Combine inputs into a string for deterministic mock signing
  const payloadDataStr = `${requirementNonce}:${amount}:${payerKeyId}:${FAKE_SIMULATED_SECRET_SALT}`;
  const rawHash = hashString(payloadDataStr);
  
  // Return clearly formatted mock signature string
  return `sim_sig_0x${rawHash.replace("0x", "")}`;
}

/**
 * Verify a simulated payment signature.
 */
export function verifyPaymentSignature(payload: PaymentPayload): boolean {
  if (!payload || !payload.signature || !payload.signature.startsWith("sim_sig_")) {
    return false;
  }
  const expectedSignature = signPaymentPayload(
    payload.requirementNonce,
    payload.amount,
    payload.payerKeyId
  );
  return payload.signature === expectedSignature;
}

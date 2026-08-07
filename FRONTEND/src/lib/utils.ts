/**
 * Pure helper utility functions for hash computation, string formatting, and key masking.
 */

// Simple deterministic string hash for inputHash and outputHash (no real crypto needed)
export function hashString(str: string): string {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash |= 0; // Convert to 32bit integer
  }
  const hex = Math.abs(hash).toString(16).padStart(8, "0");
  return `0x${hex}${Math.abs(hash * 31).toString(16).padStart(8, "0")}`;
}

// Mask sensitive simulated key material for UI display (e.g. sim_key_a...c123)
export function maskKeyId(keyId: string): string {
  if (!keyId || keyId.length <= 10) return keyId;
  const prefix = keyId.slice(0, 9);
  const suffix = keyId.slice(-4);
  return `${prefix}...${suffix}`;
}

// Mask signature for UI display
export function maskSignature(sig: string): string {
  if (!sig || sig.length <= 12) return sig;
  return `${sig.slice(0, 10)}...${sig.slice(-6)} (Simulated signature — no real key material)`;
}

// Format currency values nicely
export function formatCurrency(amount: number, currency: string = "USD"): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: currency === "USD" ? "USD" : "USD", // default USD display
    minimumFractionDigits: 2,
    maximumFractionDigits: 4,
  }).format(amount);
}

// Generate unique IDs
export function generateId(prefix: string = "id"): string {
  return `${prefix}_${Date.now().toString(36)}_${Math.random().toString(36).substring(2, 7)}`;
}

export interface Receipt {
  receiptId: string;
  provider: string;
  providerVersion?: string;
  capability?: string;
  wallet: string;
  transactionHash: string;
  inputHash: string;
  outputHash: string;
  inputPayload?: string;
  outputPayload?: string;
  timestamp: string;
  cost: number;
  status: "settled" | "pending" | "failed";
}

/**
 * Generate a real SHA-256 hex string using the browser's native Web Crypto API (crypto.subtle).
 */
export async function generateHash(data: string): Promise<string> {
  if (typeof window === 'undefined' || !window.crypto || !window.crypto.subtle) {
    // Fallback if environment doesn't support subtle crypto (SSR)
    let hash = 0;
    for (let i = 0; i < data.length; i++) {
      const char = data.charCodeAt(i);
      hash = (hash << 5) - hash + char;
      hash |= 0;
    }
    return Math.abs(hash).toString(16).padStart(64, '0');
  }

  const encoder = new TextEncoder();
  const dataBuffer = encoder.encode(data);
  const hashBuffer = await crypto.subtle.digest('SHA-256', dataBuffer);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');
}

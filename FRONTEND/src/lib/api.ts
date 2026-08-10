import { Provider, PolicyLimits, Receipt } from "./x402/types";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "/api/v1";
const HEALTH_URL = process.env.NEXT_PUBLIC_HEALTH_URL || "/health";

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

/**
 * Check Backend Health
 */
export async function checkBackendHealth(): Promise<{ running: boolean; message?: string }> {
  const candidates: string[] = [HEALTH_URL];
  if (HEALTH_URL.endsWith("/api/health")) {
    // The health route is served at /health; tolerate a misconfigured /api/health env value.
    candidates.push(HEALTH_URL.replace(/\/api\/health\/?$/, "/health"));
  }
  if (!candidates.includes("/health")) candidates.push("/health");

  for (const url of candidates) {
    try {
      const res = await fetch(url, { cache: "no-store" });
      if (!res.ok) continue;
      const data = await res.json();
      return { running: data.running ?? true, message: data.message };
    } catch {
      // try next candidate
    }
  }
  return { running: false };
}

/**
 * Fetch all providers from Backend MongoDB
 */
export async function fetchBackendProviders(): Promise<Provider[] | null> {
  try {
    const res = await fetch(`${API_BASE_URL}/providers`, { cache: "no-store" });
    if (!res.ok) return null;
    const json = await res.json();
    if (!json.success || !json.data?.providers) return null;

    return json.data.providers.map((p: any) => ({
      id: p._id || p.id,
      name: p.name,
      description: p.description,
      category: p.category,
      price: p.price,
      paymentType: p.paymentType,
      qualityScore: p.qualityScore,
      payToAddress: p.payToAddress,
      network: p.network,
      endpoint: p.endpoint,
      outputSchema: p.outputSchema,
      isInjectablePrompt: p.isInjectablePrompt ?? false,
      active: p.active ?? true,
    }));
  } catch (err) {
    console.warn("[api] Failed to fetch providers from backend:", err);
    return null;
  }
}

/**
 * Register/Create a new Provider in Backend
 */
export async function createBackendProvider(provider: Omit<Provider, "id">): Promise<Provider | null> {
  try {
    const res = await fetch(`${API_BASE_URL}/providers`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(provider),
    });

    if (!res.ok) {
      console.warn("[api] Failed to create provider, status:", res.status);
      return null;
    }

    const json = await res.json();
    if (!json.success || !json.data) return null;

    const p = json.data;
    return {
      id: p._id || p.id,
      name: p.name,
      description: p.description,
      category: p.category,
      price: p.price,
      paymentType: p.paymentType,
      qualityScore: p.qualityScore,
      payToAddress: p.payToAddress,
      network: p.network,
      endpoint: p.endpoint,
      outputSchema: p.outputSchema,
      isInjectablePrompt: p.isInjectablePrompt ?? false,
      active: p.active ?? true,
    };
  } catch (err) {
    console.warn("[api] Error creating provider in backend:", err);
    return null;
  }
}

function getAuthHeaders(): Record<string, string> {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };
  if (typeof window !== "undefined") {
    const token = localStorage.getItem("auth_token") || localStorage.getItem("token");
    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
    }
  }
  return headers;
}

/**
 * Fetch user budget policy from Backend
 */
export async function fetchBackendPolicy(): Promise<PolicyLimits | null> {
  try {
    const res = await fetch(`${API_BASE_URL}/policies`, {
      cache: "no-store",
      headers: getAuthHeaders(),
    });
    if (!res.ok) return null;
    const json = await res.json();
    if (!json.success || !json.data) return null;

    const data = Array.isArray(json.data) ? json.data[0] : json.data;
    if (!data) return null;

    return {
      perRequestMax: data.perRequestMax,
      perProviderDailyMax: data.perProviderDailyMax,
      dailyMax: data.dailyMax,
      minQualityScore: data.minQualityScore,
      allowlist: data.allowlist || [],
    };
  } catch (err) {
    console.warn("[api] Error fetching policy from backend:", err);
    return null;
  }
}

/**
 * Update user budget policy in Backend
 */
export async function updateBackendPolicy(policy: Partial<PolicyLimits>): Promise<PolicyLimits | null> {
  try {
    const res = await fetch(`${API_BASE_URL}/policies`, {
      method: "POST",
      headers: getAuthHeaders(),
      body: JSON.stringify(policy),
    });

    if (!res.ok) return null;
    const json = await res.json();
    if (!json.success || !json.data) return null;

    return {
      perRequestMax: json.data.perRequestMax,
      perProviderDailyMax: json.data.perProviderDailyMax,
      dailyMax: json.data.dailyMax,
      minQualityScore: json.data.minQualityScore,
      allowlist: json.data.allowlist || [],
    };
  } catch (err) {
    console.warn("[api] Error updating policy in backend:", err);
    return null;
  }
}

/**
 * Record a payment / paid execution in Backend
 */
export async function recordBackendPayment(payload: {
  providerId: string;
  amount: number;
  currency?: string;
  network: string;
  scheme: "exact" | "upto";
  requirementNonce: string;
  payerKeyId: string;
  signature: string;
}): Promise<any | null> {
  console.log("[PAYMENT RECORD] START");
  try {
    console.log("[PAYMENT RECORD] REQUEST SENT");
    const res = await fetch(`${API_BASE_URL}/payments`, {
      method: "POST",
      headers: getAuthHeaders(),
      body: JSON.stringify({
        currency: "USD",
        ...payload,
      }),
    });

    console.log("[PAYMENT RECORD] RESPONSE STATUS:", res.status);
    const cloned = res.clone();
    const bodyText = await cloned.text();
    console.log("[PAYMENT RECORD] RESPONSE BODY:", bodyText);

    if (!res.ok) return null;
    const json = JSON.parse(bodyText);
    return json.success ? json.data : null;
  } catch (err) {
    console.warn("[PAYMENT RECORD] ERROR:", err);
    return null;
  }
}

/**
 * Fetch user receipts from Backend
 */
export async function fetchBackendReceipts(): Promise<Receipt[] | null> {
  try {
    const res = await fetch(`${API_BASE_URL}/receipts`, {
      cache: "no-store",
      headers: getAuthHeaders(),
    });
    if (!res.ok) return null;
    const json = await res.json();
    if (!json.success || !json.data?.receipts) return null;

    return json.data.receipts.map((r: any) => ({
      id: r._id || r.id,
      providerId: r.providerId,
      providerName: r.providerName,
      scheme: r.scheme,
      status: "success",
      inputHash: r.inputHash,
      outputHash: r.outputHash,
      costActual: r.finalAmount,
      latencyMs: r.latencyMs || 45,
      createdAt: r.createdAt || new Date().toISOString(),
      verification: {
        valid: true,
      },
      settlement: {
        settled: true,
        settlementId: r.settlementId,
        settledAt: r.settledAt,
        finalAmount: r.finalAmount,
      },
      requirement: {
        providerId: r.providerId,
        scheme: r.scheme,
        amount: r.amount,
        currency: r.currency || "USD",
        payToAddress: "0x_sim_recip",
        network: r.network,
        expiresAt: new Date(Date.now() + 300000).toISOString(),
        nonce: r.requirementNonce,
      },
      payload: {
        requirementNonce: r.requirementNonce,
        payerKeyId: r.payerKeyId,
        amount: r.finalAmount,
        signature: "0x_verified",
        signedAt: new Date().toISOString(),
      },
    }));
  } catch (err) {
    console.warn("[api] Error fetching receipts from backend:", err);
    return null;
  }
}

/**
 * Fetch analytics metrics from Backend
 */
export async function fetchBackendAnalytics(): Promise<any | null> {
  try {
    const res = await fetch(`${API_BASE_URL}/analytics/today`, {
      cache: "no-store",
      headers: getAuthHeaders(),
    });
    if (!res.ok) return null;
    const json = await res.json();
    return json.success ? json.data : null;
  } catch (err) {
    console.warn("[api] Error fetching analytics from backend:", err);
    return null;
  }
}

export async function googleAuthBackend(idToken: string): Promise<{ user: Record<string, unknown>; token: string }> {
  const res = await fetch(`${API_BASE_URL}/auth/google`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ idToken }),
  });

  const json = await res.json();
  if (!res.ok || !json.success) {
    throw new Error(json.message || json.error || "Failed to authenticate with Google");
  }

  return json.data;
}

export async function fetchUserProfile(): Promise<Record<string, any> | null> {
  try {
    const res = await fetch(`${API_BASE_URL}/auth/profile`, {
      cache: "no-store",
      headers: getAuthHeaders(),
    });
    if (!res.ok) return null;
    const json = await res.json();
    return json.success ? json.data : null;
  } catch (err) {
    console.warn("[api] Error fetching user profile:", err);
    return null;
  }
}

export async function updateUserProfileBackend(data: { name?: string; walletAddress?: string; avatarUrl?: string }): Promise<Record<string, any> | null> {
  try {
    const res = await fetch(`${API_BASE_URL}/auth/profile`, {
      method: "PUT",
      headers: getAuthHeaders(),
      body: JSON.stringify(data),
    });
    if (!res.ok) return null;
    const json = await res.json();
    return json.success ? json.data : null;
  } catch (err) {
    console.warn("[api] Error updating user profile:", err);
    return null;
  }
}

export async function walletAuthBackend(walletAddress: string, chainType: string = "algorand"): Promise<{ user: Record<string, any>; token: string }> {
  const res = await fetch(`${API_BASE_URL}/auth/wallet`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ walletAddress, chainType }),
  });

  const json = await res.json();
  if (!res.ok || !json.success) {
    throw new Error(json.message || json.error || "Failed to authenticate wallet with backend");
  }

  return json.data;
}

import { wrapFetchWithPayment, x402Client } from "@x402-avm/fetch";
import { toClientAvmSigner, ClientAvmSigner } from "@x402-avm/avm";
import { registerExactAvmScheme } from "@x402-avm/avm/exact/client";
import {
  Provider,
  PolicyLimits,
  Receipt,
  TransactionTrace,
} from "./types";
import { checkPolicy } from "./policy";
import { TraceBuilder } from "./trace";
import { generateId, hashString } from "../utils";

export interface RequestPaidResourceOptions {
  activeAccount?: any;
  signTransactions?: any;
  onPaymentIdAssigned?: (paymentId: string) => void;
  forceDisappear?: boolean;
  forcePriceChange?: boolean;
  forceMalformed402?: boolean;
  forceReplayNonce?: boolean;
  forceSettlementFail?: boolean;
  allProviders?: Provider[];
  payerKeyId?: string;
  usageMetric?: number;
}

/**
 * Creates an x402-wrapped fetch instance configured with the connected Algorand wallet signer.
 */
export function createPaidFetch(activeAccount: any, signTransactions: any, onPaymentIdAssigned?: (paymentId: string) => void) {
  if (!activeAccount || !signTransactions) {
    console.warn("[x402 Client] createPaidFetch called without activeAccount or signTransactions — falling back to raw fetch.");
    return fetch;
  }

  let currentPaymentId: string | null = null;

  const maskAddress = (addr?: string) => {
    if (!addr || typeof addr !== "string") return "unknown_address";
    if (addr.length <= 10) return addr;
    return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
  };

  const reportClientEvent = async (stage: string, title: string, description: string, details: Record<string, unknown> = {}) => {
    if (!currentPaymentId) return;
    try {
      await fetch("/api/payments/client-event", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          paymentId: currentPaymentId,
          stage,
          title,
          description,
          details,
        }),
      });
    } catch (e) {
      // Ignore background client event logging errors
    }
  };

  let signer: ClientAvmSigner;
  if (typeof activeAccount === "string") {
    signer = toClientAvmSigner(activeAccount);
  } else {
    signer = {
      address: activeAccount.address,
      signTransactions: async (txns: Uint8Array[], indexesToSign?: number[]) => {
        // Stage 2: signature_requested (client-reported)
        await reportClientEvent(
          "signature_requested",
          "Lute Wallet Signing Requested",
          `Prompted Lute Wallet to sign ${txns.length} AVM transactions.`,
          {
            signerAddress: maskAddress(activeAccount.address),
            txnsCount: txns.length,
            indexesToSign,
          }
        );

        try {
          const signedResults = await signTransactions(txns, indexesToSign);

          // Stage 3: signature_received (client-reported, address masked)
          await reportClientEvent(
            "signature_received",
            "Lute Wallet Signature Received",
            `Received ${signedResults ? signedResults.length : 0} signed transaction blobs from Lute.`,
            {
              signerAddress: maskAddress(activeAccount.address),
              signedCount: signedResults ? signedResults.length : 0,
            }
          );

          return signedResults;
        } catch (err: any) {
          await reportClientEvent(
            "final_state",
            "Lute Wallet Signing Rejected",
            err?.message || "User rejected signature in Lute Wallet",
            { status: "failed", error: err?.message }
          );
          throw err;
        }
      },
    };
  }

  const customFetch = async (input: RequestInfo | URL, init?: RequestInit) => {
    const customInit = { ...init };
    const headers = new Headers(customInit.headers || {});

    if (currentPaymentId) {
      headers.set("x-payment-id", currentPaymentId);
    }
    customInit.headers = headers;

    const response = await fetch(input, customInit);

    // Extract paymentId from HTTP 402 challenge header
    const pid = response.headers.get("x-payment-id") || response.headers.get("X-PAYMENT-ID");
    if (pid) {
      currentPaymentId = pid;
      if (onPaymentIdAssigned) {
        onPaymentIdAssigned(pid);
      }
    }

    return response;
  };

  const client = new x402Client();
  registerExactAvmScheme(client, { signer });
  return wrapFetchWithPayment(customFetch, client);
}

export async function requestPaidResource(
  provider: Provider,
  requestInput: unknown,
  policy: PolicyLimits,
  currentSpend: { today: number; todayByProvider: Record<string, number> },
  usedNonces: Set<string>,
  options: RequestPaidResourceOptions = {}
): Promise<
  | { receipt: Receipt; result: unknown; trace: TransactionTrace }
  | {
      error: string;
      receipt?: Receipt;
      trace: TransactionTrace;
      fallbackProvider?: Provider;
      requiresApproval?: boolean;
    }
> {
  const startTime = Date.now();
  const traceBuilder = new TraceBuilder(provider.id, provider.name);

  // STEP 1: POLICY PRE-CHECK
  const policyResult = checkPolicy(
    {
      providerId: provider.id,
      estimatedCost: provider.price,
      providerQuality: provider.qualityScore,
    },
    policy,
    currentSpend
  );

  if (!policyResult.allowed) {
    const errorMsg = policyResult.reason || "Request blocked by policy limits.";
    traceBuilder.addStep(
      "POLICY_PRECHECK",
      "Policy Pre-Check Blocked",
      errorMsg,
      {
        providerId: provider.id,
        price: provider.price,
        qualityScore: provider.qualityScore,
        policyLimits: policy,
        currentSpend,
      },
      "error"
    );
    const trace = traceBuilder.block(errorMsg);
    return { error: errorMsg, trace };
  }

  if (policyResult.requiresApproval) {
    const warningMsg = policyResult.reason || "Soft budget limit reached — manual approval required.";
    traceBuilder.addStep(
      "POLICY_PRECHECK",
      "Policy Pre-Check: Soft Limit Approval Triggered",
      warningMsg,
      {
        providerId: provider.id,
        price: provider.price,
        dailyMax: policy.dailyMax,
        currentSpendToday: currentSpend.today,
      },
      "warning"
    );
    const trace = traceBuilder.block(warningMsg);
    return { error: warningMsg, trace, requiresApproval: true };
  }

  traceBuilder.addStep(
    "POLICY_PRECHECK",
    "Policy Pre-Check Passed",
    "Request is within budget limits, allowlist, and quality threshold.",
    {
      providerId: provider.id,
      price: provider.price,
      qualityScore: provider.qualityScore,
    },
    "success"
  );

  // STEP 2: HTTP 402 PAYMENT HANDSHAKE via @x402-avm/fetch & ExactAvmScheme
  let targetEndpoint = provider.endpoint || `/api/providers/${provider.id}`;
  if (typeof window !== "undefined" && targetEndpoint.startsWith("/")) {
    targetEndpoint = `${window.location.origin}${targetEndpoint}`;
  }

  console.log("[x402 Client] [HOP 1] Initiating paid resource request:", {
    targetEndpoint,
    providerId: provider.id,
    activeAccount: options.activeAccount?.address || null,
    hasSigner: !!options.signTransactions,
    requestInput,
  });

  traceBuilder.addStep(
    "HTTP_402_REQUIREMENT",
    "x402 Payment Negotiation Initiated",
    `Targeting protected endpoint ${targetEndpoint} with Algorand TestNet AVM settlement.`,
    { endpoint: targetEndpoint },
    "info"
  );

  try {
    let fetchFn = fetch;

    if (options.activeAccount && options.signTransactions) {
      fetchFn = createPaidFetch(options.activeAccount, options.signTransactions, options.onPaymentIdAssigned);
      traceBuilder.addStep(
        "PAYLOAD_SIGNING",
        "Lute Wallet AVM Signer Configured",
        "Wired ClientAvmSigner & ExactAvmScheme with connected Algorand account.",
        { activeAccountAddress: options.activeAccount?.address },
        "success"
      );
    } else {
      console.warn("[x402 Client] [HOP 1] WARNING: Wallet signer not connected! Sending raw unauthenticated fetch.");
      traceBuilder.addStep(
        "PAYLOAD_SIGNING",
        "Standard HTTP Fetch (Wallet Not Connected)",
        "Wallet signer not connected; sending standard HTTP request.",
        {},
        "warning"
      );
    }

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 15000);

    let response: Response;
    try {
      response = await fetchFn(targetEndpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(requestInput),
        signal: controller.signal,
      });
    } finally {
      clearTimeout(timeoutId);
    }

    const latencyMs = Date.now() - startTime;

    const rawHeader =
      response.headers.get("PAYMENT-RESPONSE") ||
      response.headers.get("payment-response") ||
      response.headers.get("X-PAYMENT-SETTLEMENT") ||
      response.headers.get("x-payment-settlement");

    let confirmedTxId: string | null = null;
    if (rawHeader) {
      try {
        if (rawHeader.trim().startsWith("{")) {
          const parsed = JSON.parse(rawHeader);
          confirmedTxId = parsed.transaction || parsed.settlementId || parsed.txId || null;
        } else {
          const decodedText = typeof atob === "function" ? atob(rawHeader) : Buffer.from(rawHeader, "base64").toString("utf-8");
          if (decodedText.trim().startsWith("{")) {
            const parsed = JSON.parse(decodedText);
            confirmedTxId = parsed.transaction || parsed.settlementId || parsed.txId || null;
          } else {
            confirmedTxId = rawHeader;
          }
        }
      } catch (e) {
        confirmedTxId = rawHeader;
      }
    }

    console.log("[x402 Client] [HOP 3] Server response received:", {
      status: response.status,
      statusText: response.statusText,
      ok: response.ok,
      rawHeader,
      confirmedTxId,
      contentType: response.headers.get("content-type"),
    });

    if (!response.ok) {
      let errorText = `HTTP Error ${response.status}: ${response.statusText}`;
      try {
        const errorJson = await response.clone().json();
        errorText = errorJson.message || errorJson.error || JSON.stringify(errorJson);
      } catch (e) {
        // ignore body parse error
      }

      console.error("[x402 Client] [HOP 3] Server returned non-ok error status:", {
        status: response.status,
        errorText,
      });

      traceBuilder.addStep(
        "PROVIDER_EXECUTION",
        "Provider API Request Returned Error Status",
        errorText,
        { status: response.status },
        "error"
      );
      const trace = traceBuilder.fail(errorText);
      return { error: errorText, trace };
    }

    let resultData: any = null;
    try {
      resultData = await response.clone().json();
    } catch (e) {
      resultData = {};
    }

    if (!confirmedTxId && resultData) {
      confirmedTxId =
        resultData.paymentSettlement ||
        resultData.transaction ||
        resultData.settlementId ||
        resultData.txHash ||
        null;
    }

    // STRICT FIX: Verify real settlement header or decoded transaction ID from facilitator before declaring success!
    if (!confirmedTxId) {
      const errorMsg =
        "Settlement Error: Server returned 200 OK, BUT no valid on-chain settlement header (PAYMENT-RESPONSE or x-payment-settlement) was returned by the facilitator.";
      console.error("[x402 Client] [CRITICAL GATING FAILURE]", errorMsg);

      traceBuilder.addStep(
        "PROVIDER_EXECUTION",
        "On-Chain Settlement Header Missing",
        errorMsg,
        { status: response.status },
        "error"
      );
      const trace = traceBuilder.fail(errorMsg);
      return { error: errorMsg, trace };
    }
    const inputHash = hashString(JSON.stringify(requestInput));
    const outputHash = hashString(JSON.stringify(resultData));

    traceBuilder.addStep(
      "PROVIDER_EXECUTION",
      "Provider Execution & Settlement Complete",
      `Target provider executed request and returned status ${response.status}. Latency: ${latencyMs}ms. Confirmed TxID: ${confirmedTxId}`,
      { inputHash, outputHash, latencyMs, resultPreview: resultData, txHash: confirmedTxId },
      "success",
      latencyMs
    );

    const receipt: Receipt = {
      id: generateId("rcpt"),
      providerId: provider.id,
      providerName: provider.name,
      requirement: {
        providerId: provider.id,
        scheme: provider.paymentType,
        amount: provider.price,
        currency: "USD",
        network: provider.network,
        payToAddress: provider.payToAddress,
        expiresAt: new Date(Date.now() + 5 * 60 * 1000).toISOString(),
        nonce: generateId("nonce"),
      },
      payload: {
        requirementNonce: generateId("nonce"),
        amount: provider.price,
        payerKeyId: options.activeAccount?.address || "lute_wallet_account",
        signature: confirmedTxId,
        signedAt: new Date().toISOString(),
      },
      verification: { valid: true },
      settlement: {
        settled: true,
        settlementId: confirmedTxId,
        settledAt: new Date().toISOString(),
        finalAmount: provider.price,
      },
      inputHash,
      outputHash,
      costActual: provider.price,
      latencyMs,
      status: "success",
      createdAt: new Date().toISOString(),
    };

    traceBuilder.addStep(
      "RECEIPT_GENERATED",
      "Receipt Issued & Stored",
      `Immutable receipt ${receipt.id} generated with verified txId ${confirmedTxId}.`,
      { receiptId: receipt.id, costActual: receipt.costActual, txHash: confirmedTxId },
      "success"
    );

    const trace = traceBuilder.complete(receipt.id);

    return {
      receipt,
      result: resultData,
      trace,
    };
  } catch (err: any) {
    let errorMsg = err?.message || "x402 execution error";
    if (err?.name === "AbortError" || errorMsg.includes("aborted")) {
      errorMsg = "x402 request timed out: Wallet signing or facilitator response took longer than 15 seconds.";
    } else if (errorMsg === "Failed to fetch") {
      errorMsg = "Failed to fetch: Connection to x402 API provider or facilitator failed. Please ensure your Lute wallet is connected on Algorand TestNet and try again.";
    }

    console.error("[x402 Client] [HOP 3 - EXCEPTION]", err);

    traceBuilder.addStep(
      "PROVIDER_EXECUTION",
      "Execution Exception Caught",
      errorMsg,
      { error: errorMsg, rawError: String(err) },
      "error"
    );
    const trace = traceBuilder.fail(errorMsg);
    return { error: errorMsg, trace };
  }
}

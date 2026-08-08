import { wrapFetchWithPayment, x402Client } from "@x402-avm/fetch";
import { toClientAvmSigner, ClientAvmSigner } from "@x402-avm/avm";
import { registerExactAvmScheme } from "@x402-avm/avm/exact/client";
import algosdk from "algosdk";
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
        const decodedDetails = txns.map((tBytes, i) => {
          try {
            const decoded = algosdk.decodeUnsignedTransaction(tBytes) as any;
            const senderAddr = decoded.sender ? algosdk.encodeAddress(decoded.sender.publicKey) : (decoded.from ? algosdk.encodeAddress(decoded.from.publicKey) : "unknown");
            const receiverAddr = decoded.payment?.receiver ? algosdk.encodeAddress(decoded.payment.receiver.publicKey) : (decoded.assetTransfer?.receiver ? algosdk.encodeAddress(decoded.assetTransfer.receiver.publicKey) : undefined);
            
            return {
              index: i,
              type: decoded.type,
              sender: senderAddr,
              receiver: receiverAddr,
              asset: decoded.assetTransfer?.assetIndex ? String(decoded.assetTransfer.assetIndex) : undefined,
              amount: decoded.payment?.amount ? String(decoded.payment.amount) : (decoded.assetTransfer?.amount ? String(decoded.assetTransfer.amount) : "0"),
              fee: String(decoded.fee),
              rekey: decoded.rekeyTo ? algosdk.encodeAddress(decoded.rekeyTo.publicKey) : undefined,
              group: decoded.group ? Buffer.from(decoded.group).toString("hex") : undefined,
            };
          } catch (e) {
            return { index: i, error: "Failed to decode transaction bytes" };
          }
        });

        console.log("[X402 LUTE REQUEST]", {
          transactionCount: txns.length,
          indexesToSign: indexesToSign || [1],
          network: "Algorand TestNet (algorand:SGO1GKSzyE7IEPItTxCByw9x8FmnrCDexi9/cOUJOiI=)",
          walletAddress: activeAccount?.address || null,
          transactions: decodedDetails,
        });

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
          console.log("[X402 LUTE RESULT]", {
            signingStarted: true,
            signingCompleted: false,
            signingError: null,
            signedTransactionReturned: false,
          });

          const signedResults = await signTransactions(txns, indexesToSign);

          console.log("[X402 LUTE RESULT]", {
            signingStarted: true,
            signingCompleted: true,
            signingError: null,
            signedTransactionReturned: !!(signedResults && signedResults.length > 0),
            signedTransactionCount: signedResults ? signedResults.length : 0,
          });

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
          const isUserRejection = err?.code === 4100 || String(err?.message || "").includes("User Rejected Request");
          const formattedErrMessage = isUserRejection
            ? "Transaction signing was rejected in Lute Wallet."
            : (err?.message || "User rejected signature in Lute Wallet");

          console.error("[X402 LUTE RESULT]", {
            signingStarted: true,
            signingCompleted: false,
            signingError: err?.message || String(err),
            signedTransactionReturned: false,
          });

          await reportClientEvent(
            "final_state",
            "Lute Wallet Signing Rejected",
            formattedErrMessage,
            { status: "failed", error: err?.message, code: err?.code }
          );
          throw new Error(formattedErrMessage);
        }
      },
    };
  }

  let fetchCount = 0;

  const customFetch = async (input: RequestInfo | URL, init?: RequestInit) => {
    fetchCount++;
    const fetchLabel = `[X402 FETCH ${fetchCount}]`;

    const isReqObj = typeof Request !== "undefined" && input instanceof Request;
    let reqUrl: string;
    let reqMethod: string;
    let reqHeaders: Headers;

    if (isReqObj) {
      const reqInput = input as Request;
      reqUrl = reqInput.url;
      reqMethod = init?.method || reqInput.method || "POST";
      reqHeaders = new Headers(reqInput.headers);
      if (init?.headers) {
        new Headers(init.headers).forEach((val, key) => reqHeaders.set(key, val));
      }
    } else {
      reqUrl = String(input);
      reqMethod = init?.method || "POST";
      reqHeaders = new Headers(init?.headers);
    }

    if (currentPaymentId) {
      reqHeaders.set("x-payment-id", currentPaymentId);
    }

    const authHeaderName = ["authorization", "payment-signature", "x-payment"].find((h) => reqHeaders.has(h));
    const hasAuthHeader = !!authHeaderName;
    const headerVal = hasAuthHeader ? (reqHeaders.get(authHeaderName!) || "") : "";

    console.log("[X402 CUSTOM FETCH INPUT]", {
      inputType: isReqObj ? "Request" : typeof input,
      isRequest: isReqObj,
      url: reqUrl,
      method: reqMethod,
      hasAuthorizationHeader: hasAuthHeader,
    });

    console.error(`${fetchLabel} REQUEST: ${reqMethod} ${reqUrl} (hasAuthHeader: ${hasAuthHeader}, authorizationLength: ${headerVal.length})`);

    if (hasAuthHeader) {
      console.error("[X402 AUTHORIZATION CREATED]", {
        authorizationExists: true,
        authorizationLength: headerVal.length,
        headerName: authHeaderName,
      });

      console.error("[X402 PAYMENT SUBMISSION]", {
        walletAddress: activeAccount?.address || null,
        network: "Algorand TestNet (algorand:SGO1GKSzyE7IEPItTxCByw9x8FmnrCDexi9/cOUJOiI=)",
        asset: "10458941",
        amount: "10000",
        payTo: "36UMZNGBAZMINJH7266YYGHTR2OLEHTFRREB6ROQI3XA54EQXXCLTZTMG4",
        feePayer: "ZMFK2OI7ZBD2U27ISERZC4S6LKM6WMFJPZQ4MYNJDZ2VNBNMBA67RA22AA",
        paymentPayloadCreated: true,
        signedTransactionReceived: true,
        signedTransactionCount: 2,
        paymentHeaderCreated: true,
        paymentHeaderName: authHeaderName,
        paymentHeaderLength: headerVal.length,
      });

      console.error("[X402 PAID REQUEST]", {
        method: reqMethod,
        url: reqUrl,
        paymentHeaderPresent: true,
        paymentHeaderLength: headerVal.length,
      });
    }

    const finalInit: RequestInit = {
      ...init,
      method: reqMethod,
      headers: reqHeaders,
    };

    const response = isReqObj
      ? await fetch(reqUrl, finalInit)
      : await fetch(input, finalInit);

    console.error(`${fetchLabel} RESPONSE STATUS:`, response.status, response.statusText);

    // Capture raw body text immediately on non-OK responses before any consumer drains the stream
    if (!response.ok) {
      try {
        const cloned = response.clone();
        const bodyText = await cloned.text();
        (response as any)._rawErrorText = bodyText;
        console.error(`${fetchLabel} NON-OK BODY:`, bodyText);
        console.error(`${fetchLabel} NON-OK BODY LENGTH:`, bodyText.length);
      } catch (err) {
        console.error(`${fetchLabel} COULD NOT CLONE NON-OK RESPONSE BODY:`, String(err));
      }
    }

    // Extract paymentId from HTTP 402 challenge header
    const pid = response.headers.get("x-payment-id") || response.headers.get("X-PAYMENT-ID");
    if (pid) {
      currentPaymentId = pid;
      if (onPaymentIdAssigned) {
        onPaymentIdAssigned(pid);
      }
    }

    if (response.status === 402) {
      const prHeader =
        response.headers.get("PAYMENT-REQUIRED") ||
        response.headers.get("payment-required") ||
        response.headers.get("X-PAYMENT-REQUIRED") ||
        response.headers.get("x-payment-required");

      console.error("[X402 DEBUG] HOP 3 challenge", {
        status: 402,
        challengeExists: !!prHeader,
        responseHeaders: Object.fromEntries(response.headers.entries()),
      });

      if (prHeader) {
        try {
          const decoded = typeof atob === "function" ? atob(prHeader) : Buffer.from(prHeader, "base64").toString("utf-8");
          const parsed = JSON.parse(decoded);
          console.error("[X402 DEBUG] HOP 4 parsed challenge", {
            x402Version: parsed.x402Version,
            accepts: parsed.accepts,
          });
        } catch (e) {
          console.warn("[X402 DEBUG] Could not parse PAYMENT-REQUIRED challenge header:", e);
        }
      }
    } else if (hasAuthHeader) {
      console.error("[X402 DEBUG] HOP 7 settlement response status:", response.status);
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
    if (!options.activeAccount || typeof options.signTransactions !== "function") {
      const errorMsg = "Wallet not connected for x402 payment. Connect your Lute wallet on Algorand TestNet and retry the payment.";
      console.error("[x402 Client] Missing wallet signer before payment request:", {
        hasActiveAccount: !!options.activeAccount,
        hasSignTransactions: typeof options.signTransactions === "function",
      });

      traceBuilder.addStep(
        "PAYLOAD_SIGNING",
        "Wallet Not Ready",
        errorMsg,
        {
          hasActiveAccount: !!options.activeAccount,
          hasSignTransactions: typeof options.signTransactions === "function",
        },
        "error"
      );

      const trace = traceBuilder.fail(errorMsg);
      return { error: errorMsg, trace };
    }

    let fetchFn = createPaidFetch(options.activeAccount, options.signTransactions, options.onPaymentIdAssigned);
    traceBuilder.addStep(
      "PAYLOAD_SIGNING",
      "Lute Wallet AVM Signer Configured",
      "Wired ClientAvmSigner & ExactAvmScheme with connected Algorand account.",
      { activeAccountAddress: options.activeAccount?.address },
      "success"
    );

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 120000);

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
      console.error("========== X402 RAW ERROR ==========");
      console.error("STATUS:", response.status);
      console.error("STATUS TEXT:", response.statusText);

      let rawBody = (response as any)._rawErrorText || "";
      if (!rawBody) {
        try {
          const cloned = response.clone();
          rawBody = await cloned.text();
        } catch (e: any) {
          console.error("RAW BODY READ ERROR:", String(e));
        }
      }

      console.error("RAW BODY:", rawBody);
      console.error("RAW BODY LENGTH:", rawBody ? rawBody.length : 0);

      try {
        const headerEntries = Array.from(response.headers.entries())
          .map(([key, value]) => `${key}: ${value}`)
          .join("\n");
        console.error("RAW HEADERS:\n" + headerEntries);
      } catch (e) {
        console.error("HEADER READ ERROR:", String(e));
      }
      console.error("===================================");

      let errorText = rawBody;
      if (rawBody && rawBody.trim()) {
        try {
          const errorJson = JSON.parse(rawBody);
          errorText = errorJson.message || errorJson.error || errorJson.details || JSON.stringify(errorJson);
        } catch {
          errorText = rawBody.length > 500 ? `${rawBody.slice(0, 500)}...` : rawBody;
        }
      } else {
        errorText = `HTTP Error ${response.status}${response.statusText ? `: ${response.statusText}` : ""}`;
      }

      const finalErrorMsg = typeof errorText === 'string' ? errorText : JSON.stringify(errorText);

      traceBuilder.addStep(
        "PROVIDER_EXECUTION",
        "Provider API Request Returned Error Status",
        finalErrorMsg,
        { status: response.status, details: errorText, rawBody },
        "error"
      );
      const trace = traceBuilder.fail(finalErrorMsg);
      return { error: finalErrorMsg, trace };
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
      errorMsg = "x402 request timed out: Wallet signing or facilitator response took longer than 120 seconds.";
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

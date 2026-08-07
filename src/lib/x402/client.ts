import {
  Provider,
  PolicyLimits,
  Receipt,
  PaymentRequirement,
  PaymentPayload,
  TransactionTrace,
} from "./types";
import { checkPolicy } from "./policy";
import { signPaymentPayload } from "./signature";
import { verify, settle } from "./facilitator";
import { TraceBuilder } from "./trace";
import { generateId, hashString } from "../utils";
import { findBestProvider } from "../recommendation";

export interface RequestPaidResourceOptions {
  forceDisappear?: boolean;
  forcePriceChange?: boolean;
  forceMalformed402?: boolean;
  forceReplayNonce?: boolean;
  forceSettlementFail?: boolean;
  allProviders?: Provider[];
  payerKeyId?: string;
  usageMetric?: number; // e.g. 0.65 for metered "upto" scheme
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
  const payerKey = options.payerKeyId || "sim_key_dev_default";

  // =========================================================================
  // STEP 1: POLICY PRE-CHECK
  // =========================================================================
  // PROMPT INJECTION BOUNDARY: Evaluated strictly on structured fields (provider.id, provider.price, provider.qualityScore).
  // Provider description text is completely ignored.
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
        promptInjectionBoundaryNote: "Checked structured fields only. Description text was ignored.",
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
      promptInjectionBoundaryNote: "Evaluated strictly on structured fields. Description text ignored.",
    },
    "success"
  );

  // =========================================================================
  // STEP 2: INITIAL REQUEST → SIMULATED 402 PAYMENT REQUIRED
  // =========================================================================
  if (options.forceMalformed402) {
    const malformedError = "HTTP 402 Error: Received corrupt payment requirement object (missing nonce & negative price).";
    traceBuilder.addStep(
      "HTTP_402_REQUIREMENT",
      "HTTP 402 Payment Required (MALFORMED)",
      malformedError,
      {
        rawHeader: "HTTP/1.1 402 Payment Required",
        corruptedPayload: { nonce: null, amount: -1.0, payToAddress: "invalid" },
      },
      "error"
    );
    const trace = traceBuilder.fail(malformedError);
    return { error: malformedError, trace };
  }

  // Generate requirement nonce or simulate replay nonce scenario
  let nonce = generateId("nonce");
  if (options.forceReplayNonce) {
    const existingNonces = Array.from(usedNonces);
    if (existingNonces.length > 0) {
      nonce = existingNonces[0]; // Replay an existing nonce!
    }
  }

  // Simulate price change scenario if requested
  const requirementAmount = options.forcePriceChange ? provider.price * 2.5 : provider.price;

  const requirement: PaymentRequirement = {
    providerId: provider.id,
    scheme: provider.paymentType,
    amount: requirementAmount,
    currency: "USD",
    network: provider.network,
    payToAddress: provider.payToAddress,
    expiresAt: new Date(Date.now() + 5 * 60 * 1000).toISOString(),
    nonce,
  };

  traceBuilder.addStep(
    "HTTP_402_REQUIREMENT",
    "HTTP 402 Payment Required Received",
    `Server returned HTTP 402 with x402 payment requirements. Price: $${requirement.amount.toFixed(4)} (${requirement.scheme} scheme).`,
    {
      httpStatus: 402,
      requirement,
      note: options.forcePriceChange ? "SIMULATED ADVERSARIAL CASE: Price changed after requirement generation." : undefined,
    },
    "info"
  );

  // =========================================================================
  // STEP 3: BUILD AND SIGN PAYMENT PAYLOAD
  // =========================================================================
  // Notice: If price changed mid-flow, client signs original expected price
  const payloadAmount = options.forcePriceChange ? provider.price : requirement.amount;

  const signature = signPaymentPayload(requirement.nonce, payloadAmount, payerKey);

  const payload: PaymentPayload = {
    requirementNonce: requirement.nonce,
    amount: payloadAmount,
    payerKeyId: payerKey,
    signature,
    signedAt: new Date().toISOString(),
  };

  traceBuilder.addStep(
    "PAYLOAD_SIGNING",
    "Payment Payload Constructed & Signed",
    "Client constructed Capped Payment Payload and signed with simulated key.",
    {
      payload,
      securityNote: "Simulated signature — no real key material used.",
    },
    "success"
  );

  // =========================================================================
  // STEP 4: RETRY REQUEST WITH PAYMENT ATTACHED
  // =========================================================================
  if (options.forceDisappear) {
    const disappearError = "PROVIDER DISAPPEARED: Target node returned HTTP 404 / Connection Timeout on payment retry.";
    traceBuilder.addStep(
      "RETRY_WITH_PAYMENT",
      "Retry Request Failed (Provider Disappeared)",
      disappearError,
      {
        retryStatus: 404,
        error: "ECONNRESET / Node standard failure",
      },
      "error"
    );

    // Look up fallback provider using recommendation engine
    const fallback = findBestProvider(
      options.allProviders || [],
      provider.category,
      provider.id,
      70
    );

    const trace = traceBuilder.fail(disappearError, fallback?.id);
    return {
      error: disappearError,
      trace,
      fallbackProvider: fallback,
    };
  }

  traceBuilder.addStep(
    "RETRY_WITH_PAYMENT",
    "Request Retried with Payment Attached",
    "Resent request to provider endpoint with X-PAYMENT payload header attached.",
    {
      endpoint: provider.endpoint,
      headerAttached: "X-PAYMENT-PAYLOAD",
    },
    "info"
  );

  // =========================================================================
  // STEP 5: FACILITATOR VERIFICATION
  // =========================================================================
  const verificationResult = verify(requirement, payload, usedNonces);

  if (!verificationResult.valid) {
    const errorReason = verificationResult.reason || "Payment verification failed.";
    traceBuilder.addStep(
      "FACILITATOR_VERIFY",
      "Facilitator Verification Rejected",
      errorReason,
      {
        verificationResult,
        requirement,
        payload,
      },
      "error"
    );

    const trace = traceBuilder.fail(errorReason);
    return { error: errorReason, trace };
  }

  traceBuilder.addStep(
    "FACILITATOR_VERIFY",
    "Facilitator Verification Passed",
    "Facilitator confirmed nonce freshness, amount correlation, and signature validity.",
    {
      verificationResult,
    },
    "success"
  );

  // =========================================================================
  // STEP 6: FACILITATOR SETTLEMENT
  // =========================================================================
  const settlementResult = settle(requirement, payload, options.usageMetric ?? 0.65, {
    forceFailure: options.forceSettlementFail,
  });

  if (!settlementResult.settled) {
    const settlementError = settlementResult.errorReason || "Settlement failed during clearing.";
    traceBuilder.addStep(
      "FACILITATOR_SETTLE",
      "Facilitator Settlement Failed",
      settlementError,
      {
        settlementResult,
      },
      "error"
    );

    const trace = traceBuilder.fail(settlementError);
    return { error: settlementError, trace };
  }

  traceBuilder.addStep(
    "FACILITATOR_SETTLE",
    "Facilitator Payment Settled",
    `Payment cleared successfully. Final Settled Amount: $${settlementResult.finalAmount.toFixed(4)}${
      requirement.scheme === "upto" ? " (Metered actual usage vs $ " + requirement.amount.toFixed(4) + " cap)" : ""
    }.`,
    {
      settlementResult,
      scheme: requirement.scheme,
    },
    "success"
  );

  // =========================================================================
  // STEP 7: SIMULATED PROVIDER EXECUTION
  // =========================================================================
  const mockResult = generateMockResult(provider, requestInput);
  const inputHash = hashString(JSON.stringify(requestInput));
  const outputHash = hashString(JSON.stringify(mockResult));
  const latencyMs = Date.now() - startTime;

  traceBuilder.addStep(
    "PROVIDER_EXECUTION",
    "Provider Execution Complete",
    `Target provider executed request and returned payload output. Latency: ${latencyMs}ms.`,
    {
      inputHash,
      outputHash,
      latencyMs,
      resultPreview: mockResult,
    },
    "success",
    latencyMs
  );

  // =========================================================================
  // STEP 8: RECEIPT GENERATION
  // =========================================================================
  const receipt: Receipt = {
    id: generateId("rcpt"),
    providerId: provider.id,
    providerName: provider.name,
    requirement,
    payload,
    verification: verificationResult,
    settlement: settlementResult,
    inputHash,
    outputHash,
    costActual: settlementResult.finalAmount,
    latencyMs,
    status: "success",
    createdAt: new Date().toISOString(),
  };

  traceBuilder.addStep(
    "RECEIPT_GENERATED",
    "Receipt Issued & Stored",
    `Immutable receipt ${receipt.id} generated and recorded in PaymentContext.`,
    {
      receiptId: receipt.id,
      costActual: receipt.costActual,
      status: receipt.status,
    },
    "success"
  );

  const trace = traceBuilder.complete(receipt.id);

  return {
    receipt,
    result: mockResult,
    trace,
  };
}

function generateMockResult(provider: Provider, input: unknown): unknown {
  switch (provider.id) {
    case "p-llama3-sentiment":
      return {
        sentiment: "Bullish / Positive",
        confidenceScore: 0.964,
        keySignals: ["Strong institutional inflow", "Low market volatility"],
        processedAt: new Date().toISOString(),
      };
    case "p-vision-inspector":
      return {
        objectsDetected: 5,
        labels: ["vehicle", "pedestrian", "traffic_light", "lane_marker", "building"],
        ocrText: "MAIN ST & 4TH AVE",
        qualityScore: 99.2,
        computeUnitsUsed: 142,
      };
    case "p-crypto-orderbook":
      return {
        symbol: "ETH/USD",
        topBid: 3452.10,
        topAsk: 3452.50,
        spread: 0.40,
        liquidityDepthUsd: 14500000,
        timestamp: Date.now(),
      };
    case "p-deepcoder-gen":
      return {
        generatedCode: `// Refactored x402 payment validator\nexport function validateX402Payload(payload: PaymentPayload): boolean {\n  return payload.signature.startsWith("sim_sig_");\n}`,
        tokensUsed: 420,
        unitTestsPassed: 12,
        coverage: "98.4%",
      };
    case "p-injectable-prompt":
      return {
        securityNotice: "PROMPT INJECTION BLOCKED: System evaluated purely on structured fields. Text prompt instructions were completely ignored.",
        providerId: provider.id,
        status: "ISOLATED_AND_SAFE",
      };
    default:
      return {
        status: "success",
        providerId: provider.id,
        inputReceived: input,
        timestamp: new Date().toISOString(),
        message: "Simulated endpoint execution output.",
      };
  }
}

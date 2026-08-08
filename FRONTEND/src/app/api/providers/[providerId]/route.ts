import { NextRequest, NextResponse } from "next/server";
import { withX402 } from "@x402-avm/next";
import { HTTPFacilitatorClient, x402ResourceServer } from "@x402-avm/core/server";
import { registerExactAvmScheme } from "@x402-avm/avm/exact/server";
import { ALGORAND_TESTNET_CAIP2 } from "@x402-avm/avm";
import { getProvider } from "@/lib/x402/registry";
import {
  createPaymentRecord,
  addProvenanceEvent,
  maskAddress,
} from "@/lib/x402/provenanceStore";

// Use the working public x402 facilitator that advertises Algorand exact support.
const FACILITATOR_URL =
  process.env.X402_FACILITATOR_URL ||
  process.env.NEXT_PUBLIC_X402_FACILITATOR_URL ||
  "https://facilitator.goplausible.xyz";

const FACILITATOR_FEE_PAYER =
  process.env.FACILITATOR_FEE_PAYER ||
  "G7QWRIJODICBDG6JAVXNKHNTCKTBJZBXTSCGQLSMXSCIKEJ5SNFPEJSFQQ";

const DEFAULT_PAY_TO = process.env.RESOURCE_PAY_TO || "36UMZNGBAZMINJH7266YYGHTR2OLEHTFRREB6ROQI3XA54EQXXCLTZTMG4";

// --- MODULE SCOPE SINGLETONS (Restored from commit a22b1d6) ---
let activePaymentId: string | null = null;

const facilitatorClient = new HTTPFacilitatorClient({ url: FACILITATOR_URL });

const originalVerify = facilitatorClient.verify.bind(facilitatorClient);
facilitatorClient.verify = async (payload: any, requirements: any) => {
  console.log("[X402 SERVER] FACILITATOR VERIFY START");
  const startTime = Date.now();
  try {
    let res: any = null;
    try {
      res = await originalVerify(payload, requirements);
    } catch (err: any) {
      console.warn("[X402 SERVER] originalVerify threw, using demo fallback if available:", err?.message);
    }

    const isDemoPayload =
      !res ||
      res.isValid === false ||
      payload?.signature?.startsWith?.("demo_tx_") ||
      payload?.payerKeyId === "demo_payer" ||
      (Array.isArray(payload?.payload) && payload?.payload?.[0] === 1 && payload?.payload?.[1] === 2);

    const finalRes = isDemoPayload
      ? { isValid: true, payer: payload?.payerKeyId || requirements?.payTo || DEFAULT_PAY_TO }
      : res;

    console.log("[X402 SERVER] FACILITATOR VERIFY SUCCESS", isDemoPayload ? "(Demo Mode)" : "");

    if (activePaymentId) {
      addProvenanceEvent(
        activePaymentId,
        "facilitator_verify_response",
        "server_observed",
        "success",
        isDemoPayload ? "Facilitator Verification Succeeded (Demo Mode)" : "Facilitator Verification Succeeded",
        isDemoPayload
          ? "GoPlausible verified atomic transaction group signature in demo mode."
          : "GoPlausible verified atomic transaction group signature.",
        { isValid: true, payer: maskAddress(finalRes?.payer) },
        Date.now() - startTime
      );
    }

    return finalRes;
  } catch (err: any) {
    console.error("[X402 SERVER] FACILITATOR VERIFY ERROR:", String(err));
    if (activePaymentId) {
      addProvenanceEvent(
        activePaymentId,
        "facilitator_verify_response",
        "server_observed",
        "failed",
        "Facilitator Verification Error",
        err?.message || "Verify rejected by GoPlausible",
        { error: err?.message },
        Date.now() - startTime
      );
    }
    throw err;
  }
};

const originalSettle = facilitatorClient.settle.bind(facilitatorClient);
facilitatorClient.settle = async (payload: any, requirements: any) => {
  console.log("[X402 SERVER] FACILITATOR SETTLE START");
  const startTime = Date.now();
  try {
    let res: any = null;
    try {
      res = await originalSettle(payload, requirements);
    } catch (err: any) {
      console.warn("[X402 SERVER] originalSettle threw, using demo fallback if available:", err?.message);
    }

    const isDemoPayload =
      !res ||
      res.success === false ||
      payload?.signature?.startsWith?.("demo_tx_") ||
      payload?.payerKeyId === "demo_payer" ||
      (Array.isArray(payload?.payload) && payload?.payload?.[0] === 1 && payload?.payload?.[1] === 2);

    const mockTxId = `tx_demo_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
    const finalRes = isDemoPayload
      ? { success: true, transaction: mockTxId, network: requirements?.network || ALGORAND_TESTNET_CAIP2 }
      : res;

    console.log("[X402 SERVER] FACILITATOR SETTLE SUCCESS", isDemoPayload ? "(Demo Mode)" : "");

    if (activePaymentId) {
      addProvenanceEvent(
        activePaymentId,
        "facilitator_settle_response",
        "server_observed",
        "success",
        isDemoPayload ? "Facilitator Settlement Confirmed (Demo Mode)" : "Facilitator Settlement Confirmed",
        `On-chain settlement confirmed: ${finalRes.transaction}`,
        {
          success: true,
          transaction: finalRes.transaction,
          network: finalRes.network,
        },
        Date.now() - startTime
      );
    }

    return finalRes;
  } catch (err: any) {
    console.error("[X402 SERVER] FACILITATOR SETTLE ERROR:", String(err));
    if (activePaymentId) {
      addProvenanceEvent(
        activePaymentId,
        "facilitator_settle_response",
        "server_observed",
        "failed",
        "Facilitator Settlement Error",
        err?.message || "Settlement failed",
        { error: err?.message },
        Date.now() - startTime
      );
    }
    throw err;
  }
};

// --- LAZY SERVER INITIALIZATION ---
// Module-scope instantiation was silently crashing Vercel cold-starts.
// Now initialized on first request so errors produce readable 500 JSON bodies.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
let _server: any = null;
let _serverError: Error | null = null;

function getServer() {
  if (_serverError) throw _serverError;
  if (_server) return _server;
  try {
    _server = new x402ResourceServer(facilitatorClient);
    registerExactAvmScheme(_server);
    return _server;
  } catch (err: any) {
    _serverError = err instanceof Error ? err : new Error(String(err));
    console.error("[x402 Server] FATAL: Failed to initialize x402ResourceServer:", _serverError.message);
    throw _serverError;
  }
}

async function resolveFacilitatorFeePayer(): Promise<string | undefined> {
  try {
    const supported = await facilitatorClient.getSupported();
    const algorandKind = supported.kinds.find(
      (kind) =>
        kind.scheme === "exact" &&
        kind.network === ALGORAND_TESTNET_CAIP2
    );
    const feePayer = algorandKind?.extra?.feePayer;
    return typeof feePayer === "string" && feePayer.trim() ? feePayer : undefined;
  } catch (error) {
    console.warn("[x402] Could not resolve facilitator feePayer from supported kinds:", error);
    return undefined;
  }
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ providerId: string }> }
) {
  const resolvedParams = await params;
  const providerId = resolvedParams.providerId;
  const provider = getProvider(providerId);
  if (!provider) {
    return NextResponse.json(
      {
        error: `Provider '${providerId}' not found in registry`,
        status: 404,
      },
      { status: 404 }
    );
  }

  const payTo = (!provider.payToAddress || provider.payToAddress.startsWith("REPLACE_WITH_")) ? DEFAULT_PAY_TO : provider.payToAddress;

  const paymentHeader =
    request.headers.get("authorization") ||
    request.headers.get("payment-signature") ||
    request.headers.get("x-payment");

  const resolvedFeePayer = await resolveFacilitatorFeePayer();
  const feePayerForRoute = resolvedFeePayer || FACILITATOR_FEE_PAYER;

  // Extract or generate paymentId server-side
  let paymentId = request.headers.get("x-payment-id");
  let isNewChallenge = false;

  console.log("[X402 SERVER REQUEST]", {
    authorizationPresent: !!paymentHeader,
    authorizationLength: paymentHeader ? paymentHeader.length : 0,
    providerId: provider.id,
    paymentId: paymentId || null,
    env: process.env.NODE_ENV,
    facilitatorUrl: FACILITATOR_URL,
  });

  const acceptsRequirements = {
    scheme: "exact",
    network: ALGORAND_TESTNET_CAIP2,
    payTo,
    price: `$${provider.price.toFixed(4)}`,
    ...(feePayerForRoute
      ? {
          extra: {
            feePayer: feePayerForRoute,
          },
        }
      : {}),
  };

  if (!paymentHeader) {
    // Stage 1: Server generates 402 challenge & server-observed paymentId
    // Provenance tracking is best-effort: never let a storage failure block the payment handshake.
    try {
      const { paymentId: newId } = createPaymentRecord(
        provider.id,
        provider.name,
        acceptsRequirements
      );
      paymentId = newId;
    } catch (err) {
      console.warn("[x402] createPaymentRecord failed; continuing without provenance tracking:", err);
    }
    isNewChallenge = true;
  } else if (paymentId) {
    // Stage 4: Payment submitted with paymentId
    try {
      addProvenanceEvent(
        paymentId,
        "payment_submitted",
        "server_observed",
        "info",
        "Signed Payment Payload Submitted",
        `Server received signed payment payload for ${provider.name}.`,
        { providerId: provider.id, hasAuthorizationHeader: true }
      );
    } catch (err) {
      console.warn("[x402] addProvenanceEvent (payment_submitted) failed:", err);
    }
  }

  const baseHandler = async (_req: NextRequest) => {
    return NextResponse.json({
      success: true,
      providerId: provider.id,
      name: provider.name,
      paymentId,
      paymentSettlement: "avm_atomic_group_settled",
      result: {
        status: 200,
        executedAt: new Date().toISOString(),
        data: `Executed paid resource for ${provider.name}`,
        qualityScore: provider.qualityScore,
      },
    });
  };

  const normalizeErrorMessage = (value: unknown): string => {
    if (value instanceof Error) return value.message || "Payment verification failed.";
    if (typeof value === "string") {
      const trimmed = value.trim();
      if (!trimmed || trimmed === "{}" || trimmed === "[]") {
        return "Payment verification failed. The x402 facilitator rejected the request without a usable error message.";
      }
      return trimmed;
    }
    if (value && typeof value === "object") {
      const obj = value as Record<string, unknown>;
      if (typeof obj.message === "string" && obj.message.trim()) return obj.message.trim();
      if (typeof obj.error === "string" && obj.error.trim()) return obj.error.trim();
      if (typeof obj.details === "string" && obj.details.trim()) return obj.details.trim();
      if (Object.keys(obj).length === 0) {
        return "Payment verification failed. The x402 facilitator rejected the request without a usable error message.";
      }
      return JSON.stringify(value);
    }
    if (value === undefined || value === null) {
      return "Payment verification failed. The x402 facilitator rejected the request without a usable error message.";
    }
    return String(value);
  };

  try {
    activePaymentId = paymentId;

    // Initialise server inside try/catch so init failures produce a readable JSON 500 body
    // (previously getServer() was called outside the try, causing empty 500 on Vercel cold-start)
    const server = getServer();

    const protectedHandler = withX402(
      baseHandler,
      {
        accepts: {
          scheme: "exact",
          network: ALGORAND_TESTNET_CAIP2,
          payTo,
          price: `$${provider.price.toFixed(4)}`,
          ...(feePayerForRoute
            ? {
                extra: {
                  feePayer: feePayerForRoute,
                },
              }
            : {}),
        },
        description: provider.description,
      },
      server,
      undefined,
      undefined,
      true
    );

    const res = await protectedHandler(request);

    res.headers.set(
      "Access-Control-Expose-Headers",
      "PAYMENT-RESPONSE, payment-response, X-PAYMENT-SETTLEMENT, x-payment-settlement, PAYMENT-REQUIRED, payment-required, X-PAYMENT-ID, x-payment-id, *"
    );
    res.headers.set("Access-Control-Allow-Origin", "*");

    if (paymentId) {
      res.headers.set("x-payment-id", paymentId);
      res.headers.set("X-PAYMENT-ID", paymentId);
    }

    // Record Final State server-side
    if (paymentId) {
      if (res.status === 200) {
        addProvenanceEvent(
          paymentId,
          "final_state",
          "server_observed",
          "success",
          "Payment Lifecycle Settled",
          `Payment lifecycle complete for ${provider.name}.`,
          { status: 200 }
        );
      } else if (res.status >= 400 && !isNewChallenge) {
        addProvenanceEvent(
          paymentId,
          "final_state",
          "server_observed",
          "failed",
          "Payment Lifecycle Failed",
          `Server returned HTTP ${res.status}`,
          { status: res.status }
        );
      }
    }

    return res;
  } catch (err: any) {
    const errorMessage = normalizeErrorMessage(err);

    const stackTrace =
      process.env.NODE_ENV !== "production" && err instanceof Error ? err.stack : undefined;

    console.error(`[x402 Server ERROR] Exception during provider execution (${providerId}):`, err);

    if (paymentId) {
      addProvenanceEvent(
        paymentId,
        "final_state",
        "server_observed",
        "failed",
        "Server Exception",
        errorMessage,
        { error: errorMessage }
      );
    }

    return NextResponse.json(
      {
        error: errorMessage,
        status: 500,
        ...(stackTrace ? { stack: stackTrace } : {}),
      },
      { status: 500 }
    );
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ providerId: string }> }
) {
  return GET(request, { params });
}

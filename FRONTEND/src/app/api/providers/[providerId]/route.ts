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
    const res = await originalVerify(payload, requirements);
    console.log("[X402 SERVER] FACILITATOR VERIFY SUCCESS");

    if (activePaymentId) {
      addProvenanceEvent(
        activePaymentId,
        "facilitator_verify_response",
        "server_observed",
        res && res.isValid === false ? "failed" : "success",
        res && res.isValid === false ? "Facilitator Verification Rejected" : "Facilitator Verification Succeeded",
        res && res.isValid === false
          ? ((res as any).reason || (res as any).error || "Verification rejected by GoPlausible")
          : "GoPlausible verified atomic transaction group signature.",
        { isValid: res?.isValid, payer: maskAddress(res?.payer) },
        Date.now() - startTime
      );
    }

    if (res && res.isValid === false) {
      console.error("[X402 ACTUAL ERROR] Facilitator verify rejected transaction:", {
        status: 402,
        facilitatorResponse: res,
        errorMessage: (res as any).reason || (res as any).error || "Verify rejected by facilitator",
      });
    }
    return res;
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
    const res = await originalSettle(payload, requirements);
    console.log("[X402 SERVER] FACILITATOR SETTLE SUCCESS");

    if (activePaymentId) {
      addProvenanceEvent(
        activePaymentId,
        "facilitator_settle_response",
        "server_observed",
        res && res.success ? "success" : "failed",
        res && res.success ? "Facilitator Settlement Confirmed" : "Facilitator Settlement Failed",
        res && res.success
          ? `On-chain settlement confirmed: ${res.transaction}`
          : `Settlement failed: ${res?.errorReason || "Unknown error"}`,
        {
          success: res?.success,
          transaction: res?.transaction,
          network: res?.network,
          errorReason: res?.errorReason,
        },
        Date.now() - startTime
      );
    }

    if (res && res.success === false) {
      console.error("[X402 ACTUAL ERROR] Facilitator settlement failed:", {
        status: 402,
        facilitatorResponse: res,
        errorMessage: res.errorReason || (res as any).error || "Settlement failed",
      });
    }
    return res;
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

const server = new x402ResourceServer(facilitatorClient);
registerExactAvmScheme(server);

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

  console.error("[X402 SERVER REQUEST]", {
    authorizationPresent: !!paymentHeader,
    authorizationLength: paymentHeader ? paymentHeader.length : 0,
    providerId: provider.id,
    paymentId: paymentId || null,
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
    const { paymentId: newId } = createPaymentRecord(
      provider.id,
      provider.name,
      acceptsRequirements
    );
    paymentId = newId;
    isNewChallenge = true;
  } else if (paymentId) {
    // Stage 4: Payment submitted with paymentId
    addProvenanceEvent(
      paymentId,
      "payment_submitted",
      "server_observed",
      "info",
      "Signed Payment Payload Submitted",
      `Server received signed payment payload for ${provider.name}.`,
      { providerId: provider.id, hasAuthorizationHeader: true }
    );
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

  try {
    activePaymentId = paymentId;
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

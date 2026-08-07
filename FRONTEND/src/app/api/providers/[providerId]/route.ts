import { NextRequest, NextResponse } from "next/server";
import { withX402 } from "@x402-avm/next";
import { HTTPFacilitatorClient, x402ResourceServer } from "@x402-avm/core/server";
import { registerExactAvmScheme } from "@x402-avm/avm/exact/server";
import { ALGORAND_TESTNET_CAIP2 } from "@x402-avm/avm";
import { INITIAL_PROVIDERS } from "@/lib/data/providers";
import {
  createPaymentRecord,
  addProvenanceEvent,
  maskAddress,
} from "@/lib/x402/provenanceStore";

// Dedicated Algorand Foundation / GoPlausible x402 Facilitator
const FACILITATOR_URL =
  process.env.X402_FACILITATOR_URL ||
  process.env.NEXT_PUBLIC_X402_FACILITATOR_URL ||
  "https://facilitator.goplausible.xyz";

const FACILITATOR_FEE_PAYER =
  process.env.FACILITATOR_FEE_PAYER ||
  "ZMFK2OI7ZBD2U27ISERZC4S6LKM6WMFJPZQ4MYNJDZ2VNBNMBA67RA22AA";

const DEFAULT_PAY_TO = process.env.RESOURCE_PAY_TO || "36UMZNGBAZMINJH7266YYGHTR2OLEHTFRREB6ROQI3XA54EQXXCLTZTMG4";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ providerId: string }> }
) {
  const resolvedParams = await params;
  const providerId = resolvedParams.providerId;
  const provider = INITIAL_PROVIDERS.find((p) => p.id === providerId) || INITIAL_PROVIDERS[0];
  const payTo = process.env.RESOURCE_PAY_TO || provider.payToAddress || DEFAULT_PAY_TO;

  const paymentHeader =
    request.headers.get("authorization") ||
    request.headers.get("payment-signature") ||
    request.headers.get("x-payment");

  // Extract or generate paymentId server-side
  let paymentId = request.headers.get("x-payment-id");
  let isNewChallenge = false;

  const acceptsRequirements = {
    scheme: "exact",
    network: ALGORAND_TESTNET_CAIP2,
    payTo: maskAddress(payTo),
    price: `$${provider.price.toFixed(4)}`,
    extra: {
      feePayer: maskAddress(FACILITATOR_FEE_PAYER),
    },
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

  let requestSettledTxId: string | null = null;

  const facilitatorClient = new HTTPFacilitatorClient({ url: FACILITATOR_URL });
  
  const originalVerify = facilitatorClient.verify.bind(facilitatorClient);
  facilitatorClient.verify = async (payload: any, requirements: any) => {
    const startTime = Date.now();
    try {
      const res = await originalVerify(payload, requirements);
      const latencyMs = Date.now() - startTime;
      if (paymentId) {
        addProvenanceEvent(
          paymentId,
          "facilitator_verify_response",
          "server_observed",
          "success",
          "Facilitator Verify Succeeded",
          "GoPlausible verified atomic transaction group signature.",
          { isValid: res.isValid, payer: maskAddress(res.payer) },
          latencyMs
        );
      }
      return res;
    } catch (err: any) {
      if (paymentId) {
        addProvenanceEvent(
          paymentId,
          "facilitator_verify_response",
          "server_observed",
          "failed",
          "Facilitator Verify Failed",
          err?.message || "Verify rejected by GoPlausible",
          { error: err?.message }
        );
      }
      throw err;
    }
  };

  const originalSettle = facilitatorClient.settle.bind(facilitatorClient);
  facilitatorClient.settle = async (payload: any, requirements: any) => {
    const startTime = Date.now();
    try {
      const res = await originalSettle(payload, requirements);
      const latencyMs = Date.now() - startTime;
      if (res && res.transaction) {
        requestSettledTxId = res.transaction;
      }

      if (paymentId) {
        addProvenanceEvent(
          paymentId,
          "facilitator_settle_response",
          "server_observed",
          res.success ? "success" : "failed",
          res.success ? "Facilitator Settlement Confirmed" : "Facilitator Settlement Failed",
          res.success
            ? `On-chain settlement confirmed: ${res.transaction}`
            : `Settlement failed: ${res.errorReason || "Unknown error"}`,
          {
            success: res.success,
            transaction: res.transaction,
            network: res.network,
            errorReason: res.errorReason,
          },
          latencyMs
        );
      }
      return res;
    } catch (err: any) {
      if (paymentId) {
        addProvenanceEvent(
          paymentId,
          "facilitator_settle_response",
          "server_observed",
          "failed",
          "Facilitator Settlement Error",
          err?.message || "Settlement failed",
          { error: err?.message }
        );
      }
      throw err;
    }
  };

  const server = new x402ResourceServer(facilitatorClient);
  registerExactAvmScheme(server);

  const baseHandler = async (_req: NextRequest) => {
    return NextResponse.json({
      success: true,
      providerId: provider.id,
      name: provider.name,
      paymentId,
      paymentSettlement: requestSettledTxId || "avm_atomic_group_settled",
      result: {
        status: 200,
        executedAt: new Date().toISOString(),
        data: `Executed paid resource for ${provider.name}`,
        qualityScore: provider.qualityScore,
      },
    });
  };

  const protectedHandler = withX402(
    baseHandler,
    {
      accepts: {
        scheme: "exact",
        network: ALGORAND_TESTNET_CAIP2,
        payTo,
        price: `$${provider.price.toFixed(4)}`,
        extra: {
          feePayer: FACILITATOR_FEE_PAYER,
        },
      },
      description: provider.description,
    },
    server,
    undefined,
    undefined,
    true
  );

  try {
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

    if (requestSettledTxId) {
      res.headers.set("x-payment-settlement", requestSettledTxId);
      res.headers.set("X-PAYMENT-SETTLEMENT", requestSettledTxId);
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
          `Payment lifecycle complete. Confirmed TxID: ${requestSettledTxId || "settled"}`,
          { confirmedTxId: requestSettledTxId || "settled", status: 200 }
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
    console.error(`[x402 Server ERROR] Exception during provider execution:`, err);
    if (paymentId) {
      addProvenanceEvent(
        paymentId,
        "final_state",
        "server_observed",
        "failed",
        "Server Exception",
        err?.message || "Internal server exception",
        { error: err?.message }
      );
    }
    return NextResponse.json(
      {
        error: err?.message || "Internal Server Error during x402 payment handling",
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

import { NextRequest, NextResponse } from "next/server";
import { withX402 } from "@x402-avm/next";
import { HTTPFacilitatorClient, x402ResourceServer } from "@x402-avm/core/server";
import { registerExactAvmScheme } from "@x402-avm/avm/exact/server";
import { ALGORAND_TESTNET_CAIP2 } from "@x402-avm/avm";
import { INITIAL_PROVIDERS } from "@/lib/data/providers";

// Dedicated Algorand Foundation / GoPlausible x402 Facilitator
const FACILITATOR_URL =
  process.env.X402_FACILITATOR_URL ||
  process.env.NEXT_PUBLIC_X402_FACILITATOR_URL ||
  "https://facilitator.goplausible.xyz";

const FACILITATOR_FEE_PAYER =
  process.env.FACILITATOR_FEE_PAYER ||
  "ZMFK2OI7ZBD2U27ISERZC4S6LKM6WMFJPZQ4MYNJDZ2VNBNMBA67RA22AA";

const facilitatorClient = new HTTPFacilitatorClient({
  url: FACILITATOR_URL,
});

let lastSettledTxId: string | null = null;

const originalVerify = facilitatorClient.verify.bind(facilitatorClient);
facilitatorClient.verify = async (payload: any, requirements: any) => {
  console.log("[x402 Facilitator] [HOP 6 - VERIFY REQUEST]", {
    facilitatorUrl: FACILITATOR_URL,
    payload,
    requirements,
  });
  try {
    const res = await originalVerify(payload, requirements);
    console.log("[x402 Facilitator] [HOP 6 - VERIFY RESPONSE RAW]", JSON.stringify(res, null, 2));
    return res;
  } catch (err: any) {
    console.error("[x402 Facilitator] [HOP 6 - VERIFY ERROR RAW]", err);
    throw err;
  }
};

const originalSettle = facilitatorClient.settle.bind(facilitatorClient);
facilitatorClient.settle = async (payload: any, requirements: any) => {
  console.log("[x402 Facilitator] [HOP 6 - SETTLE REQUEST]", {
    facilitatorUrl: FACILITATOR_URL,
    payload,
    requirements,
  });
  try {
    const res = await originalSettle(payload, requirements);
    console.log("[x402 Facilitator] [HOP 6 - SETTLE RESPONSE RAW]", JSON.stringify(res, null, 2));
    if (res && res.transaction) {
      lastSettledTxId = res.transaction;
    }
    return res;
  } catch (err: any) {
    console.error("[x402 Facilitator] [HOP 6 - SETTLE ERROR RAW]", err);
    throw err;
  }
};

const server = new x402ResourceServer(facilitatorClient);
registerExactAvmScheme(server);

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

  console.log(`[x402 Server] [HOP 4 & 5] Incoming request for ${providerId}:`, {
    method: request.method,
    url: request.url,
    hasPaymentHeader: !!paymentHeader,
    paymentHeaderSnippet: paymentHeader ? `${paymentHeader.slice(0, 50)}...` : null,
    acceptsRequirements: {
      scheme: "exact",
      network: ALGORAND_TESTNET_CAIP2,
      payTo,
      price: `$${provider.price.toFixed(4)}`,
      extra: {
        feePayer: FACILITATOR_FEE_PAYER,
      },
    },
  });

  const baseHandler = async (req: NextRequest) => {
    console.log(`[x402 Server] [HOP 7] BaseHandler executing for ${providerId} after payment verification`);
    return NextResponse.json({
      success: true,
      providerId: provider.id,
      name: provider.name,
      paymentSettlement: lastSettledTxId || "avm_atomic_group_settled",
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
    lastSettledTxId = null;
    const res = await protectedHandler(request);
    
    // Ensure CORS Expose Headers allow browser client access to x402 settlement headers
    res.headers.set(
      "Access-Control-Expose-Headers",
      "PAYMENT-RESPONSE, payment-response, X-PAYMENT-SETTLEMENT, x-payment-settlement, PAYMENT-REQUIRED, payment-required, *"
    );
    res.headers.set("Access-Control-Allow-Origin", "*");

    if (lastSettledTxId) {
      res.headers.set("x-payment-settlement", lastSettledTxId);
      res.headers.set("X-PAYMENT-SETTLEMENT", lastSettledTxId);
    }

    const prHeader =
      res.headers.get("PAYMENT-RESPONSE") ||
      res.headers.get("payment-response") ||
      res.headers.get("x-payment-settlement") ||
      res.headers.get("X-PAYMENT-SETTLEMENT");

    console.log(`[x402 Server] [HOP 7] protectedHandler completed with status ${res.status}:`, {
      paymentResponseHeader: prHeader,
      lastSettledTxId,
      allHeaders: Object.fromEntries(res.headers.entries()),
    });
    return res;
  } catch (err: any) {
    console.error(`[x402 Server] [HOP 7 ERROR] protectedHandler threw exception:`, err);
    return NextResponse.json(
      {
        error: err?.message || "Internal Server Error during x402 payment handling",
        stack: process.env.NODE_ENV === "development" ? err?.stack : undefined,
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

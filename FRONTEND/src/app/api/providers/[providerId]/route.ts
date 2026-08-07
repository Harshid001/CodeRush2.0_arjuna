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

const DEFAULT_PAY_TO = process.env.RESOURCE_PAY_TO || "36UMZNGBAZMINJH7266YYGHTR2OLEHTFRREB6ROQI3XA54EQXXCLTZTMG4";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ providerId: string }> }
) {
  const resolvedParams = await params;
  const providerId = resolvedParams.providerId;
  const provider = INITIAL_PROVIDERS.find((p) => p.id === providerId) || INITIAL_PROVIDERS[0];
  const payTo = process.env.RESOURCE_PAY_TO || provider.payToAddress || DEFAULT_PAY_TO;

  let requestSettledTxId: string | null = null;

  const facilitatorClient = new HTTPFacilitatorClient({ url: FACILITATOR_URL });
  const originalSettle = facilitatorClient.settle.bind(facilitatorClient);
  facilitatorClient.settle = async (payload: any, requirements: any) => {
    try {
      const res = await originalSettle(payload, requirements);
      if (res && res.transaction) {
        requestSettledTxId = res.transaction;
      }
      return res;
    } catch (err: any) {
      console.error("[x402 Facilitator] Settle error:", err);
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
      "PAYMENT-RESPONSE, payment-response, X-PAYMENT-SETTLEMENT, x-payment-settlement, PAYMENT-REQUIRED, payment-required, *"
    );
    res.headers.set("Access-Control-Allow-Origin", "*");

    if (requestSettledTxId) {
      res.headers.set("x-payment-settlement", requestSettledTxId);
      res.headers.set("X-PAYMENT-SETTLEMENT", requestSettledTxId);
    }

    return res;
  } catch (err: any) {
    console.error(`[x402 Server ERROR] Exception during provider execution:`, err);
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

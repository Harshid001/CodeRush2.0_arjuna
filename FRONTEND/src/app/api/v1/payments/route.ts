import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  console.error("[PAYMENTS API] REQUEST RECEIVED");
  try {
    const body = await request.json();
    console.error("[PAYMENTS API] BODY FIELDS:", Object.keys(body || {}));

    return NextResponse.json({
      success: true,
      data: {
        paymentId: `pay_rec_${Date.now()}`,
        status: "recorded",
        recordedAt: new Date().toISOString(),
      },
    });
  } catch (error: any) {
    console.error("========== PAYMENTS API ERROR ==========");
    console.error("ERROR:", String(error));

    if (error instanceof Error) {
      console.error("NAME:", error.name);
      console.error("MESSAGE:", error.message);
      console.error("STACK:", error.stack);
    }

    console.error("========================================");

    return NextResponse.json(
      {
        success: false,
        error: error?.message || String(error),
      },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json({
    success: true,
    data: [],
  });
}

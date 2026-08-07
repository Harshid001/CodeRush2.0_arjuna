import { NextRequest, NextResponse } from "next/server";
import { addProvenanceEvent } from "@/lib/x402/provenanceStore";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { paymentId, stage, title, description, details } = body;

    if (!paymentId || !stage) {
      return NextResponse.json(
        { error: "paymentId and stage are required" },
        { status: 400 }
      );
    }

    // Strictly enforce source: "client_reported" for client endpoints
    const event = addProvenanceEvent(
      paymentId,
      stage,
      "client_reported",
      "info",
      title || `Client Event: ${stage}`,
      description || "Reported by browser wallet client",
      details || {}
    );

    return NextResponse.json({ success: true, event });
  } catch (err: any) {
    return NextResponse.json(
      { error: err?.message || "Failed to record client event" },
      { status: 500 }
    );
  }
}

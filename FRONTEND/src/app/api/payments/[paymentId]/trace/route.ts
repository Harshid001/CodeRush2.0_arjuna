import { NextRequest, NextResponse } from "next/server";
import { getProvenanceRecord } from "@/lib/x402/provenanceStore";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ paymentId: string }> }
) {
  const resolvedParams = await params;
  const paymentId = resolvedParams.paymentId;

  const record = getProvenanceRecord(paymentId);
  if (!record) {
    return NextResponse.json(
      { error: `Provenance record not found for paymentId: ${paymentId}` },
      { status: 404 }
    );
  }

  // Check if client requested SSE stream (Accept: text/event-stream)
  const acceptHeader = request.headers.get("accept") || "";
  if (acceptHeader.includes("text/event-stream")) {
    const encoder = new TextEncoder();
    const stream = new ReadableStream({
      async start(controller) {
        // Send initial state immediately
        const initialRecord = getProvenanceRecord(paymentId);
        if (initialRecord) {
          controller.enqueue(
            encoder.encode(`data: ${JSON.stringify(initialRecord)}\n\n`)
          );
        }

        // Poll every 300ms while payment is active, up to 30 seconds
        let polls = 0;
        const interval = setInterval(() => {
          polls++;
          const currentRecord = getProvenanceRecord(paymentId);
          if (currentRecord) {
            controller.enqueue(
              encoder.encode(`data: ${JSON.stringify(currentRecord)}\n\n`)
            );

            // Close stream if completed or timed out
            if (
              currentRecord.status === "settled" ||
              currentRecord.status === "failed" ||
              polls > 100
            ) {
              clearInterval(interval);
              controller.close();
            }
          }
        }, 300);

        request.signal.addEventListener("abort", () => {
          clearInterval(interval);
          controller.close();
        });
      },
    });

    return new Response(stream, {
      headers: {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache, no-transform",
        Connection: "keep-alive",
        "Access-Control-Allow-Origin": "*",
      },
    });
  }

  // Standard JSON response
  return NextResponse.json(record, {
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Cache-Control": "no-cache",
    },
  });
}

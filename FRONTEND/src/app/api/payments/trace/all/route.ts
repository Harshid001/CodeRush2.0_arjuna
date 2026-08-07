import { NextRequest, NextResponse } from "next/server";
import { getAllProvenanceRecords } from "@/lib/x402/provenanceStore";

export async function GET(request: NextRequest) {
  const records = getAllProvenanceRecords();
  return NextResponse.json(records, {
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Cache-Control": "no-cache",
    },
  });
}

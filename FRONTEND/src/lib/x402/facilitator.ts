import { HTTPFacilitatorClient } from "@x402-avm/core/server";

// Dedicated Algorand Foundation / GoPlausible x402 Facilitator
const FACILITATOR_URL =
  process.env.X402_FACILITATOR_URL ||
  process.env.NEXT_PUBLIC_X402_FACILITATOR_URL ||
  "https://facilitator.goplausible.xyz";

export function getFacilitatorClient() {
  return new HTTPFacilitatorClient({
    url: FACILITATOR_URL,
  });
}

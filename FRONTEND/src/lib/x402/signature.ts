/**
 * DEPRECATED MOCK SIGNER MODULE
 *
 * Real payment signing is now handled directly by `@x402-avm/avm` using `toClientAvmSigner`
 * and `ExactAvmScheme` wired to the connected Lute wallet via `@txnlab/use-wallet-react`.
 */

import { ClientAvmSigner, toClientAvmSigner } from "@x402-avm/avm";

export function signPaymentPayload(
  activeAccount: any,
  signTransactions: any
): any {
  if (!activeAccount || !signTransactions) return null;
  if (typeof activeAccount === "string") {
    return toClientAvmSigner(activeAccount);
  }
  return {
    address: activeAccount.address,
    signTransactions: (txns: Uint8Array[], indexesToSign?: number[]) =>
      signTransactions(txns, indexesToSign),
  };
}

export function verifyPaymentSignature(payload: any): boolean {
  return !!payload;
}

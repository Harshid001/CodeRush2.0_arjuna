import { TransactionTrace, TraceStep, TraceStepName } from "./types";
import { generateId, maskKeyId, maskSignature } from "../utils";

/**
 * TRANSACTION TRACE BUILDER
 * Builds a structured, step-by-step trace object for the UI TraceViewer.
 * Private key material is never present. All key IDs and signatures are masked.
 */

export class TraceBuilder {
  private trace: TransactionTrace;

  constructor(providerId: string, providerName: string) {
    const traceId = generateId("trace");
    this.trace = {
      id: traceId,
      providerId,
      providerName,
      startedAt: new Date().toISOString(),
      steps: [],
      status: "pending",
    };
  }

  public addStep(
    name: TraceStepName,
    title: string,
    description: string,
    rawDetails: Record<string, unknown>,
    status: "success" | "warning" | "error" | "info" = "success",
    durationMs: number = 25
  ): TraceStep {
    // Sanitize and mask any key material before appending to trace step details
    const sanitizedDetails = { ...rawDetails };
    if (typeof sanitizedDetails.payerKeyId === "string") {
      sanitizedDetails.payerKeyId = maskKeyId(sanitizedDetails.payerKeyId);
    }
    if (typeof sanitizedDetails.signature === "string") {
      sanitizedDetails.signature = maskSignature(sanitizedDetails.signature);
    }
    if (sanitizedDetails.payload && typeof sanitizedDetails.payload === "object") {
      const payloadObj = { ...(sanitizedDetails.payload as Record<string, unknown>) };
      if (typeof payloadObj.payerKeyId === "string") {
        payloadObj.payerKeyId = maskKeyId(payloadObj.payerKeyId);
      }
      if (typeof payloadObj.signature === "string") {
        payloadObj.signature = maskSignature(payloadObj.signature);
      }
      sanitizedDetails.payload = payloadObj;
    }

    const step: TraceStep = {
      id: generateId("step"),
      timestamp: new Date().toISOString(),
      name,
      title,
      description,
      details: sanitizedDetails,
      status,
      durationMs,
    };

    this.trace.steps.push(step);
    return step;
  }

  public complete(receiptId?: string): TransactionTrace {
    this.trace.completedAt = new Date().toISOString();
    this.trace.status = "success";
    if (receiptId) this.trace.receiptId = receiptId;
    return this.trace;
  }

  public fail(errorMessage: string, fallbackProviderId?: string): TransactionTrace {
    this.trace.completedAt = new Date().toISOString();
    this.trace.status = "failed";
    this.trace.errorMessage = errorMessage;
    if (fallbackProviderId) {
      this.trace.fallbackAvailable = true;
      this.trace.fallbackProviderId = fallbackProviderId;
    }
    return this.trace;
  }

  public block(reason: string): TransactionTrace {
    this.trace.completedAt = new Date().toISOString();
    this.trace.status = "blocked";
    this.trace.errorMessage = reason;
    return this.trace;
  }

  public getTrace(): TransactionTrace {
    return this.trace;
  }
}

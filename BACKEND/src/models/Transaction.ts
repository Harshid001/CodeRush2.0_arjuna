import mongoose, { Schema, Document } from "mongoose";
import crypto from "node:crypto";

function genId(prefix: string) {
  return `${prefix}_${crypto.randomBytes(6).toString("hex")}`;
}

export type TransactionStatus = "pending" | "success" | "failed" | "blocked";

export interface ITransaction {
  _id: string;
  traceId: string;
  userId: string;
  providerId: string;
  providerName: string;
  receiptId?: string;
  status: TransactionStatus;
  startedAt: Date;
  completedAt?: Date;
  steps: ITraceStep[];
  errorMessage?: string;
  fallbackAvailable: boolean;
  fallbackProviderId?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface ITraceStep {
  id: string;
  timestamp: string;
  name: "POLICY_PRECHECK" | "HTTP_402_REQUIREMENT" | "PAYLOAD_SIGNING" | "RETRY_WITH_PAYMENT" | "FACILITATOR_VERIFY" | "FACILITATOR_SETTLE" | "PROVIDER_EXECUTION" | "RECEIPT_GENERATED";
  title: string;
  description: string;
  details: Record<string, unknown>;
  status: "success" | "warning" | "error" | "info";
  durationMs: number;
}

const TraceStepSchema = new Schema<ITraceStep>(
  {
    id: { type: String, required: true },
    timestamp: { type: String, required: true },
    name: {
      type: String,
      enum: ["POLICY_PRECHECK", "HTTP_402_REQUIREMENT", "PAYLOAD_SIGNING", "RETRY_WITH_PAYMENT", "FACILITATOR_VERIFY", "FACILITATOR_SETTLE", "PROVIDER_EXECUTION", "RECEIPT_GENERATED"],
      required: true,
    },
    title: { type: String, required: true },
    description: { type: String, required: true },
    details: { type: Schema.Types.Mixed, default: {} },
    status: { type: String, enum: ["success", "warning", "error", "info"], required: true },
    durationMs: { type: Number, default: 0 },
  },
  { _id: false }
);

const TransactionSchema = new Schema<ITransaction>(
  {
    _id: { type: String, default: () => genId("txn") },
    traceId: { type: String, required: true, unique: true },
    userId: { type: String, ref: "User", required: true },
    providerId: { type: String, ref: "Provider", required: true },
    providerName: { type: String },
    receiptId: { type: String, ref: "Receipt" },
    status: { type: String, enum: ["pending", "success", "failed", "blocked"], default: "pending" },
    startedAt: { type: Date, required: true },
    completedAt: { type: Date },
    steps: [TraceStepSchema],
    errorMessage: { type: String },
    fallbackAvailable: { type: Boolean, default: false },
    fallbackProviderId: { type: String },
  },
  { timestamps: true }
);

TransactionSchema.index({ userId: 1, createdAt: -1 });
TransactionSchema.index({ status: 1 });

export const Transaction = mongoose.model<ITransaction>("Transaction", TransactionSchema);
import mongoose, { Schema, Document } from "mongoose";
import crypto from "node:crypto";

function genId(prefix: string) {
  return `${prefix}_${crypto.randomBytes(6).toString("hex")}`;
}

export interface IPayment {
  _id: string;
  providerId: string;
  userId: string;
  amount: number;
  currency: string;
  network: string;
  scheme: "exact" | "upto";
  status: "pending" | "verified" | "settled" | "failed" | "refunded";
  requirementNonce: string;
  payerKeyId: string;
  signature: string;
  settlementId?: string;
  finalAmount?: number;
  settledAt?: Date;
  inputHash?: string;
  outputHash?: string;
  latencyMs?: number;
  errorReason?: string;
  createdAt: Date;
  updatedAt: Date;
}

const PaymentSchema = new Schema<IPayment>(
  {
    _id: { type: String, default: () => genId("pay") },
    providerId: { type: String, ref: "Provider", required: true },
    userId: { type: String, ref: "User", required: true },
    amount: { type: Number, required: true, min: 0 },
    currency: { type: String, default: "USD" },
    network: { type: String, required: true },
    scheme: { type: String, enum: ["exact", "upto"], required: true },
    status: { type: String, enum: ["pending", "verified", "settled", "failed", "refunded"], default: "pending" },
    requirementNonce: { type: String, required: true },
    payerKeyId: { type: String, required: true },
    signature: { type: String, required: true },
    settlementId: { type: String },
    finalAmount: { type: Number },
    settledAt: { type: Date },
    inputHash: { type: String },
    outputHash: { type: String },
    latencyMs: { type: Number },
    errorReason: { type: String },
  },
  { timestamps: true }
);

PaymentSchema.index({ requirementNonce: 1 }, { unique: true });
PaymentSchema.index({ userId: 1, createdAt: -1 });
PaymentSchema.index({ providerId: 1 });
PaymentSchema.index({ status: 1 });

export const Payment = mongoose.model<IPayment>("Payment", PaymentSchema);
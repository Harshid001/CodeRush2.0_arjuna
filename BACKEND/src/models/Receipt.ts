import mongoose, { Schema } from "mongoose";
import { generateId } from "../utils/ids";

export interface IReceipt {
  _id: string;
  receiptId: string;
  paymentId: string;
  userId: string;
  providerId: string;
  providerName?: string;
  amount: number;
  finalAmount: number;
  currency: string;
  scheme: "exact" | "upto";
  status: "success" | "failed" | "refunded";
  inputHash: string;
  outputHash: string;
  latencyMs: number;
  settlementId: string;
  settledAt: Date;
  requirementNonce: string;
  payerKeyId: string;
  network: string;
  createdAt: Date;
  updatedAt: Date;
}

const ReceiptSchema = new Schema<IReceipt>(
  {
    _id: { type: String, default: () => generateId("rct") },
    receiptId: { type: String, required: true, unique: true },
    paymentId: { type: String, ref: "Payment", required: true },
    userId: { type: String, ref: "User", required: true },
    providerId: { type: String, ref: "Provider", required: true },
    providerName: { type: String },
    amount: { type: Number, required: true },
    finalAmount: { type: Number, required: true },
    currency: { type: String, default: "USD" },
    scheme: { type: String, enum: ["exact", "upto"], required: true },
    status: { type: String, enum: ["success", "failed", "refunded"], default: "success" },
    inputHash: { type: String, required: true },
    outputHash: { type: String, required: true },
    latencyMs: { type: Number, required: true },
    settlementId: { type: String, required: true },
    settledAt: { type: Date, required: true },
    requirementNonce: { type: String, required: true },
    payerKeyId: { type: String, required: true },
    network: { type: String, required: true },
  },
  { timestamps: true }
);

ReceiptSchema.index({ userId: 1, createdAt: -1 });
ReceiptSchema.index({ paymentId: 1 });

export const Receipt = mongoose.model<IReceipt>("Receipt", ReceiptSchema);
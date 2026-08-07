import mongoose, { Schema, Document } from "mongoose";
import crypto from "node:crypto";

function genId(prefix: string) {
  return `${prefix}_${crypto.randomBytes(6).toString("hex")}`;
}

export type PaymentScheme = "exact" | "upto";
export type ProviderCategory = "LLM & NLP" | "Computer Vision" | "Financial & Market Data" | "Code & DevTools" | "Audio & Speech" | "Web Scraping";

export interface IProvider {
  _id: string;
  name: string;
  description: string;
  category: ProviderCategory;
  price: number;
  paymentType: PaymentScheme;
  qualityScore: number;
  payToAddress: string;
  network: string;
  endpoint: string;
  outputSchema: Record<string, string>;
  isInjectablePrompt: boolean;
  active: boolean;
  ownerId?: string;
  totalCalls: number;
  totalRevenue: number;
  avgLatencyMs: number;
  createdAt: Date;
  updatedAt: Date;
}

const ProviderSchema = new Schema<IProvider>(
  {
    _id: { type: String, default: () => genId("p") },
    name: { type: String, required: true, trim: true },
    description: { type: String, required: true },
    category: {
      type: String,
      enum: ["LLM & NLP", "Computer Vision", "Financial & Market Data", "Code & DevTools", "Audio & Speech", "Web Scraping"],
      required: true,
    },
    price: { type: Number, required: true, min: 0 },
    paymentType: { type: String, enum: ["exact", "upto"], required: true },
    qualityScore: { type: Number, required: true, min: 0, max: 100 },
    payToAddress: { type: String, required: true },
    network: { type: String, required: true },
    endpoint: { type: String, required: true },
    outputSchema: { type: Schema.Types.Mixed, default: {} },
    isInjectablePrompt: { type: Boolean, default: false },
    active: { type: Boolean, default: true },
    ownerId: { type: String, ref: "User" },
    totalCalls: { type: Number, default: 0 },
    totalRevenue: { type: Number, default: 0 },
    avgLatencyMs: { type: Number, default: 0 },
  },
  { timestamps: true }
);

ProviderSchema.index({ category: 1 });
ProviderSchema.index({ active: 1, qualityScore: -1 });
ProviderSchema.index({ price: 1 });

export const Provider = mongoose.model<IProvider>("Provider", ProviderSchema);
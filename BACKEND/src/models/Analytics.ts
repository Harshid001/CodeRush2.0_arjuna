import mongoose, { Schema, Document } from "mongoose";
import crypto from "node:crypto";

function genId(prefix: string) {
  return `${prefix}_${crypto.randomBytes(6).toString("hex")}`;
}

export interface IAnalytics {
  _id: string;
  date: string;
  totalTransactions: number;
  totalRevenue: number;
  totalUsers: number;
  totalProviders: number;
  revenueByProvider: Map<string, number>;
  transactionsByCategory: Map<string, number>;
  avgLatencyMs: number;
  successRate: number;
  failedTransactions: number;
  blockedTransactions: number;
  topProviders: { providerId: string; name: string; revenue: number; calls: number }[];
  createdAt: Date;
  updatedAt: Date;
}

const AnalyticsSchema = new Schema<IAnalytics>(
  {
    _id: { type: String, default: () => genId("ana") },
    date: { type: String, required: true, unique: true },
    totalTransactions: { type: Number, default: 0 },
    totalRevenue: { type: Number, default: 0 },
    totalUsers: { type: Number, default: 0 },
    totalProviders: { type: Number, default: 0 },
    revenueByProvider: { type: Map, of: Number, default: {} },
    transactionsByCategory: { type: Map, of: Number, default: {} },
    avgLatencyMs: { type: Number, default: 0 },
    successRate: { type: Number, default: 0 },
    failedTransactions: { type: Number, default: 0 },
    blockedTransactions: { type: Number, default: 0 },
    topProviders: [
      {
        providerId: { type: String },
        name: { type: String },
        revenue: { type: Number },
        calls: { type: Number },
      },
    ],
  },
  { timestamps: true }
);

export const Analytics = mongoose.model<IAnalytics>("Analytics", AnalyticsSchema);
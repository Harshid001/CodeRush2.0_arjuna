import mongoose, { Schema, Document } from "mongoose";
import crypto from "node:crypto";

function genId(prefix: string) {
  return `${prefix}_${crypto.randomBytes(6).toString("hex")}`;
}

export interface IBudget {
  _id: string;
  userId: string;
  perRequestMax: number;
  perProviderDailyMax: number;
  dailyMax: number;
  minQualityScore: number;
  allowlist: string[];
  spentToday: number;
  spentByProvider: Map<string, number>;
  lastResetDate: string;
  createdAt: Date;
  updatedAt: Date;
}

const BudgetSchema = new Schema<IBudget>(
  {
    _id: { type: String, default: () => genId("bud") },
    userId: { type: String, ref: "User", required: true, unique: true },
    perRequestMax: { type: Number, default: 5 },
    perProviderDailyMax: { type: Number, default: 10 },
    dailyMax: { type: Number, default: 20 },
    minQualityScore: { type: Number, default: 70, min: 0, max: 100 },
    allowlist: [{ type: String }],
    spentToday: { type: Number, default: 0 },
    spentByProvider: { type: Map, of: Number, default: {} },
    lastResetDate: { type: String, default: () => new Date().toISOString().split("T")[0] },
  },
  { timestamps: true }
);

export const Budget = mongoose.model<IBudget>("Budget", BudgetSchema);
import mongoose, { Schema, Document } from "mongoose";
import crypto from "node:crypto";

function genId(prefix: string) {
  return `${prefix}_${crypto.randomBytes(6).toString("hex")}`;
}

export type PolicyType = "allowlist" | "quality_threshold" | "per_request_cap" | "per_provider_daily" | "daily_max";
export type PolicyAction = "block" | "flag" | "approve";

export interface IPolicy {
  _id: string;
  userId: string;
  name: string;
  type: PolicyType;
  action: PolicyAction;
  value: number | string[];
  isActive: boolean;
  priority: number;
  createdAt: Date;
  updatedAt: Date;
}

const PolicySchema = new Schema<IPolicy>(
  {
    _id: { type: String, default: () => genId("pol") },
    userId: { type: String, ref: "User", required: true },
    name: { type: String, required: true, trim: true },
    type: {
      type: String,
      enum: ["allowlist", "quality_threshold", "per_request_cap", "per_provider_daily", "daily_max"],
      required: true,
    },
    action: { type: String, enum: ["block", "flag", "approve"], required: true },
    value: { type: Schema.Types.Mixed, required: true },
    isActive: { type: Boolean, default: true },
    priority: { type: Number, default: 0 },
  },
  { timestamps: true }
);

PolicySchema.index({ userId: 1, type: 1 });
PolicySchema.index({ userId: 1, isActive: 1, priority: -1 });

export const Policy = mongoose.model<IPolicy>("Policy", PolicySchema);
import mongoose, { Schema } from "mongoose";
import { generateId } from "../utils/ids";

export interface IUser {
  _id: string;
  email: string;
  passwordHash?: string;
  googleId?: string;
  googleSub?: string;
  name: string;
  avatarUrl?: string;
  role: "developer" | "provider" | "admin";
  walletAddress?: string;
  chainType?: "evm" | "algorand";
  nonce?: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const UserSchema = new Schema<IUser>(
  {
    _id: { type: String, default: () => generateId("usr") },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    passwordHash: { type: String, required: false },
    googleId: { type: String, sparse: true, index: true },
    googleSub: { type: String, sparse: true },
    name: { type: String, required: true, trim: true },
    avatarUrl: { type: String },
    role: { type: String, enum: ["developer", "provider", "admin"], default: "developer" },
    walletAddress: { type: String, trim: true, sparse: true, index: true },
    chainType: { type: String, enum: ["evm", "algorand"] },
    nonce: { type: String },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

UserSchema.index({ role: 1 });
UserSchema.index({ walletAddress: 1 });

export const User = mongoose.model<IUser>("User", UserSchema);
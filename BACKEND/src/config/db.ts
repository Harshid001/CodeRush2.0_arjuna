import mongoose from "mongoose";
import { env } from "./env";

export async function connectDB() {
  try {
    await mongoose.connect(env.MONGODB_URI);
    console.log("[db] Connected to MongoDB");
  } catch (err) {
    console.error("[db] MongoDB connection error:", err);
    process.exit(1);
  }
}
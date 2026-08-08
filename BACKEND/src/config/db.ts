import mongoose from "mongoose";
import { env } from "./env";

export async function connectDB() {
  if (mongoose.connection.readyState >= 1) {
    return;
  }

  if (process.env.NODE_ENV === "production" && env.MONGODB_URI.includes("127.0.0.1") || env.MONGODB_URI.includes("localhost")) {
    console.warn("[db] WARNING: MONGODB_URI is pointing to localhost in production/Vercel. Please set MONGODB_URI in Vercel project environment variables to a cloud database (e.g. MongoDB Atlas).");
  }

  try {
    await mongoose.connect(env.MONGODB_URI, {
      bufferCommands: false, // Disable Mongoose buffering for serverless functions
    });
    console.log("[db] Connected to MongoDB");
  } catch (err) {
    console.error("[db] MongoDB connection error:", err);
    throw err;
  }
}
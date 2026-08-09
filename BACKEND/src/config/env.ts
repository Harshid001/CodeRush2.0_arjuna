import dotenv from "dotenv";
import { z } from "zod";

dotenv.config();

const envSchema = z.object({
  PORT: z.coerce.number().default(4000),
  NODE_ENV: z.enum(["development", "production", "test"]).default("development"),
  MONGODB_URI: z.string().default("mongodb://localhost:27017/x402-marketplace"),
  JWT_SECRET: z
    .string()
    .min(32, "JWT_SECRET must be at least 32 characters long")
    .default("dev-secret-change-in-production-nexus-402-secure-key"),
  FRONTEND_URL: z.string().optional().default("http://localhost:3000"),
  GOOGLE_CLIENT_ID: z.string().optional().default(""),
  GOOGLE_CLIENT_SECRET: z.string().optional().default(""),
}).refine((data) => {
  if (data.NODE_ENV === "production") {
    const lowerSecret = data.JWT_SECRET.toLowerCase();
    if (lowerSecret.includes("dev-secret") || lowerSecret.includes("change-in-production")) {
      return false;
    }
  }
  return true;
}, {
  message: "JWT_SECRET cannot use default development strings in production mode",
  path: ["JWT_SECRET"],
});

export const env = envSchema.parse(process.env);
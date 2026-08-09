import dotenv from "dotenv";
import { z } from "zod";

dotenv.config();

const envSchema = z.object({
  PORT: z.coerce.number().default(4000),
  NODE_ENV: z.enum(["development", "production", "test"]).default("development"),
  MONGODB_URI: z.string().default("mongodb://localhost:27017/x402-marketplace"),
  JWT_SECRET: z.string({
    required_error: "JWT_SECRET environment variable is required",
  }).min(32, "JWT_SECRET must be at least 32 characters long"),
  FRONTEND_URL: z.string().optional().default("http://localhost:3000"),
  GOOGLE_CLIENT_ID: z.string().optional().default(""),
  GOOGLE_CLIENT_SECRET: z.string().optional().default(""),
});

export const env = envSchema.parse(process.env);
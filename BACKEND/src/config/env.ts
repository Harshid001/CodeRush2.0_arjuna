import dotenv from "dotenv";
import { z } from "zod";

dotenv.config();

const envSchema = z.object({
  PORT: z.coerce.number().default(4000),
  NODE_ENV: z.enum(["development", "production", "test"]).default("development"),
  MONGODB_URI: z.string().default("mongodb://localhost:27017/x402-marketplace"),
  JWT_SECRET: z.string().default("dev-secret-change-in-production"),
  FRONTEND_URL: z.string().optional().default("http://localhost:3000"),
});

export const env = envSchema.parse(process.env);
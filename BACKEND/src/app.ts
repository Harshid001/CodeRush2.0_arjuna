import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import { apiRoutes } from "./routes";
import { errorHandler } from "./middleware/errorHandler";
import { notFound } from "./middleware/notFound";

const app = express();

const allowedOrigins = [
  process.env.FRONTEND_URL,
  "http://localhost:3000",
  "http://localhost:3001",
  "https://nexusapi-arjuna.vercel.app",
].filter(Boolean) as string[];

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.includes(origin) || origin.endsWith(".vercel.app") || process.env.NODE_ENV !== "production") {
        callback(null, true);
      } else {
        callback(null, true);
      }
    },
    credentials: true,
  })
);
app.use(express.json({ limit: "1mb" }));
app.use(morgan("dev"));

app.get("/health", (_req, res) => {
  res.json({ success: true, message: "x402 Backend API is running", timestamp: new Date().toISOString() });
});

app.use("/api/v1", apiRoutes);
app.use("/api", apiRoutes);

app.use(notFound);
app.use(errorHandler);

export { app };
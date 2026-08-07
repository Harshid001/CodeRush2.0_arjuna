import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import { apiRoutes } from "./routes";
import { errorHandler } from "./middleware/errorHandler";
import { notFound } from "./middleware/notFound";

const app = express();

const allowedOrigins = [
  process.env.FRONTEND_URL || "http://localhost:3000",
  "http://localhost:3000",
].filter(Boolean);

app.use(
  helmet({
    crossOriginOpenerPolicy: false,
    crossOriginEmbedderPolicy: false,
  })
);
app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
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
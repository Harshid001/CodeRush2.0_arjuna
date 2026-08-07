import express from "express";
import cors from "cors";
import morgan from "morgan";
import { apiRoutes } from "./routes";
import { errorHandler } from "./middleware/errorHandler";
import { notFound } from "./middleware/notFound";

const app = express();

app.use(cors());
app.use(express.json());
app.use(morgan("dev"));

app.get("/health", (_req, res) => {
  res.json({ success: true, message: "x402 Backend API is running", timestamp: new Date().toISOString() });
});

app.use("/api/v1", apiRoutes);

app.use(notFound);
app.use(errorHandler);

export { app };
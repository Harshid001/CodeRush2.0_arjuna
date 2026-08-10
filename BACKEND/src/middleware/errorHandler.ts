import { Request, Response, NextFunction } from "express";
import { ApiError } from "../utils/ApiError";
import { env } from "../config/env";

export function errorHandler(err: Error, _req: Request, res: Response, _next: NextFunction) {
  if (err instanceof ApiError) {
    res.status(err.statusCode).json({
      success: false,
      message: err.message,
      ...(env.NODE_ENV === "development" && { stack: err.stack }),
    });
    return;
  }

  if (err.name === "ZodError" || err.name === "ValidationError") {
    res.status(400).json({
      success: false,
      message: err.message,
    });
    return;
  }

  if (err.name === "CastError") {
    res.status(400).json({
      success: false,
      message: "Invalid ID format",
    });
    return;
  }

  if ((err as any).code === 11000) {
    res.status(409).json({
      success: false,
      message: "Duplicate key error",
    });
    return;
  }

  console.error("Unhandled error:", err);
  res.status(500).json({
    success: false,
    message: "Internal server error",
    ...(env.NODE_ENV === "development" && { stack: err.stack, detail: err.message }),
  });
}
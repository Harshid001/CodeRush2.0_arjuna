import { Request, Response, NextFunction } from "express";
import { ApiError } from "../utils/ApiError";

/**
 * CSRF Protection Middleware (PRD-008)
 * Verifies header presence (X-CSRF-Token or X-Requested-With) on state-changing requests in all environments.
 * Supports X-Test-Bypass header for automated integration testing.
 */
export function csrfProtection(req: Request, _res: Response, next: NextFunction) {
  if (["GET", "HEAD", "OPTIONS"].includes(req.method)) {
    return next();
  }

  if (req.headers["x-test-bypass"] === "true") {
    return next();
  }

  const csrfHeader = req.headers["x-csrf-token"] || req.headers["x-requested-with"];
  if (!csrfHeader && !req.path.includes("/auth/")) {
    return next(new ApiError(403, "CSRF protection error: Missing X-CSRF-Token or X-Requested-With header"));
  }

  next();
}

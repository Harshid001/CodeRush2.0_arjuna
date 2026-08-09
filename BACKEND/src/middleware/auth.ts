import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { env } from "../config/env";
import { ApiError } from "../utils/ApiError";

export interface AuthPayload {
  userId: string;
  email: string;
  role: "developer" | "provider" | "admin";
}

/* eslint-disable @typescript-eslint/no-namespace */
declare global {
  namespace Express {
    interface Request {
      auth?: AuthPayload;
    }
  }
}

export function authenticate(req: Request, _res: Response, next: NextFunction) {
  const header = req.headers.authorization;
  let token: string | undefined;

  if (header && header.startsWith("Bearer ")) {
    token = header.split(" ")[1];
  } else if (req.cookies?.auth_token) {
    token = req.cookies.auth_token;
  } else if (typeof req.headers["x-auth-token"] === "string") {
    token = req.headers["x-auth-token"];
  }

  if (!token) {
    return next(new ApiError(401, "Authentication token required"));
  }

  try {
    const payload = jwt.verify(token, env.JWT_SECRET) as AuthPayload;
    req.auth = payload;
    next();
  } catch {
    return next(new ApiError(401, "Invalid or expired authentication token"));
  }
}

export function authorize(...roles: AuthPayload["role"][]) {
  return (req: Request, _res: Response, next: NextFunction) => {
    if (!req.auth) {
      return next(new ApiError(401, "Not authenticated"));
    }
    if (!roles.includes(req.auth.role)) {
      return next(new ApiError(403, "Insufficient permissions"));
    }
    next();
  };
}
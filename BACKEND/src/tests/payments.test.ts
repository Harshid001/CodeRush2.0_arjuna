import { describe, it, expect, afterAll } from "vitest";
import request from "supertest";
import jwt from "jsonwebtoken";
import { app } from "../app";
import { env } from "../config/env";
import mongoose from "mongoose";

describe("Payment & Idempotency Integration Tests (PRD-007, PRD-010)", () => {
  const testToken = jwt.sign(
    { userId: "usr_test_123", email: "test@x402.io", role: "developer" },
    env.JWT_SECRET
  );

  afterAll(async () => {
    if (mongoose.connection.readyState !== 0) {
      await mongoose.disconnect();
    }
  });

  describe("POST /api/v1/payments Validation", () => {
    it("should reject requests without required body fields", async () => {
      const res = await request(app)
        .post("/api/v1/payments")
        .set("Authorization", `Bearer ${testToken}`)
        .set("X-CSRF-Token", "test-csrf-token")
        .send({});
      expect(res.status).toBe(400);
    });

    it("should handle invalid currency inputs gracefully", async () => {
      const res = await request(app)
        .post("/api/v1/payments")
        .set("Authorization", `Bearer ${testToken}`)
        .set("X-CSRF-Token", "test-csrf-token")
        .send({
          providerId: "p_test_123",
          amount: -10,
        });
      expect(res.status).toBe(400);
    });
  });
});

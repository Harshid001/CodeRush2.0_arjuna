import { describe, it, expect, afterAll } from "vitest";
import request from "supertest";
import { app } from "../app";
import mongoose from "mongoose";

describe("Auth Integration Tests (PRD-005)", () => {
  afterAll(async () => {
    if (mongoose.connection.readyState !== 0) {
      await mongoose.disconnect();
    }
  });

  describe("POST /api/v1/auth/register", () => {
    it("should reject registration requests with invalid email or short password", async () => {
      const res = await request(app)
        .post("/api/v1/auth/register")
        .set("X-CSRF-Token", "test-csrf-token")
        .send({ email: "invalid-email", password: "123" });
      expect(res.status).toBe(400);
    });
  });

  describe("POST /api/v1/auth/login", () => {
    it("should reject login without email or password", async () => {
      const res = await request(app)
        .post("/api/v1/auth/login")
        .set("X-CSRF-Token", "test-csrf-token")
        .send({});
      expect(res.status).toBe(400);
    });
  });
});

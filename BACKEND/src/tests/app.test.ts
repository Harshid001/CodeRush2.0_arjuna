import { describe, it, expect, afterAll } from "vitest";
import request from "supertest";
import { app } from "../app";
import mongoose from "mongoose";

describe("Backend API Unit & Integration Tests (PRD-003)", () => {
  afterAll(async () => {
    if (mongoose.connection.readyState !== 0) {
      await mongoose.disconnect();
    }
  });

  describe("GET /health Endpoint (PRD-016)", () => {
    it("should return a health check payload", async () => {
      const res = await request(app).get("/health");
      expect(res.status).toBeDefined();
      expect(res.body).toHaveProperty("timestamp");
      expect(res.body).toHaveProperty("database");
    });
  });

  describe("CORS Security Middleware (PRD-001)", () => {
    it("should allow requests from local frontend origin", async () => {
      const res = await request(app)
        .get("/health")
        .set("Origin", "http://localhost:3000");
      expect(res.headers["access-control-allow-origin"]).toBe("http://localhost:3000");
    });
  });

  describe("Rate Limiting Middleware (PRD-006)", () => {
    it("should include rate limit headers in response", async () => {
      const res = await request(app).get("/health");
      expect(res.headers["ratelimit-limit"] || res.headers["x-ratelimit-limit"]).toBeDefined();
    });
  });
});

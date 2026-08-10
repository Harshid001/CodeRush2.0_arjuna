import { describe, it, expect, afterAll } from "vitest";
import request from "supertest";
import { app } from "../app";
import mongoose from "mongoose";

describe("Provider API Integration Tests (PRD-005)", () => {
  afterAll(async () => {
    if (mongoose.connection.readyState !== 0) {
      await mongoose.disconnect();
    }
  });

  describe("GET /api/v1/providers", () => {
    it("should return provider listing structure", async () => {
      const res = await request(app).get("/api/v1/providers");
      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty("success");
    });
  });
});

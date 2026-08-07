import crypto from "node:crypto";

export function generateId(prefix: string): string {
  const rand = crypto.randomBytes(6).toString("hex");
  return `${prefix}_${rand}`;
}
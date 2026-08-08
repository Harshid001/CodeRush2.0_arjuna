import fs from "fs";
import os from "os";
import path from "path";

export type ProvenanceSource = "server_observed" | "client_reported";
export type ProvenanceStatus = "pending" | "success" | "failed" | "info";

export type ProvenanceStage =
  | "challenge_issued"
  | "signature_requested"
  | "signature_received"
  | "payment_submitted"
  | "facilitator_verify_response"
  | "facilitator_settle_response"
  | "final_state";

export interface ProvenanceEvent {
  eventId: string;
  paymentId: string;
  stage: ProvenanceStage;
  source: ProvenanceSource;
  timestamp: string;
  status: ProvenanceStatus;
  title: string;
  description: string;
  details: Record<string, unknown>;
  latencyMs?: number;
}

export interface ProvenanceRecord {
  paymentId: string;
  providerId: string;
  providerName: string;
  startedAt: string;
  updatedAt: string;
  completedAt?: string;
  status: "pending" | "settled" | "failed";
  confirmedTxId?: string;
  events: ProvenanceEvent[];
}

// In-memory thread-safe singleton cache
let memoryStore: Map<string, ProvenanceRecord> = new Map();
let isInitialized = false;

// Writable location for the JSON store. Resolved lazily so serverless runtimes
// (e.g. Vercel, where only /tmp is writable and the project root is read-only)
// never crash on fs access. Falls back to memory-only mode if nothing is writable.
let DATA_DIR: string | null = null;

function getDataDir(): string | null {
  if (DATA_DIR !== null) return DATA_DIR;
  const tmpDir = path.join(os.tmpdir(), "nexusapi-provenance");
  const appDir = path.join(process.cwd(), ".data");
  const candidates = [
    process.env.DATA_DIR,
    ...(process.env.NODE_ENV === "production" ? [tmpDir, appDir] : [appDir, tmpDir]),
  ].filter(Boolean) as string[];

  for (const dir of candidates) {
    try {
      fs.mkdirSync(dir, { recursive: true });
      const probe = path.join(dir, `.write_test_${process.pid}_${Date.now()}`);
      fs.writeFileSync(probe, "ok");
      fs.unlinkSync(probe);
      DATA_DIR = dir;
      return DATA_DIR;
    } catch {
      // Not writable — try the next candidate.
    }
  }

  DATA_DIR = "";
  return DATA_DIR;
}

function getStorePaths(): { store: string | null; tmp: string | null } {
  const dir = getDataDir();
  if (!dir) return { store: null, tmp: null };
  return {
    store: path.join(dir, "provenance_records.json"),
    tmp: path.join(dir, "provenance_records.tmp.json"),
  };
}

function loadFromDisk(): Map<string, ProvenanceRecord> {
  try {
    const { store } = getStorePaths();
    if (!store || !fs.existsSync(store)) return new Map();
    const raw = fs.readFileSync(store, "utf-8");
    const parsed: Record<string, ProvenanceRecord> = JSON.parse(raw);
    return new Map(Object.entries(parsed));
  } catch (err) {
    console.error("[ProvenanceStore] Error loading store from disk:", err);
    return new Map();
  }
}

/**
 * ATOMIC FILE SAVE: Writes to temporary file first, then atomically renames it.
 * This guarantees a process crash or power interruption during write cannot corrupt the store.
 * Never throws — degrades silently to memory-only mode when disk is unavailable.
 */
function saveToDiskAtomic() {
  try {
    const { store, tmp } = getStorePaths();
    if (!store || !tmp) return;
    const obj = Object.fromEntries(memoryStore.entries());
    const jsonStr = JSON.stringify(obj, null, 2);
    fs.writeFileSync(tmp, jsonStr, "utf-8");
    fs.renameSync(tmp, store);
  } catch (err) {
    console.error("[ProvenanceStore] Error saving store atomically to disk:", err);
  }
}

function initStore() {
  if (!isInitialized) {
    try {
      memoryStore = loadFromDisk();
    } catch (err) {
      console.error("[ProvenanceStore] Error initializing store from disk:", err);
      memoryStore = new Map();
    }
    isInitialized = true;
  }
}

/**
 * MASKING HELPER: Mask address to first 6 and last 4 characters only.
 * E.g., GQHCRMG3DSGF6OWFQ6W6MT5CDV5IZTNEVHFYKNB42EI4VDOINC6AZSYB74 -> GQHCR...YB74
 */
export function maskAddress(address?: string): string {
  if (!address || typeof address !== "string") return "unknown_address";
  if (address.length <= 10) return address;
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
}

export function generatePaymentId(): string {
  return `pay_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 7)}`;
}

export function createPaymentRecord(
  providerId: string,
  providerName: string,
  requirements?: Record<string, unknown>
): { paymentId: string; record: ProvenanceRecord } {
  initStore();
  const paymentId = generatePaymentId();
  const now = new Date().toISOString();

  const record: ProvenanceRecord = {
    paymentId,
    providerId,
    providerName,
    startedAt: now,
    updatedAt: now,
    status: "pending",
    events: [],
  };

  memoryStore.set(paymentId, record);

  // Record 1st event: challenge_issued (server-observed)
  addProvenanceEvent(
    paymentId,
    "challenge_issued",
    "server_observed",
    "info",
    "HTTP 402 Requirements Issued",
    `Server generated payment requirements for ${providerName}.`,
    requirements || {}
  );

  return { paymentId, record };
}

export function addProvenanceEvent(
  paymentId: string,
  stage: ProvenanceStage,
  source: ProvenanceSource,
  status: ProvenanceStatus,
  title: string,
  description: string,
  details: Record<string, unknown> = {},
  latencyMs?: number
): ProvenanceEvent | null {
  initStore();
  const record = memoryStore.get(paymentId);
  if (!record) {
    console.warn(`[ProvenanceStore] PaymentId ${paymentId} not found when adding event ${stage}`);
    return null;
  }

  // Mask any sensitive address fields in details before recording
  const sanitizedDetails = { ...details };
  if (typeof sanitizedDetails.payerAddress === "string") {
    sanitizedDetails.payerAddress = maskAddress(sanitizedDetails.payerAddress);
  }
  if (typeof sanitizedDetails.signerAddress === "string") {
    sanitizedDetails.signerAddress = maskAddress(sanitizedDetails.signerAddress);
  }

  const now = new Date().toISOString();
  const event: ProvenanceEvent = {
    eventId: `evt_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 6)}`,
    paymentId,
    stage,
    source,
    timestamp: now,
    status,
    title,
    description,
    details: sanitizedDetails,
    latencyMs,
  };

  record.events.push(event);
  record.updatedAt = now;

  if (stage === "final_state") {
    record.completedAt = now;
    if (status === "success") {
      record.status = "settled";
      if (typeof details.confirmedTxId === "string") {
        record.confirmedTxId = details.confirmedTxId;
      }
    } else {
      record.status = "failed";
    }
  }

  memoryStore.set(paymentId, record);
  saveToDiskAtomic();
  return event;
}

export function getProvenanceRecord(paymentId: string): ProvenanceRecord | null {
  initStore();
  return memoryStore.get(paymentId) || null;
}

export function getAllProvenanceRecords(): ProvenanceRecord[] {
  initStore();
  return Array.from(memoryStore.values()).sort(
    (a, b) => new Date(b.startedAt).getTime() - new Date(a.startedAt).getTime()
  );
}

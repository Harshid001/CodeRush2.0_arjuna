import { Transaction } from "../models";
import { ApiError } from "../utils/ApiError";
import { generateId } from "../utils/ids";
import type { ITraceStep, TransactionStatus } from "../models/Transaction";

interface CreateTransactionInput {
  userId: string;
  providerId: string;
  providerName: string;
  startedAt: Date;
}

interface TraceStepInput {
  name: ITraceStep["name"];
  title: string;
  description: string;
  details?: Record<string, unknown>;
  status: ITraceStep["status"];
  durationMs: number;
}

export class TransactionService {
  async start(input: CreateTransactionInput) {
    const traceId = generateId("trace");
    const transaction = await Transaction.create({
      _id: generateId("txn"),
      traceId,
      ...input,
      status: "pending",
      steps: [],
      fallbackAvailable: false,
    });
    return transaction;
  }

  async addStep(traceId: string, step: TraceStepInput) {
    const transaction = await Transaction.findOne({ traceId });
    if (!transaction) throw new ApiError(404, "Transaction not found");

    transaction.steps.push({
      id: generateId("step"),
      timestamp: new Date().toISOString(),
      ...step,
      details: step.details || {},
    });
    await transaction.save();
    return transaction;
  }

  async complete(traceId: string, status: TransactionStatus, receiptId?: string, errorMessage?: string) {
    const transaction = await Transaction.findOneAndUpdate(
      { traceId },
      {
        $set: {
          status,
          completedAt: new Date(),
          receiptId,
          errorMessage,
        },
      },
      { new: true }
    );
    if (!transaction) throw new ApiError(404, "Transaction not found");
    return transaction;
  }

  async setFallback(traceId: string, fallbackProviderId: string) {
    const transaction = await Transaction.findOneAndUpdate(
      { traceId },
      { $set: { fallbackAvailable: true, fallbackProviderId } },
      { new: true }
    );
    if (!transaction) throw new ApiError(404, "Transaction not found");
    return transaction;
  }

  async getByUser(userId: string, page = 1, limit = 20) {
    const skip = (page - 1) * limit;
    const [transactions, total] = await Promise.all([
      Transaction.find({ userId }).sort({ createdAt: -1 }).skip(skip).limit(limit),
      Transaction.countDocuments({ userId }),
    ]);
    return { transactions, total, page, limit, totalPages: Math.ceil(total / limit) };
  }

  async getByTraceId(traceId: string) {
    const transaction = await Transaction.findOne({ traceId });
    if (!transaction) throw new ApiError(404, "Transaction not found");
    return transaction;
  }
}

export const transactionService = new TransactionService();
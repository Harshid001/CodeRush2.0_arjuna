import { Receipt } from "../models";
import { ApiError } from "../utils/ApiError";
import { generateId } from "../utils/ids";

interface CreateReceiptInput {
  paymentId: string;
  userId: string;
  providerId: string;
  providerName?: string;
  amount: number;
  finalAmount: number;
  currency: string;
  scheme: "exact" | "upto";
  inputHash: string;
  outputHash: string;
  latencyMs: number;
  settlementId: string;
  settledAt: Date;
  requirementNonce: string;
  payerKeyId: string;
  network: string;
  status?: "success" | "failed" | "refunded";
}

export class ReceiptService {
  async create(input: CreateReceiptInput) {
    const receiptId = generateId("rec");
    const receipt = await Receipt.create({
      _id: generateId("rct"),
      receiptId,
      ...input,
      status: input.status || "success",
    });
    return receipt;
  }

  async getByUser(userId: string, page = 1, limit = 20) {
    const skip = (page - 1) * limit;
    const [receipts, total] = await Promise.all([
      Receipt.find({ userId }).sort({ createdAt: -1 }).skip(skip).limit(limit),
      Receipt.countDocuments({ userId }),
    ]);
    return { receipts, total, page, limit, totalPages: Math.ceil(total / limit) };
  }

  async getByProvider(providerId: string, page = 1, limit = 20) {
    const skip = (page - 1) * limit;
    const [receipts, total] = await Promise.all([
      Receipt.find({ providerId }).sort({ createdAt: -1 }).skip(skip).limit(limit),
      Receipt.countDocuments({ providerId }),
    ]);
    return { receipts, total, page, limit, totalPages: Math.ceil(total / limit) };
  }

  async getByReceiptId(receiptId: string) {
    const receipt = await Receipt.findOne({ receiptId });
    if (!receipt) throw new ApiError(404, "Receipt not found");
    return receipt;
  }

  async getById(id: string) {
    const receipt = await Receipt.findById(id);
    if (!receipt) throw new ApiError(404, "Receipt not found");
    return receipt;
  }

  async getByPaymentId(paymentId: string) {
    return Receipt.findOne({ paymentId });
  }
}

export const receiptService = new ReceiptService();
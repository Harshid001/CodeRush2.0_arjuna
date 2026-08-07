import { Payment } from "../models";
import { ApiError } from "../utils/ApiError";
import { generateId } from "../utils/ids";

interface CreatePaymentInput {
  providerId: string;
  userId: string;
  amount: number;
  currency: string;
  network: string;
  scheme: "exact" | "upto";
  requirementNonce: string;
  payerKeyId: string;
  signature: string;
}

export class PaymentService {
  async create(input: CreatePaymentInput) {
    const existing = await Payment.findOne({ requirementNonce: input.requirementNonce });
    if (existing) {
      throw new ApiError(409, "Payment with this nonce already exists");
    }

    const payment = await Payment.create({
      _id: generateId("pay"),
      ...input,
      status: "pending",
    });
    return payment;
  }

  async verify(id: string) {
    const payment = await Payment.findByIdAndUpdate(
      id,
      { $set: { status: "verified" } },
      { new: true }
    );
    if (!payment) throw new ApiError(404, "Payment not found");
    return payment;
  }

  async settle(id: string, settlementId: string, finalAmount: number, inputHash: string, outputHash: string, latencyMs: number) {
    const payment = await Payment.findByIdAndUpdate(
      id,
      {
        $set: {
          status: "settled",
          settlementId,
          finalAmount,
          settledAt: new Date(),
          inputHash,
          outputHash,
          latencyMs,
        },
      },
      { new: true }
    );
    if (!payment) throw new ApiError(404, "Payment not found");
    return payment;
  }

  async fail(id: string, errorReason: string) {
    const payment = await Payment.findByIdAndUpdate(
      id,
      { $set: { status: "failed", errorReason } },
      { new: true }
    );
    if (!payment) throw new ApiError(404, "Payment not found");
    return payment;
  }

  async getByUser(userId: string, page = 1, limit = 20) {
    const skip = (page - 1) * limit;
    const [payments, total] = await Promise.all([
      Payment.find({ userId }).sort({ createdAt: -1 }).skip(skip).limit(limit),
      Payment.countDocuments({ userId }),
    ]);
    return { payments, total, page, limit, totalPages: Math.ceil(total / limit) };
  }

  async getById(id: string) {
    const payment = await Payment.findById(id);
    if (!payment) throw new ApiError(404, "Payment not found");
    return payment;
  }
}

export const paymentService = new PaymentService();
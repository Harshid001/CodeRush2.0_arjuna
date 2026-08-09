import { Request, Response, NextFunction } from "express";
import { z } from "zod";
import mongoose from "mongoose";
import { paymentService } from "../services/payment.service";
import { budgetService } from "../services/budget.service";
import { policyService } from "../services/policy.service";
import { providerService } from "../services/provider.service";
import { receiptService } from "../services/receipt.service";
import { ApiError } from "../utils/ApiError";

const createSchema = z.object({
  providerId: z.string().min(1),
  amount: z.number().min(0),
  currency: z.string().default("USD"),
  network: z.string().min(1),
  scheme: z.enum(["exact", "upto"]),
  requirementNonce: z.string().min(1),
  payerKeyId: z.string().min(1),
  signature: z.string().min(1),
});

export class PaymentController {
  createAndExecute = async (req: Request, res: Response, next: NextFunction) => {
    console.error("[PAYMENTS API] REQUEST RECEIVED");
    console.error("[PAYMENTS API] BODY FIELDS:", Object.keys(req.body || {}));
    
    let session: mongoose.ClientSession | null = null;
    try {
      if (mongoose.connection.readyState === 1) {
        try {
          session = await mongoose.startSession();
          session.startTransaction();
        } catch {
          session = null;
        }
      }

      const input = createSchema.parse(req.body);
      const userId = req.auth?.userId || "anonymous";

      const idempotencyKey = (req.headers["idempotency-key"] as string) || input.requirementNonce;
      if (idempotencyKey) {
        const existingReceipt = await receiptService.getByPaymentId(idempotencyKey);
        if (existingReceipt) {
          if (session) {
            await session.abortTransaction();
            session.endSession();
          }
          return res.status(200).json({
            success: true,
            data: { receipt: existingReceipt, isIdempotentReplay: true },
          });
        }
      }

      const provider = await providerService.getById(input.providerId);
      if (provider && !provider.active) {
        throw new ApiError(400, "Provider is not active");
      }

      const policyCheck = await policyService.checkPolicy(userId, input.providerId, input.amount, provider?.qualityScore || 90);
      if (!policyCheck.allowed) {
        throw new ApiError(403, policyCheck.reason || "Policy denied");
      }

      const budgetCheck = await budgetService.checkBudget(userId, input.providerId, input.amount);
      if (!budgetCheck.allowed) {
        throw new ApiError(403, budgetCheck.reason || "Budget limit exceeded");
      }

      const payment = await paymentService.create({ ...input, userId });

      const inputHash = `hash_in_${payment._id}_${Date.now()}`;
      const outputHash = `hash_out_${payment._id}_${Date.now() + 1}`;
      const latencyMs = Math.floor(Math.random() * 200) + 20;

      const settlementId = `settle_${payment._id}`;
      const finalAmount = input.scheme === "upto" ? Math.round(input.amount * 0.6 * 100) / 100 : input.amount;

      await paymentService.verify(payment._id.toString());
      const settled = await paymentService.settle(payment._id.toString(), settlementId, finalAmount, inputHash, outputHash, latencyMs);

      await budgetService.recordSpend(userId, input.providerId, finalAmount);

      if (provider) {
        await providerService.update(input.providerId, {
          totalCalls: (provider.totalCalls || 0) + 1,
          totalRevenue: (provider.totalRevenue || 0) + finalAmount,
          avgLatencyMs: Math.round(((provider.avgLatencyMs || 50) * (provider.totalCalls || 0) + latencyMs) / ((provider.totalCalls || 0) + 1)),
        } as any);
      }

      const receipt = await receiptService.create({
        paymentId: payment._id.toString(),
        userId,
        providerId: input.providerId,
        providerName: provider?.name || input.providerId,
        amount: input.amount,
        finalAmount,
        currency: input.currency,
        scheme: input.scheme,
        inputHash,
        outputHash,
        latencyMs,
        settlementId,
        settledAt: settled.settledAt!,
        requirementNonce: input.requirementNonce,
        payerKeyId: input.payerKeyId,
        network: input.network,
      });

      await session.commitTransaction();
      session.endSession();

      res.status(201).json({
        success: true,
        data: { payment: settled, receipt, requiresApproval: budgetCheck.requiresApproval },
      });
    } catch (err: any) {
      if (session) {
        await session.abortTransaction();
        session.endSession();
      }
      console.error("========== PAYMENTS API ERROR ==========");
      console.error("ERROR:", String(err));

      if (err instanceof Error) {
        console.error("NAME:", err.name);
        console.error("MESSAGE:", err.message);
        console.error("STACK:", err.stack);
      }

      console.error("========================================");
      next(err);
    }
  };

  getByUser = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { page, limit } = req.query as any;
      const result = await paymentService.getByUser(
        req.auth!.userId,
        page ? Number(page) : 1,
        limit ? Number(limit) : 20
      );
      res.json({ success: true, data: result });
    } catch (err) {
      next(err);
    }
  };

  getById = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const payment = await paymentService.getById(req.params.id);
      res.json({ success: true, data: payment });
    } catch (err) {
      next(err);
    }
  };
}

export const paymentController = new PaymentController();
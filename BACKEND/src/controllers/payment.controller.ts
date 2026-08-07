import { Request, Response, NextFunction } from "express";
import { z } from "zod";
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
    try {
      const input = createSchema.parse(req.body);
      const userId = req.auth!.userId;

      const provider = await providerService.getById(input.providerId);
      if (!provider.active) {
        throw new ApiError(400, "Provider is not active");
      }

      const policyCheck = await policyService.checkPolicy(userId, input.providerId, input.amount, provider.qualityScore);
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

      await providerService.update(input.providerId, {
        totalCalls: provider.totalCalls + 1,
        totalRevenue: provider.totalRevenue + finalAmount,
        avgLatencyMs: Math.round((provider.avgLatencyMs * provider.totalCalls + latencyMs) / (provider.totalCalls + 1)),
      } as any);

      const receipt = await receiptService.create({
        paymentId: payment._id.toString(),
        userId,
        providerId: input.providerId,
        providerName: provider.name,
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

      res.status(201).json({
        success: true,
        data: { payment: settled, receipt, requiresApproval: budgetCheck.requiresApproval },
      });
    } catch (err) {
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
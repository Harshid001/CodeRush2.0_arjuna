import { Request, Response, NextFunction } from "express";
import { z } from "zod";
import { budgetService } from "../services/budget.service";

const updateSchema = z.object({
  perRequestMax: z.number().min(0).optional(),
  perProviderDailyMax: z.number().min(0).optional(),
  dailyMax: z.number().min(0).optional(),
  minQualityScore: z.number().min(0).max(100).optional(),
  allowlist: z.array(z.string()).optional(),
});

export class BudgetController {
  get = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const budget = await budgetService.getByUser(req.auth!.userId);
      res.json({ success: true, data: budget });
    } catch (err) {
      next(err);
    }
  };

  update = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const input = updateSchema.parse(req.body);
      const budget = await budgetService.update(req.auth!.userId, input);
      res.json({ success: true, data: budget });
    } catch (err) {
      next(err);
    }
  };

  checkBudget = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { providerId, estimatedCost } = req.body;
      const result = await budgetService.checkBudget(req.auth!.userId, providerId, estimatedCost);
      res.json({ success: true, data: result });
    } catch (err) {
      next(err);
    }
  };

  resetDaily = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const budget = await budgetService.resetDaily(req.auth!.userId);
      res.json({ success: true, data: budget });
    } catch (err) {
      next(err);
    }
  };
}

export const budgetController = new BudgetController();
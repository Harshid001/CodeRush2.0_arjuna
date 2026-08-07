import { Request, Response, NextFunction } from "express";
import { z } from "zod";
import { policyService } from "../services/policy.service";

const createSchema = z.object({
  name: z.string().min(1),
  type: z.enum(["allowlist", "quality_threshold", "per_request_cap", "per_provider_daily", "daily_max"]),
  action: z.enum(["block", "flag", "approve"]),
  value: z.union([z.number(), z.array(z.string())]),
  priority: z.number().optional(),
});

const updateSchema = z.object({
  action: z.enum(["block", "flag", "approve"]).optional(),
  value: z.union([z.number(), z.array(z.string())]).optional(),
  priority: z.number().optional(),
  isActive: z.boolean().optional(),
});

export class PolicyController {
  getByUser = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const policies = await policyService.getByUser(req.auth!.userId);
      res.json({ success: true, data: policies });
    } catch (err) {
      next(err);
    }
  };

  create = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const input = createSchema.parse(req.body);
      const policy = await policyService.create({ ...input, userId: req.auth!.userId });
      res.status(201).json({ success: true, data: policy });
    } catch (err) {
      next(err);
    }
  };

  update = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const input = updateSchema.parse(req.body);
      const policy = await policyService.update(req.params.id, input);
      res.json({ success: true, data: policy });
    } catch (err) {
      next(err);
    }
  };

  remove = async (req: Request, res: Response, next: NextFunction) => {
    try {
      await policyService.remove(req.params.id);
      res.json({ success: true, message: "Policy deleted" });
    } catch (err) {
      next(err);
    }
  };
}

export const policyController = new PolicyController();
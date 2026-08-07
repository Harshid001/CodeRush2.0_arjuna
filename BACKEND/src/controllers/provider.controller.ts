import { Request, Response, NextFunction } from "express";
import { z } from "zod";
import { providerService } from "../services/provider.service";

const createSchema = z.object({
  name: z.string().min(1),
  description: z.string().min(1),
  category: z.enum(["LLM & NLP", "Computer Vision", "Financial & Market Data", "Code & DevTools", "Audio & Speech", "Web Scraping"]),
  price: z.number().min(0),
  paymentType: z.enum(["exact", "upto"]),
  qualityScore: z.number().min(0).max(100),
  payToAddress: z.string().min(1),
  network: z.string().min(1),
  endpoint: z.string().min(1),
  outputSchema: z.record(z.string()).optional(),
  isInjectablePrompt: z.boolean().optional(),
});

const updateSchema = createSchema.partial().extend({
  active: z.boolean().optional(),
});

export class ProviderController {
  getAll = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { category, active, search, minQuality, maxPrice, page, limit } = req.query as any;
      const result = await providerService.getAll({
        category,
        active: active === undefined ? undefined : active === "true",
        search,
        minQuality: minQuality ? Number(minQuality) : undefined,
        maxPrice: maxPrice ? Number(maxPrice) : undefined,
        page: page ? Number(page) : undefined,
        limit: limit ? Number(limit) : undefined,
      });
      res.json({ success: true, data: result });
    } catch (err) {
      next(err);
    }
  };

  getById = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const provider = await providerService.getById(req.params.id);
      res.json({ success: true, data: provider });
    } catch (err) {
      next(err);
    }
  };

  create = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const input = createSchema.parse(req.body);
      const provider = await providerService.create({
        ...input,
        ownerId: req.auth?.userId,
      });
      res.status(201).json({ success: true, data: provider });
    } catch (err) {
      next(err);
    }
  };

  update = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const input = updateSchema.parse(req.body);
      const provider = await providerService.update(req.params.id, input);
      res.json({ success: true, data: provider });
    } catch (err) {
      next(err);
    }
  };

  remove = async (req: Request, res: Response, next: NextFunction) => {
    try {
      await providerService.remove(req.params.id);
      res.json({ success: true, message: "Provider deleted" });
    } catch (err) {
      next(err);
    }
  };

  recommend = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { category } = req.query as any;
      const providers = await providerService.getRecommendation(category || "LLM & NLP");
      res.json({ success: true, data: providers });
    } catch (err) {
      next(err);
    }
  };
}

export const providerController = new ProviderController();
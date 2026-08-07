import { Request, Response, NextFunction } from "express";
import { analyticsService } from "../services/analytics.service";

export class AnalyticsController {
  getToday = async (_req: Request, res: Response, next: NextFunction) => {
    try {
      const data = await analyticsService.computeAndSave();
      res.json({ success: true, data });
    } catch (err) {
      next(err);
    }
  };

  getRange = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { from, to } = req.query as any;
      const data = await analyticsService.getRange(from, to);
      res.json({ success: true, data });
    } catch (err) {
      next(err);
    }
  };
}

export const analyticsController = new AnalyticsController();
import { Request, Response, NextFunction } from "express";
import { receiptService } from "../services/receipt.service";

export class ReceiptController {
  getByUser = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { page, limit } = req.query as any;
      const result = await receiptService.getByUser(
        req.auth!.userId,
        page ? Number(page) : 1,
        limit ? Number(limit) : 20
      );
      res.json({ success: true, data: result });
    } catch (err) {
      next(err);
    }
  };

  getByProvider = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { page, limit } = req.query as any;
      const result = await receiptService.getByProvider(
        req.params.providerId,
        page ? Number(page) : 1,
        limit ? Number(limit) : 20
      );
      res.json({ success: true, data: result });
    } catch (err) {
      next(err);
    }
  };

  getByReceiptId = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const receipt = await receiptService.getByReceiptId(req.params.receiptId);
      res.json({ success: true, data: receipt });
    } catch (err) {
      next(err);
    }
  };
}

export const receiptController = new ReceiptController();
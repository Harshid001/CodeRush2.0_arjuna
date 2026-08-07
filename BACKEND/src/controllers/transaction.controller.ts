import { Request, Response, NextFunction } from "express";
import { transactionService } from "../services/transaction.service";

export class TransactionController {
  getByUser = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { page, limit } = req.query as any;
      const result = await transactionService.getByUser(
        req.auth!.userId,
        page ? Number(page) : 1,
        limit ? Number(limit) : 20
      );
      res.json({ success: true, data: result });
    } catch (err) {
      next(err);
    }
  };

  getByTraceId = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const transaction = await transactionService.getByTraceId(req.params.traceId);
      res.json({ success: true, data: transaction });
    } catch (err) {
      next(err);
    }
  };
}

export const transactionController = new TransactionController();
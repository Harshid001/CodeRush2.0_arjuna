import { Router } from "express";
import { transactionController } from "../controllers/transaction.controller";
import { authenticate } from "../middleware/auth";

const router = Router();

router.use(authenticate);

router.get("/", transactionController.getByUser);
router.get("/:traceId", transactionController.getByTraceId);

export { router as transactionRoutes };
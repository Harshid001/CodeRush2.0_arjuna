import { Router } from "express";
import { receiptController } from "../controllers/receipt.controller";
import { authenticate } from "../middleware/auth";

const router = Router();

router.use(authenticate);

router.get("/", receiptController.getByUser);
router.get("/provider/:providerId", receiptController.getByProvider);
router.get("/:receiptId", receiptController.getByReceiptId);

export { router as receiptRoutes };
import { Router } from "express";
import { walletController } from "../controllers/wallet.controller";
import { authenticate } from "../middleware/auth";

const router = Router();

router.get("/status", walletController.getStatus);
router.post("/link", authenticate, walletController.linkWallet);

export { router as walletRoutes };

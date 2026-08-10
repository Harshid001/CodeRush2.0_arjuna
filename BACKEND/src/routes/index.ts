import { Router } from "express";
import { authRoutes } from "./auth.routes";
import { providerRoutes } from "./provider.routes";
import { policyRoutes } from "./policy.routes";
import { budgetRoutes } from "./budget.routes";
import { paymentRoutes } from "./payment.routes";
import { receiptRoutes } from "./receipt.routes";
import { transactionRoutes } from "./transaction.routes";
import { analyticsRoutes } from "./analytics.routes";
import { walletRoutes } from "./wallet.routes";

import pdfRoutes from "./pdf.routes";

const router = Router();

router.use("/auth", authRoutes);
router.use("/providers", providerRoutes);
router.use("/policies", policyRoutes);
router.use("/budgets", budgetRoutes);
router.use("/payments", paymentRoutes);
router.use("/receipts", receiptRoutes);
router.use("/transactions", transactionRoutes);
router.use("/analytics", analyticsRoutes);
router.use("/wallet", walletRoutes);
router.use("/pdf", pdfRoutes);

export { router as apiRoutes };
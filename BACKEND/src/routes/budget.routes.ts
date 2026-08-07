import { Router } from "express";
import { budgetController } from "../controllers/budget.controller";
import { authenticate } from "../middleware/auth";

const router = Router();

router.use(authenticate);

router.get("/", budgetController.get);
router.put("/", budgetController.update);
router.post("/check", budgetController.checkBudget);
router.post("/reset", budgetController.resetDaily);

export { router as budgetRoutes };
import { Router } from "express";
import { analyticsController } from "../controllers/analytics.controller";
import { authenticate, authorize } from "../middleware/auth";

const router = Router();

router.use(authenticate);

router.get("/today", analyticsController.getToday);
router.get("/range", authorize("admin"), analyticsController.getRange);

export { router as analyticsRoutes };
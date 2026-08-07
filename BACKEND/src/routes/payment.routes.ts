import { Router } from "express";
import { paymentController } from "../controllers/payment.controller";
import { authenticate } from "../middleware/auth";

const router = Router();

router.use(authenticate);

router.post("/", paymentController.createAndExecute);
router.get("/", paymentController.getByUser);
router.get("/:id", paymentController.getById);

export { router as paymentRoutes };
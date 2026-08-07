import { Router } from "express";
import { providerController } from "../controllers/provider.controller";
import { authenticate, authorize } from "../middleware/auth";

const router = Router();

router.get("/", providerController.getAll);
router.get("/recommend", providerController.recommend);
router.get("/:id", providerController.getById);
router.post("/", authenticate, authorize("provider", "admin"), providerController.create);
router.put("/:id", authenticate, authorize("provider", "admin"), providerController.update);
router.delete("/:id", authenticate, authorize("admin"), providerController.remove);

export { router as providerRoutes };
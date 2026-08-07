import { Router } from "express";
import { policyController } from "../controllers/policy.controller";
import { authenticate } from "../middleware/auth";

const router = Router();

router.use(authenticate);

router.get("/", policyController.getByUser);
router.post("/", policyController.create);
router.put("/:id", policyController.update);
router.delete("/:id", policyController.remove);

export { router as policyRoutes };
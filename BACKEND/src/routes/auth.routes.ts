import { Router } from "express";
import { authController } from "../controllers/auth.controller";
import { authenticate } from "../middleware/auth";

const router = Router();

router.post("/register", authController.register);
router.post("/login", authController.login);
router.post("/google", authController.googleAuth);
router.get("/profile", authenticate, authController.profile);
router.put("/profile", authenticate, authController.updateProfile);

export { router as authRoutes };
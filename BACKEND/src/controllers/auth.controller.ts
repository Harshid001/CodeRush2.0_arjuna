import { Request, Response, NextFunction } from "express";
import { z } from "zod";
import { authService } from "../services/auth.service";

const registerSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
  name: z.string().min(1),
  role: z.enum(["developer", "provider", "admin"]).optional(),
});

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

const googleSchema = z
  .object({
    idToken: z.string().optional(),
    credential: z.string().optional(),
    token: z.string().optional(),
  })
  .refine((data) => !!(data.idToken || data.credential || data.token), {
    message: "Either idToken or credential is required",
  });

export class AuthController {
  register = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { email, password, name, role } = registerSchema.parse(req.body);
      const result = await authService.register(email, password, name, role);
      res.status(201).json({ success: true, data: result });
    } catch (err) {
      next(err);
    }
  };

  login = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { email, password } = loginSchema.parse(req.body);
      const result = await authService.login(email, password);
      res.json({ success: true, data: result });
    } catch (err) {
      next(err);
    }
  };

  googleAuth = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const body = googleSchema.parse(req.body);
      const token = body.idToken || body.credential || body.token;
      const result = await authService.googleAuth(token!);
      res.json({ success: true, data: result });
    } catch (err) {
      next(err);
    }
  };

  profile = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const user = await authService.getProfile(req.auth!.userId);
      res.json({ success: true, data: user });
    } catch (err) {
      next(err);
    }
  };

  updateProfile = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { name, walletAddress, avatarUrl } = req.body;
      const user = await authService.updateProfile(req.auth!.userId, { name, walletAddress, avatarUrl });
      res.json({ success: true, data: user });
    } catch (err) {
      next(err);
    }
  };
}

export const authController = new AuthController();
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { User } from "../models";
import { env } from "../config/env";
import { ApiError } from "../utils/ApiError";
import { generateId } from "../utils/ids";
import { Budget } from "../models/Budget";

const SALT_ROUNDS = 12;

export class AuthService {
  async register(email: string, password: string, name: string, role: "developer" | "provider" | "admin" = "developer") {
    const existing = await User.findOne({ email: email.toLowerCase() });
    if (existing) {
      throw new ApiError(409, "Email already registered");
    }

    const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);
    const user = await User.create({
      _id: generateId("usr"),
      email: email.toLowerCase(),
      passwordHash,
      name,
      role,
    });

    await Budget.create({
      userId: user._id,
      perRequestMax: 5,
      perProviderDailyMax: 10,
      dailyMax: 20,
      minQualityScore: 70,
      spentToday: 0,
      spentByProvider: {},
    });

    const token = this.signToken(user._id, user.email, user.role);
    return {
      user: {
        id: user._id,
        email: user.email,
        name: user.name,
        role: user.role,
        walletAddress: user.walletAddress,
      },
      token,
    };
  }

  async login(email: string, password: string) {
    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      throw new ApiError(401, "Invalid email or password");
    }

    const valid = await bcrypt.compare(password, user.passwordHash);
    if (!valid) {
      throw new ApiError(401, "Invalid email or password");
    }

    if (!user.isActive) {
      throw new ApiError(403, "Account is deactivated");
    }

    const token = this.signToken(user._id, user.email, user.role);
    return {
      user: {
        id: user._id,
        email: user.email,
        name: user.name,
        role: user.role,
        walletAddress: user.walletAddress,
      },
      token,
    };
  }

  async getProfile(userId: string) {
    const user = await User.findById(userId).select("-passwordHash");
    if (!user) {
      throw new ApiError(404, "User not found");
    }
    return user;
  }

  private signToken(userId: string, email: string, role: string): string {
    return jwt.sign({ userId, email, role }, env.JWT_SECRET, { expiresIn: "7d" });
  }
}

export const authService = new AuthService();
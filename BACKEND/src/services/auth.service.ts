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
    if (!user || !user.passwordHash) {
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
        avatarUrl: user.avatarUrl,
      },
      token,
    };
  }

  async googleAuth(idToken: string) {
    let payload: { sub?: string; email?: string; name?: string; picture?: string; aud?: string };
    try {
      const res = await fetch(`https://oauth2.googleapis.com/tokeninfo?id_token=${encodeURIComponent(idToken)}`);
      if (!res.ok) {
        throw new ApiError(401, "Invalid or expired Google token");
      }
      payload = (await res.json()) as { sub?: string; email?: string; name?: string; picture?: string; aud?: string };
    } catch (err) {
      if (err instanceof ApiError) throw err;
      throw new ApiError(401, "Failed to verify Google token");
    }

    if (!payload.sub || !payload.email) {
      throw new ApiError(401, "Invalid Google token payload");
    }

    if (env.GOOGLE_CLIENT_ID && payload.aud && payload.aud !== env.GOOGLE_CLIENT_ID) {
      throw new ApiError(401, "Google token client ID mismatch");
    }

    const email = payload.email.toLowerCase();
    const sub = payload.sub;

    let user = await User.findOne({
      $or: [{ googleId: sub }, { googleSub: sub }, { email }],
    });

    if (user) {
      if (!user.isActive) {
        throw new ApiError(403, "Account is deactivated");
      }
      let modified = false;
      if (!user.googleId) {
        user.googleId = sub;
        modified = true;
      }
      if (!user.googleSub) {
        user.googleSub = sub;
        modified = true;
      }
      if (payload.picture && !user.avatarUrl) {
        user.avatarUrl = payload.picture;
        modified = true;
      }
      if (payload.name && !user.name) {
        user.name = payload.name;
        modified = true;
      }
      if (modified) {
        await user.save();
      }
    } else {
      user = await User.create({
        _id: generateId("usr"),
        email,
        googleId: sub,
        googleSub: sub,
        name: payload.name || email.split("@")[0],
        avatarUrl: payload.picture,
        role: "developer",
        isActive: true,
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
    }

    const token = this.signToken(user._id, user.email, user.role);
    return {
      user: {
        id: user._id,
        email: user.email,
        name: user.name,
        role: user.role,
        walletAddress: user.walletAddress,
        avatarUrl: user.avatarUrl,
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

  async updateProfile(userId: string, data: { name?: string; walletAddress?: string; avatarUrl?: string }) {
    const user = await User.findById(userId);
    if (!user) {
      throw new ApiError(404, "User not found");
    }
    if (data.name !== undefined) user.name = data.name.trim();
    if (data.walletAddress !== undefined) user.walletAddress = data.walletAddress.trim();
    if (data.avatarUrl !== undefined) user.avatarUrl = data.avatarUrl.trim();
    await user.save();
    return user;
  }

  private signToken(userId: string, email: string, role: string): string {
    return jwt.sign({ userId, email, role }, env.JWT_SECRET, { expiresIn: "7d" });
  }
}

export const authService = new AuthService();
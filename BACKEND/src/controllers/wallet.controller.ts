import { Request, Response, NextFunction } from "express";
import { User } from "../models/User";
import { ApiError } from "../utils/ApiError";

export class WalletController {
  // GET /api/v1/wallet/status?address=...
  getStatus = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const address = (req.query.address as string) || (req.query.wallet as string);
      if (!address) {
        throw new ApiError(400, "Wallet address is required");
      }

      const cleanAddress = address.trim();
      const user = await User.findOne({ walletAddress: cleanAddress }).select("-passwordHash");
      
      const isEvm = cleanAddress.startsWith("0x");
      const chain = isEvm ? "evm" : "algorand";

      res.json({
        success: true,
        data: {
          address: cleanAddress,
          chain,
          isRegistered: !!user,
          user: user
            ? {
                id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
              }
            : null,
        },
      });
    } catch (err) {
      next(err);
    }
  };

  // POST /api/v1/wallet/link (requires auth)
  linkWallet = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { walletAddress, chainType } = req.body;
      if (!walletAddress) {
        throw new ApiError(400, "walletAddress is required");
      }

      const user = await User.findById(req.auth!.userId);
      if (!user) {
        throw new ApiError(404, "User not found");
      }

      user.walletAddress = walletAddress.trim();
      if (chainType && (chainType === "evm" || chainType === "algorand")) {
        user.chainType = chainType;
      }
      await user.save();

      res.json({
        success: true,
        data: {
          id: user._id,
          name: user.name,
          email: user.email,
          walletAddress: user.walletAddress,
          chainType: user.chainType,
        },
      });
    } catch (err) {
      next(err);
    }
  };
}

export const walletController = new WalletController();

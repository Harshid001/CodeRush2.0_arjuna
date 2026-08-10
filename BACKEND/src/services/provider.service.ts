import mongoose from "mongoose";
import { Provider } from "../models";
import { ApiError } from "../utils/ApiError";
import { generateId } from "../utils/ids";
import type { PaymentScheme, ProviderCategory } from "../models/Provider";

interface CreateProviderInput {
  name: string;
  description: string;
  category: ProviderCategory;
  price: number;
  paymentType: PaymentScheme;
  qualityScore: number;
  payToAddress: string;
  network: string;
  endpoint: string;
  outputSchema?: Record<string, string>;
  isInjectablePrompt?: boolean;
  ownerId?: string;
}

interface UpdateProviderInput extends Partial<CreateProviderInput> {
  active?: boolean;
}

export class ProviderService {
  async getAll(query: { category?: string; active?: boolean; search?: string; minQuality?: number; maxPrice?: number; page?: number; limit?: number }) {
    const filter: Record<string, unknown> = {};

    if (query.category) filter.category = query.category;
    if (query.active !== undefined) filter.active = query.active;
    if (query.minQuality !== undefined) filter.qualityScore = { $gte: query.minQuality };
    if (query.maxPrice !== undefined) filter.price = { ...(filter.price as any), $lte: query.maxPrice };
    if (query.search) {
      filter.$or = [
        { name: { $regex: query.search, $options: "i" } },
        { description: { $regex: query.search, $options: "i" } },
      ];
    }

    const page = query.page || 1;
    const limit = query.limit || 20;
    const skip = (page - 1) * limit;

    if (mongoose.connection.readyState !== 1) {
      return { providers: [], total: 0, page, limit, totalPages: 0 };
    }

    const [providers, total] = await Promise.all([
      Provider.find(filter).sort({ qualityScore: -1 }).skip(skip).limit(limit),
      Provider.countDocuments(filter),
    ]);

    return { providers, total, page, limit, totalPages: Math.ceil(total / limit) };
  }

  async getById(id: string) {
    const provider = await Provider.findById(id);
    if (!provider) throw new ApiError(404, "Provider not found");
    return provider;
  }

  async create(input: CreateProviderInput) {
    const provider = await Provider.create({
      _id: generateId("p"),
      ...input,
      outputSchema: input.outputSchema || {},
      isInjectablePrompt: input.isInjectablePrompt || false,
      active: true,
      totalCalls: 0,
      totalRevenue: 0,
      avgLatencyMs: 0,
    });
    return provider;
  }

  async update(id: string, input: UpdateProviderInput) {
    const provider = await Provider.findByIdAndUpdate(id, { $set: input }, { new: true, runValidators: true });
    if (!provider) throw new ApiError(404, "Provider not found");
    return provider;
  }

  async remove(id: string) {
    const provider = await Provider.findByIdAndDelete(id);
    if (!provider) throw new ApiError(404, "Provider not found");
  }

  async getRecommendation(category: string) {
    const providers = await Provider.find({ active: true, category })
      .sort({ qualityScore: -1 })
      .limit(10);

    return providers.sort((a, b) => {
      const scoreA = a.qualityScore / Math.max(0.01, a.price);
      const scoreB = b.qualityScore / Math.max(0.01, b.price);
      return scoreB - scoreA;
    });
  }

  async recordCall(id: string, latencyMs: number, revenue: number) {
    const provider = await Provider.findById(id);
    if (!provider) return;
    const totalCalls = (provider.totalCalls || 0) + 1;
    const totalRevenue = (provider.totalRevenue || 0) + revenue;
    const avgLatencyMs = Math.round(((provider.avgLatencyMs || 50) * (provider.totalCalls || 0) + latencyMs) / totalCalls);
    await Provider.findByIdAndUpdate(id, { $set: { totalCalls, totalRevenue, avgLatencyMs } });
  }
}

export const providerService = new ProviderService();
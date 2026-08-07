import { Budget } from "../models";

export class BudgetService {
  async getByUser(userId: string) {
    let budget = await Budget.findOne({ userId });
    if (!budget) {
      budget = await Budget.create({
        userId,
        perRequestMax: 5,
        perProviderDailyMax: 10,
        dailyMax: 20,
        minQualityScore: 70,
        spentToday: 0,
        spentByProvider: {},
        lastResetDate: new Date().toISOString().split("T")[0],
      });
    }

    const today = new Date().toISOString().split("T")[0];
    if (budget.lastResetDate !== today) {
      budget.spentToday = 0;
      budget.spentByProvider = new Map();
      budget.lastResetDate = today;
      await budget.save();
    }

    return budget;
  }

  async update(userId: string, data: { perRequestMax?: number; perProviderDailyMax?: number; dailyMax?: number; minQualityScore?: number; allowlist?: string[] }) {
    const budget = await Budget.findOneAndUpdate({ userId }, { $set: data }, { new: true, upsert: true, runValidators: true });
    return budget;
  }

  async recordSpend(userId: string, providerId: string, amount: number) {
    const budget = await this.getByUser(userId);

    const providerKey = providerId;
    const currentProviderSpend = budget.spentByProvider.get(providerKey) || 0;

    budget.spentToday += amount;
    budget.spentByProvider.set(providerKey, currentProviderSpend + amount);

    await budget.save();
    return budget;
  }

  async checkBudget(userId: string, providerId: string, estimatedCost: number): Promise<{ allowed: boolean; reason?: string; requiresApproval?: boolean }> {
    const budget = await this.getByUser(userId);

    if (estimatedCost > budget.perRequestMax) {
      return { allowed: false, reason: `Request cost ${estimatedCost} exceeds per-request max ${budget.perRequestMax}` };
    }

    const providerKey = providerId;
    const currentProviderSpend = budget.spentByProvider.get(providerKey) || 0;
    if (currentProviderSpend + estimatedCost > budget.perProviderDailyMax) {
      return { allowed: false, reason: `Provider daily limit would be exceeded` };
    }

    const projectedTotal = budget.spentToday + estimatedCost;
    if (projectedTotal > budget.dailyMax) {
      return { allowed: false, reason: "Daily budget exceeded" };
    }

    if (projectedTotal >= budget.dailyMax * 0.9) {
      return { allowed: true, requiresApproval: true, reason: "Approaching daily limit" };
    }

    return { allowed: true };
  }

  async resetDaily(userId: string) {
    const today = new Date().toISOString().split("T")[0];
    return Budget.findOneAndUpdate(
      { userId },
      { spentToday: 0, spentByProvider: new Map(), lastResetDate: today },
      { new: true }
    );
  }
}

export const budgetService = new BudgetService();
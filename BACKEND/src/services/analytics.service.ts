import { Analytics } from "../models";
import { Payment } from "../models/Payment";
import { Provider } from "../models/Provider";
import { User } from "../models/User";

export class AnalyticsService {
  async getToday() {
    const today = new Date().toISOString().split("T")[0];
    return Analytics.findOne({ date: today });
  }

  async computeAndSave() {
    const today = new Date().toISOString().split("T")[0];
    const startOfDay = new Date(today);
    const endOfDay = new Date(today + "T23:59:59.999Z");

    const [payments, users, providers, settledPayments] = await Promise.all([
      Payment.find({ createdAt: { $gte: startOfDay, $lte: endOfDay } }),
      User.countDocuments({ isActive: true }),
      Provider.countDocuments({ active: true }),
      Payment.find({ status: "settled", settledAt: { $gte: startOfDay, $lte: endOfDay } }),
    ]);

    const safePayments = payments || [];
    const safeSettled = settledPayments || [];

    const totalTransactions = safePayments.length;
    const totalRevenue = safeSettled.reduce((sum, p) => {
      const val = Number(p.finalAmount ?? p.amount);
      return sum + (Number.isFinite(val) ? val : 0);
    }, 0);

    const failedTransactions = safePayments.filter((p) => p.status === "failed").length;
    const blockedTransactions = safePayments.filter((p) => p.status === "refunded").length;

    const rawSuccessRate = totalTransactions > 0 ? ((totalTransactions - failedTransactions) / totalTransactions) * 100 : 0;
    const successRate = Number.isFinite(rawSuccessRate) ? Math.max(0, Math.min(100, rawSuccessRate)) : 0;

    const totalLatency = safeSettled.reduce((sum, p) => sum + (Number(p.latencyMs) || 0), 0);
    const avgLatency = safeSettled.length > 0 ? totalLatency / safeSettled.length : 0;
    const safeAvgLatency = Number.isFinite(avgLatency) ? avgLatency : 0;

    const revenueByProvider = new Map<string, number>();
    for (const p of safeSettled) {
      if (!p.providerId) continue;
      const val = Number(p.finalAmount ?? p.amount) || 0;
      const current = revenueByProvider.get(p.providerId) || 0;
      revenueByProvider.set(p.providerId, current + val);
    }

    const topProvidersData = Array.from(revenueByProvider.entries())
      .sort(([, a], [, b]) => b - a)
      .slice(0, 5);

    const allProviderIds = Array.from(
      new Set([
        ...topProvidersData.map(([id]) => id),
        ...payments.map((p) => p.providerId).filter(Boolean),
      ])
    );

    const providerDocs = await Provider.find({ _id: { $in: allProviderIds } });
    const providerMap = new Map(providerDocs.map((p) => [p._id.toString(), p]));

    const topProviders = topProvidersData.map(([providerId, revenue]) => {
      const provider = providerMap.get(providerId);
      const calls = settledPayments.filter((p) => p.providerId === providerId).length;
      return {
        providerId,
        name: provider?.name || "Unknown",
        revenue,
        calls,
      };
    });

    const transactionsByCategory = new Map<string, number>();
    for (const p of payments) {
      if (!p.providerId) continue;
      const provider = providerMap.get(p.providerId);
      if (provider) {
        const cat = provider.category;
        transactionsByCategory.set(cat, (transactionsByCategory.get(cat) || 0) + 1);
      }
    }

    return Analytics.findOneAndUpdate(
      { date: today },
      {
        date: today,
        totalTransactions,
        totalRevenue,
        totalUsers: users,
        totalProviders: providers,
        revenueByProvider,
        transactionsByCategory,
        avgLatencyMs: safeAvgLatency,
        successRate,
        failedTransactions,
        blockedTransactions,
        topProviders,
      },
      { upsert: true, new: true }
    );
  }

  async getRange(from: string, to: string) {
    return Analytics.find({
      date: { $gte: from, $lte: to },
    }).sort({ date: 1 });
  }
}

export const analyticsService = new AnalyticsService();
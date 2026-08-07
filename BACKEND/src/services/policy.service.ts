import { Policy } from "../models";
import { ApiError } from "../utils/ApiError";
import { generateId } from "../utils/ids";
import type { PolicyType, PolicyAction } from "../models/Policy";

interface CreatePolicyInput {
  userId: string;
  name: string;
  type: PolicyType;
  action: PolicyAction;
  value: number | string[];
  priority?: number;
  isActive?: boolean;
}

export class PolicyService {
  async getByUser(userId: string) {
    return Policy.find({ userId, isActive: true }).sort({ priority: -1 });
  }

  async create(input: CreatePolicyInput) {
    return Policy.create({
      _id: generateId("pol"),
      ...input,
      isActive: true,
      priority: input.priority || 0,
    });
  }

  async update(id: string, data: Partial<Pick<CreatePolicyInput, "action" | "value" | "priority" | "isActive">>) {
    const policy = await Policy.findByIdAndUpdate(id, { $set: data }, { new: true, runValidators: true });
    if (!policy) throw new ApiError(404, "Policy not found");
    return policy;
  }

  async remove(id: string) {
    const policy = await Policy.findByIdAndDelete(id);
    if (!policy) throw new ApiError(404, "Policy not found");
  }

  async checkPolicy(userId: string, providerId: string, estimatedCost: number, providerQuality: number) {
    const policies = await this.getByUser(userId);
    const results: { allowed: boolean; reason?: string; requiresApproval?: boolean }[] = [];

    for (const policy of policies) {
      switch (policy.type) {
        case "allowlist": {
          const list = policy.value as string[];
          if (list.length > 0 && !list.includes(providerId)) {
            results.push({ allowed: false, reason: "Provider not on allowlist" });
          }
          break;
        }
        case "quality_threshold":
          if (providerQuality < (policy.value as number)) {
            results.push({ allowed: false, reason: `Quality score ${providerQuality} below threshold ${policy.value}` });
          }
          break;
        case "per_request_cap":
          if (estimatedCost > (policy.value as number)) {
            results.push({ allowed: false, reason: `Cost ${estimatedCost} exceeds per-request cap ${policy.value}` });
          }
          break;
        default:
          break;
      }
    }

    const blocked = results.find((r) => !r.allowed);
    if (blocked) return blocked;

    return { allowed: true };
  }
}

export const policyService = new PolicyService();
import { DecisionReport } from "./MarketplaceAgent";

export interface AgentHistoryEntry {
  id: string;
  timestamp: string;
  prompt: string;
  category: string;
  winnerName: string;
  winnerId: string;
  winnerPrice: string;
  rationale: string;
  paymentStatus: "Ready" | "Completed" | "Failed";
  receiptId?: string;
}

const HISTORY_KEY = "agent_execution_history";

export class ExecutionService {
  public getHistory(): AgentHistoryEntry[] {
    if (typeof window === "undefined") return [];
    try {
      const stored = localStorage.getItem(HISTORY_KEY);
      return stored ? JSON.parse(stored) : this.getDefaultHistory();
    } catch {
      return this.getDefaultHistory();
    }
  }

  public saveExecution(report: DecisionReport, receiptId?: string): AgentHistoryEntry {
    const history = this.getHistory();

    const entry: AgentHistoryEntry = {
      id: `exec_${Date.now()}`,
      timestamp: new Date().toISOString(),
      prompt: report.prompt,
      category: report.intent.category,
      winnerName: report.winner ? report.winner.name : "None",
      winnerId: report.winner ? report.winner.id : "",
      winnerPrice: report.winner ? report.winner.price : "$0.00",
      rationale: report.rationale,
      paymentStatus: receiptId ? "Completed" : "Ready",
      receiptId,
    };

    const updated = [entry, ...history].slice(0, 10);
    if (typeof window !== "undefined") {
      try {
        localStorage.setItem(HISTORY_KEY, JSON.stringify(updated));
      } catch (err) {
        console.warn("[ExecutionService] Failed to save history:", err);
      }
    }
    return entry;
  }

  private getDefaultHistory(): AgentHistoryEntry[] {
    return [
      {
        id: "exec_demo_101",
        timestamp: new Date(Date.now() - 3600000).toISOString(),
        prompt: "Extract invoice details from PDF scan",
        category: "OCR",
        winnerName: "GPT-4 Vision Pro",
        winnerId: "p-vision-inspector",
        winnerPrice: "$0.0042",
        rationale: "Selected 'GPT-4 Vision Pro' for highest OCR precision (98%) and low latency.",
        paymentStatus: "Completed",
        receiptId: "rcpt_9823a",
      },
      {
        id: "exec_demo_102",
        timestamp: new Date(Date.now() - 86400000).toISOString(),
        prompt: "Translate PDF technical whitepaper into Hindi",
        category: "Translation",
        winnerName: "Claude Inference Ultra",
        winnerId: "p-claude-3-sonnet",
        winnerPrice: "$0.0055",
        rationale: "Selected 'Claude Inference Ultra' matching technical translation policy limits.",
        paymentStatus: "Completed",
        receiptId: "rcpt_7712b",
      },
    ];
  }
}

export const executionService = new ExecutionService();

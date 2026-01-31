import type { Trade } from "@/shared/types/trade";

export interface DashboardStats {
  totalTrades: number;
  closedTrades: number;
  openTrades: number;
  totalPnl: number;
  winRate: number;
  avgPnlPercent: number;
}

export function calcStats(trades: Trade[]): DashboardStats {
  const closedList = trades.filter((t) => t.status === "closed");
  const openTrades = trades.length - closedList.length;

  const totalPnl = closedList.reduce((sum, t) => sum + (t.pnl ?? 0), 0);

  let winRate = 0;
  let avgPnlPercent = 0;

  if (closedList.length > 0) {
    const wins = closedList.filter((t) => t.pnl !== undefined && t.pnl > 0);
    winRate = (wins.length / closedList.length) * 100;

    const totalPnlPercent = closedList.reduce(
      (sum, t) => sum + (t.pnlPercent ?? 0),
      0,
    );
    avgPnlPercent = totalPnlPercent / closedList.length;
  }

  return {
    totalTrades: trades.length,
    closedTrades: closedList.length,
    openTrades,
    totalPnl,
    winRate,
    avgPnlPercent,
  };
}

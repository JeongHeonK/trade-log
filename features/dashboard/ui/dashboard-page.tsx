"use client";

import { calcStats } from "@/features/dashboard/lib/calc-stats";
import { StatCard } from "@/features/dashboard/ui/stat-card";
import { useTrades } from "@/hooks/use-trades";
import { formatCurrency, formatPercent } from "@/shared/lib/format";
import { cn } from "@/shared/lib/utils";

export function DashboardPage() {
  const trades = useTrades();

  if (trades === undefined) {
    return (
      <div className="flex min-h-[50dvh] items-center justify-center">
        <p className="text-muted-foreground text-sm">Loading...</p>
      </div>
    );
  }

  if (trades.length === 0) {
    return (
      <div className="flex min-h-[50dvh] flex-col items-center justify-center gap-2">
        <p className="text-muted-foreground text-lg font-medium">
          No trades yet
        </p>
        <p className="text-muted-foreground text-sm">
          Start by adding your first trade.
        </p>
      </div>
    );
  }

  const stats = calcStats(trades);

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold tracking-tight">Dashboard</h1>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <StatCard label="Total Trades" value={stats.totalTrades} />
        <StatCard label="Open Positions" value={stats.openTrades} />
        <StatCard
          label="Total P&L"
          value={formatCurrency(stats.totalPnl)}
          className={cn(
            stats.totalPnl > 0 && "[&_p:first-of-type]:text-green-600",
            stats.totalPnl < 0 && "[&_p:first-of-type]:text-red-600",
          )}
          description={`${stats.closedTrades} closed trades`}
        />
        <StatCard
          label="Win Rate"
          value={`${stats.winRate.toFixed(1)}%`}
          description={
            stats.closedTrades > 0
              ? `${Math.round((stats.winRate / 100) * stats.closedTrades)} wins / ${stats.closedTrades} closed`
              : "No closed trades"
          }
        />
        <StatCard
          label="Avg Return"
          value={formatPercent(stats.avgPnlPercent)}
          className={cn(
            stats.avgPnlPercent > 0 && "[&_p:first-of-type]:text-green-600",
            stats.avgPnlPercent < 0 && "[&_p:first-of-type]:text-red-600",
          )}
        />
      </div>
    </div>
  );
}

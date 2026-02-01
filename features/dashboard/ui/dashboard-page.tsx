"use client";

import { calcStats } from "@/features/dashboard/lib/calc-stats";
import { StatCard } from "@/features/dashboard/ui/stat-card";
import { useTrades } from "@/features/trades/hooks/use-trades";
import { formatCurrency, formatPercent } from "@/shared/lib/format";
import { cn } from "@/shared/lib/utils";

export function DashboardPage() {
  const trades = useTrades();

  if (trades === undefined) {
    return (
      <div className="flex min-h-[50dvh] items-center justify-center">
        <p className="text-muted-foreground text-sm">불러오는 중...</p>
      </div>
    );
  }

  if (trades.length === 0) {
    return (
      <div className="flex min-h-[50dvh] flex-col items-center justify-center gap-2">
        <p className="text-muted-foreground text-lg font-medium">
          아직 등록된 매매가 없습니다
        </p>
        <p className="text-muted-foreground text-sm">첫 매매를 등록해보세요.</p>
      </div>
    );
  }

  const stats = calcStats(trades);

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold tracking-tight">대시보드</h1>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <StatCard label="전체 매매" value={stats.totalTrades} />
        <StatCard label="보유 중" value={stats.openTrades} />
        <StatCard
          label="총 손익"
          value={formatCurrency(stats.totalPnl)}
          className={cn(
            stats.totalPnl > 0 && "[&_p:first-of-type]:text-green-600",
            stats.totalPnl < 0 && "[&_p:first-of-type]:text-red-600",
          )}
          description={`${stats.closedTrades}건 청산`}
        />
        <StatCard
          label="승률"
          value={`${stats.winRate.toFixed(1)}%`}
          description={
            stats.closedTrades > 0
              ? `${Math.round((stats.winRate / 100) * stats.closedTrades)}승 / ${stats.closedTrades}건 청산`
              : "청산된 매매 없음"
          }
        />
        <StatCard
          label="평균 수익률"
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

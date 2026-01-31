"use client";

import Link from "next/link";
import { cn } from "@/shared/lib/utils";
import type { Trade } from "@/shared/types/trade";
import { Badge } from "@/shared/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/ui/card";

interface TradeCardProps {
  trade: Trade;
}

function formatDate(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleDateString("ko-KR", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });
}

function formatNumber(value: number): string {
  return value.toLocaleString("ko-KR", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  });
}

function formatPercent(value: number): string {
  const sign = value > 0 ? "+" : "";
  return `${sign}${value.toFixed(2)}%`;
}

function formatPnl(value: number): string {
  const sign = value > 0 ? "+" : "";
  return `${sign}${formatNumber(value)}`;
}

function PnlDisplay({
  pnl,
  pnlPercent,
}: {
  pnl?: number;
  pnlPercent?: number;
}) {
  if (pnl === undefined) {
    return <span className="text-muted-foreground text-sm">--</span>;
  }

  const color =
    pnl > 0
      ? "text-emerald-600 dark:text-emerald-400"
      : pnl < 0
        ? "text-red-600 dark:text-red-400"
        : "text-muted-foreground";

  return (
    <span className={cn("text-sm font-semibold", color)}>
      {formatPnl(pnl)}
      {pnlPercent !== undefined && (
        <span className="ml-1 text-xs font-normal">
          ({formatPercent(pnlPercent)})
        </span>
      )}
    </span>
  );
}

export function TradeCard({ trade }: TradeCardProps) {
  return (
    <Link
      href={`/trades/${trade.id}`}
      className={cn(
        "block rounded-xl transition-colors",
        "hover:bg-accent/50 focus-visible:ring-2",
        "focus-visible:ring-ring focus-visible:outline-none",
      )}
    >
      <Card size="sm" className="pointer-events-none">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <CardTitle className="text-base font-bold">
                {trade.ticker}
              </CardTitle>
              <Badge
                variant={trade.direction === "long" ? "default" : "destructive"}
              >
                {trade.direction === "long" ? "Long" : "Short"}
              </Badge>
              <Badge
                variant={trade.status === "open" ? "secondary" : "outline"}
                className={
                  trade.status === "open"
                    ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400"
                    : ""
                }
              >
                {trade.status === "open" ? "Open" : "Closed"}
              </Badge>
            </div>
            <span className="text-xs text-muted-foreground">
              {formatDate(trade.entryDate)}
            </span>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm">
            <div className="flex items-center gap-1">
              <span className="text-muted-foreground">진입</span>
              <span className="font-medium">
                {formatNumber(trade.entryPrice)}
              </span>
            </div>
            {trade.exitPrice !== undefined && (
              <div className="flex items-center gap-1">
                <span className="text-muted-foreground">청산</span>
                <span className="font-medium">
                  {formatNumber(trade.exitPrice)}
                </span>
              </div>
            )}
            <div className="flex items-center gap-1">
              <span className="text-muted-foreground">수량</span>
              <span className="font-medium">
                {formatNumber(trade.quantity)}
              </span>
            </div>
            <div className="flex items-center gap-1">
              <span className="text-muted-foreground">손익</span>
              <PnlDisplay pnl={trade.pnl} pnlPercent={trade.pnlPercent} />
            </div>
          </div>
          {trade.tags.length > 0 && (
            <div className="mt-2 flex flex-wrap gap-1">
              {trade.tags.map((tag) => (
                <Badge key={tag} variant="secondary" className="text-xs">
                  {tag}
                </Badge>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </Link>
  );
}

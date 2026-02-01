"use client";

import { Add01Icon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import Link from "next/link";
import { useMemo, useState } from "react";
import { useTrades } from "@/features/trades/hooks/use-trades";
import { TradeCard } from "@/features/trades/ui/trade-card";
import { TradesFilterBar } from "@/features/trades/ui/trades-filter-bar";
import type { TradeFilters } from "@/shared/types/trade-filters";
import { Button } from "@/shared/ui/button";

function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center gap-3 py-16 text-center">
      <p className="text-muted-foreground text-sm">등록된 매매가 없습니다.</p>
      <Button render={<Link href="/trades/new" />}>
        <HugeiconsIcon
          icon={Add01Icon}
          size={16}
          strokeWidth={2}
          data-icon="inline-start"
          aria-hidden
        />
        첫 매매 등록하기
      </Button>
    </div>
  );
}

function LoadingState() {
  return (
    <div className="flex items-center justify-center py-16">
      <p className="text-muted-foreground text-sm">불러오는 중...</p>
    </div>
  );
}

export function TradesListPage() {
  const [filters, setFilters] = useState<TradeFilters>({});
  const trades = useTrades(filters);

  const sortedTrades = useMemo(() => {
    if (!trades) return undefined;
    return [...trades].sort(
      (a, b) =>
        new Date(b.entryDate).getTime() - new Date(a.entryDate).getTime(),
    );
  }, [trades]);

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold tracking-tight">매매 목록</h1>
        <Button render={<Link href="/trades/new" />}>
          <HugeiconsIcon
            icon={Add01Icon}
            size={16}
            strokeWidth={2}
            data-icon="inline-start"
            aria-hidden
          />
          새 매매 등록
        </Button>
      </div>

      <TradesFilterBar filters={filters} onFiltersChange={setFilters} />

      {sortedTrades === undefined ? (
        <LoadingState />
      ) : sortedTrades.length === 0 ? (
        <EmptyState />
      ) : (
        <div className="flex flex-col gap-3">
          {sortedTrades.map((trade) => (
            <TradeCard key={trade.id} trade={trade} />
          ))}
        </div>
      )}
    </div>
  );
}

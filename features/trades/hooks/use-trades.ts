"use client";

import { useLiveQuery } from "dexie-react-hooks";
import { useMemo } from "react";
import { getTradesByFilter } from "@/features/trades/api/trade-repository";
import { db } from "@/shared/infrastructure/db/schema";
import type { Trade } from "@/shared/types/trade";
import type { TradeFilters } from "@/shared/types/trade-filters";

export function useTrades(filters?: TradeFilters): Trade[] | undefined {
  // Serialize filters so useLiveQuery re-runs only when
  // the actual filter values change, not the object reference.
  const filterKey = JSON.stringify(filters ?? {});
  const stableFilters = useMemo<TradeFilters>(
    () => JSON.parse(filterKey) as TradeFilters,
    [filterKey],
  );

  return useLiveQuery(() => {
    if (Object.keys(stableFilters).length > 0) {
      return getTradesByFilter(stableFilters);
    }
    return db.trades.toArray();
  }, [stableFilters]);
}

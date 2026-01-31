"use client";

import { useLiveQuery } from "dexie-react-hooks";
import { getTradesByFilter } from "@/features/trades/api/trade-repository";
import { db } from "@/shared/infrastructure/db/schema";
import type { Trade } from "@/shared/types/trade";
import type { TradeFilters } from "@/shared/types/trade-filters";

export function useTrades(filters?: TradeFilters): Trade[] | undefined {
  return useLiveQuery(() => {
    if (filters && Object.keys(filters).length > 0) {
      return getTradesByFilter(filters);
    }
    return db.trades.toArray();
  }, [filters]);
}

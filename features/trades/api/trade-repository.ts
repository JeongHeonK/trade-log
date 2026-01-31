import { db } from "@/shared/infrastructure/db/schema";
import type { Trade } from "@/shared/types/trade";
import type { TradeFilters } from "@/shared/types/trade-filters";

export async function getTradesByFilter(
  filters: TradeFilters,
): Promise<Trade[]> {
  let collection = db.trades.toCollection();

  if (filters.ticker) {
    collection = db.trades.where("ticker").equals(filters.ticker);
  }

  if (filters.direction) {
    collection = filters.ticker
      ? collection.and((t) => t.direction === filters.direction)
      : db.trades.where("direction").equals(filters.direction);
  }

  if (filters.status) {
    const hasIndexFilter = filters.ticker || filters.direction;
    collection = hasIndexFilter
      ? collection.and((t) => t.status === filters.status)
      : db.trades.where("status").equals(filters.status);
  }

  let results = await collection.toArray();

  if (filters.startDate) {
    const start = filters.startDate;
    results = results.filter((t) => t.entryDate >= start);
  }

  if (filters.endDate) {
    const end = filters.endDate;
    results = results.filter((t) => t.entryDate <= end);
  }

  if (filters.tags && filters.tags.length > 0) {
    const filterTags = filters.tags;
    results = results.filter((t) =>
      filterTags.every((tag) => t.tags.includes(tag)),
    );
  }

  return results;
}

export async function getTradeById(id: string): Promise<Trade | undefined> {
  return db.trades.get(id);
}

export async function getRecentTrades(limit: number): Promise<Trade[]> {
  return db.trades.orderBy("entryDate").reverse().limit(limit).toArray();
}

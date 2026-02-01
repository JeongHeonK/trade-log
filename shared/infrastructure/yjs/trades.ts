import type * as Y from "yjs";
import type { Trade } from "@/shared/types/trade";
import { getYDoc } from "./doc";

function getTradesMap(): Y.Map<Trade> {
  const doc = getYDoc();
  return doc.getMap<Trade>("trades");
}

export function addTrade(trade: Trade): void {
  try {
    const trades = getTradesMap();
    const doc = getYDoc();
    doc.transact(() => {
      trades.set(trade.id, trade);
    });
  } catch (err) {
    console.error("[trade-log] addTrade failed:", err);
    throw err;
  }
}

export function updateTrade(
  id: string,
  partial: Partial<Omit<Trade, "id">>,
): void {
  try {
    const trades = getTradesMap();
    if (!trades.has(id)) return;
    const doc = getYDoc();
    doc.transact(() => {
      const latest = trades.get(id);
      if (!latest) return;
      trades.set(id, {
        ...latest,
        ...partial,
        updatedAt: new Date().toISOString(),
      });
    });
  } catch (err) {
    console.error(`[trade-log] updateTrade failed (id=${id}):`, err);
    throw err;
  }
}

export function deleteTrade(id: string): void {
  try {
    const trades = getTradesMap();
    const doc = getYDoc();
    doc.transact(() => {
      trades.delete(id);
    });
  } catch (err) {
    console.error(`[trade-log] deleteTrade failed (id=${id}):`, err);
    throw err;
  }
}

export function getTrade(id: string): Trade | undefined {
  const trades = getTradesMap();
  return trades.get(id);
}

export function getAllTrades(): Trade[] {
  const trades = getTradesMap();
  return Array.from(trades.values());
}

export function observeTrades(callback: (trades: Trade[]) => void): () => void {
  const trades = getTradesMap();
  const handler = () => {
    callback(Array.from(trades.values()));
  };
  trades.observe(handler);
  return () => trades.unobserve(handler);
}

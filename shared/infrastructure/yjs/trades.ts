import type * as Y from "yjs";
import type { Trade } from "@/shared/types/trade";
import { getYDoc } from "./doc";

function getTradesMap(): Y.Map<Trade> {
  const doc = getYDoc();
  return doc.getMap<Trade>("trades");
}

export function addTrade(trade: Trade): void {
  const trades = getTradesMap();
  const doc = getYDoc();
  doc.transact(() => {
    trades.set(trade.id, trade);
  });
}

export function updateTrade(
  id: string,
  partial: Partial<Omit<Trade, "id">>,
): void {
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
}

export function deleteTrade(id: string): void {
  const trades = getTradesMap();
  const doc = getYDoc();
  doc.transact(() => {
    trades.delete(id);
  });
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

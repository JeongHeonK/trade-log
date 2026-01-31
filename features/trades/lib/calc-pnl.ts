import type { TradeDirection } from "@/shared/types/trade";

export function calcPnl(
  entryPrice: number,
  exitPrice: number,
  quantity: number,
  direction: TradeDirection,
): number {
  if (direction === "long") {
    return (exitPrice - entryPrice) * quantity;
  }
  return (entryPrice - exitPrice) * quantity;
}

export function calcPnlPercent(
  entryPrice: number,
  exitPrice: number,
  direction: TradeDirection,
): number {
  if (entryPrice === 0) {
    return 0;
  }
  if (direction === "long") {
    return ((exitPrice - entryPrice) / entryPrice) * 100;
  }
  return ((entryPrice - exitPrice) / entryPrice) * 100;
}

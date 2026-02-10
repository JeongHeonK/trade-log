export type TradeDirection = "long" | "short";
export type TradeStatus = "open" | "closed";

const TRADE_STATUSES: readonly TradeStatus[] = ["open", "closed"];
const TRADE_DIRECTIONS: readonly TradeDirection[] = ["long", "short"];

export function isTradeStatus(v: string): v is TradeStatus {
  return (TRADE_STATUSES as readonly string[]).includes(v);
}

export function isTradeDirection(v: string): v is TradeDirection {
  return (TRADE_DIRECTIONS as readonly string[]).includes(v);
}

export interface Trade {
  id: string;
  ticker: string;
  direction: TradeDirection;
  status: TradeStatus;
  entryPrice: number;
  exitPrice?: number;
  quantity: number;
  entryDate: string; // ISO 8601
  exitDate?: string;
  pnl?: number;
  pnlPercent?: number;
  tags: string[];
  reasoning: string;
  reflection?: string;
  createdAt: string;
  updatedAt: string;
}

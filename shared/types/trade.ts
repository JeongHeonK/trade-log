export type TradeDirection = "long" | "short";
export type TradeStatus = "open" | "closed";

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

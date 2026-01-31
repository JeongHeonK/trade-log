import type { TradeDirection, TradeStatus } from "./trade";

export interface TradeFilters {
  ticker?: string;
  direction?: TradeDirection;
  status?: TradeStatus;
  startDate?: string; // ISO 8601
  endDate?: string; // ISO 8601
  tags?: string[];
}

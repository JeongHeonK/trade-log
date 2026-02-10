"use client";

import { isTradeDirection, isTradeStatus } from "@/shared/types/trade";
import type { TradeFilters } from "@/shared/types/trade-filters";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/ui/select";

interface TradesFilterBarProps {
  filters: TradeFilters;
  onFiltersChange: (filters: TradeFilters) => void;
}

export function TradesFilterBar({
  filters,
  onFiltersChange,
}: TradesFilterBarProps) {
  const handleStatusChange = (value: string | null) => {
    onFiltersChange({
      ...filters,
      status:
        !value || value === "all"
          ? undefined
          : isTradeStatus(value)
            ? value
            : undefined,
    });
  };

  const handleDirectionChange = (value: string | null) => {
    onFiltersChange({
      ...filters,
      direction:
        !value || value === "all"
          ? undefined
          : isTradeDirection(value)
            ? value
            : undefined,
    });
  };

  return (
    <div className="flex flex-wrap items-center gap-3">
      <div className="flex items-center gap-2">
        <span className="text-sm text-muted-foreground">상태</span>
        <Select
          value={filters.status ?? "all"}
          onValueChange={handleStatusChange}
        >
          <SelectTrigger size="sm" aria-label="상태 필터">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">전체</SelectItem>
            <SelectItem value="open">Open</SelectItem>
            <SelectItem value="closed">Closed</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div className="flex items-center gap-2">
        <span className="text-sm text-muted-foreground">방향</span>
        <Select
          value={filters.direction ?? "all"}
          onValueChange={handleDirectionChange}
        >
          <SelectTrigger size="sm" aria-label="방향 필터">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">전체</SelectItem>
            <SelectItem value="long">Long</SelectItem>
            <SelectItem value="short">Short</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}

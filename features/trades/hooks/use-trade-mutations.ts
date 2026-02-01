"use client";

import { useCallback } from "react";
import {
  addTrade as yjsAddTrade,
  deleteTrade as yjsDeleteTrade,
  updateTrade as yjsUpdateTrade,
} from "@/shared/infrastructure/yjs/trades";
import type { Trade } from "@/shared/types/trade";

type NewTrade = Omit<Trade, "id" | "createdAt" | "updatedAt">;

export function useAddTrade(): (input: NewTrade) => void {
  return useCallback((input: NewTrade) => {
    const now = new Date().toISOString();
    const trade: Trade = {
      ...input,
      id: crypto.randomUUID(),
      createdAt: now,
      updatedAt: now,
    };
    yjsAddTrade(trade);
  }, []);
}

export function useUpdateTrade(): (
  id: string,
  partial: Partial<Omit<Trade, "id">>,
) => void {
  return useCallback((id: string, partial: Partial<Omit<Trade, "id">>) => {
    yjsUpdateTrade(id, partial);
  }, []);
}

export function useDeleteTrade(): (id: string) => void {
  return useCallback((id: string) => {
    yjsDeleteTrade(id);
  }, []);
}

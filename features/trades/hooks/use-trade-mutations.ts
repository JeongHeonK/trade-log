"use client";

import { useCallback } from "react";
import {
  addTrade as yjsAddTrade,
  deleteTrade as yjsDeleteTrade,
  updateTrade as yjsUpdateTrade,
} from "@/shared/infrastructure/yjs/trades";
import type { Trade } from "@/shared/types/trade";

type NewTrade = Omit<Trade, "id" | "createdAt" | "updatedAt">;

interface MutationResult {
  success: boolean;
  error?: string;
}

export function useAddTrade(): (input: NewTrade) => MutationResult {
  return useCallback((input: NewTrade): MutationResult => {
    try {
      const now = new Date().toISOString();
      const trade: Trade = {
        ...input,
        id: crypto.randomUUID(),
        createdAt: now,
        updatedAt: now,
      };
      yjsAddTrade(trade);
      return { success: true };
    } catch (e) {
      return {
        success: false,
        error: e instanceof Error ? e.message : "알 수 없는 오류",
      };
    }
  }, []);
}

export function useUpdateTrade(): (
  id: string,
  partial: Partial<Omit<Trade, "id">>,
) => MutationResult {
  return useCallback(
    (id: string, partial: Partial<Omit<Trade, "id">>): MutationResult => {
      try {
        yjsUpdateTrade(id, partial);
        return { success: true };
      } catch (e) {
        return {
          success: false,
          error: e instanceof Error ? e.message : "알 수 없는 오류",
        };
      }
    },
    [],
  );
}

export function useDeleteTrade(): (id: string) => MutationResult {
  return useCallback((id: string): MutationResult => {
    try {
      yjsDeleteTrade(id);
      return { success: true };
    } catch (e) {
      return {
        success: false,
        error: e instanceof Error ? e.message : "알 수 없는 오류",
      };
    }
  }, []);
}

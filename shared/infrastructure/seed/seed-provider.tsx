"use client";

import { type ReactNode, useEffect } from "react";
import { getYDoc } from "@/shared/infrastructure/yjs/doc";
import { useYjs } from "@/shared/infrastructure/yjs/provider";
import { addTrade, getAllTrades } from "@/shared/infrastructure/yjs/trades";
import { SEED_TRADES } from "./trades-seed";

const SEED_KEY = "trade-log:seeded";

export function SeedProvider({ children }: { children: ReactNode }) {
  const { synced } = useYjs();

  useEffect(() => {
    if (!synced) return;
    if (localStorage.getItem(SEED_KEY)) return;

    const existing = getAllTrades();
    if (existing.length > 0) {
      localStorage.setItem(SEED_KEY, "1");
      return;
    }

    localStorage.setItem(SEED_KEY, "1");
    const doc = getYDoc();
    doc.transact(() => {
      for (const trade of SEED_TRADES) {
        addTrade(trade);
      }
    });
  }, [synced]);

  return <>{children}</>;
}

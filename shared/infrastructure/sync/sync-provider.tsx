"use client";

import {
  createContext,
  type ReactNode,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { useYjs } from "@/shared/infrastructure/yjs/provider";
import { startTradesSync } from "./trades-sync";

type SyncStatus = "syncing" | "synced" | "error";

interface SyncContextValue {
  syncStatus: SyncStatus;
}

const SyncContext = createContext<SyncContextValue | null>(null);

export function SyncProvider({ children }: { children: ReactNode }) {
  const { synced: yjsSynced } = useYjs();
  const [syncStatus, setSyncStatus] = useState<SyncStatus>("syncing");

  const handleStatus = useCallback((status: SyncStatus) => {
    setSyncStatus(status);
  }, []);

  useEffect(() => {
    if (!yjsSynced) return;

    const cleanup = startTradesSync(handleStatus);
    return cleanup;
  }, [yjsSynced, handleStatus]);

  const value = useMemo<SyncContextValue>(() => ({ syncStatus }), [syncStatus]);

  return <SyncContext.Provider value={value}>{children}</SyncContext.Provider>;
}

export function useSyncStatus(): SyncStatus {
  const ctx = useContext(SyncContext);
  if (!ctx) {
    throw new Error("useSyncStatus must be used within SyncProvider");
  }
  return ctx.syncStatus;
}

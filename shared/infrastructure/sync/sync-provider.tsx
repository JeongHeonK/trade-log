"use client";

import {
  createContext,
  type ReactNode,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";
import { startTradesSync } from "./trades-sync";

type SyncStatus = "syncing" | "synced" | "error";

interface SyncContextValue {
  syncStatus: SyncStatus;
}

const SyncContext = createContext<SyncContextValue | null>(null);

export function SyncProvider({ children }: { children: ReactNode }) {
  const [syncStatus, setSyncStatus] = useState<SyncStatus>("syncing");

  const handleStatus = useCallback((status: SyncStatus) => {
    setSyncStatus(status);
  }, []);

  useEffect(() => {
    const cleanup = startTradesSync(handleStatus);
    return cleanup;
  }, [handleStatus]);

  return (
    <SyncContext.Provider value={{ syncStatus }}>
      {children}
    </SyncContext.Provider>
  );
}

export function useSyncStatus(): SyncStatus {
  const ctx = useContext(SyncContext);
  if (!ctx) {
    throw new Error("useSyncStatus must be used within SyncProvider");
  }
  return ctx.syncStatus;
}

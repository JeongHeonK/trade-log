"use client";

import type { ReactNode } from "react";
import { SyncProvider } from "@/shared/infrastructure/sync/sync-provider";
import { YjsProvider } from "@/shared/infrastructure/yjs/provider";

export function ClientProviders({ children }: { children: ReactNode }) {
  return (
    <YjsProvider>
      <SyncProvider>{children}</SyncProvider>
    </YjsProvider>
  );
}

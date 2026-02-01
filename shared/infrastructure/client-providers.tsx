"use client";

import type { ReactNode } from "react";
import { SeedProvider } from "@/shared/infrastructure/seed/seed-provider";
import { SyncProvider } from "@/shared/infrastructure/sync/sync-provider";
import { YjsProvider } from "@/shared/infrastructure/yjs/provider";

export function ClientProviders({ children }: { children: ReactNode }) {
  return (
    <YjsProvider>
      <SeedProvider>
        <SyncProvider>{children}</SyncProvider>
      </SeedProvider>
    </YjsProvider>
  );
}

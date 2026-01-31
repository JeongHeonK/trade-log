"use client";

import dynamic from "next/dynamic";
import type { ReactNode } from "react";

const ClientProviders = dynamic(
  () =>
    import("@/shared/infrastructure/client-providers").then(
      (m) => m.ClientProviders,
    ),
  { ssr: false },
);

export function Providers({ children }: { children: ReactNode }) {
  return <ClientProviders>{children}</ClientProviders>;
}

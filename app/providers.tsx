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

const UpdatePrompt = dynamic(
  () => import("@/features/pwa/ui/update-prompt").then((m) => m.UpdatePrompt),
  { ssr: false },
);

const InstallPrompt = dynamic(
  () => import("@/features/pwa/ui/install-prompt").then((m) => m.InstallPrompt),
  { ssr: false },
);

export function Providers({ children }: { children: ReactNode }) {
  return (
    <ClientProviders>
      {children}
      <UpdatePrompt />
      <InstallPrompt />
    </ClientProviders>
  );
}

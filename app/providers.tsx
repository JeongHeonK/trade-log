"use client";

import dynamic from "next/dynamic";
import type { ReactNode } from "react";

const YjsProvider = dynamic(
  () =>
    import("@/shared/infrastructure/yjs/provider").then((m) => m.YjsProvider),
  { ssr: false },
);

export function Providers({ children }: { children: ReactNode }) {
  return <YjsProvider>{children}</YjsProvider>;
}

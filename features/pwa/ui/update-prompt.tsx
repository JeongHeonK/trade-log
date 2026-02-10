"use client";

import { useEffect } from "react";
import { toast } from "sonner";
import { useSWLifecycle } from "@/shared/infrastructure/pwa/sw-lifecycle";

export function UpdatePrompt() {
  const { hasUpdate, applyUpdate } = useSWLifecycle();

  useEffect(() => {
    if (!hasUpdate) return;
    toast.info("새 버전이 있습니다", {
      description: "업데이트를 적용하려면 클릭하세요.",
      duration: Number.POSITIVE_INFINITY,
      action: {
        label: "업데이트",
        onClick: applyUpdate,
      },
      cancel: {
        label: "나중에",
        onClick: () => {},
      },
    });
  }, [hasUpdate, applyUpdate]);

  return null;
}

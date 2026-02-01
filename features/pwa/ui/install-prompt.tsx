"use client";

import { useEffect, useRef } from "react";
import { toast } from "sonner";
import { useSWLifecycle } from "@/shared/infrastructure/pwa/sw-lifecycle";

export function InstallPrompt() {
  const { isInstallable, promptInstall } = useSWLifecycle();
  const prompted = useRef(false);

  useEffect(() => {
    if (!isInstallable || prompted.current) return;
    prompted.current = true;
    toast("앱으로 설치할 수 있습니다", {
      description: "홈 화면에 추가하여 더 빠르게 사용하세요.",
      duration: 15_000,
      action: {
        label: "설치",
        onClick: () => {
          promptInstall();
        },
      },
    });
  }, [isInstallable, promptInstall]);

  return null;
}

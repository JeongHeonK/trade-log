"use client";

import { useEffect, useState } from "react";
import type { Workbox } from "workbox-window";

interface SWLifecycle {
  hasUpdate: boolean;
  isInstallable: boolean;
  applyUpdate: () => void;
  promptInstall: () => Promise<void>;
}

export function useSWLifecycle(): SWLifecycle {
  const [wb, setWb] = useState<Workbox | null>(null);
  const [hasUpdate, setHasUpdate] = useState(false);
  const [installEvent, setInstallEvent] = useState<
    WindowEventMap["beforeinstallprompt"] | null
  >(null);

  useEffect(() => {
    if (typeof window === "undefined" || !("serviceWorker" in navigator)) {
      return;
    }

    const handleInstallPrompt = (e: Event) => {
      e.preventDefault();
      setInstallEvent(e as WindowEventMap["beforeinstallprompt"]);
    };
    window.addEventListener("beforeinstallprompt", handleInstallPrompt);

    let workbox: Workbox | null = null;

    import("workbox-window").then(({ Workbox }) => {
      workbox = new Workbox("/sw.js");

      workbox.addEventListener("waiting", () => {
        setHasUpdate(true);
      });

      workbox.register();
      setWb(workbox);
    });

    return () => {
      window.removeEventListener("beforeinstallprompt", handleInstallPrompt);
    };
  }, []);

  const applyUpdate = () => {
    if (!wb) return;
    wb.messageSkipWaiting();
    window.location.reload();
  };

  const promptInstall = async () => {
    if (!installEvent) return;
    await installEvent.prompt();
    setInstallEvent(null);
  };

  return {
    hasUpdate,
    isInstallable: installEvent !== null,
    applyUpdate,
    promptInstall,
  };
}

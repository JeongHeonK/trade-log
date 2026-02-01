"use client";

import {
  createContext,
  type ReactNode,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import type { Workbox } from "workbox-window";

interface SWLifecycle {
  hasUpdate: boolean;
  isInstallable: boolean;
  applyUpdate: () => void;
  promptInstall: () => Promise<void>;
}

const SWContext = createContext<SWLifecycle>({
  hasUpdate: false,
  isInstallable: false,
  applyUpdate: () => {},
  promptInstall: async () => {},
});

let didInit = false;

export function SWProvider({ children }: { children: ReactNode }) {
  const [wb, setWb] = useState<Workbox | null>(null);
  const [hasUpdate, setHasUpdate] = useState(false);
  const [installEvent, setInstallEvent] = useState<
    WindowEventMap["beforeinstallprompt"] | null
  >(null);

  useEffect(() => {
    if (
      didInit ||
      typeof window === "undefined" ||
      !("serviceWorker" in navigator)
    ) {
      return;
    }
    didInit = true;

    const handleInstallPrompt = (e: Event) => {
      e.preventDefault();
      setInstallEvent(e as WindowEventMap["beforeinstallprompt"]);
    };
    window.addEventListener("beforeinstallprompt", handleInstallPrompt);

    import("workbox-window").then(({ Workbox }) => {
      const workbox = new Workbox("/sw.js");

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

  const wbRef = useRef(wb);
  wbRef.current = wb;

  const applyUpdate = useCallback(() => {
    const workbox = wbRef.current;
    if (!workbox) return;
    workbox.addEventListener("controlling", () => {
      window.location.reload();
    });
    workbox.messageSkipWaiting();
  }, []);

  const installEventRef = useRef(installEvent);
  installEventRef.current = installEvent;

  const promptInstall = useCallback(async () => {
    const event = installEventRef.current;
    if (!event) return;
    await event.prompt();
    setInstallEvent(null);
  }, []);

  const value: SWLifecycle = {
    hasUpdate,
    isInstallable: installEvent !== null,
    applyUpdate,
    promptInstall,
  };

  return <SWContext.Provider value={value}>{children}</SWContext.Provider>;
}

export function useSWLifecycle(): SWLifecycle {
  return useContext(SWContext);
}

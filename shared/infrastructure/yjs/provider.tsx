"use client";

import {
  createContext,
  type ReactNode,
  useContext,
  useEffect,
  useState,
} from "react";
import type * as Y from "yjs";
import { getYDoc, getYPersistence } from "./doc";

interface YjsContextValue {
  doc: Y.Doc;
  synced: boolean;
}

const YjsContext = createContext<YjsContextValue | null>(null);

export function YjsProvider({ children }: { children: ReactNode }) {
  const [synced, setSynced] = useState(false);
  const [doc] = useState(() => getYDoc());

  useEffect(() => {
    const persistence = getYPersistence();
    if (!persistence) return;

    if (persistence.synced) {
      setSynced(true);
      return;
    }

    const handleSynced = () => setSynced(true);
    persistence.on("synced", handleSynced);
    return () => {
      persistence.off("synced", handleSynced);
    };
  }, []);

  return (
    <YjsContext.Provider value={{ doc, synced }}>
      {children}
    </YjsContext.Provider>
  );
}

export function useYjs(): YjsContextValue {
  const ctx = useContext(YjsContext);
  if (!ctx) throw new Error("useYjs must be used within YjsProvider");
  return ctx;
}

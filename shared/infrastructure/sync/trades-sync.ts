import type { YMapEvent } from "yjs";
import { db } from "@/shared/infrastructure/db/schema";
import { getYDoc } from "@/shared/infrastructure/yjs/doc";
import type { Trade } from "@/shared/types/trade";

type SyncCallback = (status: "syncing" | "synced" | "error") => void;

function getTradesMap() {
  const doc = getYDoc();
  return doc.getMap<Trade>("trades");
}

async function bulkSyncToDb(trades: Trade[]): Promise<void> {
  await db.transaction("rw", db.trades, async () => {
    await db.trades.clear();
    if (trades.length > 0) {
      await db.trades.bulkPut(trades);
    }
  });
}

async function handleYjsEvent(
  event: YMapEvent<Trade>,
  onStatus: SyncCallback,
): Promise<void> {
  onStatus("syncing");
  try {
    const toDelete: string[] = [];
    const toPut: Trade[] = [];

    for (const [key, change] of event.changes.keys) {
      if (change.action === "delete") {
        toDelete.push(key);
      } else {
        const value = getTradesMap().get(key);
        if (value) {
          toPut.push(value);
        }
      }
    }

    await db.transaction("rw", db.trades, async () => {
      if (toDelete.length > 0) {
        await db.trades.bulkDelete(toDelete);
      }
      if (toPut.length > 0) {
        await db.trades.bulkPut(toPut);
      }
    });

    onStatus("synced");
  } catch {
    onStatus("error");
  }
}

export function startTradesSync(onStatus: SyncCallback): () => void {
  const trades = getTradesMap();

  onStatus("syncing");

  const initialData = Array.from(trades.values());
  bulkSyncToDb(initialData)
    .then(() => onStatus("synced"))
    .catch(() => onStatus("error"));

  const observer = (event: YMapEvent<Trade>) => {
    handleYjsEvent(event, onStatus);
  };

  trades.observe(observer);

  return () => {
    trades.unobserve(observer);
  };
}

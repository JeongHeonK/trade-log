import type { YMapEvent } from "yjs";
import { db } from "@/shared/infrastructure/db/schema";
import { getYDoc } from "@/shared/infrastructure/yjs/doc";
import type { Trade } from "@/shared/types/trade";

type SyncCallback = (status: "syncing" | "synced" | "error") => void;

function getTradesMap() {
  const doc = getYDoc();
  return doc.getMap<Trade>("trades");
}

async function initialSyncToDb(trades: Trade[]): Promise<void> {
  await db.transaction("rw", db.trades, async () => {
    const existingIds = new Set(
      (await db.trades.toCollection().primaryKeys()) as string[],
    );
    const yjsIds = new Set(trades.map((t) => t.id));

    const toDelete = [...existingIds].filter((id) => !yjsIds.has(id));
    if (toDelete.length > 0) {
      await db.trades.bulkDelete(toDelete);
    }
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
  } catch (err) {
    console.error("[trade-log] Yjs → Dexie sync failed:", err);
    onStatus("error");
  }
}

export function startTradesSync(onStatus: SyncCallback): () => void {
  const trades = getTradesMap();
  let observer: ((event: YMapEvent<Trade>) => void) | null = null;
  let aborted = false;

  onStatus("syncing");

  const initialData = Array.from(trades.values());
  initialSyncToDb(initialData)
    .then(() => {
      if (aborted) return;
      onStatus("synced");
      observer = (event: YMapEvent<Trade>) => {
        handleYjsEvent(event, onStatus);
      };
      trades.observe(observer);
    })
    .catch((err) => {
      console.error("[trade-log] Initial sync to Dexie failed:", err);
      if (aborted) return;
      onStatus("error");
    });

  return () => {
    aborted = true;
    if (observer) {
      trades.unobserve(observer);
    }
  };
}

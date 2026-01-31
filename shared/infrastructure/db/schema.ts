import Dexie, { type EntityTable } from "dexie";
import type { Trade } from "@/shared/types/trade";

const db = new Dexie("trade-log") as Dexie & {
  trades: EntityTable<Trade, "id">;
};

db.version(1).stores({
  trades: "id, ticker, direction, status, entryDate, exitDate, *tags",
});

export { db };

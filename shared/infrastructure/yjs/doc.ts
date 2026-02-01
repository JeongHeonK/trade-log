import { IndexeddbPersistence } from "y-indexeddb";
import * as Y from "yjs";

let doc: Y.Doc | null = null;
let persistence: IndexeddbPersistence | null = null;

export function getYDoc(): Y.Doc {
  if (!doc) {
    doc = new Y.Doc();
    try {
      persistence = new IndexeddbPersistence("trade-log-yjs", doc);
    } catch (err) {
      console.warn(
        "[trade-log] IndexedDB persistence unavailable. " +
          "Running in memory-only mode.",
        err,
      );
      persistence = null;
    }
  }
  return doc;
}

export function getYPersistence(): IndexeddbPersistence | null {
  return persistence;
}

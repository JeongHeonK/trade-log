import { IndexeddbPersistence } from "y-indexeddb";
import * as Y from "yjs";

let doc: Y.Doc | null = null;
let persistence: IndexeddbPersistence | null = null;

export function getYDoc(): Y.Doc {
  if (!doc) {
    doc = new Y.Doc();
    persistence = new IndexeddbPersistence("trade-log-yjs", doc);
  }
  return doc;
}

export function getYPersistence(): IndexeddbPersistence | null {
  return persistence;
}

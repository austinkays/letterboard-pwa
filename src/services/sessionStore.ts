import type { SpellingSession } from "../models/session";

export interface SessionStore {
  save(session: SpellingSession): Promise<void>;
  list(): Promise<SpellingSession[]>;
}

const dbName = "letterboard.sessions.v1";
const storeName = "sessions";

export const sessionStore: SessionStore = {
  async save(session) {
    const db = await openDatabase();
    await runRequest(db.transaction(storeName, "readwrite").objectStore(storeName).put(session));
    db.close();
  },

  async list() {
    const db = await openDatabase();
    const sessions = await runRequest<SpellingSession[]>(db.transaction(storeName).objectStore(storeName).getAll());
    db.close();
    return sessions.sort((left, right) => right.startTime.localeCompare(left.startTime));
  },
};

function openDatabase(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(dbName, 1);

    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains(storeName)) {
        db.createObjectStore(storeName, { keyPath: "id" });
      }
    };

    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result);
  });
}

function runRequest<T>(request: IDBRequest<T>): Promise<T> {
  return new Promise((resolve, reject) => {
    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result);
  });
}

/**
 * Minimalna obsługa IndexedDB: zdjęcia z tablicy wizji i klucz szyfrowania konta.
 * Gdy IndexedDB jest niedostępne (np. w testach), dane trzymamy w pamięci.
 */
const DB_NAME = 'transerfing';
const DB_VERSION = 1;
export type StoreName = 'images' | 'keys';

const memory: Record<StoreName, Map<string, unknown>> = { images: new Map(), keys: new Map() };
let dbPromise: Promise<IDBDatabase> | null = null;

function available(): boolean {
  return typeof indexedDB !== 'undefined';
}

function open(): Promise<IDBDatabase> {
  dbPromise ??= new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);
    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains('images')) db.createObjectStore('images', { keyPath: 'id' });
      if (!db.objectStoreNames.contains('keys')) db.createObjectStore('keys');
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
  return dbPromise;
}

function run<T>(store: StoreName, mode: IDBTransactionMode, action: (s: IDBObjectStore) => IDBRequest): Promise<T> {
  return open().then(
    (db) =>
      new Promise<T>((resolve, reject) => {
        const tx = db.transaction(store, mode);
        const request = action(tx.objectStore(store));
        request.onsuccess = () => resolve(request.result as T);
        request.onerror = () => reject(request.error);
      }),
  );
}

export async function idbPut(store: StoreName, value: unknown, key?: string): Promise<void> {
  if (!available()) {
    const id = key ?? (value as { id: string }).id;
    memory[store].set(id, value);
    return;
  }
  await run(store, 'readwrite', (s) => (key === undefined ? s.put(value) : s.put(value, key)));
}

export async function idbGet<T>(store: StoreName, key: string): Promise<T | undefined> {
  if (!available()) return memory[store].get(key) as T | undefined;
  return run<T | undefined>(store, 'readonly', (s) => s.get(key));
}

export async function idbDelete(store: StoreName, key: string): Promise<void> {
  if (!available()) {
    memory[store].delete(key);
    return;
  }
  await run(store, 'readwrite', (s) => s.delete(key));
}

export async function idbGetAll<T>(store: StoreName): Promise<T[]> {
  if (!available()) return [...memory[store].values()] as T[];
  return run<T[]>(store, 'readonly', (s) => s.getAll());
}

export async function idbClear(store: StoreName): Promise<void> {
  if (!available()) {
    memory[store].clear();
    return;
  }
  await run(store, 'readwrite', (s) => s.clear());
}

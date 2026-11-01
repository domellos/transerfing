import { useCallback, useSyncExternalStore } from 'react';
import { META_KEY, PRIVATE_KEYS, SYNC_STRATEGY, normalizeMeta, trackChange, type SyncMeta } from './syncMeta';

/**
 * Współdzielony magazyn danych w localStorage (prefiks „ts:”).
 * Wszystkie dane użytkownika zostają w jego przeglądarce, chyba że sam włączy synchronizację.
 * Komponenty używające tego samego klucza odświeżają się od razu,
 * a inne karty przeglądarki dzięki zdarzeniu „storage”.
 */
export const PREFIX = 'ts:';

type Listener = () => void;
const listeners = new Map<string, Set<Listener>>();
const changeListeners = new Set<(key: string) => void>();
const cache = new Map<string, unknown>();
const MISSING = Symbol('missing');

function hasStorage(): boolean {
  try {
    return typeof localStorage !== 'undefined';
  } catch {
    return false;
  }
}

function notify(key: string) {
  listeners.get(key)?.forEach((listener) => listener());
}

function load(key: string): unknown {
  if (!hasStorage()) return MISSING;
  try {
    const raw = localStorage.getItem(PREFIX + key);
    return raw === null ? MISSING : (JSON.parse(raw) as unknown);
  } catch {
    return MISSING;
  }
}

function persist(key: string, value: unknown) {
  if (!hasStorage()) return;
  try {
    if (value === undefined) localStorage.removeItem(PREFIX + key);
    else localStorage.setItem(PREFIX + key, JSON.stringify(value));
  } catch {
    // Brak miejsca lub tryb prywatny: dane zostają tylko w pamięci tej sesji.
  }
}

export function readStore<T>(key: string, fallback: T): T {
  let value = cache.get(key);
  if (value === undefined && !cache.has(key)) {
    value = load(key);
    cache.set(key, value);
  }
  return value === MISSING || value === undefined ? fallback : (value as T);
}

export function readMeta(): SyncMeta {
  return normalizeMeta(readStore<unknown>(META_KEY, null));
}

export function writeMeta(meta: SyncMeta) {
  cache.set(META_KEY, meta);
  persist(META_KEY, meta);
}

/**
 * Zapisuje wartość. Dla kluczy objętych synchronizacją domyślnie notuje zmianę
 * w metadanych (track), żeby przy scalaniu wiadomo było, co jest nowsze.
 */
export function writeStore<T>(key: string, value: T, options: { track?: boolean } = {}) {
  const prev = readStore<unknown>(key, undefined);
  cache.set(key, value === undefined ? MISSING : value);
  persist(key, value);
  if (options.track !== false && key in SYNC_STRATEGY) {
    const meta = readMeta();
    trackChange(meta, key, prev, value);
    writeMeta(meta);
    changeListeners.forEach((listener) => listener(key));
  }
  notify(key);
}

/** Powiadamia o lokalnych zmianach danych objętych synchronizacją. */
export function onLocalChange(listener: (key: string) => void): () => void {
  changeListeners.add(listener);
  return () => {
    changeListeners.delete(listener);
  };
}

if (typeof window !== 'undefined') {
  window.addEventListener('storage', (event) => {
    if (!event.key || !event.key.startsWith(PREFIX)) return;
    const key = event.key.slice(PREFIX.length);
    cache.delete(key);
    notify(key);
  });
}

export function useStored<T>(key: string, fallback: T): [T, (next: T | ((prev: T) => T)) => void] {
  const subscribe = useCallback(
    (listener: Listener) => {
      let set = listeners.get(key);
      if (!set) {
        set = new Set();
        listeners.set(key, set);
      }
      set.add(listener);
      return () => {
        set?.delete(listener);
      };
    },
    [key],
  );

  const value = useSyncExternalStore(
    subscribe,
    () => readStore(key, fallback),
    () => fallback,
  );

  const setValue = useCallback(
    (next: T | ((prev: T) => T)) => {
      const prev = readStore(key, fallback);
      const resolved = typeof next === 'function' ? (next as (p: T) => T)(prev) : next;
      writeStore(key, resolved);
    },
    // fallback celowo pominięty: to stała wartość domyślna danego klucza
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [key],
  );

  return [value, setValue];
}

export interface ExportFile {
  app: 'transerfing-w-praktyce';
  version: 1;
  exportedAt: string;
  data: Record<string, unknown>;
  images?: unknown[];
}

function storedKeys(): string[] {
  if (!hasStorage()) return [];
  const keys: string[] = [];
  for (let i = 0; i < localStorage.length; i += 1) {
    const fullKey = localStorage.key(i);
    if (fullKey && fullKey.startsWith(PREFIX)) keys.push(fullKey.slice(PREFIX.length));
  }
  return keys;
}

/** Dane do kopii zapasowej (bez sesji konta i metadanych synchronizacji). */
export function exportAll(): ExportFile {
  const data: Record<string, unknown> = {};
  for (const key of storedKeys()) {
    if (PRIVATE_KEYS.has(key)) continue;
    const value = readStore<unknown>(key, undefined);
    if (value !== undefined) data[key] = value;
  }
  return { app: 'transerfing-w-praktyce', version: 1, exportedAt: new Date().toISOString(), data };
}

export function importAll(file: unknown): number {
  if (!file || typeof file !== 'object') throw new Error('Plik nie zawiera danych.');
  const candidate = file as Partial<ExportFile>;
  if (candidate.app !== 'transerfing-w-praktyce' || typeof candidate.data !== 'object' || candidate.data === null) {
    throw new Error('To nie jest plik kopii zapasowej tego serwisu.');
  }
  let count = 0;
  for (const [key, value] of Object.entries(candidate.data)) {
    if (!/^[a-zA-Z0-9_-]+$/.test(key) || PRIVATE_KEYS.has(key)) continue;
    writeStore(key, value);
    count += 1;
  }
  return count;
}

/** Usuwa wszystkie dane serwisu z tej przeglądarki (także sesję konta). */
export function clearAll() {
  for (const key of storedKeys()) {
    localStorage.removeItem(PREFIX + key);
    cache.delete(key);
    notify(key);
  }
}

/** Czy na tym urządzeniu są jakiekolwiek dane praktyki. */
export function hasLocalData(): boolean {
  return storedKeys().some((key) => key in SYNC_STRATEGY);
}

export function newId(): string {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID();
  }
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;
}

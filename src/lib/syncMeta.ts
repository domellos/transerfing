/**
 * Metadane synchronizacji i scalanie danych z dwóch urządzeń.
 *
 * Każdy klucz danych ma strategię scalania. Dla list z identyfikatorami i map
 * zapisujemy czas ostatniej zmiany każdego elementu oraz czas jego usunięcia
 * („nagrobek”). Przy scalaniu wygrywa najpóźniejsze zdarzenie: zapis albo usunięcie.
 * Dzięki temu wpisy dodane na telefonie i na komputerze się sumują, a usunięte nie wracają.
 */

export type Strategy = 'idArray' | 'map' | 'log' | 'value' | 'program';

export const SYNC_STRATEGY: Record<string, Strategy> = {
  journal: 'idArray',
  slides: 'idArray',
  frames: 'idArray',
  goals: 'idArray',
  customHabits: 'idArray',
  lessonsRead: 'map',
  lessonNotes: 'map',
  checkins: 'map',
  detox: 'map',
  dailyDone: 'map',
  awakenings: 'map',
  quizBest: 'map',
  challenges: 'map',
  flashcards: 'map',
  flashcardsLog: 'map',
  scenarios: 'map',
  energySessions: 'log',
  anchors: 'value',
  matrixTest: 'value',
  program: 'program',
};

export const SYNC_KEYS = Object.keys(SYNC_STRATEGY);
export const META_KEY = '_meta';

/** Klucze, które nie trafiają do kopii zapasowej ani synchronizacji. */
export const PRIVATE_KEYS = new Set([META_KEY, 'account', 'syncStatus', 'assistantChat', 'pushSettings']);

export interface SyncMeta {
  v: 1;
  upd: Record<string, number>;
  sub: Record<string, Record<string, number>>;
  del: Record<string, Record<string, number>>;
}

export interface SyncSnapshot {
  data: Record<string, unknown>;
  meta: SyncMeta;
}

const TOMBSTONE_TTL = 400 * 86_400_000;

export function emptyMeta(): SyncMeta {
  return { v: 1, upd: {}, sub: {}, del: {} };
}

export function normalizeMeta(value: unknown): SyncMeta {
  if (!value || typeof value !== 'object') return emptyMeta();
  const m = value as Partial<SyncMeta>;
  if (m.v !== 1) return emptyMeta();
  return { v: 1, upd: { ...(m.upd ?? {}) }, sub: { ...(m.sub ?? {}) }, del: { ...(m.del ?? {}) } };
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === 'object' && !Array.isArray(value);
}

interface ProgramLike {
  startedAt?: string | null;
  done?: Record<string, string>;
  notes?: Record<string, string>;
}

function toEntries(strategy: Strategy, value: unknown): Map<string, unknown> | null {
  const entries = new Map<string, unknown>();
  if (strategy === 'idArray') {
    if (Array.isArray(value)) {
      for (const item of value) {
        if (isRecord(item) && typeof item.id === 'string') entries.set(item.id, item);
      }
    }
    return entries;
  }
  if (strategy === 'map') {
    if (isRecord(value)) for (const [k, v] of Object.entries(value)) entries.set(k, v);
    return entries;
  }
  if (strategy === 'program') {
    if (isRecord(value)) {
      const p = value as ProgramLike;
      if (p.startedAt) entries.set('startedAt', p.startedAt);
      for (const [k, v] of Object.entries(p.done ?? {})) entries.set(`done:${k}`, v);
      for (const [k, v] of Object.entries(p.notes ?? {})) entries.set(`notes:${k}`, v);
    }
    return entries;
  }
  return null;
}

function same(a: unknown, b: unknown): boolean {
  return JSON.stringify(a) === JSON.stringify(b);
}

/** Zapisuje w metadanych, które elementy klucza się zmieniły. Zwraca false dla kluczy nieobjętych synchronizacją. */
export function trackChange(meta: SyncMeta, key: string, prev: unknown, next: unknown, now = Date.now()): boolean {
  const strategy = SYNC_STRATEGY[key];
  if (!strategy) return false;
  meta.upd[key] = now;
  const before = toEntries(strategy, prev);
  const after = toEntries(strategy, next);
  if (!before || !after) return true;
  const sub = (meta.sub[key] ??= {});
  for (const [k, v] of after) {
    if (!before.has(k) || !same(before.get(k), v)) {
      sub[k] = now;
      if (meta.del[key]) delete meta.del[key][k];
    }
  }
  for (const k of before.keys()) {
    if (!after.has(k)) {
      (meta.del[key] ??= {})[k] = now;
      delete sub[k];
    }
  }
  return true;
}

function unionSorted(a: unknown, b: unknown): string[] {
  const all = new Set<string>();
  for (const list of [a, b]) if (Array.isArray(list)) for (const x of list) if (typeof x === 'string') all.add(x);
  return [...all].sort();
}

function unionKeepOrder(a: unknown, b: unknown): string[] {
  const out: string[] = [];
  for (const list of [a, b]) if (Array.isArray(list)) for (const x of list) if (typeof x === 'string' && !out.includes(x)) out.push(x);
  return out;
}

/** Rozstrzyga konflikt, gdy ten sam element zmieniono na obu urządzeniach. */
function combine(key: string, a: unknown, b: unknown, aNewer: boolean): unknown {
  if (key === 'awakenings' || key === 'quizBest' || key === 'flashcardsLog') {
    return Math.max(Number(a) || 0, Number(b) || 0);
  }
  const newer = aNewer ? a : b;
  const older = aNewer ? b : a;
  if (!isRecord(newer) || !isRecord(older)) return newer;
  if (key === 'slides') {
    return { ...newer, sessions: unionSorted(newer.sessions, older.sessions), details: unionKeepOrder(newer.details, older.details) };
  }
  if (key === 'frames') {
    return { ...newer, sets: unionSorted(newer.sets, older.sets) };
  }
  if (key === 'journal') {
    const fields = { ...(isRecord(older.fields) ? older.fields : {}), ...(isRecord(newer.fields) ? newer.fields : {}) };
    return { ...older, ...newer, fields };
  }
  return newer;
}

const ORDER_DESC = new Set(['journal', 'slides', 'frames']);

function compareText(a: string, b: string): number {
  return a < b ? -1 : a > b ? 1 : 0;
}

/**
 * Wynik scalania musi być taki sam na każdym urządzeniu, inaczej urządzenia
 * w nieskończoność nadpisywałyby sobie kopię samą zmianą kolejności.
 */
function fromEntries(key: string, strategy: Strategy, entries: Map<string, unknown>, localValue: unknown, remoteValue: unknown, localNewer: boolean): unknown {
  if (strategy === 'map') return Object.fromEntries(entries);
  if (strategy === 'program') {
    const program: Required<ProgramLike> = { startedAt: null, done: {}, notes: {} };
    for (const [k, v] of entries) {
      if (k === 'startedAt') program.startedAt = typeof v === 'string' ? v : null;
      else if (k.startsWith('done:')) program.done[k.slice(5)] = String(v);
      else if (k.startsWith('notes:')) program.notes[k.slice(6)] = String(v);
    }
    return program;
  }
  // idArray
  const items = [...entries.values()] as Record<string, unknown>[];
  if (ORDER_DESC.has(key)) {
    return items.sort((x, y) => compareText(String(y.createdAt ?? ''), String(x.createdAt ?? '')) || compareText(String(x.id), String(y.id)));
  }
  // Kolejność z nowszej strony (przy remisie z serwera), elementy znane tylko drugiej stronie na końcu.
  const order: string[] = [];
  for (const list of localNewer ? [localValue, remoteValue] : [remoteValue, localValue]) {
    if (Array.isArray(list)) for (const item of list) if (isRecord(item) && typeof item.id === 'string' && !order.includes(item.id)) order.push(item.id);
  }
  return order.filter((id) => entries.has(id)).map((id) => entries.get(id));
}

export function mergeSnapshots(local: SyncSnapshot, remote: SyncSnapshot, now = Date.now()): SyncSnapshot {
  const out: SyncSnapshot = { data: {}, meta: emptyMeta() };
  for (const key of SYNC_KEYS) {
    const strategy = SYNC_STRATEGY[key];
    const hasL = key in local.data && local.data[key] !== undefined;
    const hasR = key in remote.data && remote.data[key] !== undefined;
    const tL = local.meta.upd[key] ?? 0;
    const tR = remote.meta.upd[key] ?? 0;
    if (tL || tR) out.meta.upd[key] = Math.max(tL, tR);

    if (strategy === 'value') {
      if (hasL || hasR) out.data[key] = !hasR || (hasL && tL >= tR) ? local.data[key] : remote.data[key];
      continue;
    }
    if (strategy === 'log') {
      if (hasL || hasR) out.data[key] = unionSorted(local.data[key], remote.data[key]);
      continue;
    }

    const eL = toEntries(strategy, local.data[key]) ?? new Map<string, unknown>();
    const eR = toEntries(strategy, remote.data[key]) ?? new Map<string, unknown>();
    const subL = local.meta.sub[key] ?? {};
    const subR = remote.meta.sub[key] ?? {};
    const delL = local.meta.del[key] ?? {};
    const delR = remote.meta.del[key] ?? {};
    const all = new Set<string>([...eL.keys(), ...eR.keys(), ...Object.keys(delL), ...Object.keys(delR)]);
    const result = new Map<string, unknown>();
    const sub: Record<string, number> = {};
    const del: Record<string, number> = {};

    for (const k of all) {
      const deletedAt = Math.max(delL[k] ?? -1, delR[k] ?? -1);
      const inL = eL.has(k);
      const inR = eR.has(k);
      const wL = inL ? (subL[k] ?? 0) : -1;
      const wR = inR ? (subR[k] ?? 0) : -1;
      const lastWrite = Math.max(wL, wR);
      if (deletedAt >= 0 && deletedAt >= lastWrite) {
        if (now - deletedAt < TOMBSTONE_TTL) del[k] = deletedAt;
        continue;
      }
      if (!inL && !inR) continue;
      const value = inL && inR ? combine(key, eL.get(k), eR.get(k), wL >= wR) : inL ? eL.get(k) : eR.get(k);
      result.set(k, value);
      if (lastWrite > 0) sub[k] = lastWrite;
    }

    if (hasL || hasR || result.size > 0) out.data[key] = fromEntries(key, strategy, result, local.data[key], remote.data[key], tL > tR);
    if (Object.keys(sub).length) out.meta.sub[key] = sub;
    if (Object.keys(del).length) out.meta.del[key] = del;
  }
  return out;
}

/** Stabilny JSON (posortowane klucze) do porównywania stanów. */
export function stableStringify(value: unknown): string {
  if (Array.isArray(value)) return `[${value.map(stableStringify).join(',')}]`;
  if (isRecord(value)) {
    return `{${Object.keys(value)
      .sort()
      .filter((k) => value[k] !== undefined)
      .map((k) => `${JSON.stringify(k)}:${stableStringify(value[k])}`)
      .join(',')}}`;
  }
  return JSON.stringify(value ?? null);
}

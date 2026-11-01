import { ApiError, apiRequest } from './api';
import { decryptJson, deriveAccountKeys, encryptJson, forgetVaultKey, loadVaultKey, normalizeUsername, storeVaultKey } from './crypto';
import { hasLocalData, onLocalChange, readMeta, readStore, writeMeta, writeStore } from './storage';
import { SYNC_KEYS, emptyMeta, mergeSnapshots, normalizeMeta, stableStringify, type SyncSnapshot } from './syncMeta';
import type { AccountInfo, SyncStatus } from '../types';

interface RemoteVault {
  version: number;
  iv?: string;
  data?: string;
  updatedAt?: number;
}

interface AuthResponse {
  token: string;
  username: string;
  createdAt?: string;
}

const DEFAULT_STATUS: SyncStatus = { state: 'idle', version: 0, lastSyncAt: null, error: null };

export function getAccount(): AccountInfo | null {
  return readStore<AccountInfo | null>('account', null);
}

function setStatus(patch: Partial<SyncStatus>) {
  writeStore<SyncStatus>('syncStatus', { ...DEFAULT_STATUS, ...readStore<SyncStatus>('syncStatus', DEFAULT_STATUS), ...patch });
}

export function localSnapshot(): SyncSnapshot {
  const data: Record<string, unknown> = {};
  for (const key of SYNC_KEYS) {
    const value = readStore<unknown>(key, undefined);
    if (value !== undefined) data[key] = value;
  }
  return { data, meta: readMeta() };
}

function normalizeSnapshot(value: unknown): SyncSnapshot {
  const v = (value ?? {}) as Partial<SyncSnapshot>;
  return { data: v.data && typeof v.data === 'object' ? (v.data as Record<string, unknown>) : {}, meta: normalizeMeta(v.meta) };
}

/** Zapisuje scalony stan lokalnie bez oznaczania go jako nowej zmiany. */
export function applySnapshot(snapshot: SyncSnapshot) {
  for (const key of SYNC_KEYS) {
    const next = snapshot.data[key];
    const current = readStore<unknown>(key, undefined);
    if (stableStringify(next) !== stableStringify(current)) writeStore(key, next, { track: false });
  }
  writeMeta(snapshot.meta);
}

/**
 * Odczyt kopii z serwera. Zawsze metodą POST: pamięć podręczna hostingu (np. tryb „long” na MyDevil)
 * nie zapisuje odpowiedzi na POST, więc nigdy nie poda kopii jednej osoby komuś innemu.
 */
function pullRemote(token: string): Promise<RemoteVault> {
  return apiRequest<RemoteVault>('sync.php?action=pull', { body: {}, token });
}

async function fetchRemote(token: string, key: CryptoKey): Promise<{ version: number; snapshot: SyncSnapshot | null }> {
  const remote = await pullRemote(token);
  if (!remote.version || !remote.iv || !remote.data) return { version: remote.version || 0, snapshot: null };
  return { version: remote.version, snapshot: normalizeSnapshot(await decryptJson<unknown>({ iv: remote.iv, data: remote.data }, key)) };
}

async function doSync(): Promise<void> {
  const account = getAccount();
  if (!account) return;
  const key = await loadVaultKey();
  if (!key) {
    setStatus({ state: 'locked', error: 'Zaloguj się ponownie, żeby odblokować synchronizację na tym urządzeniu.' });
    return;
  }
  setStatus({ state: 'syncing', error: null });
  try {
    for (let attempt = 0; attempt < 4; attempt += 1) {
      const remote = await fetchRemote(account.token, key);
      const merged = remote.snapshot ? mergeSnapshots(localSnapshot(), remote.snapshot) : localSnapshot();
      applySnapshot(merged);
      if (remote.snapshot && stableStringify(merged) === stableStringify(remote.snapshot)) {
        setStatus({ state: 'idle', version: remote.version, lastSyncAt: new Date().toISOString(), error: null });
        return;
      }
      const encrypted = await encryptJson(merged, key);
      try {
        const saved = await apiRequest<{ version: number }>('sync.php?action=push', { body: { baseVersion: remote.version, ...encrypted }, token: account.token });
        setStatus({ state: 'idle', version: saved.version, lastSyncAt: new Date().toISOString(), error: null });
        return;
      } catch (error) {
        if (error instanceof ApiError && error.status === 409) continue;
        throw error;
      }
    }
    throw new Error('Dane zmieniały się zbyt często. Spróbuj ponownie za chwilę.');
  } catch (error) {
    if (error instanceof ApiError && error.status === 401) {
      setStatus({ state: 'locked', error: 'Sesja wygasła. Zaloguj się ponownie.' });
      return;
    }
    setStatus({ state: 'error', error: error instanceof Error ? error.message : 'Nieznany błąd synchronizacji.' });
  }
}

let running: Promise<void> | null = null;
let again = false;

/** Synchronizuje teraz. Równoległe wywołania łączą się w jedno, a zmiany w trakcie wywołują kolejną rundę. */
export function syncNow(): Promise<void> {
  if (running) {
    again = true;
    return running;
  }
  running = doSync().finally(() => {
    running = null;
    if (again) {
      again = false;
      void syncNow();
    }
  });
  return running;
}

let started = false;
let timer: ReturnType<typeof setTimeout> | undefined;

export function startSyncEngine() {
  if (started || typeof window === 'undefined') return;
  started = true;
  const schedule = (delay: number) => {
    if (!getAccount()) return;
    if (timer) clearTimeout(timer);
    timer = setTimeout(() => void syncNow(), delay);
  };
  onLocalChange(() => schedule(5000));
  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'visible') schedule(400);
  });
  window.addEventListener('online', () => schedule(400));
  schedule(1500);
}

async function saveSession(auth: AuthResponse, key: CryptoKey) {
  await storeVaultKey(key);
  writeStore<AccountInfo>('account', { username: auth.username, token: auth.token, createdAt: auth.createdAt });
  setStatus({ ...DEFAULT_STATUS });
}

export async function registerAccount(usernameInput: string, password: string): Promise<void> {
  const username = normalizeUsername(usernameInput);
  const keys = await deriveAccountKeys(username, password);
  const auth = await apiRequest<AuthResponse>('auth.php?action=register', { body: { username, auth: keys.auth } });
  await saveSession(auth, keys.key);
  await syncNow();
}

export interface LoginResult {
  needsChoice: boolean;
}

/** Logowanie. Gdy dane są i na koncie, i na urządzeniu, użytkownik wybiera, co z nimi zrobić. */
export async function loginAccount(usernameInput: string, password: string): Promise<LoginResult> {
  const username = normalizeUsername(usernameInput);
  const keys = await deriveAccountKeys(username, password);
  const auth = await apiRequest<AuthResponse>('auth.php?action=login', { body: { username, auth: keys.auth } });
  await saveSession(auth, keys.key);
  const remote = await pullRemote(auth.token);
  if (remote.version > 0 && hasLocalData()) return { needsChoice: true };
  await syncNow();
  return { needsChoice: false };
}

/** Po zalogowaniu: połącz dane albo zastąp dane urządzenia danymi z konta. */
export async function resolveFirstSync(mode: 'merge' | 'replace-local'): Promise<void> {
  if (mode === 'replace-local') {
    for (const key of SYNC_KEYS) writeStore(key, undefined, { track: false });
    writeMeta(emptyMeta());
  }
  await syncNow();
}

export async function logoutAccount(): Promise<void> {
  const account = getAccount();
  if (account) await apiRequest('auth.php?action=logout', { body: {}, token: account.token }).catch(() => undefined);
  await forgetVaultKey();
  writeStore('account', undefined);
  writeStore('syncStatus', undefined);
}

export async function changeAccountPassword(oldPassword: string, newPassword: string): Promise<void> {
  const account = getAccount();
  if (!account) throw new Error('Najpierw się zaloguj.');
  const oldKeys = await deriveAccountKeys(account.username, oldPassword);
  const newKeys = await deriveAccountKeys(account.username, newPassword);
  await syncNow();
  for (let attempt = 0; attempt < 3; attempt += 1) {
    const remote = await fetchRemote(account.token, oldKeys.key).catch((error) => {
      throw error instanceof Error && error.message.includes('odszyfrować') ? new Error('Obecne hasło jest nieprawidłowe.') : error;
    });
    const snapshot = remote.snapshot ? mergeSnapshots(localSnapshot(), remote.snapshot) : localSnapshot();
    const encrypted = await encryptJson(snapshot, newKeys.key);
    try {
      const auth = await apiRequest<AuthResponse & { version: number }>('auth.php?action=change_password', {
        body: { auth: oldKeys.auth, newAuth: newKeys.auth, baseVersion: remote.version, ...encrypted },
        token: account.token,
      });
      applySnapshot(snapshot);
      await storeVaultKey(newKeys.key);
      writeStore<AccountInfo>('account', { ...account, token: auth.token });
      setStatus({ state: 'idle', version: auth.version, lastSyncAt: new Date().toISOString(), error: null });
      return;
    } catch (error) {
      if (error instanceof ApiError && error.status === 409) continue;
      throw error;
    }
  }
  throw new Error('Nie udało się zmienić hasła. Spróbuj ponownie.');
}

export async function deleteAccount(password: string): Promise<void> {
  const account = getAccount();
  if (!account) throw new Error('Najpierw się zaloguj.');
  const keys = await deriveAccountKeys(account.username, password);
  await apiRequest('auth.php?action=delete', { body: { auth: keys.auth }, token: account.token });
  await forgetVaultKey();
  writeStore('account', undefined);
  writeStore('syncStatus', undefined);
}

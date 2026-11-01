import { idbDelete, idbGet, idbPut } from './idb';

/**
 * Szyfrowanie end-to-end danych konta.
 * Z hasła wyprowadzamy (PBKDF2, 600 000 iteracji) klucz główny, a z niego (HKDF)
 * dwa niezależne klucze: „auth” wysyłany do serwera zamiast hasła i „vault” do szyfrowania danych.
 * Serwer nigdy nie zna hasła ani klucza szyfrowania, więc nie może odczytać dziennika.
 */
export const PBKDF2_ITERATIONS = 600_000;
const encoder = new TextEncoder();
const decoder = new TextDecoder();
const HKDF_SALT = encoder.encode('transerfing-hkdf-v1');

export function normalizeUsername(username: string): string {
  return username.trim().toLowerCase();
}

export function validUsername(username: string): boolean {
  return /^[a-z0-9][a-z0-9._-]{2,31}$/.test(username);
}

function toBase64(bytes: Uint8Array): string {
  let binary = '';
  const step = 0x8000;
  for (let i = 0; i < bytes.length; i += step) binary += String.fromCharCode(...bytes.subarray(i, i + step));
  return btoa(binary);
}

function fromBase64(text: string): Uint8Array {
  return Uint8Array.from(atob(text), (c) => c.charCodeAt(0));
}

function toBase64Url(bytes: Uint8Array): string {
  return toBase64(bytes).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

export interface AccountKeys {
  auth: string;
  key: CryptoKey;
}

export async function deriveAccountKeys(username: string, password: string): Promise<AccountKeys> {
  const subtle = crypto.subtle;
  const passwordKey = await subtle.importKey('raw', encoder.encode(password.normalize('NFKC')), 'PBKDF2', false, ['deriveBits']);
  const master = await subtle.deriveBits(
    { name: 'PBKDF2', hash: 'SHA-256', salt: encoder.encode(`transerfing-w-praktyce|v1|${normalizeUsername(username)}`), iterations: PBKDF2_ITERATIONS },
    passwordKey,
    256,
  );
  const hkdf = await subtle.importKey('raw', master, 'HKDF', false, ['deriveBits', 'deriveKey']);
  const authBits = await subtle.deriveBits({ name: 'HKDF', hash: 'SHA-256', salt: HKDF_SALT, info: encoder.encode('auth') }, hkdf, 256);
  const key = await subtle.deriveKey(
    { name: 'HKDF', hash: 'SHA-256', salt: HKDF_SALT, info: encoder.encode('vault') },
    hkdf,
    { name: 'AES-GCM', length: 256 },
    false,
    ['encrypt', 'decrypt'],
  );
  return { auth: toBase64Url(new Uint8Array(authBits)), key };
}

async function transform(bytes: Uint8Array, stream: CompressionStream | DecompressionStream): Promise<Uint8Array> {
  const output = new Blob([bytes as BlobPart]).stream().pipeThrough(stream);
  return new Uint8Array(await new Response(output).arrayBuffer());
}

export interface EncryptedPayload {
  iv: string;
  data: string;
}

/** Szyfruje JSON (AES-256-GCM). Pierwszy bajt treści mówi, czy dane są skompresowane. */
export async function encryptJson(value: unknown, key: CryptoKey): Promise<EncryptedPayload> {
  const json = encoder.encode(JSON.stringify(value));
  const canCompress = typeof CompressionStream !== 'undefined';
  const body = canCompress ? await transform(json, new CompressionStream('gzip')) : json;
  const plain = new Uint8Array(body.length + 1);
  plain[0] = canCompress ? 1 : 0;
  plain.set(body, 1);
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const cipher = await crypto.subtle.encrypt({ name: 'AES-GCM', iv }, key, plain);
  return { iv: toBase64(iv), data: toBase64(new Uint8Array(cipher)) };
}

export async function decryptJson<T>(payload: EncryptedPayload, key: CryptoKey): Promise<T> {
  let plain: Uint8Array;
  try {
    plain = new Uint8Array(await crypto.subtle.decrypt({ name: 'AES-GCM', iv: fromBase64(payload.iv) as BufferSource }, key, fromBase64(payload.data) as BufferSource));
  } catch {
    throw new Error('Nie udało się odszyfrować danych. Hasło mogło zostać zmienione na innym urządzeniu.');
  }
  const body = plain.subarray(1);
  const json = plain[0] === 1 ? await transform(body, new DecompressionStream('gzip')) : body;
  return JSON.parse(decoder.decode(json)) as T;
}

const KEY_ID = 'vault';

export async function storeVaultKey(key: CryptoKey): Promise<void> {
  await idbPut('keys', key, KEY_ID);
}

export async function loadVaultKey(): Promise<CryptoKey | null> {
  try {
    return (await idbGet<CryptoKey>('keys', KEY_ID)) ?? null;
  } catch {
    return null;
  }
}

export async function forgetVaultKey(): Promise<void> {
  await idbDelete('keys', KEY_ID).catch(() => undefined);
}

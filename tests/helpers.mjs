// Pomocnicze funkcje testów API: wywołanie PHP CLI przez tests/invoke.php.
import { spawnSync } from 'node:child_process';
import { createPublicKey, randomBytes, verify } from 'node:crypto';
import { mkdtempSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

export const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
export const PHP = process.env.PHP_BIN || 'php';

export function tempDir(prefix) {
  return mkdtempSync(join(tmpdir(), prefix));
}

/** Zwraca funkcję wywołującą API z danym katalogiem danych i domyślnymi ustawieniami. */
export function makeCaller(dataDir, defaults = {}) {
  return function call(spec) {
    const input = JSON.stringify({
      dataDir,
      ...defaults,
      ...spec,
      config: { ...(defaults.config ?? {}), ...(spec.config ?? {}) },
    });
    const result = spawnSync(PHP, [join(ROOT, 'tests', 'invoke.php')], {
      input,
      encoding: 'utf8',
      env: { ...process.env, ...(defaults.env ?? {}) },
      maxBuffer: 64 * 1024 * 1024,
    });
    if (result.status !== 0) throw new Error(`PHP zakończył się kodem ${result.status}: ${result.stderr}${result.stdout}`);
    try {
      return JSON.parse(result.stdout);
    } catch {
      throw new Error(`Niepoprawny JSON z PHP: ${result.stdout.slice(0, 2000)} ${result.stderr}`);
    }
  };
}

/** Uruchamia plik PHP jak serwer WWW (zmienne CGI w środowisku) albo jak cron. */
export function runPhpFile(file, env = {}, args = []) {
  return spawnSync(PHP, [join(ROOT, file), ...args], { encoding: 'utf8', env: { PATH: process.env.PATH, ...env } });
}

export const authKey = () => randomBytes(32).toString('base64url');
export const bearer = (token) => ({ 'x-auth-token': token });

/** Losowa „zaszyfrowana” kopia: IV 12 bajtów i szyfrogram w base64 (serwer nie zagląda do środka). */
export function fakeVault(size = 64) {
  return { iv: randomBytes(12).toString('base64'), data: randomBytes(size).toString('base64') };
}

/** Sprawdza podpis JWT ES256 kluczem publicznym VAPID (65 bajtów, base64url). */
export function verifyVapidJwt(jwt, publicKey) {
  const raw = Buffer.from(publicKey, 'base64url');
  const key = createPublicKey({
    key: { kty: 'EC', crv: 'P-256', x: raw.subarray(1, 33).toString('base64url'), y: raw.subarray(33, 65).toString('base64url') },
    format: 'jwk',
  });
  const [header, claims, signature] = jwt.split('.');
  const valid = verify('sha256', Buffer.from(`${header}.${claims}`), { key, dsaEncoding: 'ieee-p1363' }, Buffer.from(signature, 'base64url'));
  return {
    valid,
    header: JSON.parse(Buffer.from(header, 'base64url').toString()),
    claims: JSON.parse(Buffer.from(claims, 'base64url').toString()),
  };
}

/** Czas uniksowy dla daty i godziny w strefie Europe/Warsaw (np. '2026-11-02T10:00'). */
export function warsaw(local) {
  for (const offset of ['+01:00', '+02:00']) {
    const t = Date.parse(`${local}:00${offset}`);
    const check = new Intl.DateTimeFormat('sv-SE', { timeZone: 'Europe/Warsaw', year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' })
      .format(new Date(t))
      .replace(' ', 'T');
    if (check === local) return Math.floor(t / 1000);
  }
  throw new Error(`Nie umiem przeliczyć ${local}`);
}

export function warsawLocal(unix) {
  const parts = new Intl.DateTimeFormat('sv-SE', { timeZone: 'Europe/Warsaw', year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit', weekday: 'short' }).formatToParts(new Date(unix * 1000));
  const get = (type) => parts.find((p) => p.type === type)?.value;
  return { date: `${get('year')}-${get('month')}-${get('day')}`, time: `${get('hour')}:${get('minute')}`, weekday: get('weekday') };
}

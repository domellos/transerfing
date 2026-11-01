// Test integracyjny: prawdziwy kod przeglądarki (src/lib/sync.ts, crypto.ts, syncMeta.ts)
// na dwóch „urządzeniach” rozmawia z prawdziwym API w PHP (przez tests/invoke.php).
// Każde urządzenie ma własny serwer modułów Vite, więc własne kopie modułów i własną pamięć.
import { after, before, describe, test } from 'node:test';
import assert from 'node:assert/strict';
import { rmSync } from 'node:fs';
import { createServer } from 'vite';
import { ROOT, makeCaller, tempDir } from './helpers.mjs';

class MemoryStorage {
  #map = new Map();
  get length() {
    return this.#map.size;
  }
  key(i) {
    return [...this.#map.keys()][i] ?? null;
  }
  getItem(k) {
    return this.#map.has(k) ? this.#map.get(k) : null;
  }
  setItem(k, v) {
    this.#map.set(k, String(v));
  }
  removeItem(k) {
    this.#map.delete(k);
  }
  clear() {
    this.#map.clear();
  }
}

const PASSWORD = 'bardzo-tajne-haslo-1';
const PASSWORD2 = 'inne-dlugie-haslo-2';
const dataDir = tempDir('ts-sync-');
const call = makeCaller(dataDir, { config: { accounts_enabled: true } });
const requests = [];
let beforeRequest = null;
let A;
let B;

function installFetch() {
  globalThis.fetch = async (input, init = {}) => {
    const url = new URL(String(input), 'https://transerfing.example.pl');
    const match = /^\/api\/([a-z]+)\.php$/.exec(url.pathname);
    if (!match) return new Response('Nie ma', { status: 404 });
    const headers = Object.fromEntries(Object.entries(init.headers ?? {}).map(([k, v]) => [k.toLowerCase(), v]));
    const body = init.body ? JSON.parse(init.body) : undefined;
    const query = Object.fromEntries(url.searchParams);
    if (beforeRequest && beforeRequest.when(match[1], query)) {
      const hook = beforeRequest;
      beforeRequest = null;
      await hook.run();
    }
    const result = call({ handler: match[1], method: init.method ?? 'GET', query, headers, body });
    requests.push({ device: current?.name, handler: match[1], action: query.action, status: result.status });
    if (result.status === 500) throw new Error(`Błąd serwera: ${JSON.stringify(result.body)}`);
    return new Response(JSON.stringify(result.body), { status: result.status, headers: { 'content-type': 'application/json' } });
  };
}

let current = null;

async function makeDevice(name) {
  const server = await createServer({ root: ROOT, server: { middlewareMode: true, hmr: false, ws: false }, appType: 'custom', logLevel: 'error' });
  const device = { name, server, storage: new MemoryStorage() };
  device.run = async (fn) => {
    const prev = { storage: globalThis.localStorage, device: current };
    globalThis.localStorage = device.storage;
    current = device;
    try {
      return await fn(device);
    } finally {
      globalThis.localStorage = prev.storage;
      current = prev.device;
    }
  };
  await device.run(async () => {
    device.sync = await server.ssrLoadModule('/src/lib/sync.ts');
    device.store = await server.ssrLoadModule('/src/lib/storage.ts');
    device.crypto = await server.ssrLoadModule('/src/lib/crypto.ts');
  });
  return device;
}

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const entry = (id, text, day = '2026-11-01') => ({ id, type: 'notatka', date: day, createdAt: `${day}T08:00:00.000Z`, fields: { tekst: text } });
const ids = (device) => device.store.readStore('journal', []).map((e) => e.id).sort();
const status = (device) => device.store.readStore('syncStatus', null);
const vaultVersion = () => call({ handler: 'sql', body: { sql: 'SELECT version FROM vaults' } }).body.rows[0]?.version ?? 0;

before(async () => {
  installFetch();
  A = await makeDevice('A');
  B = await makeDevice('B');
});

after(async () => {
  await A?.server.close();
  await B?.server.close();
  rmSync(dataDir, { recursive: true, force: true });
});

describe('synchronizacja dwóch urządzeń z szyfrowaniem end-to-end', () => {
  test('rejestracja na A wysyła tylko zaszyfrowaną kopię', async () => {
    await A.run(async ({ store, sync }) => {
      store.writeStore('journal', [entry('a1', 'Tajny wpis A1'), entry('a2', 'Wpis A2')]);
      store.writeStore('lessonsRead', { wahadla: '2026-11-01' });
      store.writeStore('awakenings', { '2026-11-01': 3 });
      store.writeStore('settings', { theme: 'light' });
      await sync.registerAccount('Tester', PASSWORD);
      assert.equal(store.readStore('account', null).username, 'tester');
      assert.equal(status(A).state, 'idle');
      assert.equal(status(A).version, 1);
    });
    const stored = call({ handler: 'sql', body: { sql: 'SELECT iv, data FROM vaults' } }).body.rows[0];
    const raw = Buffer.from(stored.data, 'base64').toString('latin1');
    assert.ok(!raw.includes('Tajny'), 'serwer nie widzi treści');
    assert.ok(!raw.includes('wahadla'), 'serwer nie widzi nawet nazw lekcji');
    const users = call({ handler: 'sql', body: { sql: 'SELECT username, auth_hash FROM users' } }).body.rows;
    assert.equal(users[0].username, 'tester');
    assert.match(users[0].auth_hash, /^\$2y\$10\$/);
  });

  test('logowanie na B z własnymi danymi: wybór i połączenie danych', async () => {
    await B.run(async ({ store, sync }) => {
      store.writeStore('journal', [entry('b1', 'Wpis B1')]);
      store.writeStore('lessonsRead', { waznosc: '2026-11-01' });
      store.writeStore('awakenings', { '2026-11-01': 5 });
      await assert.rejects(sync.loginAccount('tester', 'zle-haslo-123'), /Nieprawidłowy login lub hasło/);
      const result = await sync.loginAccount('TESTER', PASSWORD);
      assert.equal(result.needsChoice, true);
      await sync.resolveFirstSync('merge');
      assert.deepEqual(ids(B), ['a1', 'a2', 'b1']);
      assert.deepEqual(Object.keys(store.readStore('lessonsRead', {})).sort(), ['wahadla', 'waznosc']);
      assert.equal(store.readStore('awakenings', {})['2026-11-01'], 5, 'liczniki: większa wartość');
      assert.equal(store.readStore('settings', null), null, 'ustawienia urządzenia nie są synchronizowane');
    });
    assert.equal(vaultVersion(), 2);
  });

  test('A pobiera zmiany z B bez zbędnego zapisu', async () => {
    const before = requests.length;
    await A.run(({ sync }) => sync.syncNow());
    assert.deepEqual(ids(A), ['a1', 'a2', 'b1']);
    const actions = requests.slice(before).map((r) => r.action);
    assert.deepEqual(actions, ['pull'], 'stan identyczny: bez wysyłania');
    assert.equal(vaultVersion(), 2);
  });

  test('usunięty wpis nie wraca, a nowy z drugiego urządzenia zostaje', async () => {
    await A.run(async ({ store, sync }) => {
      store.writeStore('journal', store.readStore('journal', []).filter((e) => e.id !== 'a2'));
      await sync.syncNow();
    });
    await sleep(5);
    await B.run(async ({ store, sync }) => {
      store.writeStore('journal', [entry('b2', 'Wpis B2', '2026-11-02'), ...store.readStore('journal', [])]);
      await sync.syncNow();
    });
    await A.run(({ sync }) => sync.syncNow());
    assert.deepEqual(ids(A), ['a1', 'b1', 'b2']);
    assert.deepEqual(ids(B), ['a1', 'b1', 'b2']);
  });

  test('wyścig: zapis z A w trakcie synchronizacji B (409) kończy się połączeniem obu zmian', async () => {
    const before = requests.length;
    beforeRequest = {
      when: (handler, query) => current?.name === 'B' && handler === 'sync' && query.action === 'push',
      run: () =>
        A.run(async ({ store, sync }) => {
          store.writeStore('journal', [entry('a3', 'Wpis A3', '2026-11-03'), ...store.readStore('journal', [])]);
          await sync.syncNow();
        }),
    };
    await B.run(async ({ store, sync }) => {
      store.writeStore('journal', [entry('b3', 'Wpis B3', '2026-11-03'), ...store.readStore('journal', [])]);
      await sync.syncNow();
      assert.equal(status(B).state, 'idle');
    });
    const statuses = requests.slice(before).filter((r) => r.device === 'B' && r.action === 'push').map((r) => r.status);
    assert.deepEqual(statuses, [409, 200]);
    await A.run(({ sync }) => sync.syncNow());
    assert.deepEqual(ids(A), ['a1', 'a3', 'b1', 'b2', 'b3']);
    assert.deepEqual(ids(B), ids(A));
  });

  test('edycja tego samego wpisu na obu urządzeniach zachowuje oba pola', async () => {
    const edit = (device, field, value) =>
      device.run(async ({ store, sync }) => {
        store.writeStore('journal', store.readStore('journal', []).map((e) => (e.id === 'a1' ? { ...e, fields: { ...e.fields, [field]: value } } : e)));
        await sync.syncNow();
      });
    await edit(A, 'wniosek', 'z telefonu');
    await sleep(5);
    await B.run(async ({ store }) => {
      // B nie zsynchronizował się po edycji na A.
      store.writeStore('journal', store.readStore('journal', []).map((e) => (e.id === 'a1' ? { ...e, fields: { ...e.fields, plan: 'z komputera' } } : e)));
    });
    await B.run(({ sync }) => sync.syncNow());
    await A.run(({ sync }) => sync.syncNow());
    for (const device of [A, B]) {
      const a1 = device.store.readStore('journal', []).find((e) => e.id === 'a1');
      assert.deepEqual(a1.fields, { tekst: 'Tajny wpis A1', wniosek: 'z telefonu', plan: 'z komputera' }, device.name);
    }
  });

  test('zmiana hasła na A wylogowuje B, a B po ponownym logowaniu odczytuje dane nowym kluczem', async () => {
    await A.run(async ({ sync }) => {
      await assert.rejects(sync.changeAccountPassword('zle-haslo-123', PASSWORD2), /Obecne hasło jest nieprawidłowe/);
      await sync.changeAccountPassword(PASSWORD, PASSWORD2);
      assert.equal(status(A).state, 'idle');
    });
    await B.run(async ({ sync }) => {
      await sync.syncNow();
      assert.equal(status(B).state, 'locked');
      assert.match(status(B).error, /Sesja wygasła/);
      await assert.rejects(sync.loginAccount('tester', PASSWORD), /Nieprawidłowy login lub hasło/);
      const result = await sync.loginAccount('tester', PASSWORD2);
      if (result.needsChoice) await sync.resolveFirstSync('merge');
      assert.equal(status(B).state, 'idle');
    });
    assert.deepEqual(ids(B), ['a1', 'a3', 'b1', 'b2', 'b3']);
  });

  test('stary klucz nie odszyfruje nowej kopii', async () => {
    await A.run(async ({ crypto }) => {
      const oldKeys = await crypto.deriveAccountKeys('tester', PASSWORD);
      const remote = call({ handler: 'sql', body: { sql: 'SELECT iv, data FROM vaults' } }).body.rows[0];
      await assert.rejects(crypto.decryptJson(remote, oldKeys.key), /Nie udało się odszyfrować/);
      const newKeys = await crypto.deriveAccountKeys('tester', PASSWORD2);
      const snapshot = await crypto.decryptJson(remote, newKeys.key);
      assert.equal(snapshot.data.journal.length, 5);
    });
  });

  test('po zbieżności kolejne synchronizacje niczego nie wysyłają', async () => {
    await A.run(({ sync }) => sync.syncNow());
    await B.run(({ sync }) => sync.syncNow());
    const version = vaultVersion();
    const before = requests.length;
    for (let i = 0; i < 2; i += 1) {
      await A.run(({ sync }) => sync.syncNow());
      await B.run(({ sync }) => sync.syncNow());
    }
    assert.deepEqual(requests.slice(before).map((r) => r.action), ['pull', 'pull', 'pull', 'pull']);
    assert.equal(vaultVersion(), version);
    assert.deepEqual(A.store.readStore('journal', []), B.store.readStore('journal', []));
  });

  test('wylogowanie zostawia dane na urządzeniu, usunięcie konta blokuje drugie urządzenie', async () => {
    await B.run(async ({ store, sync }) => {
      await sync.logoutAccount();
      assert.equal(store.readStore('account', null), null);
      assert.equal(ids(B).length, 5);
    });
    await A.run(async ({ store, sync }) => {
      await assert.rejects(sync.deleteAccount(PASSWORD), /Nieprawidłowe hasło/);
      await sync.deleteAccount(PASSWORD2);
      assert.equal(store.readStore('account', null), null);
      assert.equal(ids(A).length, 5);
    });
    await B.run(async ({ sync }) => {
      await assert.rejects(sync.loginAccount('tester', PASSWORD2), /Nieprawidłowy login lub hasło/);
    });
    const left = call({ handler: 'sql', body: { sql: 'SELECT (SELECT COUNT(*) FROM users) u, (SELECT COUNT(*) FROM vaults) v, (SELECT COUNT(*) FROM sessions) s' } }).body.rows[0];
    assert.deepEqual(left, { u: 0, v: 0, s: 0 });
  });
});

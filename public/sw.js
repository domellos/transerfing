// Service worker serwisu „Transerfing w praktyce”.
//
// 1. Działanie offline. Przy instalacji zapisujemy pliki aplikacji (JS, CSS, ikony).
//    Strony HTML pobieramy najpierw z sieci, a bez internetu pokazujemy zapisaną kopię
//    albo powłokę aplikacji (app.html), która wyświetli każdą stronę z kodu JS.
// 2. Powiadomienia push o przebudzeniu. Serwer wysyła pusty sygnał bez treści,
//    a tekst przypomnienia losujemy tutaj. Przez usługi push nie przechodzą żadne dane.
//
// Numer wersji i lista plików są wstawiane podczas budowania (scripts/prerender.mjs).
const BUILD = 'dev';
const PRECACHE = [];

const SCOPE = new URL(self.registration.scope).pathname;
const CACHE = `transerfing-${BUILD}`;
const SHELL = ['', 'app.html', 'manifest.webmanifest', 'favicon.svg', 'icon-192.png', 'badge-96.png'];
const NETWORK_TIMEOUT = 4000;

const TITLE = 'Obudź się: widzę siebie i widzę rzeczywistość';
const PROMPTS = [
  'Gdzie jest teraz twoja uwaga? W którym ekranie?',
  'Zatrzymaj się na oddech. Widzisz siebie i to, co się dzieje?',
  'Czy jakieś wahadło właśnie trzyma twoją uwagę?',
  'Jaki kadr ustawiasz na najbliższą godzinę?',
  'Czy coś jest teraz dla ciebie zbyt ważne? Rozluźnij barki.',
  'Wszystko idzie tak, jak trzeba. Wybierasz dalszy ciąg.',
  'Zauważ swoje ciało: ramiona, szczęka, oddech.',
  'Kto teraz patrzy twoimi oczami: ty czy sen?',
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    (async () => {
      const cache = await caches.open(CACHE);
      const urls = [...SHELL, ...PRECACHE].map((path) => SCOPE + path);
      // Pojedynczo: brak jednego pliku nie może zablokować instalacji.
      await Promise.all(urls.map((url) => cache.add(new Request(url, { cache: 'reload' })).catch(() => undefined)));
      await self.skipWaiting();
    })(),
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    (async () => {
      const keys = await caches.keys();
      await Promise.all(keys.filter((key) => key.startsWith('transerfing-') && key !== CACHE).map((key) => caches.delete(key)));
      if (self.registration.navigationPreload) await self.registration.navigationPreload.enable().catch(() => undefined);
      await self.clients.claim();
    })(),
  );
});

function timeout(ms) {
  return new Promise((_, reject) => setTimeout(() => reject(new Error('timeout')), ms));
}

async function handleNavigation(event) {
  const url = new URL(event.request.url);
  const key = url.origin + url.pathname;
  const cache = await caches.open(CACHE);
  const network = (async () => {
    // Wstępnie pobrana odpowiedź (navigation preload) przyspiesza start. Gdy zawiedzie, pytamy sieć zwyczajnie.
    const preloaded = await Promise.resolve(event.preloadResponse).catch(() => undefined);
    const response = preloaded || (await fetch(event.request));
    if (response.ok && response.type === 'basic') await cache.put(key, response.clone());
    return response;
  })();
  event.waitUntil(network.catch(() => undefined));
  try {
    return await Promise.race([network, timeout(NETWORK_TIMEOUT)]);
  } catch {
    const cached = (await cache.match(key)) || (await cache.match(SCOPE + 'app.html'));
    return cached || network;
  }
}

async function handleAsset(event, immutable) {
  const cache = await caches.open(CACHE);
  const cached = await cache.match(event.request);
  // Pliki z katalogu assets mają skrót w nazwie i się nie zmieniają. Pozostałe odświeżamy w tle.
  if (cached && immutable) return cached;
  const update = fetch(event.request).then(async (response) => {
    if (response.ok && response.type === 'basic') await cache.put(event.request, response.clone());
    return response;
  });
  if (cached) {
    event.waitUntil(update.catch(() => undefined));
    return cached;
  }
  return update;
}

self.addEventListener('fetch', (event) => {
  const request = event.request;
  if (request.method !== 'GET' || request.headers.has('range')) return;
  const url = new URL(request.url);
  if (url.origin !== self.location.origin || !url.pathname.startsWith(SCOPE)) return;
  if (url.pathname.startsWith(`${SCOPE}api/`)) return;

  if (request.mode === 'navigate') {
    event.respondWith(handleNavigation(event));
    return;
  }
  event.respondWith(handleAsset(event, url.pathname.startsWith(`${SCOPE}assets/`)));
});

self.addEventListener('push', (event) => {
  const text = PROMPTS[Math.floor(Math.random() * PROMPTS.length)];
  event.waitUntil(
    self.registration.showNotification(TITLE, {
      body: text,
      icon: `${SCOPE}icon-192.png`,
      badge: `${SCOPE}badge-96.png`,
      tag: 'przebudzenie',
      renotify: true,
      data: { text },
      actions: [{ action: 'awake', title: 'Obudziłem/obudziłam się' }],
    }),
  );
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  const awake = event.action === 'awake';
  const text = event.notification.data && event.notification.data.text;
  event.waitUntil(
    (async () => {
      const windows = await self.clients.matchAll({ type: 'window' });
      const client = windows.find((c) => c.visibilityState === 'visible') || windows[0];
      if (client) {
        // Otwarta karta sama doliczy przebudzenie albo pokaże przypomnienie, bez przeładowania strony.
        client.postMessage(awake ? { type: 'transerfing:awake' } : { type: 'transerfing:prompt', text });
        await client.focus().catch(() => undefined);
        return;
      }
      await self.clients.openWindow(`${SCOPE}praktyka/przebudzenie/${awake ? '?obudzony=1' : ''}`);
    })(),
  );
});

// Przeglądarka może sama wymienić subskrypcję. Przenosimy wtedy harmonogram na nowy adres.
self.addEventListener('pushsubscriptionchange', (event) => {
  const old = event.oldSubscription;
  if (!old || !old.options || !old.options.applicationServerKey) return;
  event.waitUntil(
    (async () => {
      const subscription = event.newSubscription || (await self.registration.pushManager.subscribe(old.options));
      await fetch(`${SCOPE}api/push.php?action=resubscribe`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ oldEndpoint: old.endpoint, subscription: subscription.toJSON() }),
        credentials: 'same-origin',
      });
    })().catch(() => undefined),
  );
});

import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router';
import App from './App';
import { preloadPath } from './routes';
import { registerServiceWorker } from './lib/hooks';
import { startSyncEngine } from './lib/sync';
import { ROUTER_BASENAME } from './site';
import './styles/global.css';

/** Stare adresy z „#/…” (pierwsza wersja serwisu) przenosimy na zwykłe adresy z ukośnikiem na końcu. */
function redirectLegacyHash() {
  const { hash } = window.location;
  if (!hash.startsWith('#/')) return;
  const prefix = ROUTER_BASENAME === '/' ? '' : ROUTER_BASENAME;
  const target = hash.slice(1);
  const queryAt = target.search(/[?#]/);
  const path = queryAt === -1 ? target : target.slice(0, queryAt);
  const rest = queryAt === -1 ? '' : target.slice(queryAt);
  window.history.replaceState(null, '', prefix + (path.endsWith('/') ? path : `${path}/`) + rest);
}

/**
 * Po publikacji nowej wersji stare pliki JS znikają z serwera. Jeśli otwarta karta
 * spróbuje wczytać taki plik, odświeżamy stronę (najwyżej raz na minutę, żeby nie zapętlić się offline).
 */
function reloadOnStaleChunks() {
  window.addEventListener('vite:preloadError', (event) => {
    const KEY = 'ts-chunk-reload';
    try {
      const last = Number(sessionStorage.getItem(KEY) ?? 0);
      if (Date.now() - last < 60_000) return;
      sessionStorage.setItem(KEY, String(Date.now()));
    } catch {
      return;
    }
    event.preventDefault();
    window.location.reload();
  });
}

function currentAppPath(): string {
  const { pathname } = window.location;
  if (ROUTER_BASENAME === '/') return pathname;
  return pathname.startsWith(ROUTER_BASENAME) ? pathname.slice(ROUTER_BASENAME.length) || '/' : pathname;
}

async function start() {
  redirectLegacyHash();
  reloadOnStaleChunks();
  const root = document.getElementById('root');
  if (!root) throw new Error('Brak elementu #root w index.html');

  // Kod bieżącej strony wczytujemy przed renderem, żeby gotowy HTML nie mignął ekranem ładowania.
  await preloadPath(currentAppPath()).catch(() => undefined);

  createRoot(root).render(
    <StrictMode>
      <BrowserRouter basename={ROUTER_BASENAME}>
        <App />
      </BrowserRouter>
    </StrictMode>,
  );

  startSyncEngine();
}

void start();
registerServiceWorker();

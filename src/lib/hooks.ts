import { useEffect } from 'react';
import { BASE, SITE_NAME, SITE_TAGLINE } from '../site';

export function useTitle(title?: string) {
  useEffect(() => {
    document.title = title ? `${title} · ${SITE_NAME}` : `${SITE_NAME}: ${SITE_TAGLINE}`;
  }, [title]);
}

export function applyTheme(theme: 'dark' | 'light' | 'auto') {
  document.documentElement.setAttribute('data-theme', theme);
}

export function registerServiceWorker() {
  if (!import.meta.env.PROD) return;
  if (!('serviceWorker' in navigator)) return;
  if (!location.protocol.startsWith('http')) return;
  window.addEventListener('load', () => {
    // Adres bezwzględny: strony mają adresy katalogowe (/wiedza/wahadla/), a service worker musi obejmować cały serwis.
    navigator.serviceWorker.register(`${BASE}sw.js`, { scope: BASE }).catch(() => {
      // Tryb offline jest opcjonalny.
    });
  });
}

type WakeLockHandle = { release: () => Promise<void> };

/** Utrzymuje ekran włączony podczas prowadzonych sesji (jeśli przeglądarka na to pozwala). */
export function useWakeLock(active: boolean) {
  useEffect(() => {
    if (!active) return;
    const nav = navigator as unknown as { wakeLock?: { request: (type: 'screen') => Promise<WakeLockHandle> } };
    if (!nav.wakeLock) return;
    let handle: WakeLockHandle | null = null;
    let cancelled = false;
    nav.wakeLock
      .request('screen')
      .then((h) => {
        if (cancelled) void h.release();
        else handle = h;
      })
      .catch(() => {});
    return () => {
      cancelled = true;
      if (handle) void handle.release();
    };
  }, [active]);
}

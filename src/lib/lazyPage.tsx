import { lazy, type ComponentType } from 'react';

export interface LazyPage {
  Component: ComponentType;
  preload: () => Promise<void>;
}

/**
 * Strona ładowana na żądanie (osobny plik JS).
 * Jeśli moduł został wczytany wcześniej (preload), komponent renderuje się od razu,
 * bez zawieszania i bez ekranu ładowania. Dzięki temu gotowy HTML strony
 * nie mignie spinnerem przy starcie aplikacji.
 */
export function lazyPage(loader: () => Promise<{ default: ComponentType }>): LazyPage {
  let loaded: ComponentType | null = null;
  let pending: Promise<void> | null = null;

  const preload = () => {
    pending ??= loader().then((module) => {
      loaded = module.default;
    });
    return pending;
  };

  const Lazy = lazy(() => preload().then(() => ({ default: loaded as ComponentType })));

  function Page() {
    const Loaded = loaded;
    return Loaded ? <Loaded /> : <Lazy />;
  }

  return { Component: Page, preload };
}

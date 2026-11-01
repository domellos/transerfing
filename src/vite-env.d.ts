/// <reference types="vite/client" />

interface ImportMetaEnv {
  /** Pełny adres serwisu, np. https://transerfing.pl (bez ukośnika na końcu). */
  readonly VITE_SITE_URL?: string;
  /** „1” w wersji prywatnej (plik .env.private, npm run build:private). */
  readonly VITE_PRIVATE?: string;
  /** „1” w wersji bez serwera, np. na GitHub Pages (plik .env.pages, npm run build:pages). */
  readonly VITE_STATIC?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}

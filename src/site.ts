export const SITE_NAME = 'Transerfing w praktyce';
export const SITE_TAGLINE = 'nauka i codzienne stosowanie zasad Vadima Zelanda';
export const SITE_DESCRIPTION =
  'Nieoficjalny przewodnik po Transerfingu Vadima Zelanda: wahadła, ważność, zamiar, slajdy, techniki Tafti i wyjście z matrixa. Lekcje, program i narzędzia.';

/** Ścieżka bazowa aplikacji, zawsze z ukośnikiem na końcu (domyślnie „/”). */
export const BASE = import.meta.env.BASE_URL || '/';
/** Basename dla routera: „/” albo np. „/transerfing”. */
export const ROUTER_BASENAME = BASE === '/' ? '/' : BASE.replace(/\/$/, '');
export const SITE_URL = (import.meta.env.VITE_SITE_URL ?? '').replace(/\/$/, '');
export const API_BASE = `${BASE}api/`;

/**
 * Wersja prywatna: serwis tylko dla właściciela (niewidoczny dla wyszukiwarek, jedno konto).
 * Strona o danych jest wtedy opisem dla właściciela, a nie polityką prywatności dla odwiedzających.
 */
export const PRIVATE = import.meta.env.VITE_PRIVATE === '1';
/**
 * Wersja bez serwera (np. GitHub Pages): wszystko działa w przeglądarce,
 * ale bez kont, synchronizacji, powiadomień push i asystenta AI.
 */
export const STATIC = import.meta.env.VITE_STATIC === '1';
export const PRIVACY_TITLE = PRIVATE ? 'Twoje dane' : 'Polityka prywatności';
/** Forma po „w”: „Szczegóły w …”. */
export const PRIVACY_IN = PRIVATE ? 'opisie „Twoje dane”' : 'polityce prywatności';

/** Adres zasobu z katalogu public z uwzględnieniem ścieżki bazowej. */
export function asset(path: string): string {
  return BASE + path.replace(/^\//, '');
}

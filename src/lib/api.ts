import { useEffect, useState } from 'react';
import { API_BASE, STATIC } from '../site';

export class ApiError extends Error {
  constructor(
    public status: number,
    message: string,
    public data?: unknown,
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

export interface ApiStatus {
  ok: boolean;
  /** Czy można teraz założyć konto (w wersji prywatnej tylko dopóki nie ma konta właściciela). */
  accounts: boolean;
  push: boolean;
  ai: boolean;
  aiRequiresAccount: boolean;
  aiDailyLimit: number;
  vapidPublicKey: string | null;
  admin: { name: string; email: string };
  /** Serwer działa w trybie prywatnym (jeden właściciel). */
  private?: boolean;
  /** Włączenie powiadomień wymaga zalogowania. */
  pushRequiresAccount?: boolean;
}

interface RequestOptions {
  method?: 'GET' | 'POST';
  body?: unknown;
  token?: string | null;
  signal?: AbortSignal;
}

/** Zapytanie do API serwisu (pliki PHP w katalogu /api/). */
export async function apiRequest<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const headers: Record<string, string> = { Accept: 'application/json' };
  if (options.body !== undefined) headers['Content-Type'] = 'application/json';
  // Własny nagłówek zamiast „Authorization”: ten zostaje dla hasła na całą stronę (Basic Auth),
  // które przeglądarka wysyła sama, jeśli właściciel je włączył.
  if (options.token) headers['X-Auth-Token'] = options.token;
  let response: Response;
  try {
    response = await fetch(API_BASE + path, {
      method: options.method ?? (options.body !== undefined ? 'POST' : 'GET'),
      headers,
      body: options.body !== undefined ? JSON.stringify(options.body) : undefined,
      signal: options.signal,
      cache: 'no-store',
      // Serwis nie używa ciasteczek. „same-origin” przepuszcza tylko hasło na całą stronę, gdy jest włączone.
      credentials: 'same-origin',
    });
  } catch {
    throw new ApiError(0, 'Brak połączenia z serwerem. Sprawdź internet i spróbuj ponownie.');
  }
  const isJson = (response.headers.get('content-type') ?? '').includes('application/json');
  const data = isJson ? ((await response.json().catch(() => null)) as Record<string, unknown> | null) : null;
  if (!response.ok || data === null) {
    const message =
      (data && typeof data.error === 'string' && data.error) ||
      (response.status === 404 ? 'Ta funkcja nie jest dostępna na tym serwerze.' : `Błąd serwera (${response.status}).`);
    throw new ApiError(response.status, message, data);
  }
  return data as T;
}

let statusPromise: Promise<ApiStatus | null> | null = null;

/** Stan usług serwera. Null oznacza, że API nie działa (np. hosting bez PHP). */
export function fetchStatus(force = false): Promise<ApiStatus | null> {
  // Wersja bez serwera nawet nie pyta o API (na GitHub Pages skończyłoby się błędem 404 w konsoli).
  if (STATIC) return Promise.resolve(null);
  if (!statusPromise || force) {
    statusPromise = apiRequest<ApiStatus>('status.php')
      .then((s) => (s && s.ok ? s : null))
      .catch(() => null);
  }
  return statusPromise;
}

export function useApiStatus(): { status: ApiStatus | null; loading: boolean } {
  const [state, setState] = useState<{ status: ApiStatus | null; loading: boolean }>({ status: null, loading: true });
  useEffect(() => {
    let alive = true;
    void fetchStatus().then((status) => alive && setState({ status, loading: false }));
    return () => {
      alive = false;
    };
  }, []);
  return state;
}

export function dateKey(date = new Date()): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

export function parseKey(key: string): Date {
  const [y, m, d] = key.split('-').map(Number);
  return new Date(y, m - 1, d);
}

export function addDays(key: string, days: number): string {
  const date = parseKey(key);
  date.setDate(date.getDate() + days);
  return dateKey(date);
}

export function lastNDays(n: number): string[] {
  const today = dateKey();
  return Array.from({ length: n }, (_, i) => addDays(today, i - (n - 1)));
}

export function daysBetween(fromKey: string, toKey: string): number {
  const ms = parseKey(toKey).getTime() - parseKey(fromKey).getTime();
  return Math.round(ms / 86_400_000);
}

export function dayOfYear(date = new Date()): number {
  const start = new Date(date.getFullYear(), 0, 0);
  return Math.floor((date.getTime() - start.getTime()) / 86_400_000);
}

/** Liczba kolejnych dni (do dziś lub do wczoraj), w których coś zrobiono. */
export function streak(days: Set<string>): number {
  let key = dateKey();
  if (!days.has(key)) key = addDays(key, -1);
  let count = 0;
  while (days.has(key)) {
    count += 1;
    key = addDays(key, -1);
  }
  return count;
}

const longFormat = new Intl.DateTimeFormat('pl-PL', { weekday: 'long', day: 'numeric', month: 'long' });
const shortFormat = new Intl.DateTimeFormat('pl-PL', { day: 'numeric', month: 'short' });
const weekdayFormat = new Intl.DateTimeFormat('pl-PL', { weekday: 'short' });
const dateTimeFormat = new Intl.DateTimeFormat('pl-PL', {
  day: 'numeric',
  month: 'long',
  year: 'numeric',
  hour: '2-digit',
  minute: '2-digit',
});

export const formatLong = (date: Date) => longFormat.format(date);
export const formatShortKey = (key: string) => shortFormat.format(parseKey(key));
export const formatWeekdayKey = (key: string) => weekdayFormat.format(parseKey(key));
export const formatDateTime = (iso: string) => dateTimeFormat.format(new Date(iso));

/** Polska odmiana liczebników: 1 dzień, 2 dni, 5 dni. */
export function plural(n: number, forms: [string, string, string]): string {
  const abs = Math.abs(n);
  if (abs === 1) return forms[0];
  const mod10 = abs % 10;
  const mod100 = abs % 100;
  if (mod10 >= 2 && mod10 <= 4 && (mod100 < 12 || mod100 > 14)) return forms[1];
  return forms[2];
}

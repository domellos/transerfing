import { CRISIS_PATTERNS } from '../data/navigator';

/** Małe litery, bez polskich znaków diakrytycznych (do wyszukiwania). */
export function normalizePl(text: string): string {
  return text
    .toLocaleLowerCase('pl-PL')
    .replace(/ł/g, 'l')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '');
}

export function slugify(text: string): string {
  return normalizePl(text)
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

function padded(text: string): string {
  return ` ${normalizePl(text).replace(/[^a-z0-9]+/g, ' ').trim()} `;
}

/**
 * Prosta ocena dopasowania opisu sytuacji do słów kluczowych.
 * Całe frazy liczą się bardziej niż pojedyncze słowa, a pierwsze litery
 * dłuższych słów łapią polską odmianę („kłótni”, „kłócimy”).
 */
export function scoreKeywords(query: string, keywords: string[]): number {
  const q = padded(query);
  let score = 0;
  for (const keyword of keywords) {
    const k = normalizePl(keyword).trim();
    if (!k) continue;
    if (q.includes(` ${k}`)) {
      score += k.includes(' ') ? 3 : 2;
      continue;
    }
    if (!k.includes(' ') && k.length >= 5 && q.includes(` ${k.slice(0, 5)}`)) score += 1;
  }
  return score;
}

export function containsCrisis(text: string): boolean {
  const q = padded(text);
  return CRISIS_PATTERNS.some((pattern) => q.includes(pattern));
}

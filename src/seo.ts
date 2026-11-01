import { LESSONS, lessonText } from './data/lessons';
import { MODULE_BY_ID } from './data/modules';
import { PROGRAM_DAYS } from './data/program';
import { AREAS } from './data/areas';
import { SCENARIOS } from './data/scenarios';
import { SITUATIONS } from './data/navigator';
import { TOOLS } from './data/tools';
import { normalizePl } from './lib/match';
import { plainText } from './lib/text';
import { plural } from './lib/date';
import { PRIVACY_TITLE, PRIVATE, SITE_DESCRIPTION, SITE_NAME, SITE_TAGLINE } from './site';

export interface PageMeta {
  path: string;
  title: string;
  description: string;
  type: 'website' | 'article';
}

function clip(text: string, max = 158): string {
  const t = plainText(text).replace(/\s+/g, ' ').trim();
  if (t.length <= max) return t;
  return `${t.slice(0, max - 1).replace(/\s+\S*$/, '')}…`;
}

/** Strony renderowane do HTML w czasie budowania (indeksowane przez wyszukiwarki). */
export function getPrerenderPages(): PageMeta[] {
  return [
    { path: '/', title: `${SITE_NAME}: ${SITE_TAGLINE}`, description: SITE_DESCRIPTION, type: 'website' },
    {
      path: '/wiedza/',
      title: 'Wiedza: lekcje Transerfingu i technik Tafti',
      description: `${LESSONS.length} ${plural(LESSONS.length, ['lekcja', 'lekcje', 'lekcji'])} o zasadach Vadima Zelanda: przestrzeń wariantów, wahadła, ważność, zamiar, slajdy, dusza i umysł, lustro świata, techniki Tafti i wyjście z matrixa.`,
      type: 'website',
    },
    ...LESSONS.map<PageMeta>((l) => ({ path: `/wiedza/${l.slug}/`, title: `${l.title}: ${l.subtitle}`, description: clip(l.summary), type: 'article' })),
    {
      path: '/nawigator/',
      title: 'Nawigator: co mówi Transerfing o twojej sytuacji?',
      description: 'Opisz, co się dzieje, i zobacz, która zasada Transerfingu pasuje do sytuacji, co zrobić od razu i które narzędzie pomoże.',
      type: 'website',
    },
    ...SITUATIONS.map<PageMeta>((s) => ({ path: `/nawigator/${s.id}/`, title: `${s.title}: co radzi Transerfing`, description: clip(s.diagnosis), type: 'article' })),
    {
      path: '/obszary/',
      title: 'Transerfing w obszarach życia: praca, pieniądze, związki, zdrowie, konflikty',
      description: 'Jak stosować zasady Zelanda w pracy, w finansach, w związku, w trosce o zdrowie i w konfliktach. Z planem na 7 dni dla każdego obszaru.',
      type: 'website',
    },
    ...AREAS.map<PageMeta>((a) => ({ path: `/obszary/${a.slug}/`, title: `${a.title}: Transerfing w praktyce`, description: clip(a.intro.join(' ')), type: 'article' })),
    {
      path: '/scenariusze/',
      title: 'Scenariusze: przećwicz zasady Transerfingu',
      description: 'Krótkie sytuacje z życia do przećwiczenia. Wybierz reakcję i zobacz, co według Transerfingu z niej wynika.',
      type: 'website',
    },
    ...SCENARIOS.map<PageMeta>((s) => ({ path: `/scenariusze/${s.id}/`, title: `Scenariusz: ${s.title}`, description: clip(`${s.situation} ${s.question}`), type: 'article' })),
    {
      path: '/program/',
      title: 'Program 8 tygodni: Transerfing krok po kroku',
      description: 'Jedno zadanie dziennie przez 56 dni: od przebudzenia obserwatora, przez wahadła, ważność i cel, po techniki Tafti i wyjście z matrixa.',
      type: 'website',
    },
    ...PROGRAM_DAYS.map<PageMeta>((d) => ({ path: `/program/dzien/${d.day}/`, title: `Dzień ${d.day}: ${d.title} · Program 8 tygodni`, description: clip(d.task), type: 'article' })),
    {
      path: '/praktyka/',
      title: 'Narzędzia do codziennej praktyki Transerfingu',
      description: `${TOOLS.length} ${plural(TOOLS.length, ['narzędzie', 'narzędzia', 'narzędzi'])}: przebudzenie, slajdy, warkocz i kadr, detektor wahadeł, miernik ważności, dziennik snów, tapeta na telefon i więcej.`,
      type: 'website',
    },
    { path: '/wyzwania/', title: 'Wyzwania: nawyki Transerfingu w 7–30 dni', description: 'Serie, które budują nawyki: 7 dni bez narzekania, 21 dni koordynacji, tydzień frajlingu, 30 dni ze slajdem i inne.', type: 'website' },
    {
      path: '/matrix/',
      title: 'Wyjście z matrixa: system technogeniczny według Zelanda',
      description: 'Jak według Vadima Zelanda system technogeniczny przechwytuje uwagę i energię oraz jak żyć w nim jako wolny gracz. Z testem i codziennym detoksem.',
      type: 'article',
    },
    { path: '/slownik/', title: 'Słownik pojęć Transerfingu', description: 'Najważniejsze pojęcia Transerfingu i technik Tafti w jednym miejscu: od wahadeł i ważności po warkocz zamiaru i kadr.', type: 'website' },
    { path: '/quiz/', title: 'Quiz z Transerfingu', description: 'Sprawdź, ile pamiętasz z zasad Transerfingu i technik Tafti. Z wyjaśnieniami i linkami do lekcji.', type: 'website' },
    { path: '/o-projekcie/', title: 'O projekcie i źródła', description: 'Nieoficjalny serwis edukacyjny o Transerfingu Vadima Zelanda. Źródła, książki i zasady korzystania.', type: 'website' },
    PRIVATE
      ? { path: '/prywatnosc/', title: PRIVACY_TITLE, description: 'Gdzie trafiają twoje dane w prywatnej wersji serwisu Transerfing w praktyce: przeglądarka, serwer i usługi zewnętrzne.', type: 'website' }
      : { path: '/prywatnosc/', title: PRIVACY_TITLE, description: 'Jakie dane przetwarza serwis Transerfing w praktyce, po co i jak długo.', type: 'website' },
  ];
}

/** Strony osobiste: dostają pustą powłokę aplikacji z „noindex”. */
export function getShellPaths(): string[] {
  return [
    '/dzis/',
    '/dziennik/',
    '/postep/',
    '/kalendarz/',
    '/laboratorium/',
    '/ustawienia/',
    '/konto/',
    '/asystent/',
    '/fiszki/',
    ...TOOLS.map((t) => `/praktyka/${t.id}/`),
  ];
}

function keywords(text: string, limit = 60): string[] {
  const counts = new Map<string, number>();
  for (const token of normalizePl(text).split(/[^a-z0-9]+/)) {
    if (token.length < 4) continue;
    counts.set(token, (counts.get(token) ?? 0) + 1);
  }
  return [...counts.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, limit)
    .map(([t]) => t);
}

/** Materiały dla asystenta AI (plik api/knowledge.json). */
export function buildKnowledge() {
  return {
    lessons: LESSONS.map((l) => ({
      url: `/wiedza/${l.slug}/`,
      title: l.title,
      module: MODULE_BY_ID[l.module].title,
      summary: plainText(l.summary),
      practice: `${l.practice.title}: ${l.practice.steps.map(plainText).join(' ')}`,
      keywords: keywords(`${l.title} ${l.title} ${l.subtitle} ${lessonText(l)}`),
    })),
    tools: TOOLS.map((t) => ({ url: `/praktyka/${t.id}/`, title: t.title, description: t.description })),
    situations: SITUATIONS.map((s) => ({ url: `/nawigator/${s.id}/`, title: s.title, keywords: s.keywords })),
  };
}

import type { ModuleDef, ModuleId } from '../types';

export const MODULES: ModuleDef[] = [
  {
    id: 'podstawy',
    title: 'Podstawy Transerfingu',
    short: 'Podstawy',
    tagline: 'Jak według Zelanda zbudowana jest rzeczywistość',
    description:
      'Przestrzeń wariantów, linie życia i najważniejsza zmiana perspektywy: od walki o swoje do świadomego wyboru.',
    hue: 220,
    icon: 'compass',
  },
  {
    id: 'wahadla',
    title: 'Wahadła',
    short: 'Wahadła',
    tagline: 'Kto karmi się twoją energią i jak to zatrzymać',
    description:
      'Struktury energetyczno-informacyjne, które żyją z ludzkiej uwagi. Jak je rozpoznać, jak się od nich uwolnić i jak złapać falę powodzenia.',
    hue: 275,
    icon: 'waves',
  },
  {
    id: 'rownowaga',
    title: 'Ważność i równowaga',
    short: 'Równowaga',
    tagline: 'Dlaczego to, na czym najbardziej ci zależy, ucieka',
    description:
      'Ważność wewnętrzna i zewnętrzna, nadmierne potencjały i siły równoważące. Praktyczne sposoby obniżania ważności, także wobec pieniędzy.',
    hue: 190,
    icon: 'scale',
  },
  {
    id: 'zamiar',
    title: 'Zamiar i slajdy',
    short: 'Zamiar',
    tagline: 'Siła, która przesuwa rzeczywistość',
    description:
      'Różnica między pragnieniem a zamiarem, zamiar zewnętrzny, slajdy, wizualizacja procesu, strefa komfortu i energia zamiaru.',
    hue: 40,
    icon: 'target',
  },
  {
    id: 'dusza',
    title: 'Dusza, umysł i twój cel',
    short: 'Dusza',
    tagline: 'Jak odróżnić swój cel od cudzego',
    description:
      'Jedność duszy i umysłu, szelest porannych gwiazd, cele i drzwi oraz pozwolenie na bycie sobą.',
    hue: 330,
    icon: 'heart',
  },
  {
    id: 'lustro',
    title: 'Lustro, nurt i relacje',
    short: 'Lustro',
    tagline: 'Świat odbija twój stosunek do niego',
    description:
      'Dualne lustro, koordynacja zamiaru, nurt wariantów, drogowskazy i frajling, czyli zasada dawania w relacjach.',
    hue: 160,
    icon: 'refresh',
  },
  {
    id: 'tafti',
    title: 'Tafti: przebudzenie w filmie',
    short: 'Tafti',
    tagline: 'Techniki z książek o kapłance Tafti',
    description:
      'Rzeczywistość jako taśma filmowa, dwa ekrany uwagi, przebudzenie, warkocz zamiaru i ustawianie kadrów przyszłości.',
    hue: 12,
    icon: 'clapperboard',
  },
  {
    id: 'matrix',
    title: 'Wyjście z matrixa',
    short: 'Matrix',
    tagline: 'Odzyskaj uwagę, energię i własną drogę',
    description:
      'System technogeniczny według Zelanda: jak przechwytuje uwagę i energię oraz jak żyć w nim jako wolny gracz.',
    hue: 110,
    icon: 'door',
  },
];

export const MODULE_BY_ID = Object.fromEntries(MODULES.map((m) => [m.id, m])) as Record<ModuleId, ModuleDef>;

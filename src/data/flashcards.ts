import type { Flashcard } from '../types';
import { GLOSSARY } from './glossary';
import { slugify } from '../lib/match';

const PRACTICE_CARDS: Flashcard[] = [
  {
    id: 'p-wahadlo-reakcja',
    front: 'Co zrobić, gdy wahadło próbuje cię wciągnąć?',
    back: 'Uznać jego prawo do istnienia, stracić zainteresowanie i nie dostarczać mu energii. Pomaga też nieoczekiwana reakcja, np. życzliwość albo humor.',
    lesson: 'uwalnianie-od-wahadel',
  },
  {
    id: 'p-formula',
    front: 'Jak brzmi formuła przebudzenia Tafti?',
    back: '„Widzę siebie i widzę rzeczywistość.” Wypowiadasz ją, przenosząc uwagę do centrum świadomości.',
    lesson: 'przebudzenie',
  },
  {
    id: 'p-kadr-kroki',
    front: 'Jakie są kroki ustawiania kadru?',
    back: 'Obudź się, poczuj warkocz, zobacz kadr tak, jakby działo się teraz, i puść.',
    lesson: 'ustawianie-kadru',
  },
  {
    id: 'p-waznosc-ruchy',
    front: 'Jakie jest pięć ruchów obniżania ważności?',
    back: 'Zauważ, zaakceptuj najgorszy scenariusz, zabezpiecz się planem B, zamień pragnienie na zamiar, działaj lekko.',
    lesson: 'obnizanie-waznosci',
  },
  {
    id: 'p-koordynacja',
    front: 'Jak brzmi zasada koordynacji zamiaru?',
    back: 'Jeśli pozornie negatywne zdarzenie świadomie uznasz za pozytywne, takie się okaże.',
    lesson: 'koordynacja-zamiaru',
  },
  {
    id: 'p-dusza-nie',
    front: 'Po czym poznać, że dusza mówi „nie”?',
    back: 'Po ciężarze i dyskomforcie, gdy wyobrażasz sobie decyzję jako podjętą. Jeśli musisz się przekonywać, dusza mówi „nie”.',
    lesson: 'szelest-porannych-gwiazd',
  },
  {
    id: 'p-frajling',
    front: 'Na czym polega frajling?',
    back: 'Na porzuceniu zamiaru brania i zastąpieniu go zamiarem dawania: uwagi, uznania i zainteresowania.',
    lesson: 'frajling',
  },
  {
    id: 'p-lustro',
    front: 'Dlaczego nie warto reagować złością na odbicie w lustrze świata?',
    back: 'Bo lustro reaguje z opóźnieniem. Złość na stare odbicie utrwala je na nowo.',
    lesson: 'dualne-lustro',
  },
  {
    id: 'p-cudzy-cel',
    front: 'Po czym rozpoznać cudzy cel?',
    back: 'Po przymusie („muszę”), prestiżu, potrzebie udowadniania, modzie, ciężarze przy myśli o celu i po tym, że jest tylko środkiem do czegoś innego.',
    lesson: 'cudze-cele',
  },
  {
    id: 'p-lejek',
    front: 'Jak chronić się przed lejkiem negatywnych wydarzeń?',
    back: 'Nie wpuszczać negatywnych informacji do swojej warstwy świata: świadomie je ignorować i nie angażować się w nie emocjonalnie.',
    lesson: 'indukowane-przejscie',
  },
  {
    id: 'p-dwa-pozwolenia',
    front: 'Jak brzmi zasada dwóch pozwoleń?',
    back: 'Pozwól sobie być sobą, a innym być innymi.',
    lesson: 'frajl-duszy',
  },
  {
    id: 'p-pieniadze',
    front: 'Czym są pieniądze w Transerfingu?',
    back: 'Atrybutem, który towarzyszy drodze do twojego celu, a nie celem samym w sobie.',
    lesson: 'pieniadze',
  },
  {
    id: 'p-sen',
    front: 'Jak według Tafti obudzić się we śnie?',
    back: 'Tak samo jak na jawie: przenieść uwagę z ekranu do centrum świadomości. Nawyk przebudzeń w ciągu dnia przenosi się na sny.',
    lesson: 'sen-i-jawa',
  },
];

export const FLASHCARDS: Flashcard[] = [
  ...GLOSSARY.map((g) => ({ id: `g-${slugify(g.term)}`, front: g.term, back: g.definition, lesson: g.lesson })),
  ...PRACTICE_CARDS,
];

/** Odstępy powtórek (w dniach) dla kolejnych pudełek systemu Leitnera. */
export const BOX_INTERVALS = [0, 1, 2, 4, 8, 16];
export const MASTERED_BOX = 4;
export const NEW_CARDS_PER_DAY = 10;

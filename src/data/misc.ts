import type { Habit } from '../types';

/** Krótkie myśli dnia — własne sformułowania inspirowane zasadami Transerfingu. */
export const THOUGHTS: string[] = [
  'Nie walczę z rzeczywistością. Wybieram swój wariant.',
  'Bieżący kadr już się zrealizował. Ustawiam następny.',
  'Widzę siebie i widzę rzeczywistość.',
  'Obniżam ważność i działam lekko.',
  'Mój świat troszczy się o mnie.',
  'Wszystko idzie tak, jak trzeba.',
  'Nie muszę tego mieć. Zamierzam to mieć i robię kolejny krok.',
  'Wahadło ma prawo istnieć. Ja mam prawo nie brać udziału.',
  'Daję uwagę i uznanie, zanim o cokolwiek poproszę.',
  'Pozwalam sobie być sobą, a innym być innymi.',
  'Jeśli muszę się przekonywać, moja dusza mówi „nie”.',
  'Moje drzwi otwierają się, gdy idę, a nie gdy stoję.',
  'Nie wpuszczam do swojej warstwy świata cudzych lejków.',
  'Przyjmuję dobre wiadomości i sam/sama je nadaję.',
  'Lustro reaguje z opóźnieniem. Utrzymuję swój obraz.',
  'Płynę z nurtem i wybieram najprostszą drogę.',
  'Moja uwaga należy do mnie.',
  'Każde zdarzenie jest sygnałem: obudź się.',
  'Mój cel daje mi poczucie święta życia.',
  'Nie usprawiedliwiam się. Mam prawo do swoich wyborów.',
  'Puszczam uchwyt. Świat może zrobić to lepiej, niż zaplanowałem/zaplanowałam.',
  'Energia płynie tam, gdzie kieruję uwagę.',
  'Mieszkam w swoim slajdzie i dodaję mu szczegółów.',
  'Nie stoję w kolejce do marzeń. Idę swoją drogą.',
  'Dziś jest lepiej niż wczoraj, a jutro będzie jeszcze lepiej.',
  'Pragnienie zamieniam w spokojną decyzję.',
  'Uśmiecham się do lustra i czekam na odbicie.',
  'Korzystam z technologii, ale to ja nią steruję.',
  'Moja dusza wie, czego chce. Umysł jej słucha.',
  'Ustawiam kadr i puszczam go z lekkością.',
  'Zauważam drogowskazy i wybieram świadomie.',
  'Trudna chwila to też kadr. Następny wybieram ja.',
  'Nie muszę niczego udowadniać.',
  'Jem, oddycham i ruszam się tak, by mieć żywą energię.',
  'Jestem widzem i aktorem jednocześnie.',
];

export function thoughtForDay(dayIndex: number): string {
  return THOUGHTS[((dayIndex % THOUGHTS.length) + THOUGHTS.length) % THOUGHTS.length];
}

export interface Book {
  title: string;
  original: string;
  note: string;
}

export const BOOKS: Book[] = [
  { title: 'Transerfing rzeczywistości, t. I: Przestrzeń wariantów', original: 'Reality Transurfing I: The Space of Variations', note: 'Przestrzeń wariantów, wahadła, fala powodzenia, ważność, nadmierne potencjały, indukowane przejście.' },
  { title: 'Transerfing rzeczywistości, t. II: Szelest porannych gwiazd', original: 'Reality Transurfing II: A Rustle of Morning Stars', note: 'Dusza i umysł, komfort duchowy, cele i drzwi.' },
  { title: 'Transerfing rzeczywistości, t. III: Naprzód w przeszłość', original: 'Reality Transurfing III: Forward to the Past', note: 'Lustro świata, energia i dalsze zasady zarządzania rzeczywistością.' },
  { title: 'Transerfing rzeczywistości, t. IV', original: 'Reality Transurfing IV: Ruler of Reality', note: 'Kontynuacja serii: zamiar zewnętrzny i odpowiedzi na pytania czytelników.' },
  { title: 'Transerfing rzeczywistości, t. V', original: 'Reality Transurfing V: Apples Fall to the Sky', note: 'Zamknięcie podstawowej serii.' },
  { title: 'Praktyczny kurs Transerfingu w 78 dni', original: 'Transurfing in 78 Days', note: 'Zwięzłe omówienie 78 podstawowych zasad i terminów.' },
  { title: 'Kapłanka Tafti (wyd. ang. Tufti the Priestess)', original: 'Tufti the Priestess. Live Stroll Through a Movie Called Life', note: 'Dwa ekrany, przebudzenie, warkocz zamiaru, ustawianie kadrów.' },
  { title: 'Kapłanka Itfat', original: 'Priestess Itfat', note: 'Powieściowa opowieść o Tafti i jej przygodach w metarzeczywistości.' },
  { title: 'Tafti 2: zarządzanie wydarzeniami', original: 'Tufti the Priestess 2: Event Management', note: 'Dalszy rozwój technik Tafti.' },
  { title: 'Hakowanie systemu technogenicznego', original: 'Hacking the Technogenic System', note: 'System technogeniczny, „cyborg”, żywa energia i wyjście z „kolejki”.' },
];

export const DETOX_HABITS: Habit[] = [
  { id: 'poranek-bez-telefonu', label: 'Pierwsze 30 minut dnia bez telefonu', hint: 'Najpierw przebudzenie i kadry, potem świat.' },
  { id: 'bez-negatywnych-wiadomosci', label: 'Bez negatywnych wiadomości i sensacji', hint: 'Ochrona przed lejkami.' },
  { id: 'limit-scrollowania', label: 'Świadomy limit mediów społecznościowych', hint: 'Korzystam, gdy chcę, a nie odruchowo.' },
  { id: 'natura', label: 'Co najmniej 20 minut na łonie natury', hint: 'Żywa energia i odpoczynek dla uwagi.' },
  { id: 'zywy-posilek', label: 'Posiłek z żywej, nieprzetworzonej żywności', hint: 'Świeże warzywa, owoce, zielenina.' },
  { id: 'ruch', label: 'Ruch: spacer, ćwiczenia, taniec', hint: 'Energia ciała to energia zamiaru.' },
  { id: 'cisza', label: 'Chwila ciszy bez bodźców', hint: 'Choćby 5 minut bez ekranu i dźwięków.' },
  { id: 'rozmowa', label: 'Rozmowa twarzą w twarz z bliską osobą', hint: 'Prawdziwy kontakt zamiast wirtualnego.' },
  { id: 'swiadomy-wybor', label: 'Świadomy wybór zamiast odruchu (zakup, klik)', hint: 'Zatrzymaj się: po co to robię?' },
  { id: 'krok-do-celu', label: 'Krok w stronę własnego celu', hint: 'Energia dla twoich drzwi, a nie cudzych.' },
];

export const MATRIX_TEST: string[] = [
  'Pierwsze, co robię po przebudzeniu, to sięgam po telefon.',
  'Czytam lub oglądam wiadomości, które mnie niepokoją, choć nic z nimi nie robię.',
  'Większość dnia reaguję odruchowo, zamiast świadomie wybierać.',
  'Moje cele w dużej mierze pochodzą z oczekiwań innych, mody lub prestiżu.',
  'Jem głównie żywność przetworzoną, często w biegu.',
  'Rzadko bywam na łonie natury.',
  'Czuję, że „muszę” być stale online i na bieżąco.',
  'Kupuję rzeczy pod wpływem impulsu albo reklamy.',
  'Mam mało czasu na ciszę i bycie ze sobą.',
  'Media i dyskusje w sieci łatwo podkręcają moje emocje.',
];

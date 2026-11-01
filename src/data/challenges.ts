import type { DayFacts } from '../lib/stats';
import type { ToolId } from '../types';

export interface ChallengeDef {
  id: string;
  title: string;
  days: number;
  summary: string;
  daily: string;
  lesson?: string;
  tool?: ToolId;
  /** Automatyczne zaliczenie dnia na podstawie wpisów. Bez reguły dzień zaznaczasz sam. */
  auto?: (f: DayFacts) => boolean;
  autoLabel?: string;
}

export const CHALLENGES: ChallengeDef[] = [
  {
    id: 'bez-narzekania-7',
    title: '7 dni bez narzekania',
    days: 7,
    summary: 'Narzekanie to nadawanie wariantu, którego nie chcesz. Przez tydzień zamieniasz je na koordynację zamiaru.',
    daily: 'Gdy złapiesz się na narzekaniu, zatrzymaj się i powiedz: „Wszystko idzie tak, jak trzeba”. Wieczorem zaznacz dzień, jeśli w większości się udało.',
    lesson: 'koordynacja-zamiaru',
    tool: 'koordynacja',
  },
  {
    id: 'koordynacja-21',
    title: '21 dni koordynacji',
    days: 21,
    summary: 'Codziennie jedno pozornie złe zdarzenie świadomie uznajesz za korzystne i sprawdzasz po czasie, jak się potoczyło.',
    daily: 'Zapisz w dzienniku koordynacji jedno zdarzenie dnia i to, jak może ci służyć.',
    lesson: 'koordynacja-zamiaru',
    tool: 'koordynacja',
    auto: (f) => f.koordynacja,
    autoLabel: 'wpis w dzienniku koordynacji',
  },
  {
    id: 'frajling-7',
    title: 'Tydzień frajlingu',
    days: 7,
    summary: 'Przez tydzień codziennie dajesz komuś szczerą uwagę, uznanie albo zainteresowanie, bez oczekiwań.',
    daily: 'Wykonaj co najmniej jeden akt frajlingu i zapisz go w dzienniku.',
    lesson: 'frajling',
    tool: 'frajling',
    auto: (f) => f.frajling,
    autoLabel: 'wpis w dzienniku frajlingu',
  },
  {
    id: 'przebudzenia-14',
    title: '14 dni przebudzeń',
    days: 14,
    summary: 'Budujesz nawyk wracania do centrum świadomości: co najmniej 10 przebudzeń dziennie.',
    daily: 'Obudź się co najmniej 10 razy w ciągu dnia i licz przebudzenia w narzędziu.',
    lesson: 'przebudzenie',
    tool: 'przebudzenie',
    auto: (f) => f.awakenings >= 10,
    autoLabel: 'co najmniej 10 przebudzeń',
  },
  {
    id: 'poranek-bez-telefonu-7',
    title: '7 poranków bez telefonu',
    days: 7,
    summary: 'Pierwsze 30 minut dnia należą do ciebie: przebudzenie i kadry, a dopiero potem świat.',
    daily: 'Nie sięgaj po telefon przez pierwsze 30 minut po przebudzeniu i odhacz to w Detoksie od matrixa.',
    lesson: 'wlasna-uwaga',
    tool: 'detoks',
    auto: (f) => f.detox.includes('poranek-bez-telefonu'),
    autoLabel: 'nawyk „poranek bez telefonu” w Detoksie',
  },
  {
    id: 'slajd-30',
    title: '30 dni ze slajdem',
    days: 30,
    summary: 'Codziennie kilka minut w slajdzie celu, aż nowy wariant stanie się dla ciebie zwyczajny.',
    daily: 'Odtwórz slajd w Studiu slajdów i dodaj do niego jeden nowy szczegół.',
    lesson: 'slajdy',
    tool: 'slajdy',
    auto: (f) => f.slide,
    autoLabel: 'sesja slajdu',
  },
  {
    id: 'kadr-21',
    title: '21 dni ustawiania kadrów',
    days: 21,
    summary: 'Codziennie ustawiasz przynajmniej jeden kadr z warkoczem albo poranne kadry dnia.',
    daily: 'Ustaw kadr w narzędziu Warkocz i kadr albo zapisz poranne ustawienie.',
    lesson: 'ustawianie-kadru',
    tool: 'warkocz',
    auto: (f) => f.frame || f.morning,
    autoLabel: 'ustawiony kadr albo poranne ustawienie',
  },
  {
    id: 'cisza-informacyjna-7',
    title: '7 dni bez złych wiadomości',
    days: 7,
    summary: 'Tydzień ochrony przed lejkami: bez sensacji, katastrof i internetowych kłótni.',
    daily: 'Unikaj negatywnych wiadomości i odhacz to w Detoksie od matrixa.',
    lesson: 'higiena-informacyjna',
    tool: 'detoks',
    auto: (f) => f.detox.includes('bez-negatywnych-wiadomosci'),
    autoLabel: 'nawyk „bez negatywnych wiadomości” w Detoksie',
  },
  {
    id: 'waznosc-7',
    title: 'Tydzień obniżania ważności',
    days: 7,
    summary: 'Codziennie przepuszczasz jedną sprawę, która cię spina, przez pięć ruchów obniżania ważności.',
    daily: 'Przejdź procedurę w Mierniku ważności dla jednej sprawy.',
    lesson: 'obnizanie-waznosci',
    tool: 'waznosc',
    auto: (f) => f.waznosc,
    autoLabel: 'wpis w Mierniku ważności',
  },
  {
    id: 'wieczory-14',
    title: '14 wieczornych przeglądów',
    days: 14,
    summary: 'Dwa tygodnie uczciwej obserwacji dnia: dobre wiadomości, wahadła, ważność i kadr na jutro.',
    daily: 'Zrób Wieczorny przegląd przed snem.',
    lesson: 'fala-powodzenia',
    tool: 'wieczor',
    auto: (f) => f.evening,
    autoLabel: 'wieczorny przegląd',
  },
  {
    id: 'sny-14',
    title: '14 dni dziennika snów',
    days: 14,
    summary: 'Dwa tygodnie zapisywania snów zaraz po przebudzeniu. Pamięć snów szybko się poprawia.',
    daily: 'Rano zapisz w Dzienniku snów wszystko, co pamiętasz, choćby fragment.',
    lesson: 'sen-i-jawa',
    tool: 'sny',
    auto: (f) => f.dream,
    autoLabel: 'wpis w Dzienniku snów',
  },
];

export const CHALLENGE_BY_ID: Record<string, ChallengeDef> = Object.fromEntries(CHALLENGES.map((c) => [c.id, c]));

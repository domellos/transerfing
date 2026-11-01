import type { JournalConfig, JournalType, ToolDef, ToolGroup, ToolId } from '../types';

export const TOOL_GROUPS: { id: ToolGroup; title: string; description: string }[] = [
  { id: 'rytualy', title: 'Codzienne rytuały', description: 'Poranne ustawienie, przebudzenia w ciągu dnia i wieczorny przegląd.' },
  { id: 'energia', title: 'Energia i wahadła', description: 'Odzyskiwanie energii, obniżanie ważności i ochrona przed matrixem.' },
  { id: 'kreowanie', title: 'Kreowanie rzeczywistości', description: 'Twój cel, slajdy i ustawianie kadrów przyszłości.' },
  { id: 'relacje', title: 'Lustro, relacje i znaki', description: 'Koordynacja zamiaru, frajling i drogowskazy.' },
];

export const TOOLS: ToolDef[] = [
  { id: 'poranek', title: 'Poranne ustawienie', short: 'Kadry i zamiar na dziś', description: 'Dwie minuty po przebudzeniu: jak chcesz się czuć, 1–3 kadry dnia i zamiar.', icon: 'sunrise', group: 'rytualy', lesson: 'rozswietlanie-dnia', time: '2–5 min' },
  { id: 'przebudzenie', title: 'Przebudzenie', short: 'Licznik, dzwonek i push', description: 'Licz przebudzenia, ustaw kotwice i włącz przypomnienia: w karcie albo jako powiadomienia push przy zamkniętej stronie.', icon: 'eye', group: 'rytualy', lesson: 'przebudzenie', time: 'cały dzień' },
  { id: 'wieczor', title: 'Wieczorny przegląd', short: 'Podsumowanie dnia', description: 'Wahadła, ważność, odbicia lustra, wdzięczność i kadr na jutro.', icon: 'moon', group: 'rytualy', lesson: 'fala-powodzenia', time: '5–10 min' },
  { id: 'sny', title: 'Dziennik snów', short: 'Sen i jawa', description: 'Zapisuj sny zaraz po przebudzeniu i notuj chwile, gdy wiesz, że śnisz.', icon: 'bed', group: 'rytualy', lesson: 'sen-i-jawa', time: '3 min' },
  { id: 'wahadla', title: 'Detektor wahadeł', short: 'Rozpoznaj i uwolnij się', description: 'Oceń siłę haczyka w konkretnej sytuacji i wybierz strategię uwolnienia.', icon: 'waves', group: 'energia', lesson: 'uwalnianie-od-wahadel', time: '3 min' },
  { id: 'waznosc', title: 'Miernik ważności', short: 'Pięć ruchów obniżania', description: 'Zmierz ważność przed i po procedurze: zauważ, zaakceptuj, zabezpiecz, zamień, działaj.', icon: 'scale', group: 'energia', lesson: 'obnizanie-waznosci', time: '5 min' },
  { id: 'detoks', title: 'Detoks od matrixa', short: 'Nawyki wolnego gracza', description: 'Codzienne nawyki odzyskiwania uwagi i energii z serią dni i historią.', icon: 'phoneOff', group: 'energia', lesson: 'wlasna-uwaga', time: 'codziennie' },
  { id: 'energia', title: 'Centralne strumienie', short: 'Prowadzone ćwiczenie energii', description: 'Pięciominutowe ćwiczenie strumienia wstępującego i zstępującego z minutnikiem.', icon: 'zap', group: 'energia', lesson: 'energia-zamiaru', time: '5 min' },
  { id: 'cele', title: 'Cele i drzwi', short: 'Znajdź swój cel', description: 'Burza pragnień, test duszy i wybór drzwi dla celu, który świeci najjaśniej.', icon: 'target', group: 'kreowanie', lesson: 'cele-i-drzwi', time: '15–30 min' },
  { id: 'slajdy', title: 'Studio slajdów', short: 'Twórz i odtwarzaj slajdy', description: 'Zbuduj slajd celu, dodaj zdjęcia i odtwarzaj go w prowadzonej sesji wizualizacji z lektorem.', icon: 'image', group: 'kreowanie', lesson: 'slajdy', time: '3–10 min' },
  { id: 'wizje', title: 'Tablica wizji', short: 'Zdjęcia twoich celów', description: 'Wszystkie zdjęcia ze slajdów w jednym miejscu i pokaz na pełnym ekranie.', icon: 'images', group: 'kreowanie', lesson: 'slajdy', time: '2–5 min' },
  { id: 'warkocz', title: 'Warkocz i kadr', short: 'Technika Tafti', description: 'Prowadzone ustawianie kadru: przebudzenie, warkocz, kadr, puszczenie. Z galerią zrealizowanych kadrów.', icon: 'wand', group: 'kreowanie', lesson: 'ustawianie-kadru', time: '1–2 min' },
  { id: 'tapeta', title: 'Tapeta na telefon', short: 'Kotwica na ekranie', description: 'Stwórz tapetę z deklaracją, kadrem albo formułą przebudzenia. Każde spojrzenie na telefon przypomni ci o przebudzeniu.', icon: 'smartphone', group: 'kreowanie', lesson: 'przebudzenie', time: '2 min' },
  { id: 'koordynacja', title: 'Dziennik koordynacji', short: 'Wszystko idzie tak, jak trzeba', description: 'Zamieniaj potknięcia w korzyści i sprawdzaj po czasie, jak się potoczyły.', icon: 'refresh', group: 'relacje', lesson: 'koordynacja-zamiaru', time: '2 min' },
  { id: 'frajling', title: 'Dziennik frajlingu', short: 'Zamiar dawania', description: 'Zapisuj akty szczerej uwagi i uznania oraz to, co z nich wynikło.', icon: 'heartHandshake', group: 'relacje', lesson: 'frajling', time: '2 min' },
  { id: 'drogowskazy', title: 'Dziennik drogowskazów', short: 'Znaki i ich skutki', description: 'Notuj sygnały „coś jest inaczej” i sprawdzaj, które okazały się trafne.', icon: 'signpost', group: 'relacje', lesson: 'drogowskazy', time: '2 min' },
];

export const TOOL_BY_ID = Object.fromEntries(TOOLS.map((t) => [t.id, t])) as Record<ToolId, ToolDef>;

export const JOURNALS: Partial<Record<ToolId, JournalConfig>> = {
  poranek: {
    type: 'poranek',
    tool: 'poranek',
    title: 'Poranne ustawienie',
    intro:
      'Zanim sięgniesz po telefon: obudź się („widzę siebie i widzę rzeczywistość”), poczuj warkocz i ustaw kadry dnia. Wystarczą dwie minuty.',
    fields: [
      { key: 'stan', label: 'Jak chcę się dziś czuć?', placeholder: 'np. spokojnie, lekko, z ciekawością', rows: 2, suggestions: ['Spokojnie i lekko', 'Z ciekawością i radością', 'Pewnie i bez pośpiechu'] },
      { key: 'kadry', label: 'Kadry dnia (1–3 sceny w czasie teraźniejszym)', placeholder: 'np. Spotkanie przebiega życzliwie i kończy się porozumieniem.', rows: 4 },
      { key: 'zamiar', label: 'Mój zamiar na dziś: co robię dla swojego celu?', placeholder: 'np. Wysyłam ofertę i dzwonię do Anny.', rows: 2 },
      { key: 'deklaracja', label: 'Deklaracja dnia', rows: 1, suggestions: ['Mój świat troszczy się o mnie.', 'Wszystko idzie tak, jak trzeba.', 'Dziś czekają mnie dobre wiadomości.'] },
    ],
    lesson: 'rozswietlanie-dnia',
    saveLabel: 'Zapisz poranne ustawienie',
  },
  wieczor: {
    type: 'wieczor',
    tool: 'wieczor',
    title: 'Wieczorny przegląd',
    intro: 'Kilka minut uczciwej obserwacji dnia, bez oceniania się. Zauważasz, wyciągasz wnioski i ustawiasz kadr na jutro.',
    fields: [
      { key: 'dobre', label: 'Trzy dobre wiadomości dnia', placeholder: '1. …\n2. …\n3. …', rows: 3 },
      { key: 'wahadla', label: 'Gdzie złapało mnie dziś wahadło?', placeholder: 'Sytuacja, emocja, jak zareagowałem/zareagowałam', rows: 2 },
      { key: 'waznosc', label: 'Gdzie podniosłem/podniosłam ważność i co z nią zrobiłem/zrobiłam?', rows: 2 },
      { key: 'lustro', label: 'Co dobrego odbiło dziś lustro? Które kadry się zrealizowały?', rows: 2 },
      { key: 'wdziecznosc', label: 'Za co dziękuję?', rows: 2 },
      { key: 'jutro', label: 'Kadr na jutro', placeholder: 'Jedna scena w czasie teraźniejszym', rows: 2 },
    ],
    rating: { label: 'Jak oceniam ten dzień?', low: 'ciężki', high: 'świetny' },
    lesson: 'fala-powodzenia',
    saveLabel: 'Zapisz przegląd dnia',
  },
  koordynacja: {
    type: 'koordynacja',
    tool: 'koordynacja',
    title: 'Dziennik koordynacji',
    intro:
      'Coś poszło nie tak? Zanim się zdenerwujesz, zapisz to tutaj i świadomie uznaj, że to ci służy. Po kilku dniach wróć i dopisz, jak się potoczyło.',
    fields: [
      { key: 'zdarzenie', label: 'Co się wydarzyło (pozornie negatywnego)?', rows: 2 },
      { key: 'korzysc', label: 'Jak to może mi służyć? Jakie korzyści mogą się w tym kryć?', rows: 3 },
      { key: 'deklaracja', label: 'Moja deklaracja koordynacji', rows: 1, suggestions: ['Wszystko idzie tak, jak trzeba.', 'To mi służy, nawet jeśli jeszcze nie wiem jak.', 'Wybieram dalszy ciąg, w którym to okazuje się korzystne.'] },
      { key: 'skutek', label: 'Jak to się potoczyło? (uzupełnij później)', rows: 2 },
    ],
    lesson: 'koordynacja-zamiaru',
    saveLabel: 'Zapisz koordynację',
  },
  frajling: {
    type: 'frajling',
    tool: 'frajling',
    title: 'Dziennik frajlingu',
    intro: 'Zapisz, komu i co dziś dałeś/dałaś: szczerą uwagę, uznanie, zainteresowanie albo pomoc. Bez oczekiwań.',
    fields: [
      { key: 'komu', label: 'Komu?', rows: 1 },
      { key: 'co', label: 'Co dałem/dałam?', placeholder: 'np. wysłuchałem bez przerywania, doceniłam jej pomysł', rows: 2 },
      { key: 'reakcja', label: 'Jak zareagowała druga osoba?', rows: 2 },
      { key: 'odczucie', label: 'Co poczułem/poczułam?', rows: 2 },
    ],
    tags: ['uwaga', 'uznanie', 'zainteresowanie', 'pomoc', 'akceptacja'],
    lesson: 'frajling',
    saveLabel: 'Zapisz akt frajlingu',
  },
  drogowskazy: {
    type: 'drogowskazy',
    tool: 'drogowskazy',
    title: 'Dziennik drogowskazów',
    intro: 'Zapisuj zdarzenia, którym towarzyszyło odczucie „coś jest inaczej”. Z czasem zobaczysz, które sygnały są u ciebie trafne.',
    fields: [
      { key: 'znak', label: 'Jaki znak zauważyłem/zauważyłam?', rows: 2 },
      { key: 'odczucie', label: 'Co poczułem/poczułam (komfort czy dyskomfort duszy)?', rows: 2 },
      { key: 'decyzja', label: 'Jaką decyzję podjąłem/podjęłam?', rows: 2 },
      { key: 'skutek', label: 'Jaki był skutek? (uzupełnij później)', rows: 2 },
    ],
    tags: ['ostrzegawczy', 'potwierdzający', 'zmiana nastroju'],
    lesson: 'drogowskazy',
    saveLabel: 'Zapisz drogowskaz',
  },
  sny: {
    type: 'sen',
    tool: 'sny',
    title: 'Dziennik snów',
    intro:
      'Zapisz sen od razu po przebudzeniu, zanim zniknie. Wystarczy fragment. Z czasem sny stają się wyraźniejsze, a ty łatwiej zauważasz, że śnisz.',
    fields: [
      { key: 'sen', label: 'Co mi się śniło?', placeholder: 'Miejsca, osoby, wydarzenia, nawet urywki', rows: 5 },
      { key: 'emocje', label: 'Jakie emocje towarzyszyły snowi?', rows: 2 },
      { key: 'motywy', label: 'Powtarzające się motywy, miejsca, osoby', rows: 2 },
      {
        key: 'intencja',
        label: 'Moja intencja na następną noc',
        rows: 1,
        suggestions: ['Dziś obudzę się we śnie i zobaczę siebie.', 'We śnie zapytam: gdzie jest moja uwaga?'],
      },
    ],
    rating: { label: 'Na ile byłem/byłam świadomy/świadoma we śnie?', low: 'wcale', high: 'w pełni' },
    tags: ['świadomy sen', 'koszmar', 'powtarzający się', 'zwykły'],
    lesson: 'sen-i-jawa',
    saveLabel: 'Zapisz sen',
  },
};

/** Opis oceny w liście wpisów, zależnie od rodzaju dziennika. */
export const RATING_LABELS: Partial<Record<JournalType, string>> = {
  wieczor: 'Ocena dnia',
  sen: 'Świadomość we śnie',
  tydzien: 'Ocena tygodnia',
};

export const WEEKLY_FIELDS: { key: string; label: string; placeholder?: string }[] = [
  { key: 'dzialalo', label: 'Co działało w tym tygodniu?', placeholder: 'Praktyki, reakcje, decyzje, które przyniosły lekkość' },
  { key: 'trudne', label: 'Co było trudne? Gdzie łapały mnie wahadła?' },
  { key: 'zmieniam', label: 'Co zmieniam w przyszłym tygodniu?' },
  { key: 'kadr', label: 'Kadr na przyszły tydzień', placeholder: 'Jedna scena w czasie teraźniejszym' },
];

export const JOURNAL_LABELS: Record<JournalType, string> = {
  poranek: 'Poranne ustawienie',
  wieczor: 'Wieczorny przegląd',
  koordynacja: 'Koordynacja',
  drogowskazy: 'Drogowskaz',
  frajling: 'Frajling',
  wahadlo: 'Wahadło',
  waznosc: 'Ważność',
  sen: 'Sen',
  tydzien: 'Przegląd tygodnia',
  notatka: 'Notatka',
};

/** Etykiety pól wpisów dla wszystkich typów dziennika. */
export const FIELD_LABELS: Record<JournalType, Record<string, string>> = {
  poranek: Object.fromEntries(JOURNALS.poranek!.fields.map((f) => [f.key, f.label])),
  wieczor: Object.fromEntries(JOURNALS.wieczor!.fields.map((f) => [f.key, f.label])),
  koordynacja: Object.fromEntries(JOURNALS.koordynacja!.fields.map((f) => [f.key, f.label])),
  drogowskazy: Object.fromEntries(JOURNALS.drogowskazy!.fields.map((f) => [f.key, f.label])),
  frajling: Object.fromEntries(JOURNALS.frajling!.fields.map((f) => [f.key, f.label])),
  sen: Object.fromEntries(JOURNALS.sny!.fields.map((f) => [f.key, f.label])),
  tydzien: { week: 'Tydzień od', ...Object.fromEntries(WEEKLY_FIELDS.map((f) => [f.key, f.label])) },
  wahadlo: {
    sytuacja: 'Sytuacja',
    haczyki: 'Rozpoznane haczyki',
    strategia: 'Wybrana strategia',
    plan: 'Co konkretnie zrobię',
    wynik: 'Wynik',
  },
  waznosc: {
    sprawa: 'Sprawa',
    rodzaj: 'Rodzaj ważności',
    emocje: 'Emocje',
    najgorsze: 'Najgorszy scenariusz i akceptacja',
    planB: 'Plan B',
    zamiar: 'Zamiar zamiast pragnienia',
    krok: 'Lekki krok',
  },
  notatka: { tekst: 'Notatka' },
};

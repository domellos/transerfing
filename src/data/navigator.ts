import type { Situation, SituationCategory } from '../types';

export const SITUATION_CATEGORIES: { id: SituationCategory; title: string }[] = [
  { id: 'emocje', title: 'Emocje i stres' },
  { id: 'relacje', title: 'Ludzie i relacje' },
  { id: 'cele', title: 'Cele i decyzje' },
  { id: 'praca', title: 'Praca i pieniądze' },
  { id: 'energia', title: 'Energia i uwaga' },
];

export const SITUATIONS: Situation[] = [
  {
    id: 'stres-przed-wydarzeniem',
    title: 'Stresuję się przed ważnym wydarzeniem',
    category: 'emocje',
    keywords: ['stres', 'boje sie', 'strach', 'egzamin', 'rozmowa kwalifikacyjna', 'wystapienie', 'prezentacja', 'trema', 'denerwuje sie', 'wazne spotkanie', 'nerwy'],
    diagnosis:
      'Napięcie rośnie, bo sprawa ma dla ciebie ogromną ważność. Według Transerfingu nadmierna ważność tworzy potencjał, który siły równoważące wyrównują, często przez błędy właśnie w kluczowym momencie.',
    steps: [
      'Nazwij to: „Nadaję temu zbyt dużą ważność”. Rozluźnij barki i zrób trzy wolne oddechy.',
      'Zaakceptuj najgorszy scenariusz i ustal plan B. Wynik przestaje być sprawą życia i śmierci.',
      'Ustaw krótki kadr: zobacz, jak wydarzenie przebiega spokojnie, i poczuj przy tym warkocz.',
      'Idź i zrób swoje. Zamiast walczyć o wynik, wykonaj kolejny krok.',
    ],
    phrase: 'Nie muszę. Zamierzam i robię swoje.',
    lessons: ['obnizanie-waznosci', 'waznosc', 'ustawianie-kadru'],
    tools: ['waznosc', 'warkocz'],
  },
  {
    id: 'cos-poszlo-nie-tak',
    title: 'Coś poszło nie tak',
    category: 'emocje',
    keywords: ['pech', 'nie wyszlo', 'spoznilem', 'spoznilam', 'autobus', 'porazka', 'zepsulo sie', 'odmowa', 'odrzucili', 'wpadka', 'nie udalo sie'],
    diagnosis:
      'Zdarzenie już się zrealizowało, to bieżący kadr. Wpływ masz na reakcję, a ta według Zelanda wybiera dalszy ciąg: złość prowadzi na linię kolejnych potknięć, spokojne uznanie prowadzi gdzie indziej.',
    steps: [
      'Powiedz w myślach: „Ten kadr już się zrealizował”.',
      'Zastosuj koordynację zamiaru: „Wszystko idzie tak, jak trzeba. To mi w czymś służy”.',
      'Zapytaj, jaki następny kadr wybierasz, i zrób pierwszy mały krok w jego stronę.',
      'Zapisz zdarzenie w dzienniku koordynacji, a po kilku dniach sprawdź, jak się potoczyło.',
    ],
    phrase: 'Wszystko idzie tak, jak trzeba.',
    lessons: ['koordynacja-zamiaru', 'rzeczywistosc-jako-film'],
    tools: ['koordynacja'],
  },
  {
    id: 'pasmo-niepowodzen',
    title: 'Mam pasmo niepowodzeń',
    category: 'emocje',
    keywords: ['nic nie wychodzi', 'pasmo', 'seria', 'wszystko sie sypie', 'zly okres', 'pech za pechem', 'czarna seria', 'nic mi nie wychodzi'],
    diagnosis:
      'Seria porażek to w Transerfingu znak, że jesteś na niesprzyjającej linii życia. Często podtrzymuje ją twoja reakcja: każde potknięcie budzi rozczarowanie, które dostraja cię do kolejnych.',
    steps: [
      'Przestań nadawać pecha: nie opowiadaj o nim wszystkim i nie szukaj potwierdzeń.',
      'Odetnij negatywne informacje na kilka dni, żeby nie wpaść w lejek.',
      'Codziennie wieczorem zapisuj trzy dobre wiadomości, nawet drobne.',
      'Rób małe rzeczy, które się udają. Fala powodzenia zaczyna się od drobnych sukcesów.',
    ],
    lessons: ['linie-zycia', 'fala-powodzenia', 'indukowane-przejscie'],
    tools: ['wieczor', 'detoks'],
  },
  {
    id: 'konflikt-prowokacja',
    title: 'Ktoś mnie prowokuje albo się kłócimy',
    category: 'relacje',
    keywords: ['klotnia', 'konflikt', 'prowokacja', 'wkurza', 'zlosc', 'awantura', 'sprzeczka', 'krytyka', 'obraza', 'klocimy', 'klocimy sie'],
    diagnosis:
      'Konflikt to klasyczne wahadło: żywi się emocjami obu stron. Im mocniej reagujesz, tym silniej się kołysze. Wygrywasz, kiedy przestajesz dostarczać mu energii.',
    steps: [
      'Obudź się: „Widzę siebie i widzę rzeczywistość”. Zauważ, że jesteś w rytmie wahadła.',
      'Nie odpowiadaj od razu. Odczekaj trzy oddechy.',
      'Odpowiedz nieoczekiwanie: spokojnie, życzliwie albo z lekkim humorem, bez sarkazmu.',
      'Jeśli rozmowa nie ma sensu, wyjdź z niej bez walki.',
    ],
    phrase: 'Masz prawo tak myśleć. Ja nie biorę w tym udziału.',
    lessons: ['uwalnianie-od-wahadel', 'haczyki-wahadel', 'frajling'],
    tools: ['wahadla'],
  },
  {
    id: 'poczucie-winy',
    title: 'Ktoś wzbudza we mnie poczucie winy',
    category: 'relacje',
    keywords: ['wina', 'poczucie winy', 'manipulacja', 'wyrzuty', 'powinienem', 'powinnam', 'zawiodlem', 'zawiodlam', 'szantaz', 'wypomina'],
    diagnosis:
      'Poczucie winy to nadmierny potencjał, a manipulatorzy chętnie z niego korzystają. Działa tylko wtedy, gdy przyjmujesz rolę oskarżonego i zaczynasz się tłumaczyć.',
    steps: [
      'Zauważ moment, w którym masz ochotę się usprawiedliwiać.',
      'Zamiast tłumaczeń powiedz krótko i spokojnie: „Rozumiem, że tak to widzisz”.',
      'Jeśli naprawdę coś zawaliłeś/zawaliłaś, napraw to i przeproś raz, bez noszenia kamienia winy.',
      'Przypomnij sobie zasadę dwóch pozwoleń: masz prawo być sobą.',
    ],
    lessons: ['poczucie-winy', 'frajl-duszy'],
    tools: ['waznosc'],
  },
  {
    id: 'bardzo-pragne',
    title: 'Bardzo czegoś pragnę, a to się oddala',
    category: 'cele',
    keywords: ['pragne', 'zalezy mi', 'obsesja', 'ucieka', 'oddala sie', 'nie moge przestac myslec', 'bardzo chce', 'desperacko', 'marzenie'],
    diagnosis:
      'Silne pragnienie to poczucie braku i napięcie, czyli nadmierny potencjał. Siły równoważące go wyrównują, a cel jakby się wymyka. Zamiar działa inaczej: to spokojna decyzja połączona z działaniem.',
    steps: [
      'Przepisz pragnienie na zamiar: „Nie muszę tego mieć. Zamierzam to mieć i robię…”.',
      'Obniż ważność: zaakceptuj, że może się nie udać, i przygotuj plan B.',
      'Stwórz slajd celu i odtwarzaj go krótko, bez poczucia braku.',
      'Zrób jeden spokojny krok dziennie i puść resztę.',
    ],
    lessons: ['pragnienie-a-zamiar', 'nadmierne-potencjaly', 'slajdy'],
    tools: ['slajdy', 'waznosc'],
  },
  {
    id: 'nie-wiem-czego-chce',
    title: 'Nie wiem, czego naprawdę chcę',
    category: 'cele',
    keywords: ['nie wiem czego chce', 'brak celu', 'sens zycia', 'pasja', 'powolanie', 'zagubiony', 'zagubiona', 'co robic w zyciu', 'kierunek'],
    diagnosis:
      'Cel często zagłuszają standardy i oczekiwania innych. Według Zelanda twój cel rozpoznasz po poczuciu święta życia, a drogę do niego, czyli twoje drzwi, po natchnieniu, jakie w tobie budzi.',
    steps: [
      'Zrób burzę pragnień: przez 10 minut wypisuj wszystko, czego chcesz, bez cenzury.',
      'Przy każdym pragnieniu sprawdź komfort duszy: lekkość czy ciężar?',
      'Odrzuć cele, w których coś komuś udowadniasz albo gonisz prestiż.',
      'Wybierz jeden kierunek i sprawdź go małym krokiem w tym tygodniu.',
    ],
    lessons: ['cele-i-drzwi', 'cudze-cele', 'szelest-porannych-gwiazd'],
    tools: ['cele'],
  },
  {
    id: 'zmuszam-sie',
    title: 'Muszę się do czegoś codziennie zmuszać',
    category: 'cele',
    keywords: ['zmuszam sie', 'nie chce mi sie', 'praca mnie meczy', 'przymus', 'musze', 'wypalenie', 'nienawidze', 'meczy mnie'],
    diagnosis:
      'Jeśli ciągle musisz się do czegoś przekonywać, dusza mówi „nie”. Może to być cudzy cel narzucony przez wahadło: prestiż, oczekiwania rodziny albo „tak wypada”.',
    steps: [
      'Zapisz, czyje oczekiwania spełniasz, robiąc tę rzecz.',
      'Sprawdź, jaka prawdziwa potrzeba może się kryć pod tym celem, np. bezpieczeństwo albo swoboda.',
      'Nie rób rewolucji z dnia na dzień. Zacznij od jednego kroku w stronę własnych drzwi.',
      'Zrób test komfortu duchowego dla dwóch możliwych zmian.',
    ],
    lessons: ['cudze-cele', 'dusza-i-umysl', 'szelest-porannych-gwiazd'],
    tools: ['cele'],
  },
  {
    id: 'trudna-decyzja',
    title: 'Stoję przed trudną decyzją',
    category: 'cele',
    keywords: ['decyzja', 'wybor', 'nie wiem co wybrac', 'dylemat', 'zmiana pracy', 'przeprowadzka', 'rozstanie', 'czy powinienem', 'czy powinnam'],
    diagnosis:
      'Umysł zwykle przegaduje duszę argumentami. Transerfing proponuje sprawdzić cichy sygnał duszy: komfort albo dyskomfort, gdy wyobrażasz sobie każdą opcję jako już wybraną.',
    steps: [
      'Zapisz argumenty umysłu za i przeciw każdej opcji.',
      'Wyobraź sobie, że wybrałeś/wybrałaś pierwszą opcję. Przez 30 sekund oceń lekkość albo ciężar. Powtórz dla drugiej.',
      'Odróżnij lęk przed zmianą od ciężaru wobec samego celu.',
      'Przez kilka dni obserwuj drogowskazy, zanim zdecydujesz.',
    ],
    lessons: ['szelest-porannych-gwiazd', 'dusza-i-umysl', 'drogowskazy'],
    tools: ['cele', 'drogowskazy'],
  },
  {
    id: 'cel-stoi',
    title: 'Pracuję nad celem, a nic się nie zmienia',
    category: 'cele',
    keywords: ['nic sie nie zmienia', 'cel stoi', 'brak efektow', 'nie dziala', 'czekam', 'bez rezultatow', 'zastoj', 'stoje w miejscu'],
    diagnosis:
      'Lustro świata reaguje z opóźnieniem. Jeśli w okresie przejściowym denerwujesz się starym odbiciem, utrwalasz je. Bywa też, że cel leży poza strefą komfortu i podświadomie go odpychasz.',
    steps: [
      'Utrzymaj nowy obraz, choć dowody jeszcze nie przyszły. Nie reaguj na stare odbicie.',
      'Przejdź na wizualizację procesu: zobacz, jak dobrze przebiega bieżący etap.',
      'Zrób przymiarkę do celu: odwiedź miejsce albo porozmawiaj z kimś, kto już tam jest.',
      'Sprawdź, czy nie płyniesz pod prąd. Czy jest prostsza droga?',
    ],
    lessons: ['dualne-lustro', 'wizualizacja-procesu', 'strefa-komfortu'],
    tools: ['slajdy', 'warkocz'],
  },
  {
    id: 'okazja-strach',
    title: 'Pojawiła się okazja, ale czuję, że to nie dla mnie',
    category: 'cele',
    keywords: ['okazja', 'propozycja', 'oferta', 'za dobre', 'nie dla mnie', 'nie zasluguje', 'boje sie sukcesu', 'awans'],
    diagnosis:
      'To znak strefy komfortu: umysł uważa coś za „zbyt dobre” albo „nie dla takich jak ja”. Według Zelanda, dopóki w głębi nie pozwolisz sobie mieć, sam blokujesz zamiar zewnętrzny.',
    steps: [
      'Zapytaj siebie: czego dokładnie się boję, drogi czy samego celu?',
      'Powiedz: „Pozwalam sobie to mieć”. Zauważ, gdzie w ciele pojawia się opór.',
      'Zrób najmniejszy możliwy krok w stronę okazji, zamiast decydować o wszystkim naraz.',
      'Odtwarzaj slajd, w którym ta sytuacja jest już zwyczajna.',
    ],
    lessons: ['strefa-komfortu', 'wybieraj-nie-walcz', 'slajdy'],
    tools: ['slajdy'],
  },
  {
    id: 'pieniadze-martwie',
    title: 'Martwię się o pieniądze',
    category: 'praca',
    keywords: ['pieniadze', 'finanse', 'dlugi', 'kredyt', 'nie starcza', 'bieda', 'oszczednosci', 'wyplata', 'rachunki', 'kasa'],
    diagnosis:
      'Pieniądze to potężne wahadło. Zamartwianie się nimi podnosi ważność zewnętrzną i nadaje dokładnie ten wariant, którego się boisz. W Transerfingu pieniądze są atrybutem drogi do celu, a nie celem samym w sobie.',
    steps: [
      'Oddziel fakty od lęku: zapisz konkretne liczby i jeden praktyczny krok na ten tydzień.',
      'Obniż ważność: jaki jest najgorszy scenariusz i jak byś go przetrwał/przetrwała?',
      'Sprawdź swoje przekonania o pieniądzach. Które z nich są cudzymi slajdami?',
      'Zrób dziś coś dla swojego celu, a nie tylko dla zarabiania. Przy długach skorzystaj też z pomocy specjalisty.',
    ],
    lessons: ['pieniadze', 'waznosc', 'cele-i-drzwi'],
    tools: ['waznosc', 'cele'],
  },
  {
    id: 'praca-trudna',
    title: 'Mam trudną sytuację w pracy',
    category: 'praca',
    keywords: ['szef', 'praca', 'zespol', 'firma', 'korporacja', 'wspolpracownik', 'nadgodziny', 'krytyka w pracy', 'przelozony'],
    diagnosis:
      'Firma to wahadło, które chce twojej energii i lojalności. Napięcie rośnie, gdy praca staje się sprawą życia i śmierci albo gdy walczysz z systemem zamiast świadomie w nim uczestniczyć.',
    steps: [
      'Uczestnicz świadomie: wykonuj swoją rolę dobrze, ale bez fanatyzmu i lęku.',
      'Nie wchodź w plotki i konflikty. To lejki, które zabierają energię.',
      'Przed trudną rozmową ustaw kadr jej spokojnego przebiegu i daj komuś szczere uznanie.',
      'Jeśli doświadczasz mobbingu albo łamania twoich praw, szukaj wsparcia: dział kadr, Państwowa Inspekcja Pracy, prawnik.',
    ],
    lessons: ['wahadla', 'uwalnianie-od-wahadel', 'frajling'],
    tools: ['wahadla', 'frajling'],
  },
  {
    id: 'zalezy-mi-na-kims',
    title: 'Bardzo zależy mi na drugiej osobie',
    category: 'relacje',
    keywords: ['zwiazek', 'milosc', 'zakochany', 'zakochana', 'partner', 'partnerka', 'nie odpisuje', 'randka', 'byly', 'byla', 'zazdrosc'],
    diagnosis:
      'Idealizacja i silne przywiązanie to nadmierne potencjały. Druga osoba wyczuwa napięcie i zamiar brania, więc często się dystansuje. Frajling odwraca kierunek: zaczynasz od dawania, bez oczekiwań.',
    steps: [
      'Zauważ, czego oczekujesz od tej osoby, i obniż ważność tych oczekiwań.',
      'Dawaj szczerą uwagę i zainteresowanie bez rachunku „dałem, więc teraz ty”.',
      'Pozwól drugiej osobie być sobą i sobie być sobą.',
      'Zajmij się własnym celem. Człowiek, który żyje swoim życiem, przyciąga naturalnie.',
    ],
    lessons: ['frajling', 'nadmierne-potencjaly', 'frajl-duszy'],
    tools: ['frajling'],
  },
  {
    id: 'porownuje-sie',
    title: 'Porównuję się z innymi i czuję się gorzej',
    category: 'emocje',
    keywords: ['porownuje sie', 'zazdroszcze', 'gorszy', 'gorsza', 'kompleksy', 'inni maja lepiej', 'social media', 'instagram', 'nie jestem wystarczajacy'],
    diagnosis:
      'Porównywanie się ze standardami narzuconymi przez wahadła to ważność wewnętrzna i niezadowolenie z siebie. Według Zelanda twoja siła leży w niepowtarzalności, a nie w dorównaniu wzorcowi.',
    steps: [
      'Zauważ, kto ustala standard, z którym się porównujesz.',
      'Ogranicz źródła porównań, np. przewijanie zdjęć cudzych sukcesów.',
      'Zapisz trzy rzeczy, które są w tobie niepowtarzalne.',
      'Zrób dziś coś, co lubisz, nawet jeśli „nie wypada”.',
    ],
    lessons: ['frajl-duszy', 'waznosc', 'slajdy'],
    tools: ['detoks'],
  },
  {
    id: 'zle-wiadomosci',
    title: 'Złe wiadomości nie dają mi spokoju',
    category: 'energia',
    keywords: ['wiadomosci', 'media', 'wojna', 'kryzys', 'polityka', 'newsy', 'katastrofa', 'niepokoj', 'panika'],
    diagnosis:
      'To indukowane przejście: wahadło skupia uwagę wielu osób na problemie i wciąga je w lejek. Im więcej o tym myślisz i mówisz, tym bardziej problem staje się częścią twojej warstwy świata.',
    steps: [
      'Ustal jedną porę na wiadomości z rzetelnego źródła zamiast śledzenia ich przez cały dzień.',
      'Nie czytaj komentarzy i nie podsycaj rozmów o katastrofach.',
      'Zapytaj: czy mogę coś realnie zrobić? Jeśli tak, zrób jeden konkretny krok. Jeśli nie, odpuść.',
      'Wróć uwagą do swojego dnia: przebudzenie i jeden kadr na najbliższą godzinę.',
    ],
    lessons: ['indukowane-przejscie', 'higiena-informacyjna'],
    tools: ['detoks', 'przebudzenie'],
  },
  {
    id: 'telefon',
    title: 'Spędzam za dużo czasu w telefonie',
    category: 'energia',
    keywords: ['telefon', 'scroll', 'przewijanie', 'tiktok', 'facebook', 'instagram', 'uzaleznienie', 'ekran', 'powiadomienia', 'rolki'],
    diagnosis:
      'Telefon to idealna maszyna do snu na jawie: uwaga zanurza się w ekranie zewnętrznym i należy do kogoś innego. System technogeniczny zarabia na twojej uwadze, a ty tracisz energię.',
    steps: [
      'Wyłącz wszystkie zbędne powiadomienia.',
      'Zanim sięgniesz po telefon, obudź się i zapytaj: „Po co to robię?”.',
      'Pierwsze 30 minut dnia spędź bez telefonu.',
      'Ustal miejsca bez ekranu, np. sypialnię i posiłki.',
    ],
    lessons: ['wlasna-uwaga', 'dwa-ekrany', 'system-technogeniczny'],
    tools: ['detoks', 'przebudzenie'],
  },
  {
    id: 'brak-energii',
    title: 'Brakuje mi energii',
    category: 'energia',
    keywords: ['zmeczenie', 'zmeczony', 'zmeczona', 'brak energii', 'nie mam sily', 'wyczerpany', 'wyczerpana', 'senny', 'ospaly'],
    diagnosis:
      'W Transerfingu energię najczęściej tracimy na wewnętrzne napięcia: ważność, zamartwianie się i walkę z wahadłami. Zeland wiąże też siłę zamiaru ze stanem ciała: ruchem, jedzeniem, powietrzem i naturą.',
    steps: [
      'Sprawdź, na co dziś poszła energia: którzy ludzie, tematy i ekrany ją zabrały?',
      'Zrób 5-minutowe ćwiczenie centralnych strumieni energii.',
      'Wyjdź na co najmniej 20 minut na zewnątrz, najlepiej wśród zieleni.',
      'Jeśli zmęczenie trwa długo, porozmawiaj z lekarzem. Może mieć przyczyny zdrowotne.',
    ],
    lessons: ['energia-zamiaru', 'zywa-energia', 'waznosc'],
    tools: ['energia', 'detoks'],
  },
  {
    id: 'zyje-automatycznie',
    title: 'Czuję, że żyję jak automat',
    category: 'energia',
    keywords: ['automat', 'rutyna', 'schemat', 'dzien swistaka', 'matrix', 'bez sensu', 'odruchowo', 'wszystko takie samo', 'nuda'],
    diagnosis:
      'Tafti nazwałaby to snem na jawie: uwaga przeskakuje między ekranem zewnętrznym a wewnętrznym, a scenariusz prowadzi cię bez twojego udziału. Śpiący nie wybiera, tylko odgrywa rolę.',
    steps: [
      'Ustaw trzy kotwice przebudzenia i obudź się dziś co najmniej 10 razy.',
      'Zrób spacer z obserwacją ekranów: gdzie jest teraz twoja uwaga?',
      'Rano ustaw jeden kadr dnia, który jest twój, a nie systemu.',
      'Zrób dziś jedną rzecz inaczej niż zwykle.',
    ],
    lessons: ['przebudzenie', 'dwa-ekrany', 'system-technogeniczny'],
    tools: ['przebudzenie', 'poranek'],
  },
  {
    id: 'chce-przyciagnac',
    title: 'Chcę przyciągnąć konkretne wydarzenie',
    category: 'cele',
    keywords: ['przyciagnac', 'manifestowac', 'manifestacja', 'wizualizacja', 'spelnic marzenie', 'chce zeby', 'wydarzenie', 'kadr'],
    diagnosis:
      'W technikach Tafti przyszłe wydarzenia ustawia się z centrum zamiaru zewnętrznego: budzisz się, czujesz warkocz i widzisz kadr tak, jakby działo się teraz. Potem puszczasz i działasz.',
    steps: [
      'Zapisz jedną scenę w czasie teraźniejszym, która opisuje to, co ma być.',
      'Obudź się, poczuj warkocz i ustaw kadr przez kilkanaście sekund.',
      'Powtarzaj kilka razy dziennie, krótko i lekko.',
      'Rób swoje kroki i nie sprawdzaj nerwowo, czy już działa.',
    ],
    lessons: ['ustawianie-kadru', 'warkocz-zamiaru', 'slajdy'],
    tools: ['warkocz', 'slajdy'],
  },
];

export const SITUATION_BY_ID: Record<string, Situation> = Object.fromEntries(SITUATIONS.map((s) => [s.id, s]));

/** Fragmenty wypowiedzi, przy których zamiast porad pokazujemy kontakty pomocowe. */
export const CRISIS_PATTERNS = [
  'samobojstw',
  'samobojcz',
  'zabic sie',
  'zabije sie',
  'nie chce zyc',
  'nie chce juz zyc',
  'odebrac sobie zycie',
  'skonczyc ze soba',
  'skrzywdzic sie',
  'samookalecz',
  'tne sie',
  'ciac sie',
  'przemoc',
  'bije mnie',
  'boje sie o zycie',
  'grozi mi',
];

import type { Lesson } from '../../types';

const SOURCE = 'Tafti the Priestess (Kapłanka Tafti) i dalsze książki o Tafti';

export const tafti: Lesson[] = [
  {
    slug: 'rzeczywistosc-jako-film',
    module: 'tafti',
    title: 'Rzeczywistość jako film',
    subtitle: 'Kadr, taśma i dlaczego nie warto walczyć z bieżącą chwilą',
    summary:
      'W książkach o Tafti rzeczywistość istnieje tylko przez jedną chwilę, jak kadr na taśmie filmowej, która przesuwa się z przeszłości w przyszłość. Bieżącego kadru nie da się zmienić, bo już się zrealizował. Można za to wybrać taśmę i kierunek ruchu, czyli ustawiać kolejne kadry.',
    sections: [
      {
        heading: 'Kadr po kadrze',
        body: [
          'Tafti, kapłanka ze starożytnego Egiptu i narratorka książek, tłumaczy, że życie przypomina film. Każda chwila to kadr, a kadry następują po sobie zgodnie ze scenariuszem. Na oficjalnej stronie Zelanda czytamy, że rzeczywistość istnieje tylko „teraz i raz”, jak kadr przesuwający się po taśmie.',
        ],
      },
      {
        heading: 'Pułapka bieżącego kadru',
        body: [
          'Większość ludzi próbuje zmieniać rzeczywistość w bieżącym kadrze: denerwuje się na to, co już jest, walczy z faktami, analizuje bez końca. Tymczasem bieżący kadr jest już nagrany. Gdy uwaga utknie w teraźniejszości, człowiek paradoksalnie tkwi w przeszłości, a scenariusz niesie go po taśmie, której nie wybierał.',
        ],
        bullets: [
          'Bieżący kadr: przyjmij go takim, jaki jest.',
          'Przyszłe kadry: tu masz wpływ.',
          'Wybór taśmy to wybór kierunku, w którym przesuwa się kadr.',
        ],
      },
      {
        heading: 'Jak to się łączy z Transerfingiem',
        body: [
          'Model filmowy to nowy język dla znanych idei. Przestrzeń wariantów to archiwum taśm, linie życia to taśmy, a zamiar zewnętrzny to zdolność przesuwania kadru na wybraną taśmę. Techniki Tafti dodają do tego bardzo praktyczne narzędzia: [[przebudzenie|przebudzenie]] i [[ustawianie-kadru|ustawianie kadru]] za pomocą [[warkocz-zamiaru|warkocza]].',
        ],
      },
    ],
    practice: {
      title: 'Przyjmij kadr, ustaw następny',
      steps: [
        'Gdy coś cię dziś zdenerwuje, powiedz w myślach: „Ten kadr już się zrealizował”.',
        'Zamiast z nim walczyć, zapytaj: „Jaki następny kadr wybieram?”.',
        'Wyobraź sobie krótko ten następny kadr i działaj w jego kierunku.',
      ],
    },
    mistakes: [
      'Rozumienie akceptacji jako rezygnacji. Przyjmujesz to, co jest, i od razu ustawiasz to, co ma być.',
      'Ustawianie kadrów w złości na bieżący kadr. Najpierw spokój, potem wybór.',
    ],
    questions: [
      'Z jakim bieżącym kadrem najczęściej walczę?',
      'Jaki kadr chcę zobaczyć jutro?',
    ],
    related: ['dwa-ekrany', 'ustawianie-kadru', 'przestrzen-wariantow'],
    source: SOURCE,
  },
  {
    slug: 'dwa-ekrany',
    module: 'tafti',
    title: 'Dwa ekrany i sen na jawie',
    subtitle: 'Gdzie jest teraz twoja uwaga?',
    summary:
      'Tafti mówi, że mamy dwa ekrany: zewnętrzny (to, co dzieje się wokół) i wewnętrzny (myśli, wyobrażenia, przeżycia). Gdy uwaga całkowicie zanurza się w którymś z nich, człowiek śpi: działa odruchowo, a scenariusz prowadzi go bez jego udziału.',
    sections: [
      {
        heading: 'Ekran zewnętrzny',
        body: [
          'To wszystko, co przyciąga uwagę z zewnątrz: rozmowy, wydarzenia, ekrany telefonów, bodźce. Gdy całkowicie się w nich zanurzasz, reagujesz automatycznie, jak postać w filmie, która nie wie, że jest w filmie.',
        ],
      },
      {
        heading: 'Ekran wewnętrzny',
        body: [
          'To strumień myśli, wspomnień, zmartwień i fantazji. Kto odpływa w myśli, też śpi, tyle że w innym kinie. Tafti zauważa, że ludzie nauczyli się chronić przed światem ucieczką do ekranu wewnętrznego, a uwaga przyzwyczaiła się skakać z jednego ekranu na drugi i nigdy nie odpoczywać pośrodku.',
        ],
      },
      {
        heading: 'Środek między ekranami',
        body: [
          'Rozwiązaniem nie jest zamknięcie oczu na świat ani wyłączenie myśli. Uwaga potrzebuje punktu obserwacyjnego, czyli centrum świadomości, z którego widać oba ekrany naraz. Z tego miejsca widzisz, gdzie jest twoja uwaga i na czym się skupia. Więcej w lekcji [[przebudzenie|Przebudzenie]].',
        ],
      },
    ],
    practice: {
      title: 'Spacer z obserwacją ekranów',
      steps: [
        'Wyjdź na 15-minutowy spacer.',
        'Co jakiś czas pytaj: „W którym ekranie jestem teraz, w zewnętrznym czy w wewnętrznym?”.',
        'Za każdym razem przenieś uwagę do środka: widzisz otoczenie i jednocześnie siebie w nim.',
        'Policz, ile razy udało ci się obudzić.',
      ],
      tip: 'Tafti proponuje ćwiczyć w miejscach, gdzie nikt cię nie zna, np. podczas spaceru po centrum handlowym.',
    },
    mistakes: [
      'Próba utrzymania uwagi w centrum bez przerwy. To męczy i zniechęca. Wystarczy często wracać.',
      'Ocenianie się za „zasypianie”. Zauważenie snu to już przebudzenie.',
    ],
    questions: ['W którym ekranie spędzam najwięcej czasu?', 'Co najczęściej wciąga mnie w sen na jawie?'],
    related: ['przebudzenie', 'rzeczywistosc-jako-film', 'wlasna-uwaga'],
    tool: 'przebudzenie',
    source: SOURCE,
  },
  {
    slug: 'przebudzenie',
    module: 'tafti',
    title: 'Przebudzenie',
    subtitle: 'Widzę siebie i widzę rzeczywistość',
    summary:
      'Przebudzić się to przenieść uwagę z ekranów do centrum świadomości, punktu obserwacji, z którego widzisz zarówno siebie, jak i to, co się dzieje. Tafti proponuje prostą formułę: „Widzę siebie i widzę rzeczywistość”. Celem jest nawyk częstego wracania do tego stanu.',
    sections: [
      {
        heading: 'Formuła przebudzenia',
        body: [
          'W chwili przebudzenia mówisz sobie w myślach **„Widzę siebie i widzę rzeczywistość”** i naprawdę to robisz: zauważasz swoje ciało, postawę i emocje, a jednocześnie otoczenie. Przestajesz być postacią porwaną przez fabułę. Jesteś jak widz, który zszedł z ekranu na salę kinową. Dalej grasz swoją rolę, ale świadomie.',
        ],
      },
      {
        heading: 'Nawyk zamiast wysiłku',
        body: [
          'Tafti podkreśla, że nie trzeba trzymać uwagi w centrum bez przerwy. Uwaga i tak będzie uciekać, więc chodzi o nowy nawyk wracania. Szczególnie ważne są chwile, gdy coś się wydarza. Wtedy najłatwiej zasnąć, więc właśnie wtedy warto się budzić.',
        ],
        bullets: [
          'Każde zdarzenie potraktuj jak sygnał: „obudź się”.',
          'Zanim coś powiesz albo zrobisz, przenieś uwagę do centrum.',
          'Ustal kotwice: drzwi, telefon, lustro, czekanie w kolejce.',
        ],
      },
      {
        heading: 'Co daje przebudzenie',
        body: [
          'Przebudzony człowiek nie reaguje odruchowo, więc wahadła tracą nad nim władzę. Widzi więcej możliwości, mówi i działa spokojniej. Przede wszystkim jednak tylko w stanie przebudzenia można świadomie [[ustawianie-kadru|ustawiać kolejne kadry]]. Śpiący nie wybiera, tylko odgrywa scenariusz.',
        ],
      },
    ],
    practice: {
      title: 'Dziesięć przebudzeń',
      steps: [
        'Wybierz trzy kotwice (np. otwieranie drzwi, sięganie po telefon, picie wody).',
        'Przy każdej kotwicy obudź się: „Widzę siebie i widzę rzeczywistość”.',
        'Licz przebudzenia w narzędziu Przebudzenie. Celem jest co najmniej 10 dziennie.',
        'Możesz włączyć dzwonek przypominający co 30–60 minut.',
      ],
    },
    mistakes: [
      'Zamienienie przebudzenia w kolejny obowiązek do rozliczenia. To ma być lekka gra.',
      'Wypowiadanie formuły bez rzeczywistego zauważenia siebie i otoczenia.',
    ],
    questions: ['W jakich sytuacjach najłatwiej zasypiam?', 'Co się zmienia, gdy jestem przebudzony/przebudzona?'],
    related: ['dwa-ekrany', 'warkocz-zamiaru', 'wlasna-uwaga'],
    tool: 'przebudzenie',
    source: SOURCE,
  },
  {
    slug: 'warkocz-zamiaru',
    module: 'tafti',
    title: 'Warkocz zamiaru',
    subtitle: 'Centrum zamiaru zewnętrznego',
    summary:
      'Tafti mówi o niewidzialnym warkoczu energii, który każdy ma na plecach. Nie zwisa prosto, tylko odstaje od kręgosłupa pod kątem. Jego koniec znajduje się mniej więcej między łopatkami, trochę od pleców. Właśnie tam leży centrum zamiaru zewnętrznego.',
    sections: [
      {
        heading: 'Dwa centra zamiaru',
        body: [
          'Tak jak uwaga ma dwa ekrany, zamiar ma dwa centra. Centrum wewnętrzne, w przedniej części głowy, odpowiada za zwykłe działania w bieżącym kadrze. Centrum zewnętrzne znajduje się na końcu warkocza i odpowiada za ruch przyszłego kadru. Według Tafti większość ludzi w ogóle z niego nie korzysta.',
        ],
      },
      {
        heading: 'Jak poczuć warkocz',
        bullets: [
          'Warkocza nie widać, ale można go poczuć. Tafti porównuje to do kończyny fantomowej.',
          'Przenieś uwagę na plecy, w okolicę między łopatkami, trochę od kręgosłupa.',
          'Dokładne miejsce znajdziesz intuicyjnie. Odległość nie ma znaczenia.',
          'Wiele osób czuje to jako mrowienie, ciepło albo wrażenie, że coś unosi się pod kątem.',
        ],
      },
      {
        heading: 'Nie spinaj się',
        body: [
          'Warkocza nie aktywuje się wysiłkiem mięśni. Wystarczy uwaga i lekkie wyobrażenie. Jeśli na początku nic nie czujesz, po prostu kieruj tam uwagę przez kilka dni. Wrażenie zwykle pojawia się samo.',
        ],
      },
    ],
    practice: {
      title: 'Pięć dotknięć warkocza',
      steps: [
        'Pięć razy w ciągu dnia przenieś uwagę na warkocz na kilka sekund.',
        'Poczuj, jak odstaje od pleców pod kątem.',
        'Zapisz, jakie odczucia się pojawiają.',
        'Gdy poczujesz warkocz wyraźnie, przejdź do lekcji [[ustawianie-kadru|Ustawianie kadru]].',
      ],
    },
    mistakes: [
      'Szukanie fizycznych dowodów na istnienie warkocza zamiast praktyki.',
      'Napinanie ramion i pleców podczas skupiania się.',
    ],
    questions: [
      'Co czuję, gdy kieruję uwagę na warkocz?',
      'Kiedy działam z centrum wewnętrznego, a kiedy z zewnętrznego?',
    ],
    related: ['ustawianie-kadru', 'zamiar-zewnetrzny', 'przebudzenie'],
    tool: 'warkocz',
    source: SOURCE,
  },
  {
    slug: 'ustawianie-kadru',
    module: 'tafti',
    title: 'Ustawianie kadru',
    subtitle: 'Technika Tafti krok po kroku',
    summary:
      'Ustawianie kadru to główna technika Tafti. Budzisz się, aktywujesz warkocz i trzymając uwagę na jego końcu, wyobrażasz sobie wydarzenie, które chcesz wprowadzić do swojego życia. W ten sposób rozświetlasz przyszły kadr. Potem puszczasz i wracasz do życia.',
    sections: [
      {
        heading: 'Cztery kroki',
        bullets: [
          '**Obudź się**: „Widzę siebie i widzę rzeczywistość”.',
          '**Aktywuj warkocz**: przenieś uwagę na plecy i poczuj warkocz odstający pod kątem.',
          '**Ustaw kadr**: nie tracąc uczucia warkocza, zobacz obraz wydarzenia tak, jakby działo się teraz. Możesz powiedzieć go w myślach słowami i dodać przyjemne odczucia.',
          '**Puść**: uwaga wraca do centrum, a ty do swoich zajęć. Nie czekaj nerwowo na wynik.',
        ],
      },
      {
        heading: 'Jak formułować kadr',
        bullets: [
          'Krótko i konkretnie: jedna scena, a nie cała biografia.',
          'W czasie teraźniejszym, jakby się działo: „Odbieram telefon z dobrą wiadomością”.',
          'Z odczuciem: spokojna radość, oczywistość.',
          'To, co **ma być**, a nie to, czego **nie chcesz**.',
        ],
      },
      {
        heading: 'Częstotliwość i lekkość',
        body: [
          'Kadr ustawia się krótko, ale regularnie: kilka razy dziennie, przez kilka dni lub tygodni, aż się zrealizuje. Ważna jest lekkość. Im mniej ważności i napięcia, tym lepiej. Ustawiaj zarówno duże cele, jak i drobne kadry dnia, np. spokojną rozmowę albo udane spotkanie.',
        ],
      },
    ],
    practice: {
      title: 'Pierwsze ustawienie',
      steps: [
        'Zapisz w narzędziu Warkocz i kadr jedną scenę, którą chcesz zobaczyć w swoim życiu.',
        'Uruchom prowadzoną sesję: przebudzenie, warkocz, kadr, puszczenie.',
        'Powtarzaj 3 razy dziennie przez tydzień.',
        'Gdy kadr się zrealizuje, oznacz go. Galeria zrealizowanych kadrów to najlepszy motywator.',
      ],
    },
    mistakes: [
      'Ustawianie kadru z napięciem i presją na wynik.',
      'Wizualizowanie z głowy i z wysiłkiem, czyli z centrum wewnętrznego, zamiast z warkocza.',
      'Formułowanie kadru jako walki z bieżącą sytuacją.',
    ],
    questions: ['Jaki kadr ustawiam jako pierwszy?', 'Jakie drobne kadry mogę ustawić jutro?'],
    related: ['warkocz-zamiaru', 'rozswietlanie-dnia', 'slajdy'],
    tool: 'warkocz',
    source: SOURCE,
  },
  {
    slug: 'rozswietlanie-dnia',
    module: 'tafti',
    title: 'Rozświetlanie dnia',
    subtitle: 'Ustawiaj kadry na najbliższe godziny',
    summary:
      'Techniki Tafti najlepiej sprawdzają się w codzienności. Rano możesz ustawić kilka kadrów na nadchodzący dzień, a przed ważnymi momentami krótki kadr na najbliższą sytuację. Tak przestajesz odgrywać dzień i zaczynasz go współtworzyć.',
    sections: [
      {
        heading: 'Poranne ustawienie',
        body: [
          'Zaraz po przebudzeniu, zanim sięgniesz po telefon, obudź się w środku („widzę siebie i widzę rzeczywistość”), aktywuj warkocz i ustaw 1–3 kadry dnia: jak przebiega ważne spotkanie, jak się czujesz wieczorem, jaka dobra wiadomość przychodzi. Zajmuje to dwie minuty.',
        ],
      },
      {
        heading: 'Kadry przed wydarzeniami',
        bullets: [
          'Przed rozmową: kadr spokojnej, życzliwej wymiany zdań.',
          'Przed wyjazdem: kadr płynnej podróży.',
          'Przed zadaniem: kadr satysfakcji z dobrze wykonanej pracy.',
          'W trudnej chwili: kadr wyjścia z sytuacji, nawet jeśli nie wiesz jeszcze, jak to się stanie.',
        ],
      },
      {
        heading: 'Wieczorne podsumowanie',
        body: [
          'Wieczorem sprawdź, które kadry się zrealizowały, w całości albo częściowo. To trenuje uważność i pokazuje, że masz wpływ. Ustaw też jeden kadr na jutro.',
        ],
      },
    ],
    practice: {
      title: 'Dzień ustawiony z góry',
      steps: [
        'Rano zapisz w Porannym ustawieniu 1–3 kadry dnia.',
        'Ustaw je, korzystając z warkocza.',
        'Przed każdym ważnym wydarzeniem ustaw krótki kadr (30 sekund).',
        'Wieczorem w Wieczornym przeglądzie sprawdź, co się zrealizowało.',
      ],
    },
    mistakes: [
      'Planowanie każdej minuty i kontrolowanie przebiegu. Kadr to kierunek, a nie scenariusz kontroli.',
      'Pomijanie przebudzenia przed ustawieniem kadru.',
    ],
    questions: ['Jakie trzy kadry ustawiam na jutro?', 'Który kadr dnia zrealizował się dziś najlepiej?'],
    related: ['ustawianie-kadru', 'przebudzenie', 'wizualizacja-procesu'],
    tool: 'poranek',
    source: SOURCE,
  },
  {
    slug: 'sen-i-jawa',
    module: 'tafti',
    title: 'Sen i jawa',
    subtitle: 'Dwa filmy i jedna technika przebudzenia',
    summary:
      'Tafti opisuje dwie warstwy rzeczywistości, które zna każdy: świat fizyczny i przestrzeń snów. Według niej w obu „śpimy”, gdy uwaga zanurza się w ekranie, i w obu można się obudzić tą samą metodą: przenosząc uwagę do centrum świadomości. Nawyk przebudzeń na jawie przygotowuje do świadomych snów.',
    sections: [
      {
        heading: 'Dwie warstwy rzeczywistości',
        body: [
          'We wstępie do książki o Tafti, opublikowanym na stronie autora, kapłanka mówi, że znamy dwie warstwy: rzeczywistość fizyczną, w której żyjemy, i przestrzeń snów, którą oglądamy co noc. Przestrzeń snów nie jest według niej wytworem wyobraźni, tylko czymś w rodzaju archiwum filmów.',
          'Podobnie patrzy na sny Transerfing. W modelu Zelanda sen to nie zwykła fantazja: we śnie można oglądać warianty z [[przestrzen-wariantow|przestrzeni wariantów]], które nie zrealizowały się w świecie materialnym.',
        ],
      },
      {
        heading: 'Śpimy także za dnia',
        body: [
          'Tafti wskazuje podobieństwa snu i jawy. W obu stanach śpisz, gdy uwaga jest całkowicie pochłonięta jednym z [[dwa-ekrany|ekranów]] i działasz odruchowo. W obu rzeczywistość przesuwa się jak kadr na taśmie. W obu ruch kadru można kontrolować, jeśli się obudzisz.',
        ],
        bullets: [
          'Sen to stan, w którym uwaga tonie w ekranie zewnętrznym albo wewnętrznym.',
          'Przebudzenie to przeniesienie uwagi do centrum świadomości, tak samo na jawie i we śnie.',
          'Kto nauczy się budzić w ciągu dnia, ma większą szansę obudzić się także we śnie.',
        ],
      },
      {
        heading: 'Od przebudzeń na jawie do świadomych snów',
        body: [
          'Najprostsza droga do świadomego snu prowadzi przez codzienność. Jeśli często pytasz siebie „gdzie jest teraz moja uwaga?” i odpowiadasz formułą „Widzę siebie i widzę rzeczywistość”, to pytanie zaczyna pojawiać się także w snach.',
        ],
        bullets: [
          '**Przed snem** ustal intencję: „Dziś obudzę się we śnie i zobaczę siebie”.',
          '**Zaraz po przebudzeniu** zapisz sen, nawet fragment. Pamięć snów szybko się poprawia.',
          '**W ciągu dnia** rób [[przebudzenie|przebudzenia]] i spacery „przez sen na jawie”, które proponuje Tafti.',
          '**We śnie** spróbuj tej samej formuły co na jawie. Tafti proponuje też eksperyment: zapytaj postać ze snu, kim jest, i obserwuj, co się stanie.',
        ],
      },
      {
        heading: 'Zdrowy rozsądek',
        body: [
          'Sen służy przede wszystkim odpoczynkowi. Nie budź się co chwilę budzikiem i nie skracaj snu w pogoni za świadomymi snami. Przy uporczywej bezsenności, koszmarach albo paraliżu sennym porozmawiaj z lekarzem. Sny warto obserwować, ale ważnych decyzji nie opieraj wyłącznie na nich.',
        ],
      },
    ],
    practice: {
      title: 'Tydzień ze snami',
      steps: [
        'Każdego ranka od razu zapisz w Dzienniku snów wszystko, co pamiętasz.',
        'W ciągu dnia obudź się co najmniej 10 razy: „Widzę siebie i widzę rzeczywistość”.',
        'Przed snem powiedz sobie spokojnie: „Dziś obudzę się we śnie i zobaczę siebie”.',
        'Po tygodniu przejrzyj wpisy. Czy sny są wyraźniejsze? Czy choć raz zorientowałeś/zorientowałaś się, że śnisz?',
      ],
      tip: 'Licz się z tym, że pierwsze efekty pojawiają się po kilku tygodniach. Liczy się regularność, nie wysiłek.',
    },
    mistakes: [
      'Wymuszanie świadomych snów kosztem snu. Odpoczynek jest ważniejszy.',
      'Traktowanie każdego snu jak przepowiedni. Zapisuj i obserwuj, ale decyzje podejmuj na jawie.',
    ],
    questions: [
      'Co najczęściej mi się śni i jakie emocje towarzyszą snom?',
      'Czy zdarzyło mi się wiedzieć, że śnię? Co wtedy czułem/czułam?',
    ],
    related: ['dwa-ekrany', 'przebudzenie', 'przestrzen-wariantow'],
    tool: 'sny',
    source: 'Tafti the Priestess (wstęp na zelands.com) oraz Transerfing rzeczywistości, t. I',
  },
];

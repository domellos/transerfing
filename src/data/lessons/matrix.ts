import type { Lesson } from '../../types';

export const matrix: Lesson[] = [
  {
    slug: 'system-technogeniczny',
    module: 'matrix',
    title: 'System technogeniczny',
    subtitle: 'Czym jest „matrix” w ujęciu Zelanda',
    summary:
      'Zeland opisuje współczesną cywilizację jako system technogeniczny, czyli strukturę, która rozwija się dla siebie, a nie dla ludzi. Jej modelowy mieszkaniec to „cyborg”: zawsze podłączony, przebodźcowany, odżywiany przetworzoną żywnością i posłuszny zasadzie „skoro wszyscy tak robią, to dobrze”.',
    sections: [
      {
        heading: 'Jak działa system',
        body: [
          'System technogeniczny to w gruncie rzeczy wielkie wahadło złożone z mniejszych: technologii, rynku, mediów i konsumpcji. W książce o „hakowaniu” systemu Zeland stawia tezę, że postęp techniczny służy przede wszystkim samemu systemowi. Ludzie stopniowo tracą zdolności, które nie są mu potrzebne: samodzielne myślenie, kontakt z naturą, żywą energię.',
        ],
      },
      {
        heading: 'Portret „cyborga”',
        bullets: [
          'Żyje w wirtualnych światach i ma coraz mniej prawdziwych relacji.',
          'Ma umysł zamglony nadmiarem informacji.',
          'Je głównie przetworzoną, „martwą” żywność.',
          'Reaguje na bodźce jak na komendy: klik, zakup, udostępnienie.',
          'Nie szuka własnej drogi, bo ktoś mu ją wskazuje.',
        ],
      },
      {
        heading: 'Co znaczy „wyjść z matrixa”',
        body: [
          'Wyjście z matrixa nie oznacza ucieczki do lasu ani walki z cywilizacją. Walka to przecież karmienie wahadła. Oznacza odzyskanie trzech rzeczy: **uwagi** (budzisz się i sam/sama decydujesz, na co patrzysz), **energii** (dbasz o ciało i chronisz się przed informacyjnym śmietnikiem) oraz **własnej drogi** (idziesz do swojego celu przez swoje drzwi, a nie w kolejce za tłumem). Możesz korzystać z technologii, ale to ty nią sterujesz.',
        ],
      },
    ],
    practice: {
      title: 'Mapa twoich połączeń',
      steps: [
        'Zapisz, z czym jesteś połączony/połączona w ciągu dnia: aplikacje, media, nawyki zakupowe.',
        'Przy każdym elemencie zaznacz, czy używasz go świadomie, czy odruchowo.',
        'Wybierz jeden odruch, który w tym tygodniu zamienisz na świadomy wybór.',
      ],
      tip: 'Zrób test „Ile matrixa jest w twoim dniu?” w sekcji Wyjście z matrixa.',
    },
    mistakes: [
      'Demonizowanie technologii i ludzi, którzy z niej korzystają.',
      'Zamiana jednego wahadła na drugie, np. na fanatyczną walkę z systemem.',
    ],
    questions: [
      'W których obszarach życia działam jak „cyborg”?',
      'Co bym odzyskał/odzyskała, gdybym odłączył/odłączyła się od jednego odruchu?',
    ],
    related: ['wlasna-uwaga', 'wahadla', 'poza-kolejka'],
    tool: 'detoks',
    source: 'Hacking the Technogenic System (wyd. ang.)',
  },
  {
    slug: 'wlasna-uwaga',
    module: 'matrix',
    title: 'Odzyskaj swoją uwagę',
    subtitle: 'Ekrany telefonów a dwa ekrany Tafti',
    summary:
      'Współczesne technologie są projektowane tak, by przyciągać i zatrzymywać uwagę. W języku Tafti to idealna maszyna do usypiania: uwaga zanurza się w ekranie zewnętrznym, a po odłożeniu telefonu w wewnętrznym, pełnym przetrawianych bodźców. Odzyskanie uwagi to fundament wyjścia z matrixa.',
    sections: [
      {
        heading: 'Uwaga to energia',
        body: [
          'W Transerfingu energia płynie tam, gdzie kierujesz uwagę. Jeśli przez większość dnia uwaga należy do powiadomień, feedów i cudzych spraw, twoja energia zasila cudze wahadła. To nie kwestia moralności, tylko prostego bilansu.',
        ],
      },
      {
        heading: 'Jak system przechwytuje uwagę',
        bullets: [
          'Powiadomienia: małe haczyki, które budzą odruch sprawdzania.',
          'Nieskończone przewijanie bez naturalnego końca.',
          'Treści wywołujące silne emocje. Oburzenie i lęk zatrzymują najdłużej.',
          'Poczucie, że coś cię omija, jeśli nie jesteś na bieżąco.',
        ],
      },
      {
        heading: 'Jak ją odzyskać',
        bullets: [
          'Wyłącz powiadomienia, które nie są niezbędne.',
          'Pierwsze 30–60 minut dnia spędź bez telefonu. To czas na przebudzenie i ustawienie kadrów.',
          'Zanim sięgniesz po telefon, obudź się: „Widzę siebie i widzę rzeczywistość. Po co to robię?”.',
          'Ustal miejsca i pory bez ekranów, np. sypialnię i posiłki.',
          'Zastępuj odruch świadomym wyborem: korzystasz z technologii wtedy, kiedy ty tego chcesz.',
        ],
      },
    ],
    practice: {
      title: 'Tydzień świadomej uwagi',
      steps: [
        'Wyłącz dziś wszystkie zbędne powiadomienia.',
        'Przez tydzień nie sięgaj po telefon przez pierwsze 30 minut dnia.',
        'Przy każdym sięgnięciu po telefon zrób mikroprzebudzenie.',
        'Codziennie odhaczaj postępy w Detoksie od matrixa.',
      ],
    },
    mistakes: [
      'Radykalny detoks, po którym następuje powrót do jeszcze intensywniejszego korzystania.',
      'Poczucie winy przy każdym sięgnięciu po telefon. Wystarczy wracać do świadomości.',
    ],
    questions: [
      'Ile razy dziennie sięgam po telefon odruchowo?',
      'Na co chcę przeznaczyć odzyskaną uwagę?',
    ],
    related: ['dwa-ekrany', 'przebudzenie', 'higiena-informacyjna'],
    tool: 'detoks',
    source: 'Książki o Tafti i Hacking the Technogenic System (wyd. ang.)',
  },
  {
    slug: 'higiena-informacyjna',
    module: 'matrix',
    title: 'Higiena informacyjna',
    subtitle: 'Nie wpuszczaj śmieci do swojej warstwy świata',
    summary:
      'Informacja, którą przyjmujesz, staje się częścią twojej warstwy świata. Zeland zaleca świadomie nie wpuszczać negatywnych informacji, a przyjmować i wzmacniać pozytywne. Higiena informacyjna to praktyczna ochrona przed lejkami i wahadłami.',
    sections: [
      {
        heading: 'Twoja warstwa świata',
        body: [
          'W Transerfingu każdy człowiek żyje we własnej warstwie świata, kształtowanej przez to, co myśli, czuje i przyjmuje. Codzienna porcja złych wiadomości i internetowych kłótni to dobrowolne zapraszanie do siebie cudzych lejków.',
        ],
      },
      {
        heading: 'Dieta informacyjna',
        bullets: [
          'Wybierz 1–2 rzetelne źródła i sprawdzaj je o stałej porze, a nie przez cały dzień.',
          'Unikaj treści, które mają cię przestraszyć albo oburzyć.',
          'Nie czytaj komentarzy pod tematami budzącymi emocje.',
          'Pytaj: czy ta informacja jest mi potrzebna do działania?',
          'Celowo dodawaj dobre wiadomości: historie sukcesu, wiedzę, inspiracje.',
        ],
      },
      {
        heading: 'Odpowiedzialność bez lejka',
        body: [
          'Higiena informacyjna nie oznacza ignorancji. Możesz wiedzieć to, co potrzebne, pomagać innym i działać społecznie, nie wpadając w emocjonalny wir. Spokojny, przebudzony człowiek jest zresztą dużo skuteczniejszy niż ktoś pochłonięty paniką.',
        ],
      },
    ],
    practice: {
      title: 'Plan diety informacyjnej',
      steps: [
        'Wypisz wszystkie źródła informacji, z których korzystasz w ciągu tygodnia.',
        'Oznacz te, które dają ci wartość, i te, które tylko niepokoją.',
        'Zrezygnuj na tydzień z dwóch niepokojących źródeł.',
        'Ustal stałą porę na sprawdzanie wiadomości.',
      ],
    },
    mistakes: [
      'Zastąpienie złych wiadomości obsesyjnym śledzeniem „pozytywnych” treści. To też ucieczka w ekran.',
      'Ocenianie innych za ich wybory informacyjne.',
    ],
    questions: [
      'Które źródło informacji najbardziej zabiera mi spokój?',
      'Jakie informacje są mi naprawdę potrzebne?',
    ],
    related: ['indukowane-przejscie', 'fala-powodzenia', 'wlasna-uwaga'],
    tool: 'detoks',
    source: 'Transerfing rzeczywistości, t. I: Przestrzeń wariantów',
  },
  {
    slug: 'zywa-energia',
    module: 'matrix',
    title: 'Żywa energia',
    subtitle: 'Ciało, jedzenie i natura w ujęciu Zelanda',
    summary:
      'Zeland wiąże jasność świadomości i siłę zamiaru ze stanem ciała. W późniejszych książkach zachęca do jedzenia naturalnej, głównie roślinnej i nieprzetworzonej żywności, do ruchu, świeżego powietrza i kontaktu z naturą. To jego osobista propozycja, więc warto podchodzić do niej rozsądnie i stopniowo.',
    sections: [
      {
        heading: 'Dlaczego ciało ma znaczenie',
        body: [
          'Według Zelanda „martwa”, przetworzona żywność i życie w sztucznym środowisku osłabiają energię, a razem z nią jasność umysłu i siłę zamiaru. Żywa energia z naturalnego jedzenia, ruchu i natury sprawia, że łatwiej się budzić i trudniej dać się wciągnąć wahadłom.',
        ],
      },
      {
        heading: 'Propozycje Zelanda',
        bullets: [
          'Więcej świeżych warzyw, owoców, zieleniny i kiełków.',
          'Mniej żywności wysoko przetworzonej i sztucznych dodatków.',
          'Jedzenie nieprzetworzonego termicznie. To jego najbardziej kontrowersyjna rekomendacja.',
          'Woda, świeże powietrze, ruch i czas na łonie natury.',
          'Zmiany wprowadzane stopniowo i w zgodzie z odczuciami ciała, a nie z przymusu.',
        ],
      },
      {
        heading: 'Rozsądne podejście',
        body: [
          'Ten serwis nie jest poradnikiem medycznym. Jeśli chcesz istotnie zmienić sposób odżywiania, zwłaszcza przy chorobach przewlekłych, w ciąży, u dzieci albo przy przyjmowaniu leków, skonsultuj to z lekarzem lub dietetykiem. Zgodnie z duchem Transerfingu nie rób z jedzenia nowego wahadła ani źródła ważności. Słuchaj ciała i duszy, a zmiany wprowadzaj łagodnie.',
        ],
      },
    ],
    practice: {
      title: 'Jeden żywy krok dziennie',
      steps: [
        'Dodaj dziś do jednego posiłku porcję świeżych warzyw lub owoców.',
        'Spędź co najmniej 20 minut na zewnątrz, najlepiej wśród zieleni.',
        'Wypij szklankę wody zaraz po przebudzeniu.',
        'Odhaczaj te kroki w Detoksie od matrixa i obserwuj poziom energii w codziennym check-inie.',
      ],
    },
    mistakes: [
      'Radykalna zmiana diety z dnia na dzień i bez konsultacji.',
      'Ocenianie i nawracanie innych. To typowe zachowanie zwolennika wahadła.',
    ],
    questions: [
      'Po jakim jedzeniu czuję się lekko i przytomnie, a po jakim ociężale?',
      'Ile czasu w tygodniu spędzam na łonie natury?',
    ],
    related: ['energia-zamiaru', 'system-technogeniczny', 'wlasna-uwaga'],
    tool: 'detoks',
    source: 'Hacking the Technogenic System (wyd. ang.) i wcześniejsze książki Zelanda o żywym jedzeniu',
  },
  {
    slug: 'poza-kolejka',
    module: 'matrix',
    title: 'Wolny gracz poza kolejką',
    subtitle: 'Własna droga zamiast standardowych tras systemu',
    summary:
      'System oferuje standardowe trasy do celów: te same szkoły, ścieżki kariery i sposoby na sukces. Gdy wszyscy chcą tego samego tą samą drogą, ustawiają się w długiej kolejce. Wolny gracz korzysta z systemu, ale nie daje się nim prowadzić: idzie do swojego celu przez swoje drzwi.',
    sections: [
      {
        heading: 'Kolejka do marzeń',
        body: [
          'W opisie rosyjskiego wydania książki o hakowaniu systemu pojawia się obraz ludzi, którzy stoją w długiej kolejce po swoje marzenie, bo wielu chce tego samego co oni. Standardowa trasa jest zatłoczona, a o tym, kto i kiedy przejdzie dalej, decyduje system.',
        ],
      },
      {
        heading: 'Jak wyjść z kolejki',
        bullets: [
          'Sprawdź, czy twój cel jest naprawdę twój (zob. [[cudze-cele|Jak rozpoznać cudzy cel]]).',
          'Szukaj drzwi, które pasują do ciebie, a nie do statystyki.',
          'Korzystaj z zamiaru zewnętrznego: wybieraj wariant, zamiast przepychać się łokciami.',
          'Obniż ważność. W kolejce wszyscy są spięci, a ty możesz spokojnie pójść inną drogą.',
          'Ucz się od ludzi, którzy już są tam, gdzie chcesz być, a nie od tłumu.',
        ],
      },
      {
        heading: 'Wolny gracz',
        body: [
          'Wolny gracz rozumie zasady gry, ale nie wierzy, że są jedyne. Pracuje, korzysta z technologii, uczestniczy w życiu społecznym, tyle że świadomie i na swoich warunkach. Nie walczy z systemem i nie służy mu ślepo. Jego energia płynie do jego celów.',
        ],
      },
    ],
    practice: {
      title: 'Alternatywna trasa',
      steps: [
        'Wybierz jeden cel, do którego zmierzasz standardową drogą.',
        'Wypisz co najmniej pięć niestandardowych dróg, które mogłyby do niego prowadzić.',
        'Przy każdej sprawdź komfort duszy.',
        'Wybierz jedną i zrób w tym tygodniu mały krok, żeby ją przetestować.',
      ],
    },
    mistakes: [
      'Odrzucanie wszystkiego, co standardowe, tylko z przekory. To nadal reakcja na wahadło.',
      'Mylenie wolności z brakiem odpowiedzialności.',
    ],
    questions: [
      'W jakiej kolejce stoję?',
      'Jak wyglądałaby moja droga, gdybym nie musiał/musiała nikomu niczego udowadniać?',
    ],
    related: ['cele-i-drzwi', 'system-technogeniczny', 'zamiar-zewnetrzny'],
    tool: 'cele',
    source: 'Hacking the Technogenic System (wyd. ang.)',
  },
];

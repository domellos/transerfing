import type { Lesson } from '../../types';

export const dusza: Lesson[] = [
  {
    slug: 'dusza-i-umysl',
    module: 'dusza',
    title: 'Jedność duszy i umysłu',
    subtitle: 'Gdy wiesz bez słów i działasz bez wahania',
    summary:
      'Umysł myśli, analizuje i kontroluje. Dusza czuje i wie. Umysł łatwo ulega wahadłom i cudzym standardom, a dusza zna twoją drogę. Gdy umysł i dusza chcą tego samego, rodzi się zamiar zewnętrzny, czyli siła, która realizuje cele.',
    sections: [
      {
        heading: 'Dwa głosy',
        body: [
          'Umysł mówi językiem argumentów: „to się opłaca”, „tak wypada”, „to bezpieczne”. Dusza mówi językiem odczuć: lekkość albo ciężar, radość albo niepokój. Umysł jest wychowywany przez wahadła (szkołę, media, otoczenie) i często zagłusza duszę.',
        ],
      },
      {
        heading: 'Stan jedności',
        body: [
          'Jedność duszy i umysłu to stan, w którym myśli i uczucia płyną w jednym kierunku. Opis polskiego wydania tomu „Szelest porannych gwiazd” ujmuje go jako jasność bez słów, wiedzę bez wiary i pewność bez wahania. W tym stanie nie musisz się do niczego przekonywać. Po prostu wiesz i działasz.',
        ],
      },
      {
        heading: 'Jak się do niego zbliżać',
        bullets: [
          'Pytaj duszę o zdanie, zanim umysł zacznie argumentować (zob. [[szelest-porannych-gwiazd|Szelest porannych gwiazd]]).',
          'Zauważaj, kiedy umysł zmusza duszę do czegoś „bo trzeba”.',
          'Pozwól sobie na własne cele, nawet jeśli nie są „rozsądne” według standardów otoczenia.',
          'Bądź dla siebie życzliwy/życzliwa. Trudno porozumieć się z kimś, kogo bez przerwy krytykujesz.',
        ],
      },
    ],
    practice: {
      title: 'Rozmowa umysłu z duszą',
      steps: [
        'Wybierz decyzję, przed którą stoisz.',
        'Zapisz argumenty umysłu za i przeciw.',
        'Zamknij oczy i wyobraź sobie każdą opcję jako już wybraną. Zapisz, co czujesz w ciele: lekkość czy ciężar?',
        'Porównaj obie listy i zapytaj: co by się stało, gdybym zaufał/zaufała duszy?',
      ],
    },
    mistakes: [
      'Lekceważenie umysłu. Umysł jest potrzebny, tylko ma słuchać duszy, a nie ją zastępować.',
      'Mylenie zachcianek i emocji chwili z głosem duszy.',
    ],
    questions: ['Kiedy ostatnio umysł przegadał moją duszę?', 'Jak odczuwam „tak” mojej duszy w ciele?'],
    related: ['szelest-porannych-gwiazd', 'zamiar-zewnetrzny', 'cele-i-drzwi'],
    source: 'Transerfing rzeczywistości, t. II: Szelest porannych gwiazd',
  },
  {
    slug: 'szelest-porannych-gwiazd',
    module: 'dusza',
    title: 'Szelest porannych gwiazd',
    subtitle: 'Jak usłyszeć cichy głos duszy',
    summary:
      'Dusza nie mówi słowami. Sygnalizuje stanem duchowego komfortu albo dyskomfortu, a ten subtelny sygnał dał tytuł drugiemu tomowi serii. Zasada jest prosta: jeśli musisz się do czegoś przekonywać, dusza mówi „nie”.',
    sections: [
      {
        heading: 'Subtelny sygnał',
        body: [
          'Głos duszy jest cichy jak szelest: niejasne uczucie lekkości albo ciężaru, które pojawia się, zanim umysł zdąży cokolwiek przeanalizować. Łatwo go zagłuszyć argumentami, ale można nauczyć się go słyszeć.',
        ],
      },
      {
        heading: 'Test komfortu duchowego',
        bullets: [
          'Wyobraź sobie, że decyzja jest już podjęta. Co czujesz?',
          'Lekkość, spokój, ciepło, cicha radość: dusza mówi „tak”.',
          'Ciężar, ucisk, niechęć, nawet przy świetnych argumentach: dusza mówi „nie”.',
          'Jeśli musisz się przekonywać i namawiać, to też jest „nie”.',
        ],
      },
      {
        heading: 'Dyskomfort a strach',
        body: [
          'Ważne rozróżnienie: strach przed nowym nie zawsze oznacza „nie” duszy. Często to głos umysłu, który boi się zmian. Pomaga pytanie: czy czuję ciężar wobec **samego celu**, czy tylko wobec niepewności drogi? Dusza może bać się drogi, a jednocześnie rwać się do celu.',
        ],
      },
    ],
    practice: {
      title: 'Trzy decyzje, trzy testy',
      steps: [
        'Wypisz trzy decyzje do podjęcia, małe lub duże.',
        'Przy każdej wyobraź sobie, że już ją podjąłeś/podjęłaś. Zatrzymaj się na 30 sekund.',
        'Oceń komfort duchowy w skali 1–10 i zapisz pierwsze słowo, które przychodzi.',
        'Sprawdź, czy wynik różni się od tego, co podpowiadał rozsądek.',
      ],
    },
    mistakes: [
      'Branie każdego dyskomfortu za „nie”, także zwykłego lęku przed nowym.',
      'Zadawanie pytania tak długo, aż usłyszy się wygodną odpowiedź.',
    ],
    questions: ['Jak brzmi „nie” mojej duszy?', 'Do czego obecnie się przekonuję?'],
    related: ['dusza-i-umysl', 'cudze-cele', 'cele-i-drzwi'],
    tool: 'cele',
    source: 'Transerfing rzeczywistości, t. II: Szelest porannych gwiazd',
  },
  {
    slug: 'cele-i-drzwi',
    module: 'dusza',
    title: 'Cele i drzwi',
    subtitle: 'Twój cel daje poczucie święta życia, twoje drzwi dają natchnienie',
    summary:
      'Twój cel to coś, co daje ci prawdziwą radość i poczucie święta życia. Twoje drzwi to droga do celu, na której czujesz fascynację i natchnienie. Szczęście nie czeka na końcu: pojawia się już w drodze do twojego celu przez twoje drzwi.',
    sections: [
      {
        heading: 'Twój cel',
        body: [
          'Zeland odróżnia cele własne od narzuconych. Twój cel nie jest środkiem do czegoś innego, tylko wartością samą w sobie. Myśl o nim wywołuje entuzjazm, a nie przymus. Nie musisz go uzasadniać ani przed innymi, ani przed sobą.',
        ],
      },
      {
        heading: 'Twoje drzwi',
        body: [
          'Drzwi to droga, która cię pociąga: zajęcie, przy którym tracisz poczucie czasu, ścieżka, na której czujesz się jak u siebie. Rzadko wyglądają jak najrozsądniejsza opcja z punktu widzenia wahadeł, za to prowadzą tam, gdzie jest twoje miejsce.',
        ],
        bullets: [
          'Na początku nie pytaj „czy to prestiżowe?” ani „czy to realne?”. Pytaj „czy to moje?”.',
          'Nie myśl o środkach. Gdy idziesz do swojego celu, środki pojawiają się po drodze.',
          'Według Zelanda realizacja twojego głównego celu pociąga za sobą spełnienie wielu innych pragnień.',
        ],
      },
      {
        heading: 'Jak szukać',
        body: [
          'Szukanie celu to nie jednorazowa decyzja, tylko obserwacja. Pozwól sobie marzyć bez cenzury, obserwuj reakcje duszy i sprawdzaj kolejne drzwi małymi krokami. Gdy znajdziesz swoją drogę, poczujesz to jako cichą oczywistość.',
        ],
      },
    ],
    practice: {
      title: 'Burza pragnień',
      steps: [
        'Otwórz narzędzie Cele i drzwi.',
        'Przez 10 minut wypisuj wszystko, czego chcesz, bez oceniania i bez pytania „czy to realne”.',
        'Przy każdym pragnieniu przeprowadź test duszy.',
        'Wybierz cel, który świeci najjaśniej, i zapisz trzy możliwe drzwi.',
      ],
      tip: 'Nie spiesz się. Wróć do listy po kilku dniach: prawdziwy cel nie traci blasku.',
    },
    mistakes: [
      'Wybieranie celu, który dobrze wygląda w oczach innych.',
      'Odkładanie szukania celu „na kiedyś, gdy będzie czas”.',
    ],
    questions: [
      'Co sprawiłoby, że moje życie stałoby się świętem?',
      'Przy jakich zajęciach tracę poczucie czasu?',
    ],
    related: ['cudze-cele', 'szelest-porannych-gwiazd', 'poza-kolejka'],
    tool: 'cele',
    source: 'Transerfing rzeczywistości, t. II: Szelest porannych gwiazd',
  },
  {
    slug: 'cudze-cele',
    module: 'dusza',
    title: 'Jak rozpoznać cudzy cel',
    subtitle: 'Prestiż, moda, przymus i udowadnianie jako znaki ostrzegawcze',
    summary:
      'Cudze cele narzucają wahadła: moda, prestiż, oczekiwania rodziny, porównania z innymi. Ich realizacja wymaga przemocy wobec siebie i nie daje radości. Rozpoznasz je po przymusie, potrzebie udowadniania i po tym, że są środkiem do czegoś innego.',
    sections: [
      {
        heading: 'Znaki cudzego celu',
        bullets: [
          '**Przymus**: „muszę”, „powinienem/powinnam” zamiast „chcę”.',
          '**Prestiż**: cel ma przede wszystkim robić wrażenie na innych.',
          '**Udowadnianie**: chcesz coś komuś (albo sobie) udowodnić.',
          '**Środek, nie cel**: chcesz tego tylko po to, by zdobyć coś innego.',
          '**Moda**: pragnienie pojawiło się, bo „wszyscy teraz to robią”.',
          '**Ciężar**: myśl o celu męczy, choć „powinna” cieszyć.',
        ],
      },
      {
        heading: 'Skąd się biorą',
        body: [
          'Wahadła potrzebują zwolenników, którzy realizują ich cele: kariery według schematu, konsumpcji, rywalizacji. Przekonują nas, że to nasze marzenia. Człowiek goniący za cudzym celem może go nawet osiągnąć, ale nie znajdzie w nim szczęścia.',
        ],
      },
      {
        heading: 'Co zrobić z cudzym celem',
        body: [
          'Nie musisz od razu rzucać wszystkiego. Najpierw nazwij cel po imieniu: „to nie moje”. Potem zmniejsz energię, którą mu oddajesz, i zacznij szukać swoich drzwi. Czasem z cudzego celu da się wydobyć ziarno własnego pragnienia. Za „prestiżową posadą” może kryć się potrzeba swobody albo twórczości.',
        ],
      },
    ],
    practice: {
      title: 'Filtr celów',
      steps: [
        'Wypisz swoje obecne cele: zawodowe, osobiste, materialne.',
        'Przy każdym przejdź przez sześć znaków cudzego celu.',
        'Oznacz cele jako „moje”, „cudze” albo „do sprawdzenia”.',
        'Przy celu cudzym zapisz, jaka prawdziwa potrzeba może się za nim kryć.',
      ],
    },
    mistakes: [
      'Odrzucanie celu tylko dlatego, że jest popularny. Popularny cel też może być twój.',
      'Rewolucja z dnia na dzień zamiast spokojnego przesuwania energii.',
    ],
    questions: ['Który z moich celów najbardziej mnie męczy?', 'Czyje oczekiwania spełniam, dążąc do niego?'],
    related: ['cele-i-drzwi', 'wahadla', 'szelest-porannych-gwiazd'],
    tool: 'cele',
    source: 'Transerfing rzeczywistości, t. II: Szelest porannych gwiazd',
  },
  {
    slug: 'frajl-duszy',
    module: 'dusza',
    title: 'Pozwól sobie być sobą',
    subtitle: 'Wyjątkowość duszy i uwolnienie od standardów',
    summary:
      'Każda dusza jest wyjątkowa. Zeland pisze o frajlu duszy (ang. fraile), jej niepowtarzalnej istocie, którą porównuje do Świętego Graala w człowieku. Wahadła narzucają standardy, z którymi się porównujemy. Jedna z głównych zasad Transerfingu brzmi: pozwól sobie być sobą, a innym być innymi.',
    sections: [
      {
        heading: 'Frajl duszy',
        body: [
          'Frajl to niepowtarzalna istota twojej duszy, to, co sprawia, że jesteś sobą. Zeland zachęca, by dostroić do niego umysł, a pierwszym krokiem jest przekonanie się, że twoja dusza jest godna miłości. Kto próbuje być kopią cudzego wzorca, traci kontakt z własną siłą.',
        ],
      },
      {
        heading: 'Pułapka standardów',
        body: [
          'Wahadła ustalają standardy urody, sukcesu i stylu życia. Porównując się z nimi, wytwarzasz niezadowolenie z siebie, czyli nadmierny potencjał. Twoja wartość nie polega na dorównaniu wzorcowi, tylko na byciu niepowtarzalnym.',
        ],
      },
      {
        heading: 'Zasada dwóch pozwoleń',
        bullets: [
          '**Pozwól sobie być sobą**: ze swoimi upodobaniami, tempem i drogą, bez usprawiedliwiania się.',
          '**Pozwól innym być innymi**: bez prób zmieniania ich na siłę i bez potępiania.',
          'Te dwa pozwolenia zdejmują ogromną ilość ważności i uwalniają energię.',
        ],
      },
    ],
    practice: {
      title: 'Dzień w zgodzie ze sobą',
      steps: [
        'Zapisz trzy rzeczy, które lubisz, choć „nie wypada” albo są „niemodne”.',
        'Zrób dziś jedną z nich bez tłumaczenia się.',
        'Wybierz osobę, którą próbujesz zmienić, i przez jeden dzień pozwól jej być sobą.',
        'Zapisz, co się zmieniło w twoim samopoczuciu.',
      ],
    },
    mistakes: [
      'Mylenie bycia sobą z egoizmem albo brakiem szacunku dla innych.',
      'Budowanie nowego standardu „oświeconego transerfera” i porównywanie się z nim.',
    ],
    questions: ['Jakim standardom próbuję dorównać?', 'Co we mnie jest niepowtarzalne?'],
    related: ['dusza-i-umysl', 'poczucie-winy', 'frajling'],
    source: 'Seria „Transerfing rzeczywistości”',
  },
];

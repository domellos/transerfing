import type { Scenario } from '../types';

export const SCENARIOS: Scenario[] = [
  {
    id: 'uciekajacy-autobus',
    title: 'Uciekający autobus',
    area: 'Codzienność',
    situation: 'Wychodzisz z domu na ważne spotkanie. Na przystanku widzisz, jak twój autobus odjeżdża. Następny będzie za 15 minut.',
    question: 'Co robisz?',
    options: [
      {
        text: 'Klnę pod nosem, piszę znajomym, że znowu mam pecha, i całą drogę odtwarzam w głowie, jak wszystko się sypie.',
        verdict: 'pułapka',
        feedback: 'Złość i narzekanie to nadawanie wariantu, w którym dzień jest serią potknięć. Według Zelanda taka reakcja przesuwa cię na gorszą linię życia.',
        lesson: 'linie-zycia',
      },
      {
        text: 'Udaję, że jest mi wszystko jedno, ale w środku się gotuję.',
        verdict: 'częściowo',
        feedback: 'Tłumienie emocji nie zmienia tego, co nadajesz. Lepiej zauważyć złość i świadomie wybrać inną reakcję, niż udawać obojętność.',
        lesson: 'uwalnianie-od-wahadel',
      },
      {
        text: 'Mówię sobie: „Wszystko idzie tak, jak trzeba”. Uprzedzam o kilku minutach spóźnienia i ustawiam kadr spokojnego spotkania.',
        verdict: 'najlepsza',
        feedback: 'To koordynacja zamiaru i praca z następnym kadrem. Przyjmujesz to, co się stało, i wybierasz dalszy ciąg, zamiast walczyć z bieżącą chwilą.',
        lesson: 'koordynacja-zamiaru',
      },
    ],
  },
  {
    id: 'krytyka-przy-zespole',
    title: 'Krytyka przy zespole',
    area: 'Praca',
    situation: 'Na spotkaniu przełożony ostro krytykuje twój projekt przy całym zespole. Czujesz, jak rośnie w tobie złość i wstyd.',
    question: 'Jak reagujesz?',
    options: [
      {
        text: 'Od razu kontratakuję i wytykam mu błędy, żeby wszyscy widzieli, że nie dam sobą pomiatać.',
        verdict: 'pułapka',
        feedback: 'Wchodzisz w rytm wahadła i oddajesz mu całą energię. Konflikt eskaluje, a ty tracisz kontrolę nad sytuacją.',
        lesson: 'haczyki-wahadel',
      },
      {
        text: 'Długo się tłumaczę, przepraszam i obiecuję, że to się nie powtórzy.',
        verdict: 'częściowo',
        feedback: 'Przeprosiny bywają na miejscu, ale długie usprawiedliwianie się wzmacnia poczucie winy i zaprasza kolejną krytykę.',
        lesson: 'poczucie-winy',
      },
      {
        text: 'Biorę oddech, budzę się („widzę siebie i widzę rzeczywistość”), dziękuję za uwagi i proponuję omówić szczegóły po spotkaniu.',
        verdict: 'najlepsza',
        feedback: 'Przebudzenie wyprowadza cię z odruchowej reakcji, a spokojna, nieoczekiwana odpowiedź odbiera wahadłu paliwo. Sprawy merytoryczne załatwiasz potem, bez widowni.',
        lesson: 'przebudzenie',
      },
    ],
  },
  {
    id: 'polityka-na-grupie',
    title: 'Polityka na grupie rodzinnej',
    area: 'Konflikty',
    situation: 'Na rodzinnej grupie ktoś wrzuca prowokujący wpis polityczny. Kilka osób już się kłóci, a ciebie aż świerzbią palce.',
    question: 'Co robisz?',
    options: [
      {
        text: 'Piszę długi komentarz z argumentami i linkami. Ktoś musi im to wreszcie wytłumaczyć.',
        verdict: 'pułapka',
        feedback: 'Zasilasz dwa wahadła naraz: swoje i to, z którym walczysz. Dyskusja pochłonie twój wieczór i nikogo nie przekona.',
        lesson: 'haczyki-wahadel',
      },
      {
        text: 'Wyciszam grupę i nic nie piszę, ale przez godzinę myślę o tym, co bym im odpisał/odpisała.',
        verdict: 'częściowo',
        feedback: 'Dobrze, że nie wchodzisz w kłótnię, ale wahadło nadal ma twoją uwagę w ekranie wewnętrznym. Przenieś ją na coś, co jest twoje.',
        lesson: 'dwa-ekrany',
      },
      {
        text: 'Uznaję, że każdy ma prawo do swojego zdania, wyciszam wątek i wracam do swoich spraw. Jeśli już coś piszę, to lekko i życzliwie.',
        verdict: 'najlepsza',
        feedback: 'To klasyczne uwolnienie od wahadła: uznanie jego prawa do istnienia, utrata zainteresowania i ewentualnie nieoczekiwana, życzliwa reakcja.',
        lesson: 'uwalnianie-od-wahadel',
      },
    ],
  },
  {
    id: 'wymarzona-praca',
    title: 'Rozmowa o wymarzoną pracę',
    area: 'Praca',
    situation: 'Za dwa dni masz rozmowę kwalifikacyjną do pracy, o której marzysz od lat. Nie możesz spać i ciągle wyobrażasz sobie, że wszystko pójdzie źle.',
    question: 'Jak się przygotowujesz?',
    options: [
      {
        text: 'Powtarzam sobie, że to moja jedyna szansa i muszę wypaść perfekcyjnie.',
        verdict: 'pułapka',
        feedback: 'To maksymalna ważność zewnętrzna. Nadmierny potencjał sprawia, że ręce drżą dokładnie wtedy, gdy powinny być pewne.',
        lesson: 'waznosc',
      },
      {
        text: 'Przygotowuję się merytorycznie, ale w głowie dalej mam czarne scenariusze.',
        verdict: 'częściowo',
        feedback: 'Przygotowanie jest ważne, ale nie rozładowuje ważności. Brakuje akceptacji najgorszego scenariusza i planu B.',
        lesson: 'obnizanie-waznosci',
      },
      {
        text: 'Przygotowuję się, akceptuję, że może się nie udać, mam plan B i ustawiam kadr spokojnej, rzeczowej rozmowy.',
        verdict: 'najlepsza',
        feedback: 'Obniżona ważność i zabezpieczenie zdejmują napięcie, a kadr kieruje uwagę na to, co ma się wydarzyć. Idziesz na rozmowę jak ktoś, kto wybiera, a nie błaga.',
        lesson: 'obnizanie-waznosci',
      },
    ],
  },
  {
    id: 'cisza-w-telefonie',
    title: 'Cisza w telefonie',
    area: 'Związki',
    situation: 'Osoba, na której bardzo ci zależy, nie odpisuje od kilku godzin. Co chwilę sprawdzasz telefon.',
    question: 'Co robisz?',
    options: [
      {
        text: 'Wysyłam kolejne wiadomości z pytaniem, czy wszystko w porządku i dlaczego mnie ignoruje.',
        verdict: 'pułapka',
        feedback: 'Zamiar brania i silne przywiązanie tworzą nadmierny potencjał. Druga strona wyczuwa presję i zwykle się dystansuje.',
        lesson: 'nadmierne-potencjaly',
      },
      {
        text: 'Udaję obojętność i postanawiam odpisać dopiero za dwa dni, żeby nie wyjść na zdesperowanego/zdesperowaną.',
        verdict: 'częściowo',
        feedback: 'Gra w obojętność to wciąż walka o kontrolę. Ważność nie spada, tylko się ukrywa.',
        lesson: 'waznosc',
      },
      {
        text: 'Odkładam telefon i zajmuję się swoim dniem. Gdy przyjdzie odpowiedź, odpisuję ciepło i bez wyrzutów.',
        verdict: 'najlepsza',
        feedback: 'Obniżasz ważność i wracasz do własnego życia. Ciepła odpowiedź bez rachunku krzywd to frajling w praktyce.',
        lesson: 'frajling',
      },
    ],
  },
  {
    id: 'sensacja-w-wiadomosciach',
    title: 'Sensacja w wiadomościach',
    area: 'Energia i uwaga',
    situation: 'Wszyscy w pracy mówią o niepokojącej wiadomości z kraju. Wieczorem łapiesz się na tym, że od godziny czytasz kolejne artykuły i komentarze.',
    question: 'Co robisz dalej?',
    options: [
      {
        text: 'Czytam dalej. Muszę wiedzieć wszystko, żeby być przygotowanym/przygotowaną.',
        verdict: 'pułapka',
        feedback: 'To mechanizm lejka: emocjonalne zaangażowanie w problem wciąga cię w indukowane przejście, a problem staje się częścią twojej warstwy świata.',
        lesson: 'indukowane-przejscie',
      },
      {
        text: 'Zamykam stronę, ale idę spać z tymi myślami.',
        verdict: 'częściowo',
        feedback: 'Dobry pierwszy krok. Następny to przeniesienie uwagi: przebudzenie i coś, co jest twoje, zamiast przeżuwania tematu w ekranie wewnętrznym.',
        lesson: 'dwa-ekrany',
      },
      {
        text: 'Sprawdzam fakty w jednym rzetelnym źródle, pytam siebie, czy mogę coś realnie zrobić, a potem świadomie wracam do swojego wieczoru.',
        verdict: 'najlepsza',
        feedback: 'To higiena informacyjna: wiesz to, co potrzebne, ale nie wpuszczasz lejka do swojej warstwy świata.',
        lesson: 'higiena-informacyjna',
      },
    ],
  },
  {
    id: 'po-tym-wszystkim',
    title: '„Po tym wszystkim, co dla ciebie zrobiłam”',
    area: 'Relacje',
    situation: 'Bliska osoba mówi: „Po tym wszystkim, co dla ciebie zrobiłam, nie możesz mi odmówić”. Prosi o coś, czego naprawdę nie chcesz robić.',
    question: 'Jak odpowiadasz?',
    options: [
      {
        text: 'Zgadzam się, choć wszystko we mnie protestuje. Nie chcę wyjść na niewdzięcznika.',
        verdict: 'pułapka',
        feedback: 'Przyjmujesz rolę winnego, a manipulacja przez winę działa właśnie wtedy. Napięcie, które w sobie tłumisz, i tak wróci.',
        lesson: 'poczucie-winy',
      },
      {
        text: 'Długo tłumaczę, dlaczego nie mogę, i przepraszam za odmowę.',
        verdict: 'częściowo',
        feedback: 'Tłumaczenie się to sygnał: „uznaję twoje prawo do oceniania mnie”. Im dłużej się usprawiedliwiasz, tym mocniejszy nacisk.',
        lesson: 'poczucie-winy',
      },
      {
        text: 'Mówię ciepło, ale jasno: „Jestem ci wdzięczny/wdzięczna za wszystko, a jednocześnie tym razem odmawiam”.',
        verdict: 'najlepsza',
        feedback: 'Wdzięczność bez winy i odmowa bez tłumaczenia. Pozwalasz sobie być sobą, a drugiej osobie mieć swoje odczucia.',
        lesson: 'frajl-duszy',
      },
    ],
  },
  {
    id: 'dom-znajomego',
    title: 'Znajomy kupił dom',
    area: 'Pieniądze',
    situation: 'Znajomy chwali się na zdjęciach nowym domem. Ty od lat odkładasz na mieszkanie i czujesz ukłucie zazdrości.',
    question: 'Co z tym robisz?',
    options: [
      {
        text: 'Myślę, że świat jest niesprawiedliwy, a takim ludziom zawsze się udaje.',
        verdict: 'pułapka',
        feedback: 'Niezadowolenie i zazdrość to nadmierne potencjały. Do tego nadajesz slajd „mnie się nie udaje”, który lustro chętnie potwierdzi.',
        lesson: 'nadmierne-potencjaly',
      },
      {
        text: 'Postanawiam pracować dwa razy więcej, żeby go dogonić.',
        verdict: 'częściowo',
        feedback: 'Działanie jest dobre, ale motywacja jest cudza: porównanie i udowadnianie. To prosta droga do cudzego celu.',
        lesson: 'cudze-cele',
      },
      {
        text: 'Szczerze gratuluję, a potem sprawdzam, czy mieszkanie to mój cel. Jeśli tak, odświeżam jego slajd i planuję kolejny krok.',
        verdict: 'najlepsza',
        feedback: 'Gratulacje to frajling, a pytanie o cel chroni przed porównaniami. Twój slajd i krok w twoim tempie budują twój wariant.',
        lesson: 'cele-i-drzwi',
      },
    ],
  },
  {
    id: 'pol-roku-bez-efektow',
    title: 'Pół roku bez efektów',
    area: 'Cele',
    situation: 'Od pół roku konsekwentnie pracujesz nad własnym projektem. Wyniki są skromne i zaczynasz wątpić, czy to ma sens.',
    question: 'Co robisz?',
    options: [
      {
        text: 'Rzucam projekt. Skoro po pół roku nie działa, to już nie zadziała.',
        verdict: 'pułapka',
        feedback: 'Lustro świata reaguje z opóźnieniem. Porzucenie obrazu w okresie przejściowym to najczęstszy błąd, a złość na stare odbicie je utrwala.',
        lesson: 'dualne-lustro',
      },
      {
        text: 'Zaciskam zęby i pracuję jeszcze więcej, chociaż czuję coraz większy ciężar.',
        verdict: 'częściowo',
        feedback: 'Wytrwałość jest cenna, ale ciężar i przymus to sygnał, żeby sprawdzić, czy płyniesz pod prąd i czy cel wciąż jest twój.',
        lesson: 'nurt-wariantow',
      },
      {
        text: 'Sprawdzam komfort duszy wobec celu. Jeśli wciąż jest lekko, przechodzę na wizualizację bieżącego etapu i szukam prostszej drogi.',
        verdict: 'najlepsza',
        feedback: 'Łączysz test duszy, wizualizację procesu i zasadę najmniejszego oporu. Utrzymujesz obraz, ale nie walczysz z nurtem.',
        lesson: 'wizualizacja-procesu',
      },
    ],
  },
  {
    id: 'propozycja-ktora-przeraza',
    title: 'Propozycja, która przeraża',
    area: 'Cele',
    situation: 'Dostajesz propozycję prowadzenia własnego działu. To krok w stronę tego, o czym marzysz, ale czujesz, że „to chyba nie dla mnie”.',
    question: 'Jak się zachowujesz?',
    options: [
      {
        text: 'Odmawiam od razu. Na pewno są lepsi ode mnie.',
        verdict: 'pułapka',
        feedback: 'Cel leży poza strefą komfortu, więc odpychasz go w chwili, gdy jest na wyciągnięcie ręki. To blokuje zamiar zewnętrzny.',
        lesson: 'strefa-komfortu',
      },
      {
        text: 'Zgadzam się, ale zakładam, że i tak sobie nie poradzę.',
        verdict: 'częściowo',
        feedback: 'Zgoda to krok naprzód, ale negatywny slajd „nie poradzę sobie” zacznie filtrować rzeczywistość i szukać potwierdzeń.',
        lesson: 'slajdy',
      },
      {
        text: 'Proszę o dzień do namysłu i sprawdzam komfort duszy. Jeśli jest lekko, mówię sobie „pozwalam sobie to mieć” i się zgadzam.',
        verdict: 'najlepsza',
        feedback: 'Odróżniasz lęk przed drogą od ciężaru wobec celu, a pozwolenie sobie na posiadanie odblokowuje zamiar.',
        lesson: 'strefa-komfortu',
      },
    ],
  },
  {
    id: 'godzina-w-telefonie',
    title: 'Godzina w telefonie',
    area: 'Energia i uwaga',
    situation: 'Wieczorem chcesz tylko na chwilę sprawdzić telefon. Po godzinie orientujesz się, że wciąż przewijasz krótkie filmy.',
    question: 'Co teraz?',
    options: [
      {
        text: 'Wyzywam się w myślach od słabeuszy i obiecuję, że od jutra kasuję wszystkie aplikacje.',
        verdict: 'pułapka',
        feedback: 'Poczucie winy i radykalne postanowienia to kolejne napięcie. Zwykle kończą się powrotem do jeszcze intensywniejszego przewijania.',
        lesson: 'wlasna-uwaga',
      },
      {
        text: 'Odkładam telefon, ale niczego nie zmieniam na przyszłość.',
        verdict: 'częściowo',
        feedback: 'Przebudzenie jest, brakuje nawyku. Bez kotwic i drobnych zmian scenariusz powtórzy się jutro.',
        lesson: 'przebudzenie',
      },
      {
        text: 'Zauważam, że to był sen na jawie. Odkładam telefon, wyłączam powiadomienia tej aplikacji i ustawiam kotwicę przebudzenia na sięganie po telefon.',
        verdict: 'najlepsza',
        feedback: 'Przebudzenie bez oceniania się plus mała zmiana w otoczeniu. Odzyskujesz uwagę stopniowo, bez walki z samym sobą.',
        lesson: 'dwa-ekrany',
      },
    ],
  },
  {
    id: 'strach-przed-wystapieniem',
    title: 'Strach przed wystąpieniem',
    area: 'Emocje',
    situation: 'Za godzinę przemawiasz przed dużą grupą. Masz suche usta i myśl: „wszyscy zobaczą, że się nie nadaję”.',
    question: 'Co robisz w tej godzinie?',
    options: [
      {
        text: 'W kółko powtarzam całe przemówienie i wyobrażam sobie wszystkie możliwe wpadki.',
        verdict: 'pułapka',
        feedback: 'Ważność wewnętrzna i czarne scenariusze nadają dokładnie ten wariant, którego się boisz.',
        lesson: 'waznosc',
      },
      {
        text: 'Piję kawę za kawą i próbuję w ogóle nie myśleć o wystąpieniu.',
        verdict: 'częściowo',
        feedback: 'Ucieczka od tematu nie obniża ważności. Napięcie zostaje w ciele i wraca w najgorszym momencie.',
        lesson: 'obnizanie-waznosci',
      },
      {
        text: 'Rozluźniam barki, mówię sobie: „Nie muszę zachwycić, zamierzam przekazać to, co ważne”, ustawiam kadr życzliwych twarzy i robię krótki spacer.',
        verdict: 'najlepsza',
        feedback: 'Zamieniasz pragnienie perfekcji na spokojny zamiar, obniżasz ważność przez ciało i ustawiasz kadr najbliższej sytuacji.',
        lesson: 'rozswietlanie-dnia',
      },
    ],
  },
];

export const SCENARIO_BY_ID: Record<string, Scenario> = Object.fromEntries(SCENARIOS.map((s) => [s.id, s]));

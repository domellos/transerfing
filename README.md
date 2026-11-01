# Transerfing w praktyce

Nieoficjalny serwis do nauki i codziennego stosowania zasad Transerfingu rzeczywistości Vadima Zelanda, technik Tafti oraz „wyjścia z matrixa” systemu technogenicznego. Działa jako zwykła strona i jako aplikacja na telefonie (instalacja z przeglądarki, praca offline).

## Wersje

| Wersja | Hosting | Polecenie | Co działa |
| --- | --- | --- | --- |
| Publiczna | serwer z PHP, np. MyDevil | `npm run build` | wszystko: konta z synchronizacją, powiadomienia push, asystent AI |
| Prywatna | serwer z PHP, np. MyDevil | `npm run build:private` | wszystko, ale tylko dla właściciela i niewidoczne dla wyszukiwarek |
| Bez serwera | GitHub Pages albo dowolny hosting statyczny | `npm run build:pages` | lekcje, program, narzędzia i dziennik w przeglądarce, bez kont, powiadomień push i asystenta |

## Co zawiera

**Nauka**
- **Wiedza**: 42 lekcje w 8 modułach (Podstawy, Wahadła, Ważność i równowaga, Zamiar i slajdy, Dusza i cel, Lustro i relacje, Tafti, Wyjście z matrixa). Każda lekcja ma skrót, ćwiczenie, typowe błędy, pytania do refleksji i powiązane lekcje.
- **Obszary życia**: praca, pieniądze, związki, zdrowie, konflikty. Wahadła i pułapki ważności w danym obszarze, zasady z linkami do lekcji i plan na 7 dni.
- **Scenariusze** (12): krótkie sytuacje z wyborem reakcji i omówieniem.
- **Fiszki** (63) z powtórkami w rosnących odstępach, **Słownik** (50 pojęć), **Quiz** (34 pytania), **Wyjście z matrixa** z testem i detoksem.

**Codzienna praktyka**
- **Dziś**: myśl dnia, lista praktyk, check-in (energia, ważność, nastrój), fiszki do powtórki.
- **Nawigator** (20 sytuacji): opisujesz, co się dzieje, i dostajesz pasującą zasadę, kroki na teraz i narzędzie. Przy słowach świadczących o kryzysie pokazuje numery pomocowe.
- **Asystent AI** (opcjonalny): odpowiada na podstawie lekcji serwisu, z limitem pytań dziennie.
- **Program 8 tygodni** (56 dni) i **11 wyzwań** (np. 7 dni bez narzekania, 21 dni koordynacji, 30 dni ze slajdem).
- **16 narzędzi**: poranne ustawienie, przebudzenie (licznik, kotwice, dzwonek, powiadomienia push), wieczorny przegląd, dziennik snów, detektor wahadeł, miernik ważności, detoks od matrixa, centralne strumienie, cele i drzwi, studio slajdów, tablica wizji (zdjęcia), warkocz i kadr, tapeta na telefon, dzienniki koordynacji, frajlingu i drogowskazów.
- **Prowadzone sesje** z minutnikiem, dzwonkiem i lektorem (synteza mowy wbudowana w przeglądarkę).

**Ty**
- **Postęp i 21 odznak**, **Tydzień i kalendarz** (mapa praktyki i przegląd tygodnia), **Laboratorium wzorców** (porównanie check-inów w dni z praktyką i bez).
- **Konto i synchronizacja** między urządzeniami z szyfrowaniem end-to-end (opcjonalne).
- **Ustawienia**: motyw, dźwięk, lektor, kopia zapasowa (razem ze zdjęciami), usuwanie danych.

## Jak to działa

- **Strony**: React 19 + Vite. Adresy mają postać katalogów (`/wiedza/wahadla/` to plik `wiedza/wahadla/index.html`), więc serwer nie potrzebuje reguł przepisywania adresów. Strony z treścią są przy budowaniu zamieniane na gotowy HTML (dla wyszukiwarek i szybkiego startu). Strony osobiste (Dziś, Dziennik, Konto…) dostają powłokę aplikacji z `noindex`. Każda strona ma osobny plik JS, ładowany na żądanie.
- **Dane** zostają w przeglądarce: `localStorage` (prefiks `ts:`) i IndexedDB (zdjęcia tablicy wizji, klucz szyfrowania).
- **API** (`public/api/`, PHP 8.1+ z SQLite) obsługuje konta, synchronizację, powiadomienia i asystenta. Baza, konfiguracja i logi są w katalogu `private` obok `public_html`, poza zasięgiem przeglądarki.
- **Szyfrowanie**: z hasła powstaje w przeglądarce klucz główny (PBKDF2-SHA256, 600 000 iteracji), a z niego dwa klucze (HKDF): klucz logowania (serwer zna tylko jego skrót bcrypt) i klucz AES-GCM-256 do danych, który nigdy nie opuszcza urządzenia. Serwer przechowuje wyłącznie szyfrogram z numerem wersji. Zmiany z kilku urządzeń łączą się po stronie przeglądarki: wpisy się sumują, a usunięte nie wracają.
- **Powiadomienia push**: Web Push z kluczami VAPID. Serwer wysyła pusty sygnał, a treść przypomnienia losuje service worker, więc usługi push (Google, Mozilla, Apple, Microsoft) nie dostają żadnych danych. Wysyłką zajmuje się zadanie cron co 5 minut.
- **Asystent AI**: serwer pośredniczy w rozmowie z dostawcą (klucz API zostaje na serwerze), dobiera pasujące lekcje do pytania, liczy limity i nie zapisuje treści rozmów. Przy sygnałach kryzysu odpowiada od razu numerami pomocowymi, bez pytania modelu.

## Uruchomienie lokalne

Wymagany Node.js 22.22 lub nowszy.

```bash
npm install
npm run dev        # serwer deweloperski (bez API: konta, push i asystent są wtedy niedostępne)
npm run build          # wersja publiczna: sprawdzenie typów, build i prerender do katalogu dist/
npm run build:private  # wersja prywatna (tylko dla ciebie) do katalogu dist-prywatna/
npm run build:pages    # wersja bez serwera (GitHub Pages) do katalogu dist-pages/
npm test               # testy (wymagają PHP 8.1+ z pdo_sqlite, openssl i curl)
```

Testy uruchamiają API w PHP z wiersza poleceń, bez serwera WWW. Jeśli `php` nie jest w `PATH`, wskaż go zmienną: `PHP_BIN=/sciezka/do/php npm test`.

Zbudowany serwis razem z API możesz sprawdzić na własnym komputerze wbudowanym serwerem PHP:

```bash
TRANSERFING_DATA_DIR=/tmp/transerfing-dane php -S localhost:8080 -t dist
```

## Publikacja na MyDevil.net

### 1. Zbuduj serwis z adresem domeny

```bash
VITE_SITE_URL=https://twojadomena.pl npm run build
```

Adres domeny trafia do znaczników `canonical`, obrazka podglądu linków (`og:image`), mapy strony `sitemap.xml` i `robots.txt`. Bez tej zmiennej serwis działa tak samo, tylko bez tych dodatków dla wyszukiwarek i mediów społecznościowych.

Serwis w podkatalogu domeny (np. `https://domena.pl/transerfing/`) wymaga osobnego buildu: `BASE_PATH=/transerfing/ VITE_SITE_URL=https://domena.pl npm run build`.

### 2. Dodaj stronę w panelu

1. Panel DevilWEB (`panelX.mydevil.net`, gdzie X to numer serwera `sX.mydevil.net` z maila aktywacyjnego): **Strony WWW → + Dodaj nową stronę**, wpisz domenę, typ **PHP**.
2. **SSL → Strony WWW → Zarządzaj → + Dodaj certyfikat → Wygeneruj certyfikat Let's Encrypt**. Domena musi już wskazywać na serwer MyDevil. Powiadomienia push i instalacja na telefonie wymagają https.
3. **Strony WWW → Szczegóły**: włącz wymuszenie SSL i kompresję GZIP. Pamięć podręczną serwera ustaw na `control` (respektuje nagłówki wysyłane przez serwis) albo zostaw wyłączoną.

Przez SSH to samo robią polecenia `devil www add DOMENA php`, `devil ssl www add ADRES_IP le le DOMENA`, `devil www options DOMENA sslonly on`, `devil www options DOMENA gzip on` i `devil www options DOMENA cache control`.

### 3. Wgraj pliki

Wgraj **zawartość** katalogu `dist/` do `/usr/home/LOGIN/domains/DOMENA/public_html/`, np. przez SFTP (FileZilla: serwer `sX.mydevil.net`, port 22, dane jak do SSH). Wgraj też ukryte pliki `.htaccess` (w katalogu głównym, w `assets/` i w `api/lib/`).

Przy pierwszym zapytaniu do API (np. otwarcie `https://twojadomena.pl/api/status.php`) serwis sam utworzy katalog `/usr/home/LOGIN/domains/DOMENA/private/` z plikiem `config.php`, bazą SQLite i losowymi kluczami. Ten katalog leży obok `public_html`, więc nie jest dostępny z internetu. Jeśli w panelu włączysz ograniczenie `open_basedir`, dopisz do niego katalog `private` (albo cały katalog domeny) i `/tmp`.

### 4. Uzupełnij konfigurację

Edytuj `/usr/home/LOGIN/domains/DOMENA/private/config.php` (przez SSH: `nano ~/domains/DOMENA/private/config.php`, albo pobierz, popraw i wgraj przez SFTP). Zachowaj apostrofy i przecinki na końcach linii: błąd składni wyłączy API.

| Ustawienie | Znaczenie |
| --- | --- |
| `admin_name`, `admin_email` | Administrator danych w polityce prywatności (wymóg RODO). E-mail jest też kontaktem dla usług push. |
| `accounts_enabled` | Zakładanie kont i synchronizacja. Domyślnie `false`: włącz po uzupełnieniu danych administratora. |
| `accounts_max` | Najwięcej kont na serwerze (`0` = bez limitu; w wersji prywatnej `1`). |
| `push_enabled` | Powiadomienia push (domyślnie `true`, działają dopiero po dodaniu zadania cron). |
| `push_require_account` | Czy włączenie powiadomień wymaga zalogowania (w wersji prywatnej `true`). |
| `private_mode` | Wersja prywatna: teksty dla właściciela zamiast dla odwiedzających (ustawiane przez `npm run build:private`). |
| `ai_enabled`, `ai_format`, `ai_key`, `ai_model` | Asystent AI. `ai_format`: `'openai'` (OpenAI i usługi zgodne z Chat Completions) albo `'anthropic'` (API Claude). Przykładowe modele: `'gpt-6-luna'`, `'claude-haiku-5-5'`; sprawdź aktualną nazwę w panelu dostawcy. |
| `ai_url` | Adres API dostawcy, gdy inny niż domyślny (np. usługa zgodna z OpenAI). |
| `ai_require_account` | Asystent tylko dla zalogowanych (domyślnie `true`, limit liczony na osobę). |
| `ai_daily_limit_user`, `ai_daily_limit_anon`, `ai_daily_limit_total` | Dzienne limity pytań: na konto, na łącze bez konta, dla całego serwisu (kontrola kosztów). |
| `ai_max_tokens`, `ai_extra_body`, `ai_anthropic_version` | Ustawienia zaawansowane zapytań do dostawcy. |
| `site_url` | Adres serwisu (opcjonalnie, zwykle wykrywany sam). |
| `diag_web` | Diagnostyka w przeglądarce pod `api/diagnostyka.php` (domyślnie wyłączona). |
| `secret`, `vapid_public`, `vapid_private_pem` | Wygenerowane automatycznie. Zmiana kluczy VAPID wyłączy powiadomienia wszystkim subskrybentom. |

### 5. Dodaj zadanie cron

Panel: **Zadania Cron → + Dodaj zadanie Cron**, uruchamianie co 5 minut (minuta `*/5`, pozostałe pola `*`), polecenie:

```
/usr/local/bin/php /usr/home/LOGIN/domains/DOMENA/public_html/api/cron.php
```

Zadanie wysyła powiadomienia push i sprząta dane: wygasłe sesje (180 dni bez użycia), konta nieużywane od 24 miesięcy, liczniki limitów i dzienne skróty adresów IP. Dopóki cron nie zadziała ani razu, przycisk włączania powiadomień jest ukryty (inaczej nic by nie przychodziło).

### 6. Sprawdź konfigurację

```bash
php ~/domains/DOMENA/public_html/api/diagnostyka.php        # wersja PHP, rozszerzenia, baza, klucze VAPID, cron, asystent
php ~/domains/DOMENA/public_html/api/diagnostyka.php --ai   # dodatkowo próbne pytanie do dostawcy AI
```

Błędy techniczne (bez treści od użytkowników i bez adresów IP) zapisują się w `private/logs/`.

### Aktualizacja

Zbuduj nową wersję i nadpisz pliki w `public_html`. Katalogu `private` nie ruszaj: są w nim konta i konfiguracja. Odwiedzający dostaną nową wersję automatycznie (service worker sprawdza aktualizacje przy każdej wizycie). Stare pliki z `assets/` możesz usunąć.

`.htaccess` używa wyłącznie składni z dokumentacji MyDevil. Błąd w tym pliku powoduje błąd 500 całej strony, więc edytuj go ostrożnie (bez BOM, końce linii LF).

## Wersja prywatna (tylko dla ciebie)

Paczka `transerfing-prywatna.zip` powstaje poleceniem `npm run build:private` (wynik w `dist-prywatna/`). To ten sam serwis z innymi ustawieniami:

- Wszystkie strony mają `noindex, nofollow`, a `robots.txt` blokuje roboty. Nie ma mapy strony, adresu kanonicznego ani podglądu linków, więc przy budowaniu nie trzeba podawać domeny.
- Konta działają od razu, bez edycji `config.php`. Pierwsze założone konto zostaje kontem właściciela, a rejestracja się zamyka (`accounts_max => 1`).
- Asystent AI i włączanie powiadomień działają tylko po zalogowaniu na to konto.
- Zamiast polityki prywatności dla odwiedzających jest strona „Twoje dane” z opisem, gdzie trafiają twoje dane. Dane administratora nie są potrzebne.

### Wdrożenie wersji prywatnej

1. W panelu dodaj stronę typu PHP i certyfikat Let's Encrypt (kroki z punktu 2 publikacji powyżej).
2. Wgraj zawartość `transerfing-prywatna.zip` do `public_html`, razem z ukrytymi plikami `.htaccess` (także w katalogu `.well-known`).
3. Od razu otwórz `https://twojadomena.pl/konto/` i załóż swoje konto. Na telefonie i innych urządzeniach tylko się na nie logujesz.
4. Jeśli chcesz powiadomień o przebudzeniu, dodaj zadanie cron (punkt 5 publikacji).
5. Asystent AI: w `private/config.php` ustaw `ai_enabled`, `ai_format`, `ai_key` i `ai_model` (punkt 4 publikacji).

Zapomniane hasło do konta: `php ~/domains/DOMENA/public_html/api/diagnostyka.php --usun-konta --potwierdzam` usuwa z serwera konto i zaszyfrowaną kopię (dane w przeglądarkach zostają) i ponownie otwiera rejestrację. Drugą osobę dopuścisz, zwiększając `accounts_max` w `config.php`.

### Hasło na całą stronę (opcjonalnie)

Bez niego każdy, kto zna adres, może otworzyć lekcje i narzędzia, a jego wpisy zostają w jego przeglądarce. Nie ma dostępu do twoich danych, konta, asystenta ani powiadomień. Z hasłem przeglądarka pyta o nie przy pierwszym wejściu na stronę.

1. Przez SSH utwórz plik haseł (podasz hasło dwa razy) i nadaj mu prawo odczytu:
   ```bash
   htpasswd -c /usr/home/LOGIN/transerfing.passwd ja
   chmod +r /usr/home/LOGIN/transerfing.passwd
   ```
2. W `public_html/.htaccess` usuń znak `#` z czterech ostatnich linii (`AuthType`, `AuthName`, `AuthUserFile`, `require`) i wpisz swój login MyDevil zamiast `LOGIN`.
3. Otwórz stronę. Jeśli pokaże się błąd, przywróć znaki `#` i sprawdź ścieżkę do pliku haseł.

Plik `.well-known/.htaccess` zostawia bez hasła katalog, którego używa weryfikacja certyfikatu Let's Encrypt. Serwis wysyła swój token konta w osobnym nagłówku, więc hasło na całą stronę nie koliduje z logowaniem.

Na iPhonie aplikacja dodana do ekranu początkowego może źle współpracować z hasłem na całą stronę, a powiadomienia push na iPhonie działają tylko w takiej aplikacji. Jeśli korzystasz z iPhone'a, po włączeniu hasła sprawdź, czy aplikacja z ekranu początkowego się otwiera i czy działają powiadomienia.

## GitHub

### Testy i paczki

Przy każdej zmianie w gałęzi `main` i w każdym pull requeście workflow **Testy i paczki** (`.github/workflows/ci.yml`) uruchamia wszystkie testy (Node 22 i PHP 8.3) oraz buduje obie paczki na MyDevil. Pobierzesz je w zakładce **Actions**: wybierz przebieg, a potem w sekcji **Artifacts** pliki `transerfing-strona.zip` i `transerfing-prywatna.zip` (przechowywane 30 dni).

### GitHub Pages

Workflow **GitHub Pages** (`.github/workflows/pages.yml`) publikuje wersję bez serwera przy każdej zmianie w `main`.

1. W repozytorium: **Settings → Pages → Build and deployment → Source: GitHub Actions**. Dopóki tego nie zrobisz, ten workflow kończy się błędem (testy działają niezależnie).
2. Wyślij zmiany do `main` albo uruchom workflow ręcznie (**Actions → GitHub Pages → Run workflow**).
3. Strona pojawi się pod adresem `https://UZYTKOWNIK.github.io/NAZWA-REPOZYTORIUM/`. Adres bazowy, adres kanoniczny i mapę strony workflow ustawia sam, także dla własnej domeny ustawionej w Pages.

Wersja bez serwera nie ma kont, synchronizacji, powiadomień push ani asystenta AI: te pozycje znikają z menu, a strona prywatności opisuje tylko dane w przeglądarce. Dane między urządzeniami przeniesiesz kopią zapasową z Ustawień.

Ten sam build lokalnie (np. dla repozytorium `transerfing-w-praktyce`):

```bash
BASE_PATH=/transerfing-w-praktyce/ VITE_SITE_URL=https://uzytkownik.github.io npm run build:pages
```

### Końce linii

`.gitattributes` wymusza końce linii LF. Na Windowsie nie zmieniaj tego: plik `.htaccess` z końcami CRLF powoduje na MyDevil błąd 500.

## Prywatność i bezpieczeństwo

- Bez kont serwer nie dostaje żadnych danych z dziennika. Serwis nie używa ciasteczek, reklam ani analityki.
- Hasło nie opuszcza przeglądarki. Serwer przechowuje skrót bcrypt klucza logowania i zaszyfrowaną kopię danych, której nie potrafi odczytać. Zapomnianego hasła nie da się odzyskać.
- Sesje: losowy token (serwer zna tylko jego skrót SHA-256), wygasa po 180 dniach bez użycia. Zmiana hasła wylogowuje inne urządzenia.
- Limity prób logowania i rejestracji, liczone na skrót adresu IP z kluczem zmienianym codziennie (dla IPv6 na sieć /64). Skróty są usuwane najpóźniej po dobie.
- Adresy subskrypcji push są przyjmowane tylko od znanych usług push przeglądarek, więc serwera nie da się użyć do wysyłania zapytań w dowolne miejsca.
- Asystent nie zapisuje rozmów na serwerze. Treść pytań trafia do wybranego dostawcy AI, o czym informuje strona asystenta i polityka prywatności.
- Polityka prywatności (`/prywatnosc/`) opisuje wszystkie powyższe dane; dane administratora pobiera z `config.php`.

## Testy

- `tests/api.test.mjs`: API w PHP (konta, sesje i ich wygasanie, limity, wersje kopii i konflikty, zmiana hasła, usuwanie konta, harmonogram i wysyłka push z weryfikacją podpisu VAPID, asystent w obu formatach, numery pomocowe, limity dzienne, wersja prywatna z jednym kontem, układ katalogów MyDevil, ochrona katalogu danych).
- `tests/sync.test.mjs`: prawdziwy kod przeglądarki z dwóch „urządzeń” przeciw API w PHP (szyfrowanie, łączenie danych, usunięcia, wyścig zapisów, zmiana hasła).
- `tests/data.test.mjs`: spójność treści (odwołania do lekcji, narzędzi, obszarów) i opisy stron dla wyszukiwarek.

Na GitHubie te same testy uruchamia workflow **Testy i paczki**.

## Edycja treści

| Co | Plik |
| --- | --- |
| Lekcje (po jednym pliku na moduł) | `src/data/lessons/*.ts` |
| Moduły | `src/data/modules.ts` |
| Program 8 tygodni | `src/data/program.ts` |
| Nawigator (sytuacje i słowa kluczowe, wyrażenia kryzysowe) | `src/data/navigator.ts` |
| Obszary życia | `src/data/areas.ts` |
| Scenariusze | `src/data/scenarios.ts` |
| Wyzwania | `src/data/challenges.ts` |
| Fiszki | `src/data/flashcards.ts` |
| Słownik | `src/data/glossary.ts` |
| Quiz | `src/data/quiz.ts` |
| Myśli dnia, książki, nawyki detoksu, test matrixa | `src/data/misc.ts` |
| Narzędzia i pola dzienników | `src/data/tools.ts` |
| Odznaki | `src/lib/badges.ts` |
| Opisy stron dla wyszukiwarek | `src/seo.ts` |

W treściach lekcji działają dwa znaczniki: `**pogrubienie**` oraz `[[slug-lekcji|tekst linku]]` (link do innej lekcji). Po zmianie treści uruchom `npm run build`: materiały dla asystenta AI (`api/knowledge.json`) budują się wtedy z aktualnych lekcji.

## Ograniczenia

- Na iPhonie i iPadzie powiadomienia push działają po dodaniu serwisu do ekranu początkowego (iOS 16.4 lub nowszy).
- Lektor używa głosów zainstalowanych w systemie. Bez polskiego głosu przeglądarka czyta innym głosem albo wcale.
- Zdjęcia z tablicy wizji nie są synchronizowane (zostają na urządzeniu i w pliku kopii zapasowej).
- Asystent AI kosztuje według cennika wybranego dostawcy. Limity w `config.php` ograniczają liczbę pytań.

## Prawa autorskie

Treści są własnymi omówieniami idei z książek Vadima Zelanda i nie zawierają przedruków jego tekstów. Serwis nie jest związany z autorem ani wydawcami. Nie wklejaj do niego fragmentów książek.

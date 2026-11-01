import { Link } from 'react-router';
import { PageHeader } from '../components/ui';
import { useApiStatus } from '../lib/api';
import { useTitle } from '../lib/hooks';
import { PRIVACY_TITLE, PRIVATE, STATIC } from '../site';

/** Wersja prywatna: opis dla właściciela, gdzie trafiają jego dane. */
function YourData() {
  useTitle(PRIVACY_TITLE);
  return (
    <article className="page narrow">
      <PageHeader icon="shield" title={PRIVACY_TITLE} lead="To prywatna wersja serwisu. Tak wygląda droga twoich danych." />

      <section className="lesson-section">
        <h2>W twojej przeglądarce</h2>
        <p>
          Dziennik, slajdy, kadry, wyzwania, check-iny, postępy, ustawienia i zdjęcia z tablicy wizji zapisują się w pamięci przeglądarki na danym urządzeniu
          (localStorage i IndexedDB). Wyczyszczenie danych przeglądarki je usuwa, więc co jakiś czas pobierz kopię zapasową w{' '}
          <Link to="/ustawienia/">Ustawieniach</Link>.
        </p>
      </section>

      <section className="lesson-section">
        <h2>Na twoim serwerze</h2>
        <ul className="bullets">
          <li>
            Zaszyfrowana kopia danych, gdy jesteś zalogowany/zalogowana. Szyfruje ją przeglądarka kluczem utworzonym z twojego hasła, więc na serwerze nie da się jej
            odczytać. Zapomnianego hasła nie da się odzyskać.
          </li>
          <li>Konto: login, skrót klucza logowania (nie hasło), daty założenia i ostatniego użycia oraz sesje, które wygasają po 180 dniach bez użycia.</li>
          <li>Powiadomienia push: adres subskrypcji przeglądarki, strefa czasowa i harmonogram.</li>
          <li>Zabezpieczenia: przez najwyżej dobę skrót adresu IP z liczbą prób logowania i innych operacji (nie da się z niego odtworzyć adresu).</li>
        </ul>
        <p>Wszystko leży w katalogu „private” obok public_html, poza zasięgiem przeglądarki.</p>
      </section>

      <section className="lesson-section">
        <h2>Poza twoim serwerem</h2>
        <ul className="bullets">
          <li>Powiadomienia przechodzą przez usługę push producenta przeglądarki (Google, Mozilla, Apple, Microsoft) i nie zawierają żadnej treści.</li>
          <li>
            Pytania do <Link to="/asystent/">asystenta AI</Link> i kilka poprzednich wiadomości trafiają do dostawcy AI wybranego w konfiguracji. Serwer nie zapisuje
            rozmów, a historia zostaje w przeglądarce, dopóki nie klikniesz „Nowa rozmowa”.
          </li>
          <li>Dostawca hostingu może prowadzić standardowe logi serwera WWW.</li>
        </ul>
      </section>

      <section className="lesson-section">
        <h2>Kto ma dostęp</h2>
        <ul className="bullets">
          <li>
            Strona jest ukryta przed wyszukiwarkami. Kto zna adres, może jednak otworzyć lekcje i narzędzia, a jego wpisy zostają wtedy w jego przeglądarce.
          </li>
          <li>Można założyć tylko jedno konto: twoje. Asystent AI i powiadomienia działają tylko po zalogowaniu.</li>
          <li>Jeśli nikt poza tobą nie ma nawet oglądać strony, włącz hasło na cały serwis (instrukcja w README, punkt o haśle na całą stronę).</li>
        </ul>
      </section>
    </article>
  );
}

/** Wersja bez serwera (np. GitHub Pages): serwis niczego nie zbiera, zostają tylko logi hostingu. */
function StaticPolicy() {
  useTitle(PRIVACY_TITLE);
  return (
    <article className="page narrow">
      <PageHeader icon="shield" title={PRIVACY_TITLE} lead="Ta wersja serwisu działa w całości w twojej przeglądarce i niczego nie zbiera." />

      <section className="lesson-section">
        <h2>Dane w twojej przeglądarce</h2>
        <p>
          Dziennik, slajdy, kadry, wyzwania, check-iny, postępy, ustawienia i zdjęcia z tablicy wizji zapisują się tylko w pamięci przeglądarki na tym
          urządzeniu (localStorage i IndexedDB). Nie są wysyłane nigdzie dalej. Serwis nie używa plików cookie, reklam ani narzędzi analitycznych.
        </p>
        <p>
          Kopię zapasową pobierzesz, a dane usuniesz w <Link to="/ustawienia/">Ustawieniach</Link>. Kopią przeniesiesz też dane na inne urządzenie, bo ta
          wersja nie ma kont ani synchronizacji.
        </p>
      </section>

      <section className="lesson-section">
        <h2>Hosting</h2>
        <p>
          Pliki strony udostępnia zewnętrzny hosting (np. GitHub Pages). Jak każdy serwer WWW może on zapisywać w logach adres IP i dane techniczne
          przeglądarki zgodnie z własną polityką prywatności. Właściciel tej kopii serwisu nie ma dostępu do takich danych o tobie i niczego sam nie zbiera.
        </p>
      </section>

      <section className="lesson-section">
        <h2>Czego tu nie ma</h2>
        <p>
          Konta, synchronizacja, powiadomienia push i asystent AI wymagają serwera z PHP, więc w tej wersji są wyłączone. Dzwonek przebudzenia działa w
          otwartej karcie.
        </p>
      </section>
    </article>
  );
}

export default function Privacy() {
  if (STATIC) return <StaticPolicy />;
  return PRIVATE ? <YourData /> : <PublicPolicy />;
}

function PublicPolicy() {
  useTitle(PRIVACY_TITLE);
  const { status } = useApiStatus();
  const admin = status?.admin;
  const hasAdmin = Boolean(admin && (admin.name || admin.email));

  return (
    <article className="page narrow">
      <PageHeader icon="shield" title="Polityka prywatności" lead="Krótko i konkretnie: jakie dane przetwarza ten serwis, po co i jak długo." />

      <section className="lesson-section">
        <h2>Administrator danych</h2>
        {hasAdmin ? (
          <p>
            Administratorem danych osobowych przetwarzanych na serwerze jest {admin!.name || 'właściciel serwisu'}
            {admin!.email && (
              <>
                , kontakt: <a href={`mailto:${admin!.email}`}>{admin!.email}</a>
              </>
            )}
            .
          </p>
        ) : (
          <p>Administratorem danych przetwarzanych na serwerze jest właściciel serwisu. Dane kontaktowe pojawią się tutaj po ich uzupełnieniu w konfiguracji serwera.</p>
        )}
      </section>

      <section className="lesson-section">
        <h2>Dane w twojej przeglądarce</h2>
        <p>
          Dziennik, slajdy, kadry, wyzwania, check-iny, postępy i ustawienia zapisują się w pamięci twojej przeglądarki (localStorage i IndexedDB) na tym urządzeniu.
          Nie trafiają na serwer, dopóki sam/sama nie włączysz synchronizacji. Serwis nie używa plików cookie, reklam ani narzędzi analitycznych.
        </p>
        <p>
          Możesz w każdej chwili pobrać kopię zapasową albo usunąć wszystkie dane w <Link to="/ustawienia/">Ustawieniach</Link>.
        </p>
      </section>

      <section className="lesson-section">
        <h2>Konto i synchronizacja (opcjonalnie)</h2>
        <ul className="bullets">
          <li>Przechowujemy: login, skrót klucza logowania (nie hasło), zaszyfrowaną kopię twoich danych, datę założenia konta i ostatniej aktywności oraz sesje logowania.</li>
          <li>
            Kopia jest szyfrowana w twojej przeglądarce kluczem wyprowadzonym z twojego hasła. Administrator nie zna hasła i nie może odczytać treści wpisów.
          </li>
          <li>Podstawa prawna: wykonanie usługi, o którą prosisz (art. 6 ust. 1 lit. b RODO).</li>
          <li>Sesje wygasają po 180 dniach bez użycia. Konta nieużywane przez 24 miesiące są usuwane automatycznie razem z kopią.</li>
          <li>
            Konto i całą kopię usuniesz sam/sama w zakładce <Link to="/konto/">Konto</Link>. Kopię danych pobierzesz w Ustawieniach.
          </li>
        </ul>
      </section>

      <section className="lesson-section">
        <h2>Powiadomienia push (opcjonalnie)</h2>
        <p>
          Gdy włączysz powiadomienia o przebudzeniu, serwer zapisuje adres subskrypcji wygenerowany przez twoją przeglądarkę, strefę czasową i wybrany harmonogram.
          Powiadomienia przechodzą przez usługę push producenta przeglądarki (np. Google, Mozilla, Apple) i nie zawierają żadnych treści o tobie. Dane usuwamy po
          wyłączeniu powiadomień albo gdy przeglądarka unieważni subskrypcję.
        </p>
      </section>

      <section className="lesson-section">
        <h2>Asystent AI (opcjonalnie)</h2>
        <p>
          Treść pytań zadanych asystentowi i kilku poprzednich wiadomości z rozmowy jest przekazywana do zewnętrznego dostawcy modelu AI, żeby przygotować
          odpowiedź. Serwer serwisu nie zapisuje treści rozmów, liczy tylko liczbę pytań na potrzeby limitu dziennego. Rozmowa jest zapisana w twojej przeglądarce i
          możesz ją wyczyścić przyciskiem „Nowa rozmowa”. Nie wpisuj danych, których nie chcesz udostępniać dostawcy AI.
        </p>
      </section>

      <section className="lesson-section">
        <h2>Zabezpieczenia i logi</h2>
        <p>
          Żeby chronić serwis przed nadużyciami, przez maksymalnie dobę przechowujemy skrót adresu IP (zmieniany codziennie, bez możliwości odtworzenia adresu) wraz z
          liczbą prób logowania i innych operacji. Dostawca hostingu może prowadzić standardowe logi serwera WWW.
        </p>
      </section>

      <section className="lesson-section">
        <h2>Twoje prawa</h2>
        <p>
          Masz prawo dostępu do swoich danych, ich sprostowania, usunięcia, ograniczenia przetwarzania, przenoszenia oraz wniesienia sprzeciwu, a także prawo skargi do
          Prezesa Urzędu Ochrony Danych Osobowych. Większość z tych praw wykonasz sam/sama w serwisie (eksport i usunięcie danych). W pozostałych sprawach napisz do
          administratora.
        </p>
      </section>
    </article>
  );
}

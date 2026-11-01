import { Link } from 'react-router';
import { Callout, PageHeader } from '../components/ui';
import { BOOKS } from '../data/misc';
import { useTitle } from '../lib/hooks';
import { PRIVACY_IN, PRIVATE, STATIC } from '../site';

export default function About() {
  useTitle('O projekcie');
  return (
    <div className="page narrow">
      <PageHeader
        icon="info"
        title="O projekcie"
        lead="„Transerfing w praktyce” pomaga uczyć się zasad Vadima Zelanda i stosować je na co dzień: od pierwszego przebudzenia po świadome życie poza matrixem."
      />

      <section className="lesson-section">
        <h2>Czym jest ten serwis</h2>
        <p>
          To nieoficjalny, niekomercyjny serwis edukacyjny. Nie jest związany z Vadimem Zelandem, jego wydawcami ani szkołami
          Transerfingu. Lekcje, program 8 tygodni, ćwiczenia i quiz to własne omówienia i propozycje praktyk, oparte na ideach z książek
          autora. Nie zawierają przedruków jego tekstów.
        </p>
        <p>
          Jeśli Transerfing jest dla ciebie ważny, sięgnij po oryginały. Książki zawierają znacznie więcej niuansów, przykładów i
          kontekstu, niż może pomieścić jakikolwiek przewodnik.
        </p>
      </section>

      <section className="lesson-section">
        <h2>Książki Vadima Zelanda</h2>
        <p className="muted small">
          Wybrane tytuły, na których opierają się treści serwisu. Polskie tytuły podano tam, gdzie były dostępne w źródłach. Przy
          pozostałych podano opisowy przekład i tytuł angielski.
        </p>
        <ul className="books">
          {BOOKS.map((b) => (
            <li key={b.title} className="card book">
              <h3>{b.title}</h3>
              <p className="muted small">{b.original}</p>
              <p className="small">{b.note}</p>
            </li>
          ))}
        </ul>
        <p className="small">
          Oficjalna strona autora:{' '}
          <a href="https://zelands.com/" target="_blank" rel="noopener noreferrer">
            zelands.com
          </a>
        </p>
      </section>

      <section className="lesson-section">
        <h2>Prywatność</h2>
        <p>
          Serwis nie ma reklam, plików cookie ani narzędzi śledzących. Wpisy, slajdy, kadry i postępy zapisują się w tej przeglądarce.{' '}
          {STATIC ? (
            <>Ta wersja działa bez serwera, więc nic z twoich wpisów nie jest nigdzie wysyłane.</>
          ) : (
            <>
              Konto jest opcjonalne: dane synchronizowane między urządzeniami są szyfrowane w przeglądarce twoim hasłem, więc{' '}
              {PRIVATE ? 'nawet ktoś z dostępem do serwera' : 'administrator'} nie może ich odczytać.
            </>
          )}{' '}
          Szczegóły znajdziesz w <Link to="/prywatnosc/">{PRIVACY_IN}</Link>, a kopię zapasową pobierzesz w <Link to="/ustawienia/">Ustawieniach</Link>.
        </p>
      </section>

      <section className="lesson-section">
        <h2>Asystent AI</h2>
        <p>
          Asystent odpowiada na podstawie lekcji tego serwisu, ale jego odpowiedzi tworzy model językowy zewnętrznego dostawcy. Mogą zawierać błędy albo
          uproszczenia. Traktuj je jako podpowiedź do własnej praktyki, nie jako wykładnię Transerfingu ani poradę specjalisty.
        </p>
      </section>

      <section className="lesson-section">
        <h2>Zdrowy rozsądek</h2>
        <Callout tone="warn">
          Transerfing to system samorozwoju, a nie terapia ani porada medyczna. Nie zastępuje pomocy lekarza, psychologa czy
          psychoterapeuty. Wskazówki dotyczące jedzenia to propozycje autora: zmiany diety warto wprowadzać stopniowo, a przy problemach
          zdrowotnych skonsultować je ze specjalistą. Jeśli przeżywasz kryzys psychiczny, skontaktuj się z lekarzem albo z bezpłatnym
          Centrum Wsparcia dla Osób Dorosłych w Kryzysie Psychicznym: 800 70 2222 (całodobowo). Dzieci i młodzież mogą dzwonić pod 116 111. W nagłym
          zagrożeniu życia dzwoń pod numer alarmowy 112.
        </Callout>
      </section>

      <section className="lesson-section">
        <h2>Jak korzystać z aplikacji na telefonie</h2>
        <p>
          Serwis działa w przeglądarce telefonu. Możesz dodać go do ekranu głównego (w menu przeglądarki: „Dodaj do ekranu głównego”, a w Safari:
          „Udostępnij” → „Do ekranu początkowego”). Wtedy otwiera się jak aplikacja, działa bez internetu i może wysyłać powiadomienia o przebudzeniu.
        </p>
      </section>
    </div>
  );
}

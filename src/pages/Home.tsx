import { Link, useNavigate } from 'react-router';
import { ArrowRight, BookOpen, Compass, Map, NotebookPen, Search } from 'lucide-react';
import { MODULES } from '../data/modules';
import { LESSONS, lessonsOfModule } from '../data/lessons';
import { TOOLS } from '../data/tools';
import { AREAS } from '../data/areas';
import { SITUATIONS } from '../data/navigator';
import { ICONS } from '../components/icons';
import { ProgressBar, moduleStyle } from '../components/ui';
import { useLessonsRead, useProgram } from '../state';
import { useTitle } from '../lib/hooks';
import { plural } from '../lib/date';
import { PROGRAM_LENGTH } from '../data/program';
import { STATIC } from '../site';
import type { IconName } from '../types';

const FEATURED_TOOLS = ['warkocz', 'slajdy', 'wahadla', 'waznosc', 'cele', 'przebudzenie'] as const;
const POPULAR_SITUATIONS = ['stres-przed-wydarzeniem', 'cos-poszlo-nie-tak', 'konflikt-prowokacja', 'nie-wiem-czego-chce'];

const PRACTICE_LINKS: { to: string; icon: IconName; title: string; text: string }[] = [
  { to: '/scenariusze/', icon: 'route', title: 'Scenariusze', text: 'Wybierz reakcję w sytuacji z życia i zobacz, co z niej wynika.' },
  { to: '/fiszki/', icon: 'cards', title: 'Fiszki', text: 'Pojęcia wracają w odstępach, które pomagają je zapamiętać.' },
  { to: '/wyzwania/', icon: 'trophy', title: 'Wyzwania', text: 'Serie od 7 do 30 dni, np. tydzień bez narzekania.' },
  { to: '/quiz/', icon: 'graduation', title: 'Quiz', text: 'Sprawdź, ile zostało w pamięci, z wyjaśnieniami.' },
];

export default function Home() {
  useTitle();
  const [read] = useLessonsRead();
  const [program] = useProgram();
  const navigate = useNavigate();
  const doneDays = Object.keys(program.done).length;

  return (
    <div className="page">
      <section className="hero">
        <p className="eyebrow">Nieoficjalny przewodnik po Transerfingu Vadima Zelanda</p>
        <h1 className="hero-title">
          Nie walcz z rzeczywistością. <span className="grad">Wybieraj ją.</span>
        </h1>
        <p className="lead">
          Ucz się zasad Transerfingu krok po kroku i stosuj je każdego dnia: obniżaj ważność, uwalniaj się od wahadeł, ustawiaj kadry swojej
          przyszłości i odzyskuj uwagę z rąk systemu.
        </p>
        <div className="hero-actions">
          <Link to="/program/" className="btn btn-primary btn-lg">
            {program.startedAt ? `Kontynuuj program (${doneDays}/${PROGRAM_LENGTH})` : 'Rozpocznij program 8 tygodni'}
            <ArrowRight size={18} />
          </Link>
          <Link to="/wiedza/" className="btn btn-lg">
            Przeglądaj wiedzę
          </Link>
          <Link to="/dzis/" className="btn btn-ghost btn-lg">
            Praktyka na dziś
          </Link>
        </div>
      </section>

      <section className="card navigator-band">
        <div>
          <p className="eyebrow">
            <Compass size={16} aria-hidden /> Nawigator
          </p>
          <h2>Co się u ciebie dzieje?</h2>
          <p className="muted">Opisz sytuację, a nawigator wskaże pasującą zasadę, kroki do zrobienia od razu i narzędzie do praktyki.</p>
          <form
            className="search search-lg"
            onSubmit={(e) => {
              e.preventDefault();
              const q = new FormData(e.currentTarget).get('q')?.toString().trim() ?? '';
              navigate(q ? `/nawigator/?q=${encodeURIComponent(q)}` : '/nawigator/');
            }}
          >
            <Search size={20} aria-hidden />
            <input type="search" name="q" placeholder="Np. „boję się jutrzejszej rozmowy”" aria-label="Opisz sytuację" />
            <button type="submit" className="btn btn-primary btn-sm">
              Szukaj
            </button>
          </form>
          <div className="chips">
            {POPULAR_SITUATIONS.map((id) => {
              const s = SITUATIONS.find((x) => x.id === id);
              return s ? (
                <Link key={id} to={`/nawigator/${id}/`} className="chip">
                  {s.title}
                </Link>
              ) : null;
            })}
          </div>
        </div>
      </section>

      <section className="section">
        <h2 className="section-title">Jak korzystać z serwisu</h2>
        <div className="grid grid-3">
          <div className="card step-card">
            <BookOpen size={22} aria-hidden className="step-icon" />
            <h3>1. Poznaj</h3>
            <p>
              {LESSONS.length} {plural(LESSONS.length, ['lekcja', 'lekcje', 'lekcji'])} w {MODULES.length} modułach, przewodniki po obszarach życia i słownik pojęć. Każda lekcja kończy się ćwiczeniem.
            </p>
          </div>
          <div className="card step-card">
            <Map size={22} aria-hidden className="step-icon" />
            <h3>2. Ćwicz</h3>
            <p>
              Program 8 tygodni, wyzwania i {TOOLS.length} {plural(TOOLS.length, ['narzędzie', 'narzędzia', 'narzędzi'])}: od Detektora wahadeł, przez prowadzone sesje z lektorem, po tapetę z formułą
              przebudzenia.
            </p>
          </div>
          <div className="card step-card">
            <NotebookPen size={22} aria-hidden className="step-icon" />
            <h3>3. Obserwuj</h3>
            <p>
              Dziennik, mapa praktyki i Laboratorium wzorców pokazują, co naprawdę ci pomaga. Dane zostają w przeglądarce, a z kontem
              synchronizują się w zaszyfrowanej postaci.
            </p>
          </div>
        </div>
      </section>

      <section className="section">
        <div className="section-head">
          <h2 className="section-title">Moduły wiedzy</h2>
          <Link to="/wiedza/" className="link-more">
            Wszystkie lekcje <ArrowRight size={16} />
          </Link>
        </div>
        <div className="grid grid-2">
          {MODULES.map((m) => {
            const lessons = lessonsOfModule(m.id);
            const readCount = lessons.filter((l) => read[l.slug]).length;
            const Icon = ICONS[m.icon];
            return (
              <Link key={m.id} to={`/wiedza/?modul=${m.id}`} className="card card-link module-card" style={moduleStyle(m.id)}>
                <div className="module-card-icon">
                  <Icon size={22} aria-hidden />
                </div>
                <div className="module-card-body">
                  <h3>{m.title}</h3>
                  <p className="muted">{m.tagline}</p>
                  <div className="module-card-progress">
                    <ProgressBar value={readCount} max={lessons.length} label={`Postęp modułu ${m.title}`} />
                    <span className="muted small">
                      {readCount}/{lessons.length}
                    </span>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      </section>

      <section className="section">
        <div className="section-head">
          <h2 className="section-title">Transerfing w obszarach życia</h2>
          <Link to="/obszary/" className="link-more">
            Wszystkie obszary <ArrowRight size={16} />
          </Link>
        </div>
        <div className="grid grid-3">
          {AREAS.map((area) => {
            const Icon = ICONS[area.icon];
            return (
              <Link key={area.slug} to={`/obszary/${area.slug}/`} className="card card-link quick-card">
                <Icon size={22} aria-hidden />
                <span>
                  {area.title}
                  <span className="muted small block">{area.tagline}</span>
                </span>
              </Link>
            );
          })}
        </div>
      </section>

      <section className="section">
        <div className="section-head">
          <h2 className="section-title">Narzędzia do codziennej praktyki</h2>
          <Link to="/praktyka/" className="link-more">
            Wszystkie narzędzia <ArrowRight size={16} />
          </Link>
        </div>
        <div className="grid grid-3">
          {FEATURED_TOOLS.map((id) => {
            const tool = TOOLS.find((t) => t.id === id)!;
            const Icon = ICONS[tool.icon];
            return (
              <Link key={tool.id} to={`/praktyka/${tool.id}/`} className="card card-link tool-card">
                <Icon size={22} aria-hidden className="tool-card-icon" />
                <h3>{tool.title}</h3>
                <p className="muted">{tool.description}</p>
              </Link>
            );
          })}
        </div>
      </section>

      <section className="section">
        <h2 className="section-title">Utrwalaj i sprawdzaj się</h2>
        <div className="grid grid-4">
          {PRACTICE_LINKS.map((item) => {
            const Icon = ICONS[item.icon];
            return (
              <Link key={item.to} to={item.to} className="card card-link tool-card">
                <Icon size={22} aria-hidden className="tool-card-icon" />
                <h3>{item.title}</h3>
                <p className="muted small">{item.text}</p>
              </Link>
            );
          })}
        </div>
      </section>

      <section className="section">
        <Link to="/matrix/" className="card card-link matrix-banner">
          <div>
            <p className="eyebrow">Specjalna sekcja</p>
            <h2>Wyjście z matrixa</h2>
            <p>
              Jak według Zelanda działa system technogeniczny, jak przechwytuje twoją uwagę i energię oraz jak żyć w nim jako wolny gracz. Z testem i
              codziennym detoksem.
            </p>
          </div>
          <ArrowRight size={28} aria-hidden />
        </Link>
      </section>

      {!STATIC && (
      <section className="section">
        <div className="grid grid-2">
          <Link to="/asystent/" className="card card-link quick-card">
            <ICONS.bot size={22} aria-hidden />
            <span>
              Asystent AI
              <span className="muted small block">Opisz sytuację i zapytaj, które zasady mogą pomóc.</span>
            </span>
          </Link>
          <Link to="/konto/" className="card card-link quick-card">
            <ICONS.user size={22} aria-hidden />
            <span>
              Konto i synchronizacja
              <span className="muted small block">Ten sam dziennik na telefonie i komputerze, szyfrowany end-to-end.</span>
            </span>
          </Link>
        </div>
      </section>
      )}
    </div>
  );
}

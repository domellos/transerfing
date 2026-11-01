import { Component, Suspense, useEffect, useId, useState, type ReactNode } from 'react';
import { Link, NavLink, Outlet, useLocation } from 'react-router';
import { Menu, MoonStar, MoreHorizontal, Sun, X } from 'lucide-react';
import { ICONS } from './icons';
import { EmptyState } from './ui';
import ReminderEngine from './Reminders';
import { useSettings } from '../state';
import { applyTheme } from '../lib/hooks';
import { PRIVACY_TITLE, PRIVATE, STATIC } from '../site';
import type { IconName } from '../types';

interface NavItem {
  to: string;
  label: string;
  icon: IconName;
}

/** Strony, które potrzebują serwera z PHP: w wersji bez serwera (GitHub Pages) znikają z menu. */
const SERVER_ONLY = new Set(['/asystent/', '/konto/']);

const NAV_ALL: { title: string; items: NavItem[] }[] = [
  {
    title: 'Codziennie',
    items: [
      { to: '/dzis/', label: 'Dziś', icon: 'sun' },
      { to: '/nawigator/', label: 'Nawigator: co się dzieje?', icon: 'compass' },
      { to: '/asystent/', label: 'Asystent AI', icon: 'bot' },
      { to: '/program/', label: 'Program 8 tygodni', icon: 'map' },
      { to: '/praktyka/', label: 'Praktyka', icon: 'sparkles' },
      { to: '/wyzwania/', label: 'Wyzwania', icon: 'trophy' },
      { to: '/dziennik/', label: 'Dziennik', icon: 'notebook' },
    ],
  },
  {
    title: 'Nauka',
    items: [
      { to: '/wiedza/', label: 'Wiedza', icon: 'book' },
      { to: '/obszary/', label: 'Obszary życia', icon: 'layers' },
      { to: '/scenariusze/', label: 'Scenariusze', icon: 'route' },
      { to: '/fiszki/', label: 'Fiszki', icon: 'cards' },
      { to: '/matrix/', label: 'Wyjście z matrixa', icon: 'door' },
      { to: '/slownik/', label: 'Słownik pojęć', icon: 'library' },
      { to: '/quiz/', label: 'Quiz', icon: 'graduation' },
    ],
  },
  {
    title: 'Ty',
    items: [
      { to: '/postep/', label: 'Postęp i odznaki', icon: 'chart' },
      { to: '/kalendarz/', label: 'Tydzień i kalendarz', icon: 'calendar' },
      { to: '/laboratorium/', label: 'Laboratorium wzorców', icon: 'flask' },
      { to: '/konto/', label: 'Konto i synchronizacja', icon: 'user' },
      { to: '/ustawienia/', label: 'Ustawienia', icon: 'settings' },
      { to: '/o-projekcie/', label: 'O projekcie', icon: 'info' },
    ],
  },
];

const NAV = NAV_ALL.map((group) => ({ ...group, items: group.items.filter((item) => !STATIC || !SERVER_ONLY.has(item.to)) }));

const TABS: NavItem[] = [
  { to: '/dzis/', label: 'Dziś', icon: 'sun' },
  { to: '/nawigator/', label: 'Nawigator', icon: 'compass' },
  { to: '/praktyka/', label: 'Praktyka', icon: 'sparkles' },
  { to: '/wiedza/', label: 'Wiedza', icon: 'book' },
];

function Logo() {
  // Logo występuje kilka razy na stronie, więc każda kopia ma własne identyfikatory gradientów.
  const uid = useId().replace(/[^a-zA-Z0-9_-]/g, '');
  const sunId = `logo-sun-${uid}`;
  const waveId = `logo-wave-${uid}`;
  return (
    <Link to="/" className="logo" aria-label="Transerfing w praktyce, strona główna">
      <svg viewBox="0 0 64 64" width="32" height="32" aria-hidden>
        <defs>
          <linearGradient id={sunId} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#ffe3a3" />
            <stop offset="1" stopColor="#f2a65a" />
          </linearGradient>
          <linearGradient id={waveId} x1="0" y1="0" x2="1" y2="0">
            <stop offset="0" stopColor="#7cc6d6" />
            <stop offset="1" stopColor="#b69cff" />
          </linearGradient>
        </defs>
        <circle cx="32" cy="27" r="12" fill={`url(#${sunId})`} />
        <path d="M8 42c6-5 11-5 16 0s10 5 16 0 11-5 16 0" fill="none" stroke={`url(#${waveId})`} strokeWidth="4" strokeLinecap="round" />
        <path d="M13 51c5-3.5 9-3.5 13 0s8 3.5 13 0 8-3.5 12 0" fill="none" stroke={`url(#${waveId})`} strokeWidth="3" strokeLinecap="round" opacity=".55" />
      </svg>
      <span className="logo-text">
        Transerfing <em>w praktyce</em>
      </span>
    </Link>
  );
}

function NavList({ onNavigate }: { onNavigate?: () => void }) {
  return (
    <nav aria-label="Główna nawigacja">
      {NAV.map((group) => (
        <div key={group.title} className="nav-group">
          <p className="nav-group-title">{group.title}</p>
          <ul>
            {group.items.map((item) => {
              const Icon = ICONS[item.icon];
              return (
                <li key={item.to}>
                  <NavLink to={item.to} className="nav-link" onClick={onNavigate}>
                    <Icon size={18} aria-hidden />
                    {item.label}
                  </NavLink>
                </li>
              );
            })}
          </ul>
        </div>
      ))}
    </nav>
  );
}

function prefersLight(): boolean {
  return typeof window !== 'undefined' && Boolean(window.matchMedia?.('(prefers-color-scheme: light)').matches);
}

function ThemeToggle() {
  const [settings, update] = useSettings();
  const isLight = settings.theme === 'light' || (settings.theme === 'auto' && prefersLight());
  return (
    <button
      type="button"
      className="icon-btn"
      onClick={() => update({ theme: isLight ? 'dark' : 'light' })}
      aria-label={isLight ? 'Włącz ciemny motyw' : 'Włącz jasny motyw'}
      title={isLight ? 'Ciemny motyw' : 'Jasny motyw'}
    >
      {isLight ? <MoonStar size={20} /> : <Sun size={20} />}
    </button>
  );
}

function PageLoading() {
  return (
    <div className="page-loading" role="status" aria-live="polite">
      <span className="spinner" aria-hidden />
      Ładowanie…
    </div>
  );
}

/** Gdy strona nie może się wczytać (np. brak internetu przy pierwszym otwarciu), pokazujemy komunikat zamiast pustego ekranu. */
class PageErrorBoundary extends Component<{ children: ReactNode; resetKey: string }, { failed: boolean }> {
  state = { failed: false };

  static getDerivedStateFromError() {
    return { failed: true };
  }

  componentDidCatch(error: unknown) {
    console.error(error);
  }

  componentDidUpdate(prev: { resetKey: string }) {
    // Przejście na inną stronę daje jej nową szansę.
    if (prev.resetKey !== this.props.resetKey && this.state.failed) this.setState({ failed: false });
  }

  render() {
    if (!this.state.failed) return this.props.children;
    return (
      <div className="page narrow">
        <EmptyState icon="refresh" title="Nie udało się wyświetlić tej strony">
          <p>Sprawdź połączenie z internetem i odśwież stronę. Twoje dane są bezpieczne w tej przeglądarce.</p>
          <button type="button" className="btn btn-primary" onClick={() => window.location.reload()}>
            Odśwież stronę
          </button>
        </EmptyState>
      </div>
    );
  }
}

export default function Layout() {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const { pathname } = useLocation();
  const [settings] = useSettings();

  useEffect(() => {
    applyTheme(settings.theme);
  }, [settings.theme]);

  useEffect(() => {
    window.scrollTo(0, 0);
    setDrawerOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (!drawerOpen) return;
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setDrawerOpen(false);
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [drawerOpen]);

  return (
    <div className="app">
      <a href="#tresc" className="skip-link">
        Przejdź do treści
      </a>

      <aside className="sidebar">
        <div className="sidebar-head">
          <Logo />
          <ThemeToggle />
        </div>
        <NavList />
        <p className="sidebar-note">
          {PRIVATE ? 'Twoja prywatna wersja serwisu.' : 'Nieoficjalny serwis edukacyjny.'}{' '}
          {STATIC ? 'Twoje dane zostają w tej przeglądarce.' : 'Twoje dane zostają w tej przeglądarce, dopóki sam/sama nie włączysz synchronizacji.'}
        </p>
      </aside>

      <header className="topbar">
        <Logo />
        <div className="topbar-actions">
          <ThemeToggle />
          <button type="button" className="icon-btn" onClick={() => setDrawerOpen(true)} aria-label="Otwórz menu">
            <Menu size={22} />
          </button>
        </div>
      </header>

      {drawerOpen && (
        <div className="drawer-backdrop" onClick={() => setDrawerOpen(false)}>
          <div className="drawer" role="dialog" aria-modal="true" aria-label="Menu" onClick={(e) => e.stopPropagation()}>
            <div className="sidebar-head">
              <Logo />
              <button type="button" className="icon-btn" onClick={() => setDrawerOpen(false)} aria-label="Zamknij menu">
                <X size={22} />
              </button>
            </div>
            <NavList onNavigate={() => setDrawerOpen(false)} />
          </div>
        </div>
      )}

      <main id="tresc" className="main">
        <PageErrorBoundary resetKey={pathname}>
          <Suspense fallback={<PageLoading />}>
            <Outlet />
          </Suspense>
        </PageErrorBoundary>
        <footer className="footer">
          <p>
            „Transerfing w praktyce” to nieoficjalny serwis edukacyjny, niezwiązany z Vadimem Zelandem ani jego wydawcami.
            Treści to własne omówienia idei z jego książek. Po pełną wiedzę sięgnij do oryginałów.
          </p>
          <p className="footer-links">
            <Link to="/o-projekcie/">O projekcie i źródła</Link>
            <Link to="/prywatnosc/">{PRIVACY_TITLE}</Link>
          </p>
        </footer>
      </main>

      <nav className="tabbar" aria-label="Szybka nawigacja">
        {TABS.map((tab) => {
          const Icon = ICONS[tab.icon];
          return (
            <NavLink key={tab.to} to={tab.to} className="tab">
              <Icon size={20} aria-hidden />
              <span>{tab.label}</span>
            </NavLink>
          );
        })}
        <button type="button" className="tab" onClick={() => setDrawerOpen(true)}>
          <MoreHorizontal size={20} aria-hidden />
          <span>Więcej</span>
        </button>
      </nav>

      <ReminderEngine />
    </div>
  );
}

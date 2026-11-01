import { matchPath } from 'react-router';
import { lazyPage, type LazyPage } from './lib/lazyPage';

export const PAGES = {
  Home: lazyPage(() => import('./pages/Home')),
  Today: lazyPage(() => import('./pages/Today')),
  Navigator: lazyPage(() => import('./pages/Navigator')),
  Assistant: lazyPage(() => import('./pages/Assistant')),
  Program: lazyPage(() => import('./pages/Program')),
  ProgramDay: lazyPage(() => import('./pages/ProgramDay')),
  Practice: lazyPage(() => import('./pages/Practice')),
  ToolPage: lazyPage(() => import('./pages/ToolPage')),
  Challenges: lazyPage(() => import('./pages/Challenges')),
  Journal: lazyPage(() => import('./pages/Journal')),
  Knowledge: lazyPage(() => import('./pages/Knowledge')),
  Lesson: lazyPage(() => import('./pages/Lesson')),
  Areas: lazyPage(() => import('./pages/Areas')),
  AreaPage: lazyPage(() => import('./pages/AreaPage')),
  Scenarios: lazyPage(() => import('./pages/Scenarios')),
  ScenarioPage: lazyPage(() => import('./pages/ScenarioPage')),
  Flashcards: lazyPage(() => import('./pages/Flashcards')),
  Matrix: lazyPage(() => import('./pages/Matrix')),
  Glossary: lazyPage(() => import('./pages/Glossary')),
  Quiz: lazyPage(() => import('./pages/Quiz')),
  Progress: lazyPage(() => import('./pages/Progress')),
  Week: lazyPage(() => import('./pages/Week')),
  Lab: lazyPage(() => import('./pages/Lab')),
  Settings: lazyPage(() => import('./pages/Settings')),
  Account: lazyPage(() => import('./pages/Account')),
  About: lazyPage(() => import('./pages/About')),
  Privacy: lazyPage(() => import('./pages/Privacy')),
  NotFound: lazyPage(() => import('./pages/NotFound')),
} satisfies Record<string, LazyPage>;

export interface RouteDef {
  path: string;
  page: LazyPage;
}

export const ROUTES: RouteDef[] = [
  { path: '/', page: PAGES.Home },
  { path: '/dzis', page: PAGES.Today },
  { path: '/nawigator', page: PAGES.Navigator },
  { path: '/nawigator/:id', page: PAGES.Navigator },
  { path: '/asystent', page: PAGES.Assistant },
  { path: '/program', page: PAGES.Program },
  { path: '/program/dzien/:day', page: PAGES.ProgramDay },
  { path: '/praktyka', page: PAGES.Practice },
  { path: '/praktyka/:tool', page: PAGES.ToolPage },
  { path: '/wyzwania', page: PAGES.Challenges },
  { path: '/dziennik', page: PAGES.Journal },
  { path: '/wiedza', page: PAGES.Knowledge },
  { path: '/wiedza/:slug', page: PAGES.Lesson },
  { path: '/obszary', page: PAGES.Areas },
  { path: '/obszary/:slug', page: PAGES.AreaPage },
  { path: '/scenariusze', page: PAGES.Scenarios },
  { path: '/scenariusze/:id', page: PAGES.ScenarioPage },
  { path: '/fiszki', page: PAGES.Flashcards },
  { path: '/matrix', page: PAGES.Matrix },
  { path: '/slownik', page: PAGES.Glossary },
  { path: '/quiz', page: PAGES.Quiz },
  { path: '/postep', page: PAGES.Progress },
  { path: '/kalendarz', page: PAGES.Week },
  { path: '/laboratorium', page: PAGES.Lab },
  { path: '/ustawienia', page: PAGES.Settings },
  { path: '/konto', page: PAGES.Account },
  { path: '/o-projekcie', page: PAGES.About },
  { path: '/prywatnosc', page: PAGES.Privacy },
];

export function routeForPath(pathname: string): RouteDef | undefined {
  return ROUTES.find((route) => matchPath({ path: route.path, end: true }, pathname));
}

/** Wczytuje kod strony dla podanego adresu, zanim aplikacja się wyrenderuje. */
export async function preloadPath(pathname: string): Promise<void> {
  const route = routeForPath(pathname);
  await (route ? route.page : PAGES.NotFound).preload();
}

export async function preloadAll(): Promise<void> {
  await Promise.all(Object.values(PAGES).map((page) => page.preload()));
}

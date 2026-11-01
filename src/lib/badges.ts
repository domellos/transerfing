import type { CardState, ChallengeState, IconName } from '../types';
import { MASTERED_BOX } from '../data/flashcards';
import { activeDaySet, buildDayFacts, longestStreak, type AllData } from './stats';

export interface BadgeStats {
  awakenings: number;
  slides: number;
  slideSessions: number;
  frameSets: number;
  realized: number;
  pendulums: number;
  importance: number;
  dreams: number;
  journal: number;
  lessonsRead: number;
  lessonsTotal: number;
  programDone: number;
  programTotal: number;
  quizPerfect: number;
  maxStreak: number;
  challengeCompletions: number;
  mastered: number;
  scenariosDone: number;
  scenariosTotal: number;
}

export interface BadgeDef {
  id: string;
  title: string;
  description: string;
  icon: IconName;
  value: (s: BadgeStats) => number;
  target: (s: BadgeStats) => number;
}

const fixed = (n: number) => () => n;

export const BADGES: BadgeDef[] = [
  { id: 'pierwsze-przebudzenie', title: 'Pierwsze przebudzenie', description: 'Obudź się choć raz: widzę siebie i widzę rzeczywistość.', icon: 'eye', value: (s) => s.awakenings, target: fixed(1) },
  { id: 'sto-przebudzen', title: '100 przebudzeń', description: 'Nawyk powracania do centrum świadomości.', icon: 'eye', value: (s) => s.awakenings, target: fixed(100) },
  { id: 'tysiac-przebudzen', title: '1000 przebudzeń', description: 'Przebudzenie staje się twoim drugim oddechem.', icon: 'sparkles', value: (s) => s.awakenings, target: fixed(1000) },
  { id: 'pierwszy-slajd', title: 'Pierwszy slajd', description: 'Stwórz slajd swojego celu.', icon: 'image', value: (s) => s.slides, target: fixed(1) },
  { id: 'slajdy-30', title: '30 sesji slajdów', description: 'Miesiąc życia w wybranym wariancie.', icon: 'images', value: (s) => s.slideSessions, target: fixed(30) },
  { id: 'pierwszy-kadr', title: 'Pierwszy kadr', description: 'Ustaw kadr z warkoczem.', icon: 'wand', value: (s) => s.frameSets, target: fixed(1) },
  { id: 'kadr-zrealizowany', title: 'Kadr zrealizowany', description: 'Oznacz pierwszy kadr, który się zrealizował.', icon: 'gem', value: (s) => s.realized, target: fixed(1) },
  { id: 'piec-kadrow', title: '5 zrealizowanych kadrów', description: 'Galeria dowodów, że masz wpływ.', icon: 'gem', value: (s) => s.realized, target: fixed(5) },
  { id: 'detektyw', title: 'Detektyw wahadeł', description: 'Rozpoznaj i zapisz 10 wahadeł.', icon: 'waves', value: (s) => s.pendulums, target: fixed(10) },
  { id: 'lekkosc', title: 'Lekkość', description: 'Przejdź 10 razy procedurę obniżania ważności.', icon: 'scale', value: (s) => s.importance, target: fixed(10) },
  { id: 'sniacy', title: 'Strażnik snów', description: 'Zapisz 10 snów w Dzienniku snów.', icon: 'bed', value: (s) => s.dreams, target: fixed(10) },
  { id: 'kronikarz', title: 'Kronikarz', description: 'Zrób 50 wpisów w dzienniku.', icon: 'notebook', value: (s) => s.journal, target: fixed(50) },
  { id: 'tydzien-z-rzedu', title: 'Tydzień z rzędu', description: '7 kolejnych dni praktyki.', icon: 'calendar', value: (s) => s.maxStreak, target: fixed(7) },
  { id: 'miesiac-z-rzedu', title: 'Miesiąc z rzędu', description: '30 kolejnych dni praktyki.', icon: 'calendar', value: (s) => s.maxStreak, target: fixed(30) },
  { id: 'uczen', title: 'Cała wiedza', description: 'Przeczytaj wszystkie lekcje.', icon: 'book', value: (s) => s.lessonsRead, target: (s) => s.lessonsTotal },
  { id: 'program', title: 'Program ukończony', description: 'Przejdź wszystkie dni programu 8 tygodni.', icon: 'map', value: (s) => s.programDone, target: (s) => s.programTotal },
  { id: 'quiz', title: 'Bezbłędnie', description: 'Zdobądź 100% w dowolnym quizie.', icon: 'graduation', value: (s) => s.quizPerfect, target: fixed(1) },
  { id: 'wyzwanie', title: 'Pierwsze wyzwanie', description: 'Ukończ dowolne wyzwanie.', icon: 'trophy', value: (s) => s.challengeCompletions, target: fixed(1) },
  { id: 'mistrz-wyzwan', title: 'Mistrz wyzwań', description: 'Ukończ 5 wyzwań.', icon: 'trophy', value: (s) => s.challengeCompletions, target: fixed(5) },
  { id: 'fiszki', title: 'Pojęcia w małym palcu', description: 'Opanuj 30 fiszek.', icon: 'cards', value: (s) => s.mastered, target: fixed(30) },
  { id: 'scenariusze', title: 'Wszystkie scenariusze', description: 'Przećwicz wszystkie scenariusze.', icon: 'route', value: (s) => s.scenariosDone, target: (s) => s.scenariosTotal },
];

export function computeBadgeStats(input: {
  data: AllData;
  quizBest: Record<string, number>;
  challenges: Record<string, ChallengeState>;
  flashcards: Record<string, CardState>;
  scenarios: Record<string, number>;
  lessonsTotal: number;
  programTotal: number;
  scenariosTotal: number;
}): BadgeStats {
  const { data } = input;
  const facts = buildDayFacts(data);
  const byType = (type: string) => data.journal.filter((e) => e.type === type).length;
  return {
    awakenings: Object.values(data.awakenings).reduce((s, v) => s + v, 0),
    slides: data.slides.length,
    slideSessions: data.slides.reduce((s, x) => s + x.sessions.length, 0),
    frameSets: data.frames.reduce((s, f) => s + f.sets.length, 0),
    realized: data.frames.filter((f) => f.status === 'zrealizowany').length,
    pendulums: byType('wahadlo'),
    importance: byType('waznosc'),
    dreams: byType('sen'),
    journal: data.journal.length,
    lessonsRead: Object.keys(data.lessonsRead).length,
    lessonsTotal: input.lessonsTotal,
    programDone: Object.keys(data.program.done).length,
    programTotal: input.programTotal,
    quizPerfect: Object.values(input.quizBest).filter((v) => v >= 100).length,
    maxStreak: longestStreak(activeDaySet(facts)),
    challengeCompletions: Object.values(input.challenges).reduce((s, c) => s + (c.completions?.length ?? 0), 0),
    mastered: Object.values(input.flashcards).filter((c) => c.box >= MASTERED_BOX).length,
    scenariosDone: Object.keys(input.scenarios).length,
    scenariosTotal: input.scenariosTotal,
  };
}

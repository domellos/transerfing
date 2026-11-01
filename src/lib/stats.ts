import { useMemo } from 'react';
import {
  useAwakenings,
  useCheckins,
  useDailyDone,
  useDetox,
  useEnergySessions,
  useFlashcardsLog,
  useFrames,
  useJournal,
  useLessonsRead,
  useProgram,
  useSlides,
} from '../state';
import { addDays, dateKey } from './date';
import type { CheckIn, Frame, JournalEntry, ProgramState, Slide } from '../types';

export interface AllData {
  journal: JournalEntry[];
  awakenings: Record<string, number>;
  slides: Slide[];
  frames: Frame[];
  detox: Record<string, string[]>;
  checkins: Record<string, CheckIn>;
  energySessions: string[];
  dailyDone: Record<string, string[]>;
  program: ProgramState;
  lessonsRead: Record<string, string>;
  flashcardsLog: Record<string, number>;
}

/** Wszystkie dane praktyki potrzebne do statystyk, wyzwań i odznak. */
export function useAllData(): AllData {
  const { entries: journal } = useJournal();
  const [awakenings] = useAwakenings();
  const [slides] = useSlides();
  const [frames] = useFrames();
  const [detox] = useDetox();
  const [checkins] = useCheckins();
  const [energySessions] = useEnergySessions();
  const [dailyDone] = useDailyDone();
  const [program] = useProgram();
  const [lessonsRead] = useLessonsRead();
  const [flashcardsLog] = useFlashcardsLog();
  return useMemo(
    () => ({ journal, awakenings, slides, frames, detox, checkins, energySessions, dailyDone, program, lessonsRead, flashcardsLog }),
    [journal, awakenings, slides, frames, detox, checkins, energySessions, dailyDone, program, lessonsRead, flashcardsLog],
  );
}

export interface DayFacts {
  date: string;
  morning: boolean;
  evening: boolean;
  dream: boolean;
  frajling: boolean;
  koordynacja: boolean;
  waznosc: boolean;
  wahadlo: boolean;
  journal: number;
  awakenings: number;
  slide: boolean;
  frame: boolean;
  energy: boolean;
  detox: string[];
  checkin?: CheckIn;
  program: boolean;
  lesson: boolean;
  flashcards: number;
}

const isoKey = (iso: string) => dateKey(new Date(iso));

function emptyDay(date: string): DayFacts {
  return {
    date,
    morning: false,
    evening: false,
    dream: false,
    frajling: false,
    koordynacja: false,
    waznosc: false,
    wahadlo: false,
    journal: 0,
    awakenings: 0,
    slide: false,
    frame: false,
    energy: false,
    detox: [],
    program: false,
    lesson: false,
    flashcards: 0,
  };
}

export function buildDayFacts(data: AllData): Map<string, DayFacts> {
  const days = new Map<string, DayFacts>();
  const day = (key: string) => {
    let f = days.get(key);
    if (!f) {
      f = emptyDay(key);
      days.set(key, f);
    }
    return f;
  };

  for (const e of data.journal) {
    const f = day(e.date);
    f.journal += 1;
    if (e.type === 'poranek') f.morning = true;
    if (e.type === 'wieczor') f.evening = true;
    if (e.type === 'sen') f.dream = true;
    if (e.type === 'frajling') f.frajling = true;
    if (e.type === 'koordynacja') f.koordynacja = true;
    if (e.type === 'waznosc') f.waznosc = true;
    if (e.type === 'wahadlo') f.wahadlo = true;
  }
  for (const [k, n] of Object.entries(data.awakenings)) if (n > 0) day(k).awakenings = n;
  for (const s of data.slides) for (const iso of s.sessions) day(isoKey(iso)).slide = true;
  for (const fr of data.frames) for (const iso of fr.sets) day(isoKey(iso)).frame = true;
  for (const iso of data.energySessions) day(isoKey(iso)).energy = true;
  for (const [k, list] of Object.entries(data.detox)) if (list.length) day(k).detox = list;
  for (const [k, c] of Object.entries(data.checkins)) if (Object.keys(c).length) day(k).checkin = c;
  for (const k of Object.values(data.program.done)) day(k).program = true;
  for (const k of Object.values(data.lessonsRead)) day(k).lesson = true;
  for (const [k, n] of Object.entries(data.flashcardsLog)) if (n > 0) day(k).flashcards = n;
  for (const [k, list] of Object.entries(data.dailyDone)) if (list.length) day(k);
  return days;
}

/** Liczba rodzajów praktyki wykonanych danego dnia (do mapy aktywności). */
export function practiceCount(f: DayFacts | undefined): number {
  if (!f) return 0;
  return [
    f.morning,
    f.evening,
    f.awakenings > 0,
    f.slide || f.frame,
    f.energy,
    f.frajling || f.koordynacja,
    f.waznosc || f.wahadlo,
    f.detox.length > 0,
    f.dream,
    f.program || f.lesson,
    f.flashcards > 0,
    Boolean(f.checkin),
  ].filter(Boolean).length;
}

export function longestStreak(days: Set<string>): number {
  let best = 0;
  for (const key of days) {
    if (days.has(addDays(key, -1))) continue;
    let length = 1;
    let next = addDays(key, 1);
    while (days.has(next)) {
      length += 1;
      next = addDays(next, 1);
    }
    best = Math.max(best, length);
  }
  return best;
}

export function activeDaySet(facts: Map<string, DayFacts>): Set<string> {
  return new Set([...facts.values()].filter((f) => practiceCount(f) > 0).map((f) => f.date));
}

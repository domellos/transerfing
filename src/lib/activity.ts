import { dateKey } from './date';
import type { CheckIn, Frame, JournalEntry, Slide } from '../types';

export const isoToKey = (iso: string) => dateKey(new Date(iso));

/** Zbiór dni, w których była jakakolwiek praktyka. */
export function activeDays(input: {
  journal: JournalEntry[];
  awakenings: Record<string, number>;
  slides: Slide[];
  frames: Frame[];
  detox: Record<string, string[]>;
  checkins: Record<string, CheckIn>;
  energySessions: string[];
  dailyDone: Record<string, string[]>;
  programDone: Record<string, string>;
}): Set<string> {
  const days = new Set<string>();
  input.journal.forEach((e) => days.add(e.date));
  Object.entries(input.awakenings).forEach(([k, v]) => v > 0 && days.add(k));
  input.slides.forEach((s) => s.sessions.forEach((iso) => days.add(isoToKey(iso))));
  input.frames.forEach((f) => f.sets.forEach((iso) => days.add(isoToKey(iso))));
  Object.entries(input.detox).forEach(([k, v]) => v.length > 0 && days.add(k));
  Object.entries(input.checkins).forEach(([k, v]) => Object.keys(v).length > 0 && days.add(k));
  input.energySessions.forEach((iso) => days.add(isoToKey(iso)));
  Object.entries(input.dailyDone).forEach(([k, v]) => v.length > 0 && days.add(k));
  Object.values(input.programDone).forEach((k) => days.add(k));
  return days;
}

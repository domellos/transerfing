import { FLASHCARDS, NEW_CARDS_PER_DAY } from '../data/flashcards';
import { dateKey } from './date';
import type { CardState } from '../types';

/** Liczba fiszek do powtórki dziś (zaległe + nowe w dziennym limicie). */
export function cardsForToday(states: Record<string, CardState>, today = dateKey()): number {
  const due = FLASHCARDS.filter((c) => states[c.id] && states[c.id].due <= today).length;
  const newToday = FLASHCARDS.filter((c) => states[c.id]?.reviews === 1 && states[c.id]?.lastReviewed === today).length;
  const fresh = FLASHCARDS.filter((c) => !states[c.id]).length;
  return due + Math.min(fresh, Math.max(0, NEW_CARDS_PER_DAY - newToday));
}

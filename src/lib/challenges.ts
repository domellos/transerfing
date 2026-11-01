import type { ChallengeDef } from '../data/challenges';
import type { ChallengeState } from '../types';
import { addDays, dateKey, daysBetween } from './date';
import type { DayFacts } from './stats';

export interface ChallengeDay {
  date: string;
  auto: boolean;
  manual: boolean;
  done: boolean;
}

export interface ChallengeProgress {
  done: number;
  elapsed: number;
  days: ChallengeDay[];
  completed: boolean;
  todayDone: boolean;
  todayAuto: boolean;
}

export function challengeProgress(
  def: ChallengeDef,
  state: ChallengeState,
  facts: Map<string, DayFacts>,
  today = dateKey(),
): ChallengeProgress {
  const span = Math.max(0, Math.min(daysBetween(state.startedAt, today), def.days * 4));
  const days: ChallengeDay[] = [];
  let done = 0;
  for (let i = 0; i <= span; i += 1) {
    const date = addDays(state.startedAt, i);
    const f = facts.get(date);
    const auto = Boolean(def.auto && f && def.auto(f));
    const manual = Boolean(state.marks[date]);
    const ok = auto || manual;
    if (ok) done += 1;
    days.push({ date, auto, manual, done: ok });
  }
  const todayEntry = days.find((d) => d.date === today);
  return {
    done: Math.min(done, def.days),
    elapsed: span + 1,
    days,
    completed: Boolean(state.completedAt) || done >= def.days,
    todayDone: Boolean(todayEntry?.done),
    todayAuto: Boolean(todayEntry?.auto),
  };
}

import { useCallback } from 'react';
import { useStored, newId } from './lib/storage';
import { dateKey } from './lib/date';
import type {
  AccountInfo,
  CardState,
  ChallengeState,
  ChatMessage,
  CheckIn,
  Frame,
  GoalCandidate,
  Habit,
  JournalEntry,
  JournalType,
  ProgramState,
  PushSettings,
  Settings,
  Slide,
  SyncStatus,
} from './types';

export const DEFAULT_SETTINGS: Settings = {
  name: '',
  theme: 'dark',
  sound: true,
  reminderEnabled: false,
  reminderMinutes: 45,
  voice: false,
  voiceName: '',
  voiceRate: 0.95,
};

export const DEFAULT_PUSH: PushSettings = { interval: 60, jitter: true, from: '08:00', to: '21:00', days: [1, 2, 3, 4, 5, 6, 7] };
export const DEFAULT_SYNC_STATUS: SyncStatus = { state: 'idle', version: 0, lastSyncAt: null, error: null };

const DEFAULT_PROGRAM: ProgramState = { startedAt: null, done: {}, notes: {} };
const EMPTY_RECORD: Record<string, never> = {};
const EMPTY_LIST: never[] = [];
export const DEFAULT_ANCHORS = ['Otwieranie drzwi', 'Sięganie po telefon', 'Picie wody'];

export function useSettings(): [Settings, (patch: Partial<Settings>) => void] {
  const [stored, setStored] = useStored<Partial<Settings>>('settings', DEFAULT_SETTINGS);
  const settings = { ...DEFAULT_SETTINGS, ...stored };
  const update = useCallback(
    (patch: Partial<Settings>) => setStored((prev) => ({ ...DEFAULT_SETTINGS, ...prev, ...patch })),
    [setStored],
  );
  return [settings, update];
}

export const useLessonsRead = () => useStored<Record<string, string>>('lessonsRead', EMPTY_RECORD);
export const useLessonNotes = () => useStored<Record<string, Record<string, string>>>('lessonNotes', EMPTY_RECORD);
export const useProgram = () => useStored<ProgramState>('program', DEFAULT_PROGRAM);
export const useSlides = () => useStored<Slide[]>('slides', EMPTY_LIST);
export const useFrames = () => useStored<Frame[]>('frames', EMPTY_LIST);
export const useGoals = () => useStored<GoalCandidate[]>('goals', EMPTY_LIST);
export const useAwakenings = () => useStored<Record<string, number>>('awakenings', EMPTY_RECORD);
export const useAnchors = () => useStored<string[]>('anchors', DEFAULT_ANCHORS);
export const useCheckins = () => useStored<Record<string, CheckIn>>('checkins', EMPTY_RECORD);
export const useDetox = () => useStored<Record<string, string[]>>('detox', EMPTY_RECORD);
export const useCustomHabits = () => useStored<Habit[]>('customHabits', EMPTY_LIST);
export const useEnergySessions = () => useStored<string[]>('energySessions', EMPTY_LIST);
export const useQuizBest = () => useStored<Record<string, number>>('quizBest', EMPTY_RECORD);
export const useMatrixTest = () => useStored<{ date: string; score: number } | null>('matrixTest', null);
export const useDailyDone = () => useStored<Record<string, string[]>>('dailyDone', EMPTY_RECORD);
export const useChallenges = () => useStored<Record<string, ChallengeState>>('challenges', EMPTY_RECORD);
export const useFlashcards = () => useStored<Record<string, CardState>>('flashcards', EMPTY_RECORD);
export const useFlashcardsLog = () => useStored<Record<string, number>>('flashcardsLog', EMPTY_RECORD);
export const useScenarios = () => useStored<Record<string, number>>('scenarios', EMPTY_RECORD);
export const useAccount = () => useStored<AccountInfo | null>('account', null);
export const useSyncStatus = () => useStored<SyncStatus>('syncStatus', DEFAULT_SYNC_STATUS);
export const usePushSettings = () => useStored<PushSettings>('pushSettings', DEFAULT_PUSH);
export const useAssistantChat = () => useStored<ChatMessage[]>('assistantChat', EMPTY_LIST);

export function useJournal() {
  const [entries, setEntries] = useStored<JournalEntry[]>('journal', EMPTY_LIST);

  const addEntry = useCallback(
    (entry: Omit<JournalEntry, 'id' | 'createdAt' | 'date'> & { date?: string }) => {
      const full: JournalEntry = {
        ...entry,
        id: newId(),
        createdAt: new Date().toISOString(),
        date: entry.date ?? dateKey(),
      };
      setEntries((prev) => [full, ...prev]);
      return full;
    },
    [setEntries],
  );

  const removeEntry = useCallback(
    (id: string) => setEntries((prev) => prev.filter((e) => e.id !== id)),
    [setEntries],
  );

  const updateEntry = useCallback(
    (id: string, patch: Partial<JournalEntry>) =>
      setEntries((prev) => prev.map((e) => (e.id === id ? { ...e, ...patch } : e))),
    [setEntries],
  );

  return { entries, addEntry, removeEntry, updateEntry };
}

export function useAwakeningCounter() {
  const [awakenings, setAwakenings] = useAwakenings();
  const today = dateKey();
  const add = useCallback(
    () => setAwakenings((prev) => ({ ...prev, [today]: (prev[today] ?? 0) + 1 })),
    [setAwakenings, today],
  );
  return { count: awakenings[today] ?? 0, all: awakenings, add };
}

export function entriesOfTypeToday(entries: JournalEntry[], type: JournalType) {
  const today = dateKey();
  return entries.filter((e) => e.type === type && e.date === today);
}

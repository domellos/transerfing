export type ModuleId =
  | 'podstawy'
  | 'wahadla'
  | 'rownowaga'
  | 'zamiar'
  | 'dusza'
  | 'lustro'
  | 'tafti'
  | 'matrix';

export type ToolId =
  | 'poranek'
  | 'przebudzenie'
  | 'wieczor'
  | 'sny'
  | 'wahadla'
  | 'waznosc'
  | 'detoks'
  | 'energia'
  | 'cele'
  | 'slajdy'
  | 'wizje'
  | 'warkocz'
  | 'tapeta'
  | 'koordynacja'
  | 'frajling'
  | 'drogowskazy';

export type IconName =
  | 'sun'
  | 'sunrise'
  | 'moon'
  | 'map'
  | 'sparkles'
  | 'notebook'
  | 'book'
  | 'door'
  | 'library'
  | 'graduation'
  | 'chart'
  | 'info'
  | 'waves'
  | 'scale'
  | 'target'
  | 'eye'
  | 'zap'
  | 'leaf'
  | 'refresh'
  | 'signpost'
  | 'heartHandshake'
  | 'clapperboard'
  | 'compass'
  | 'brain'
  | 'heart'
  | 'gem'
  | 'phoneOff'
  | 'wand'
  | 'orbit'
  | 'shield'
  | 'layers'
  | 'route'
  | 'image'
  | 'images'
  | 'smartphone'
  | 'bed'
  | 'trophy'
  | 'cards'
  | 'calendar'
  | 'flask'
  | 'settings'
  | 'user'
  | 'bot'
  | 'lock'
  | 'briefcase'
  | 'coins'
  | 'users'
  | 'activity'
  | 'swords'
  | 'help';

export interface ModuleDef {
  id: ModuleId;
  title: string;
  short: string;
  tagline: string;
  description: string;
  hue: number;
  icon: IconName;
}

export interface LessonSection {
  heading: string;
  body?: string[];
  bullets?: string[];
}

export interface Lesson {
  slug: string;
  module: ModuleId;
  title: string;
  subtitle: string;
  summary: string;
  sections: LessonSection[];
  practice: { title: string; steps: string[]; tip?: string };
  mistakes: string[];
  questions: string[];
  related: string[];
  tool?: ToolId;
  source: string;
}

export interface ProgramDay {
  day: number;
  title: string;
  lesson?: string;
  task: string;
  reflection: string;
  tool?: ToolId;
}

export interface ProgramWeek {
  week: number;
  title: string;
  intro: string;
  days: ProgramDay[];
}

export interface QuizQuestion {
  module: ModuleId;
  question: string;
  options: string[];
  correct: number;
  explanation: string;
  lesson: string;
}

export interface GlossaryTerm {
  term: string;
  definition: string;
  lesson?: string;
}

export type ToolGroup = 'rytualy' | 'energia' | 'kreowanie' | 'relacje';

export interface ToolDef {
  id: ToolId;
  title: string;
  short: string;
  description: string;
  icon: IconName;
  group: ToolGroup;
  lesson?: string;
  time: string;
}

export type JournalType =
  | 'poranek'
  | 'wieczor'
  | 'koordynacja'
  | 'drogowskazy'
  | 'frajling'
  | 'wahadlo'
  | 'waznosc'
  | 'sen'
  | 'tydzien'
  | 'notatka';

export interface JournalEntry {
  id: string;
  type: JournalType;
  date: string;
  createdAt: string;
  fields: Record<string, string>;
  rating?: number;
  tags?: string[];
  meta?: Record<string, number>;
}

export interface JournalField {
  key: string;
  label: string;
  placeholder?: string;
  rows?: number;
  suggestions?: string[];
}

export interface JournalConfig {
  type: JournalType;
  tool: ToolId;
  title: string;
  intro: string;
  fields: JournalField[];
  rating?: { label: string; low: string; high: string };
  tags?: string[];
  lesson?: string;
  saveLabel: string;
}

export interface Settings {
  name: string;
  theme: 'dark' | 'light' | 'auto';
  sound: boolean;
  reminderEnabled: boolean;
  reminderMinutes: number;
  /** Lektor czyta kroki prowadzonych sesji. */
  voice: boolean;
  voiceName: string;
  voiceRate: number;
}

export interface ProgramState {
  startedAt: string | null;
  done: Record<string, string>;
  notes: Record<string, string>;
}

export interface Slide {
  id: string;
  title: string;
  scene: string;
  feelings: string;
  process: string;
  declaration: string;
  details: string[];
  createdAt: string;
  sessions: string[];
  goalId?: string;
}

export interface Frame {
  id: string;
  text: string;
  createdAt: string;
  sets: string[];
  status: 'aktywny' | 'zrealizowany';
  realizedAt?: string;
  note?: string;
}

export interface GoalTest {
  notMeans: boolean | null;
  forMe: boolean | null;
  lightness: boolean | null;
  noPersuasion: boolean | null;
  celebration: boolean | null;
  comfort: number;
}

export interface GoalCandidate {
  id: string;
  text: string;
  createdAt: string;
  test?: GoalTest;
  chosen: boolean;
  doors: string[];
  nextStep: string;
}

export interface CheckIn {
  energia?: number;
  waznosc?: number;
  nastroj?: number;
}

export interface Habit {
  id: string;
  label: string;
  hint?: string;
}

export type SituationCategory = 'emocje' | 'relacje' | 'cele' | 'praca' | 'energia';

export interface Situation {
  id: string;
  title: string;
  category: SituationCategory;
  keywords: string[];
  diagnosis: string;
  steps: string[];
  phrase?: string;
  lessons: string[];
  tools: ToolId[];
}

export interface LifeArea {
  slug: string;
  title: string;
  icon: IconName;
  tagline: string;
  intro: string[];
  pendulums: string[];
  importance: string[];
  principles: { principle: string; lesson: string; action: string }[];
  plan: string[];
  tools: ToolId[];
  caution?: string;
}

export interface ScenarioOption {
  text: string;
  verdict: 'najlepsza' | 'częściowo' | 'pułapka';
  feedback: string;
  lesson: string;
}

export interface Scenario {
  id: string;
  title: string;
  area: string;
  situation: string;
  question: string;
  options: ScenarioOption[];
}

export interface Flashcard {
  id: string;
  front: string;
  back: string;
  lesson?: string;
}

export interface CardState {
  box: number;
  due: string;
  reviews: number;
  lastReviewed: string;
}

export interface ChallengeState {
  startedAt: string;
  marks: Record<string, boolean>;
  completedAt?: string;
  completions: string[];
}

export interface PushSettings {
  interval: number;
  jitter: boolean;
  from: string;
  to: string;
  days: number[];
}

export interface AccountInfo {
  username: string;
  token: string;
  createdAt?: string;
}

export interface SyncStatus {
  state: 'idle' | 'syncing' | 'error' | 'locked';
  version: number;
  lastSyncAt: string | null;
  error: string | null;
}

export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
  at: string;
}

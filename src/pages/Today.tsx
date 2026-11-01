import { useMemo } from 'react';
import { Link } from 'react-router';
import { ArrowRight, CalendarCheck, CircleCheck, Circle, Compass, Flame, Quote, RefreshCw, Signpost, Trophy, Waves, WalletCards } from 'lucide-react';
import { PageHeader, Scale5, Stat } from '../components/ui';
import { useChallenges, useCheckins, useDailyDone, useDetox, useFlashcards, useFrames, useSettings, useAwakeningCounter } from '../state';
import { dateKey, dayOfYear, formatLong, parseKey, plural, streak, addDays } from '../lib/date';
import { thoughtForDay } from '../data/misc';
import { PROGRAM_DAYS, PROGRAM_LENGTH } from '../data/program';
import { LESSON_BY_SLUG } from '../data/lessons';
import { CHALLENGES } from '../data/challenges';
import { activeDaySet, buildDayFacts, useAllData } from '../lib/stats';
import { challengeProgress } from '../lib/challenges';
import { cardsForToday } from '../lib/cards';
import { useTitle } from '../lib/hooks';
import type { CheckIn } from '../types';

function greeting(hour: number) {
  if (hour < 5) return 'Dobrej nocy';
  if (hour < 12) return 'Dzień dobry';
  if (hour < 18) return 'Dobrego popołudnia';
  return 'Dobry wieczór';
}

export default function Today() {
  useTitle('Dziś');
  const today = dateKey();
  const now = new Date();
  const [settings] = useSettings();
  const data = useAllData();
  const { count: awakeCount } = useAwakeningCounter();
  const [frames] = useFrames();
  const [detox] = useDetox();
  const [checkins, setCheckins] = useCheckins();
  const [dailyDone, setDailyDone] = useDailyDone();
  const [challenges, setChallenges] = useChallenges();
  const [flashcards] = useFlashcards();
  const facts = useMemo(() => buildDayFacts(data), [data]);
  const todayFacts = facts.get(today);

  const detoxCount = detox[today]?.length ?? 0;
  const manual = new Set(dailyDone[today] ?? []);

  const practices = [
    { id: 'poranek', label: 'Poranne ustawienie kadrów', to: '/praktyka/poranek/', auto: Boolean(todayFacts?.morning) },
    { id: 'przebudzenia', label: `Przebudzenia w ciągu dnia (${awakeCount}/10)`, to: '/praktyka/przebudzenie/', auto: awakeCount >= 10 },
    { id: 'kadr', label: 'Sesja slajdu lub ustawienie kadru', to: '/praktyka/warkocz/', auto: Boolean(todayFacts?.slide || todayFacts?.frame) },
    { id: 'frajling', label: 'Akt frajlingu', to: '/praktyka/frajling/', auto: Boolean(todayFacts?.frajling) },
    { id: 'detoks', label: `Detoks od matrixa (${detoxCount}/3 nawyki)`, to: '/praktyka/detoks/', auto: detoxCount >= 3 },
    { id: 'wieczor', label: 'Wieczorny przegląd', to: '/praktyka/wieczor/', auto: Boolean(todayFacts?.evening) },
  ];
  const doneCount = practices.filter((p) => p.auto || manual.has(p.id)).length;

  const toggleManual = (id: string) =>
    setDailyDone((prev) => {
      const set = new Set(prev[today] ?? []);
      if (set.has(id)) set.delete(id);
      else set.add(id);
      return { ...prev, [today]: [...set] };
    });

  const checkin: CheckIn = checkins[today] ?? {};
  const setCheck = (key: keyof CheckIn, value: number) => setCheckins((prev) => ({ ...prev, [today]: { ...prev[today], [key]: value } }));

  const currentStreak = streak(activeDaySet(facts));
  const program = data.program;
  const nextDay = program.startedAt ? PROGRAM_DAYS.find((d) => !program.done[String(d.day)]) : undefined;
  const nextLesson = nextDay?.lesson ? LESSON_BY_SLUG[nextDay.lesson] : undefined;
  const programFinished = program.startedAt && !nextDay;
  const activeFrames = frames.filter((f) => f.status === 'aktywny').slice(0, 3);

  const activeChallenges = CHALLENGES.filter((c) => challenges[c.id] && !challenges[c.id].completedAt).map((def) => ({
    def,
    progress: challengeProgress(def, challenges[def.id], facts, today),
  }));
  const toggleChallenge = (id: string) =>
    setChallenges((prev) => {
      const current = prev[id];
      if (!current) return prev;
      const marks = { ...current.marks };
      if (marks[today]) delete marks[today];
      else marks[today] = true;
      return { ...prev, [id]: { ...current, marks } };
    });

  const cards = cardsForToday(flashcards, today);
  const dow = parseKey(today).getDay();
  const weekStart = addDays(today, -((dow + 6) % 7));
  const hasWeekly = data.journal.some((e) => e.type === 'tydzien' && e.fields.week === weekStart);
  const showWeekly = (dow === 0 || dow === 1) && !hasWeekly;

  return (
    <div className="page">
      <PageHeader
        eyebrow={formatLong(now)}
        title={`${greeting(now.getHours())}${settings.name ? `, ${settings.name}` : ''}`}
        lead="Twoja codzienna praktyka w jednym miejscu. Zacznij od przebudzenia, a resztę dnia ustaw jak kolejne kadry filmu."
      />

      <section className="card thought-card">
        <Quote size={22} aria-hidden className="thought-icon" />
        <div>
          <p className="eyebrow">Myśl dnia</p>
          <p className="thought-text">{thoughtForDay(dayOfYear(now))}</p>
        </div>
      </section>

      <div className="grid grid-2 today-grid">
        <section className="card">
          <div className="card-head">
            <h2 className="card-title">Praktyka na dziś</h2>
            <span className="badge">
              {doneCount}/{practices.length}
            </span>
          </div>
          <ul className="checklist">
            {practices.map((p) => {
              const done = p.auto || manual.has(p.id);
              return (
                <li key={p.id} className={done ? 'is-done' : ''}>
                  <button
                    type="button"
                    className="check-btn"
                    onClick={() => !p.auto && toggleManual(p.id)}
                    aria-pressed={done}
                    aria-label={done ? `${p.label}: zrobione` : `Oznacz jako zrobione: ${p.label}`}
                    title={p.auto ? 'Zaliczone automatycznie na podstawie twoich wpisów' : 'Kliknij, aby oznaczyć ręcznie'}
                  >
                    {done ? <CircleCheck size={22} /> : <Circle size={22} />}
                  </button>
                  <Link to={p.to} className="checklist-link">
                    {p.label}
                  </Link>
                </li>
              );
            })}
          </ul>
          <div className="stats-row">
            <Stat icon="sparkles" value={currentStreak} label={`${plural(currentStreak, ['dzień', 'dni', 'dni'])} praktyki z rzędu`} />
            <Stat icon="eye" value={awakeCount} label="przebudzeń dziś" />
          </div>
        </section>

        <section className="card">
          <h2 className="card-title">Check-in</h2>
          <p className="muted small">Szybka ocena stanu. Z tych danych korzysta Laboratorium wzorców.</p>
          <div className="checkin">
            <p className="checkin-label">Energia</p>
            <Scale5 label="Energia" value={checkin.energia} onChange={(v) => setCheck('energia', v)} low="niska" high="wysoka" />
            <p className="checkin-label">Ważność i napięcie</p>
            <Scale5 label="Ważność" value={checkin.waznosc} onChange={(v) => setCheck('waznosc', v)} low="luz" high="spięcie" />
            <p className="checkin-label">Nastrój</p>
            <Scale5 label="Nastrój" value={checkin.nastroj} onChange={(v) => setCheck('nastroj', v)} low="ciężki" high="lekki" />
          </div>
          {checkin.waznosc && checkin.waznosc >= 4 ? (
            <p className="hint-box">
              Wysoka ważność? Przejdź przez <Link to="/praktyka/waznosc/">pięć ruchów obniżania ważności</Link>.
            </p>
          ) : null}
          {checkin.energia && checkin.energia <= 2 ? (
            <p className="hint-box">
              Mało energii? Spróbuj <Link to="/praktyka/energia/">ćwiczenia centralnych strumieni</Link> albo spaceru.
            </p>
          ) : null}
        </section>
      </div>

      {(activeChallenges.length > 0 || cards > 0 || showWeekly) && (
        <div className="grid grid-3 today-extras">
          {activeChallenges.map(({ def, progress }) => (
            <section key={def.id} className="card challenge-mini">
              <p className="eyebrow">
                <Trophy size={14} aria-hidden /> Wyzwanie · {progress.done}/{def.days}
              </p>
              <h3>{def.title}</h3>
              {progress.todayAuto ? (
                <p className="saved-note">Dziś zaliczone automatycznie.</p>
              ) : (
                <button type="button" className={`btn btn-sm ${progress.todayDone ? '' : 'btn-primary'}`} onClick={() => toggleChallenge(def.id)} aria-pressed={progress.todayDone}>
                  <CircleCheck size={16} aria-hidden /> {progress.todayDone ? 'Zaliczone (cofnij)' : 'Zaliczam dziś'}
                </button>
              )}
            </section>
          ))}
          {cards > 0 && (
            <Link to="/fiszki/" className="card card-link challenge-mini">
              <p className="eyebrow">
                <WalletCards size={14} aria-hidden /> Fiszki
              </p>
              <h3>
                {cards} {plural(cards, ['karta', 'karty', 'kart'])} do powtórki
              </h3>
              <span className="link-more small">
                Powtórz w 3 minuty <ArrowRight size={14} aria-hidden />
              </span>
            </Link>
          )}
          {showWeekly && (
            <Link to="/kalendarz/" className="card card-link challenge-mini">
              <p className="eyebrow">
                <CalendarCheck size={14} aria-hidden /> Koniec tygodnia
              </p>
              <h3>Czas na przegląd tygodnia</h3>
              <span className="link-more small">
                Co działało, co zmieniasz? <ArrowRight size={14} aria-hidden />
              </span>
            </Link>
          )}
        </div>
      )}

      <section className="card program-card">
        {!program.startedAt && (
          <>
            <p className="eyebrow">Program 8 tygodni</p>
            <h2 className="card-title">Zacznij od dnia pierwszego</h2>
            <p className="muted">Jedno zadanie dziennie, od przebudzenia obserwatora po wyjście z matrixa. Możesz iść we własnym tempie.</p>
            <Link to="/program/" className="btn btn-primary">
              Zobacz program <ArrowRight size={18} />
            </Link>
          </>
        )}
        {nextDay && (
          <>
            <p className="eyebrow">
              Program: dzień {nextDay.day} z {PROGRAM_LENGTH}
            </p>
            <h2 className="card-title">{nextDay.title}</h2>
            <p>{nextDay.task}</p>
            {nextLesson && <p className="muted small">Lekcja: {nextLesson.title}</p>}
            <Link to={`/program/dzien/${nextDay.day}/`} className="btn btn-primary">
              Przejdź do zadania <ArrowRight size={18} />
            </Link>
          </>
        )}
        {programFinished && (
          <>
            <p className="eyebrow">Program 8 tygodni</p>
            <h2 className="card-title">Program ukończony</h2>
            <p className="muted">Praktyka trwa dalej. Wracaj do narzędzi i lekcji, które dają ci najwięcej, albo podejmij nowe wyzwanie.</p>
          </>
        )}
      </section>

      <section className="section">
        <h2 className="section-title">Coś się dzieje?</h2>
        <div className="grid grid-2">
          <Link to="/praktyka/wahadla/" className="card card-link quick-card">
            <Waves size={22} aria-hidden />
            <span>Złapało mnie wahadło</span>
          </Link>
          <Link to="/praktyka/koordynacja/" className="card card-link quick-card">
            <RefreshCw size={22} aria-hidden />
            <span>Coś poszło nie tak</span>
          </Link>
          <Link to="/praktyka/drogowskazy/" className="card card-link quick-card">
            <Signpost size={22} aria-hidden />
            <span>Zauważyłem/zauważyłam znak</span>
          </Link>
          <Link to="/nawigator/" className="card card-link quick-card">
            <Compass size={22} aria-hidden />
            <span>Inna sytuacja: otwórz Nawigator</span>
          </Link>
        </div>
      </section>

      {activeFrames.length > 0 && (
        <section className="section">
          <div className="section-head">
            <h2 className="section-title">Twoje aktywne kadry</h2>
            <Link to="/praktyka/warkocz/" className="link-more">
              Ustaw kadr <ArrowRight size={16} />
            </Link>
          </div>
          <ul className="frame-list">
            {activeFrames.map((f) => (
              <li key={f.id} className="card frame-mini">
                <Flame size={18} aria-hidden />
                <span>{f.text}</span>
                <span className="muted small">{f.sets.length}×</span>
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  );
}

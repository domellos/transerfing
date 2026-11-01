import { useEffect, useMemo } from 'react';
import { Link } from 'react-router';
import { CircleCheck, Circle, Flag, Play, RotateCcw, Trophy } from 'lucide-react';
import { PageHeader, ProgressBar } from '../components/ui';
import { CHALLENGES, CHALLENGE_BY_ID } from '../data/challenges';
import { TOOL_BY_ID } from '../data/tools';
import { LESSON_BY_SLUG } from '../data/lessons';
import { useChallenges } from '../state';
import { buildDayFacts, useAllData } from '../lib/stats';
import { challengeProgress } from '../lib/challenges';
import { dateKey, formatShortKey, formatWeekdayKey, plural } from '../lib/date';
import { useTitle } from '../lib/hooks';
import type { ChallengeState } from '../types';

export default function Challenges() {
  useTitle('Wyzwania');
  const [challenges, setChallenges] = useChallenges();
  const data = useAllData();
  const facts = useMemo(() => buildDayFacts(data), [data]);
  const today = dateKey();

  const active = CHALLENGES.filter((c) => challenges[c.id] && !challenges[c.id].completedAt);
  const available = CHALLENGES.filter((c) => !challenges[c.id] || challenges[c.id].completedAt);
  const totalCompletions = Object.values(challenges).reduce((s, c) => s + (c.completions?.length ?? 0), 0);

  // Zapisz ukończenie, gdy liczba zaliczonych dni osiągnie cel.
  useEffect(() => {
    for (const def of CHALLENGES) {
      const state = challenges[def.id];
      if (!state || state.completedAt) continue;
      if (challengeProgress(def, state, facts, today).completed) {
        setChallenges((prev) => {
          const current = prev[def.id];
          if (!current || current.completedAt) return prev;
          const at = new Date().toISOString();
          return { ...prev, [def.id]: { ...current, completedAt: at, completions: [...(current.completions ?? []), at] } };
        });
      }
    }
  }, [challenges, facts, today, setChallenges]);

  const start = (id: string) =>
    setChallenges((prev) => {
      const previous = prev[id];
      const state: ChallengeState = { startedAt: today, marks: {}, completions: previous?.completions ?? [] };
      return { ...prev, [id]: state };
    });

  const abandon = (id: string) => {
    if (!window.confirm('Przerwać to wyzwanie? Ukończone wcześniej wyzwania zostaną w historii.')) return;
    setChallenges((prev) => {
      const current = prev[id];
      if (!current) return prev;
      if (current.completions?.length) return { ...prev, [id]: { ...current, completedAt: current.completedAt ?? current.completions[current.completions.length - 1] } };
      const copy = { ...prev };
      delete copy[id];
      return copy;
    });
  };

  const toggleToday = (id: string) =>
    setChallenges((prev) => {
      const current = prev[id];
      if (!current) return prev;
      const marks = { ...current.marks };
      if (marks[today]) delete marks[today];
      else marks[today] = true;
      return { ...prev, [id]: { ...current, marks } };
    });

  return (
    <div className="page">
      <PageHeader
        icon="trophy"
        eyebrow={`${totalCompletions} ${plural(totalCompletions, ['ukończone wyzwanie', 'ukończone wyzwania', 'ukończonych wyzwań'])}`}
        title="Wyzwania"
        lead="Krótkie serie, które budują nawyki Transerfingu. Wiele dni zalicza się samo na podstawie twoich wpisów, resztę zaznaczasz ręcznie. Liczy się regularność, nie perfekcja: pominięty dzień nie zeruje postępu."
      />

      {active.length > 0 && (
        <section className="section">
          <h2 className="section-title">Twoje aktywne wyzwania</h2>
          <div className="grid grid-2">
            {active.map((def) => {
              const state = challenges[def.id];
              const progress = challengeProgress(def, state, facts, today);
              const lastDays = progress.days.slice(-7);
              return (
                <article key={def.id} className="card challenge-card">
                  <div className="card-head">
                    <h3>{def.title}</h3>
                    <span className="badge">
                      {progress.done}/{def.days}
                    </span>
                  </div>
                  <ProgressBar value={progress.done} max={def.days} label={`Postęp: ${def.title}`} />
                  <p className="muted small">
                    Start: {formatShortKey(state.startedAt)} · dzień {progress.elapsed}
                  </p>
                  <p>{def.daily}</p>
                  <ul className="day-strip" aria-label="Ostatnie dni">
                    {lastDays.map((d) => (
                      <li key={d.date} className={d.done ? 'is-done' : ''} title={`${formatShortKey(d.date)}: ${d.done ? 'zaliczony' : 'niezaliczony'}`}>
                        <span>{formatWeekdayKey(d.date)}</span>
                        {d.done ? <CircleCheck size={18} aria-hidden /> : <Circle size={18} aria-hidden />}
                      </li>
                    ))}
                  </ul>
                  <div className="form-actions">
                    {progress.todayAuto ? (
                      <span className="saved-note">Dziś zaliczone automatycznie ({def.autoLabel}).</span>
                    ) : (
                      <button type="button" className={`btn ${progress.todayDone ? '' : 'btn-primary'}`} onClick={() => toggleToday(def.id)} aria-pressed={progress.todayDone}>
                        <CircleCheck size={18} aria-hidden /> {progress.todayDone ? 'Dziś zaliczone (cofnij)' : 'Zaliczam dzisiejszy dzień'}
                      </button>
                    )}
                    {def.tool && (
                      <Link to={`/praktyka/${def.tool}/`} className="btn btn-ghost">
                        {TOOL_BY_ID[def.tool].title}
                      </Link>
                    )}
                    <button type="button" className="btn btn-ghost btn-sm" onClick={() => abandon(def.id)}>
                      <Flag size={16} aria-hidden /> Przerwij
                    </button>
                  </div>
                </article>
              );
            })}
          </div>
        </section>
      )}

      <section className="section">
        <h2 className="section-title">{active.length ? 'Kolejne wyzwania' : 'Wybierz wyzwanie'}</h2>
        <div className="grid grid-3">
          {available.map((def) => {
            const state = challenges[def.id];
            const count = state?.completions?.length ?? 0;
            const lesson = def.lesson ? LESSON_BY_SLUG[def.lesson] : undefined;
            return (
              <article key={def.id} className="card challenge-card">
                <div className="card-head">
                  <h3>{def.title}</h3>
                  {count > 0 && (
                    <span className="badge" title="Ukończono">
                      <Trophy size={14} aria-hidden /> {count}×
                    </span>
                  )}
                </div>
                <p className="muted">{def.summary}</p>
                <p className="small">{def.auto ? `Zalicza się samo: ${def.autoLabel}.` : 'Dni zaznaczasz ręcznie.'}</p>
                {lesson && (
                  <p className="small">
                    <Link to={`/wiedza/${lesson.slug}/`}>Lekcja: {lesson.title}</Link>
                  </p>
                )}
                <button type="button" className="btn btn-primary" onClick={() => start(def.id)}>
                  {count > 0 ? <RotateCcw size={18} aria-hidden /> : <Play size={18} aria-hidden />}
                  {count > 0 ? 'Zacznij ponownie' : 'Rozpocznij'} ({def.days} {plural(def.days, ['dzień', 'dni', 'dni'])})
                </button>
              </article>
            );
          })}
        </div>
      </section>

      {Object.entries(challenges).some(([, s]) => s.completions?.length) && (
        <section className="section">
          <h2 className="section-title">Historia</h2>
          <ul className="history">
            {Object.entries(challenges).flatMap(([id, s]) =>
              (s.completions ?? []).map((at) => (
                <li key={`${id}-${at}`}>
                  <Trophy size={16} aria-hidden /> {CHALLENGE_BY_ID[id]?.title ?? id}
                  <span className="muted small"> · ukończone {formatShortKey(dateKey(new Date(at)))}</span>
                </li>
              )),
            )}
          </ul>
        </section>
      )}
    </div>
  );
}

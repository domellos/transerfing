import { useMemo } from 'react';
import { Link } from 'react-router';
import { ArrowRight, Lock } from 'lucide-react';
import { MiniBars, PageHeader, ProgressBar, Stat } from '../components/ui';
import { ICONS } from '../components/icons';
import { useChallenges, useFlashcards, useQuizBest, useScenarios } from '../state';
import { MODULES } from '../data/modules';
import { LESSONS } from '../data/lessons';
import { PROGRAM_LENGTH } from '../data/program';
import { SCENARIOS } from '../data/scenarios';
import { JOURNAL_LABELS } from '../data/tools';
import { BADGES, computeBadgeStats } from '../lib/badges';
import { activeDaySet, buildDayFacts, useAllData } from '../lib/stats';
import { formatWeekdayKey, lastNDays, streak } from '../lib/date';
import { useTitle } from '../lib/hooks';
import type { CheckIn, JournalType } from '../types';

export default function Progress() {
  useTitle('Postęp i odznaki');
  const data = useAllData();
  const [quizBest] = useQuizBest();
  const [challenges] = useChallenges();
  const [flashcards] = useFlashcards();
  const [scenarios] = useScenarios();

  const facts = useMemo(() => buildDayFacts(data), [data]);
  const days = useMemo(() => activeDaySet(facts), [facts]);
  const badgeStats = useMemo(
    () =>
      computeBadgeStats({
        data,
        quizBest,
        challenges,
        flashcards,
        scenarios,
        lessonsTotal: LESSONS.length,
        programTotal: PROGRAM_LENGTH,
        scenariosTotal: SCENARIOS.length,
      }),
    [data, quizBest, challenges, flashcards, scenarios],
  );
  const earned = BADGES.filter((b) => b.value(badgeStats) >= b.target(badgeStats));

  const last14 = lastNDays(14);
  const trend = (key: keyof CheckIn) =>
    last14.map((k) => ({ label: formatWeekdayKey(k), value: data.checkins[k]?.[key] ?? 0, title: `${k}: ${data.checkins[k]?.[key] ?? 'brak'}` }));
  const typeCounts = (Object.keys(JOURNAL_LABELS) as JournalType[])
    .map((t) => ({ type: t, count: data.journal.filter((e) => e.type === t).length }))
    .filter((x) => x.count > 0);

  return (
    <div className="page">
      <PageHeader icon="chart" title="Postęp i odznaki" lead="Twoja praktyka w liczbach. Odznaki przyznają się same, gdy osiągasz kolejne progi." />

      <section className="grid grid-4 stats-grid">
        <Stat icon="sparkles" value={streak(days)} label="dni praktyki z rzędu" />
        <Stat icon="map" value={`${badgeStats.programDone}/${PROGRAM_LENGTH}`} label="dni programu" />
        <Stat icon="book" value={`${badgeStats.lessonsRead}/${LESSONS.length}`} label="przeczytanych lekcji" />
        <Stat icon="notebook" value={badgeStats.journal} label="wpisów w dzienniku" />
        <Stat icon="eye" value={badgeStats.awakenings} label="przebudzeń" />
        <Stat icon="image" value={badgeStats.slideSessions} label="sesji slajdów" />
        <Stat icon="wand" value={badgeStats.frameSets} label="ustawień kadrów" />
        <Stat icon="gem" value={badgeStats.realized} label="zrealizowanych kadrów" />
      </section>

      <section className="section">
        <div className="section-head">
          <h2 className="section-title">
            Odznaki ({earned.length}/{BADGES.length})
          </h2>
        </div>
        <ul className="badges">
          {BADGES.map((badge) => {
            const value = badge.value(badgeStats);
            const target = Math.max(1, badge.target(badgeStats));
            const has = value >= target;
            const Icon = ICONS[badge.icon];
            return (
              <li key={badge.id} className={`badge-card ${has ? 'is-earned' : ''}`} title={badge.description}>
                <span className="badge-icon" aria-hidden>
                  {has ? <Icon size={22} /> : <Lock size={18} />}
                </span>
                <span className="badge-title">{badge.title}</span>
                <span className="badge-desc">{badge.description}</span>
                {!has && <ProgressBar value={Math.min(value, target)} max={target} label={`Postęp odznaki ${badge.title}`} />}
                <span className="sr-only">{has ? 'zdobyta' : `postęp ${Math.min(value, target)} z ${target}`}</span>
              </li>
            );
          })}
        </ul>
      </section>

      <section className="card">
        <h2 className="card-title">Nauka według modułów</h2>
        <ul className="module-progress">
          {MODULES.map((m) => {
            const lessons = LESSONS.filter((l) => l.module === m.id);
            const r = lessons.filter((l) => data.lessonsRead[l.slug]).length;
            return (
              <li key={m.id}>
                <span>{m.title}</span>
                <ProgressBar value={r} max={lessons.length} label={m.title} />
                <span className="muted small">
                  {r}/{lessons.length}
                  {quizBest[m.id] !== undefined ? ` · quiz ${quizBest[m.id]}%` : ''}
                </span>
              </li>
            );
          })}
        </ul>
      </section>

      <div className="grid grid-3">
        <section className="card">
          <h2 className="card-title">Energia (14 dni)</h2>
          <MiniBars data={trend('energia')} max={5} />
        </section>
        <section className="card">
          <h2 className="card-title">Ważność (14 dni)</h2>
          <MiniBars data={trend('waznosc')} max={5} />
        </section>
        <section className="card">
          <h2 className="card-title">Nastrój (14 dni)</h2>
          <MiniBars data={trend('nastroj')} max={5} />
        </section>
      </div>

      {typeCounts.length > 0 && (
        <section className="card">
          <h2 className="card-title">Dziennik według rodzaju</h2>
          <div className="chips">
            {typeCounts.map((t) => (
              <span key={t.type} className="chip">
                {JOURNAL_LABELS[t.type]}: {t.count}
              </span>
            ))}
          </div>
        </section>
      )}

      <div className="grid grid-2">
        <Link to="/kalendarz/" className="card card-link quick-card">
          <ICONS.calendar size={22} aria-hidden />
          <span>Mapa praktyki i przegląd tygodnia</span>
          <ArrowRight size={18} aria-hidden />
        </Link>
        <Link to="/laboratorium/" className="card card-link quick-card">
          <ICONS.flask size={22} aria-hidden />
          <span>Laboratorium: co naprawdę ci pomaga?</span>
          <ArrowRight size={18} aria-hidden />
        </Link>
      </div>
    </div>
  );
}

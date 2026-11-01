import { useMemo } from 'react';
import { Link } from 'react-router';
import { Callout, EmptyState, PageHeader, Stat } from '../components/ui';
import { buildDayFacts, useAllData, type DayFacts } from '../lib/stats';
import { parseKey, plural } from '../lib/date';
import { useTitle } from '../lib/hooks';
import type { CheckIn } from '../types';

type Metric = keyof CheckIn;

const METRICS: { id: Metric; label: string; better: 'higher' | 'lower' }[] = [
  { id: 'energia', label: 'Energia', better: 'higher' },
  { id: 'nastroj', label: 'Nastrój', better: 'higher' },
  { id: 'waznosc', label: 'Ważność i napięcie', better: 'lower' },
];

const FACTORS: { id: string; label: string; test: (f: DayFacts) => boolean }[] = [
  { id: 'morning', label: 'Poranne ustawienie', test: (f) => f.morning },
  { id: 'evening', label: 'Wieczorny przegląd', test: (f) => f.evening },
  { id: 'awake', label: '10 lub więcej przebudzeń', test: (f) => f.awakenings >= 10 },
  { id: 'kadr', label: 'Sesja slajdu albo ustawienie kadru', test: (f) => f.slide || f.frame },
  { id: 'energy', label: 'Ćwiczenie strumieni energii', test: (f) => f.energy },
  { id: 'detox', label: 'Co najmniej 3 nawyki detoksu', test: (f) => f.detox.length >= 3 },
  { id: 'frajling', label: 'Akt frajlingu', test: (f) => f.frajling },
  { id: 'dream', label: 'Wpis w dzienniku snów', test: (f) => f.dream },
];

const MIN_DAYS = 3;
const WEEKDAY_NAMES = ['niedziela', 'poniedziałek', 'wtorek', 'środa', 'czwartek', 'piątek', 'sobota'];
const fmt = (n: number) => n.toFixed(1).replace('.', ',');

function average(values: number[]): number | null {
  return values.length ? values.reduce((s, v) => s + v, 0) / values.length : null;
}

export default function Lab() {
  useTitle('Laboratorium wzorców');
  const data = useAllData();
  const facts = useMemo(() => buildDayFacts(data), [data]);
  const checkinDays = [...facts.values()].filter((f) => f.checkin);

  const comparisons = useMemo(
    () =>
      FACTORS.map((factor) => ({
        factor,
        metrics: METRICS.map((metric) => {
          const withVals: number[] = [];
          const withoutVals: number[] = [];
          for (const f of checkinDays) {
            const v = f.checkin?.[metric.id];
            if (typeof v !== 'number') continue;
            (factor.test(f) ? withVals : withoutVals).push(v);
          }
          const a = average(withVals);
          const b = average(withoutVals);
          const enough = withVals.length >= MIN_DAYS && withoutVals.length >= MIN_DAYS && a !== null && b !== null;
          const diff = enough ? a! - b! : 0;
          const good = metric.better === 'higher' ? diff > 0 : diff < 0;
          return { metric, a, b, nA: withVals.length, nB: withoutVals.length, enough, diff, good };
        }),
      })),
    [checkinDays],
  );

  const importanceDrops = data.journal
    .filter((e) => e.type === 'waznosc' && typeof e.meta?.przed === 'number' && typeof e.meta?.po === 'number')
    .map((e) => (e.meta!.przed ?? 0) - (e.meta!.po ?? 0));
  const avgDrop = average(importanceDrops);

  const realizedDays = data.frames
    .filter((f) => f.status === 'zrealizowany' && f.realizedAt)
    .map((f) => (new Date(f.realizedAt!).getTime() - new Date(f.createdAt).getTime()) / 86_400_000);
  const avgRealize = average(realizedDays);

  const hooks = new Map<string, number>();
  for (const e of data.journal) {
    if (e.type !== 'wahadlo') continue;
    for (const line of (e.fields.haczyki ?? '').split('\n').map((l) => l.trim()).filter(Boolean)) hooks.set(line, (hooks.get(line) ?? 0) + 1);
  }
  const topHooks = [...hooks.entries()].sort((a, b) => b[1] - a[1]).slice(0, 3);

  const byWeekday = Array.from({ length: 7 }, () => [] as number[]);
  for (const f of checkinDays) if (typeof f.checkin?.nastroj === 'number') byWeekday[parseKey(f.date).getDay()].push(f.checkin.nastroj);
  const weekdayAvg = byWeekday.map((vals, i) => ({ day: WEEKDAY_NAMES[i], avg: vals.length >= 2 ? average(vals) : null }));
  const bestDay = weekdayAvg.filter((d) => d.avg !== null).sort((a, b) => (b.avg ?? 0) - (a.avg ?? 0))[0];

  const anyComparison = comparisons.some((c) => c.metrics.some((m) => m.enough));

  return (
    <div className="page">
      <PageHeader
        icon="flask"
        title="Laboratorium wzorców"
        lead="Transerfing warto sprawdzać na sobie. Laboratorium porównuje twoje codzienne check-iny z praktyką: jaka była średnia energia, nastrój i ważność w dni z daną praktyką, a jaka w pozostałe."
      />

      <Callout tone="info" title="Jak czytać wyniki">
        To zależności, a nie dowody. Jeśli w dni z poranną praktyką masz więcej energii, może to wynikać z praktyki, ale też z tego, że w lepsze dni łatwiej
        o nią pamiętać. Wyniki pokazujemy dopiero przy co najmniej {MIN_DAYS} dniach w każdej grupie.
      </Callout>

      <div className="stats-row">
        <Stat icon="calendar" value={checkinDays.length} label="dni z check-inem" />
        <Stat icon="scale" value={avgDrop !== null ? `−${fmt(avgDrop)}` : '–'} label="średni spadek ważności w Mierniku (pkt)" />
        <Stat
          icon="gem"
          value={avgRealize !== null ? `${Math.round(avgRealize)} ${plural(Math.round(avgRealize), ['dzień', 'dni', 'dni'])}` : '–'}
          label="średni czas do realizacji kadru"
        />
      </div>

      {checkinDays.length < MIN_DAYS * 2 ? (
        <EmptyState icon="flask" title="Za mało danych do porównań">
          Rób codzienny check-in na stronie <Link to="/dzis/">Dziś</Link> (energia, ważność, nastrój). Po kilkunastu dniach pojawią się tu pierwsze wzorce.
        </EmptyState>
      ) : (
        <section className="section">
          <h2 className="section-title">Praktyka a samopoczucie</h2>
          {!anyComparison && <p className="muted">Na razie żadna praktyka nie ma wystarczającej liczby dni z check-inem w obu grupach.</p>}
          <div className="grid grid-2">
            {comparisons
              .filter((c) => c.metrics.some((m) => m.enough))
              .map(({ factor, metrics }) => (
                <article key={factor.id} className="card lab-card">
                  <h3>{factor.label}</h3>
                  {metrics
                    .filter((m) => m.enough)
                    .map((m) => (
                      <div key={m.metric.id} className="lab-row">
                        <p className="lab-label">
                          {m.metric.label}{' '}
                          <span className={`badge ${Math.abs(m.diff) < 0.3 ? '' : m.good ? 'badge-good' : 'badge-bad'}`}>
                            {Math.abs(m.diff) < 0.3 ? 'bez wyraźnej różnicy' : `${m.diff > 0 ? '+' : '−'}${fmt(Math.abs(m.diff))}`}
                          </span>
                        </p>
                        <div className="lab-bars">
                          <div className="lab-bar">
                            <span className="lab-bar-label">
                              z praktyką ({m.nA} {plural(m.nA, ['dzień', 'dni', 'dni'])})
                            </span>
                            <div className="progress">
                              <div className="progress-fill" style={{ width: `${((m.a ?? 0) / 5) * 100}%` }} />
                            </div>
                            <span className="lab-bar-value">{fmt(m.a ?? 0)}</span>
                          </div>
                          <div className="lab-bar">
                            <span className="lab-bar-label">
                              bez niej ({m.nB} {plural(m.nB, ['dzień', 'dni', 'dni'])})
                            </span>
                            <div className="progress progress-muted">
                              <div className="progress-fill" style={{ width: `${((m.b ?? 0) / 5) * 100}%` }} />
                            </div>
                            <span className="lab-bar-value">{fmt(m.b ?? 0)}</span>
                          </div>
                        </div>
                      </div>
                    ))}
                </article>
              ))}
          </div>
        </section>
      )}

      <div className="grid grid-2">
        <section className="card">
          <h2 className="card-title">Najczęstsze haczyki wahadeł</h2>
          {topHooks.length ? (
            <ol className="steps">
              {topHooks.map(([hook, n]) => (
                <li key={hook}>
                  {hook} <span className="muted small">({n}×)</span>
                </li>
              ))}
            </ol>
          ) : (
            <p className="muted">
              Zapisuj sytuacje w <Link to="/praktyka/wahadla/">Detektorze wahadeł</Link>, a zobaczysz, na co łapiesz się najczęściej.
            </p>
          )}
        </section>
        <section className="card">
          <h2 className="card-title">Nastrój według dnia tygodnia</h2>
          {bestDay ? (
            <>
              <p>
                Najlepszy nastrój masz zwykle w: <strong>{bestDay.day}</strong> ({fmt(bestDay.avg ?? 0)}).
              </p>
              <ul className="weekday-list">
                {[1, 2, 3, 4, 5, 6, 0].map((i) => (
                  <li key={i}>
                    <span>{weekdayAvg[i].day}</span>
                    <span className="muted">{weekdayAvg[i].avg !== null ? fmt(weekdayAvg[i].avg!) : '–'}</span>
                  </li>
                ))}
              </ul>
            </>
          ) : (
            <p className="muted">Potrzeba co najmniej dwóch check-inów z tego samego dnia tygodnia.</p>
          )}
        </section>
      </div>
    </div>
  );
}

import { useMemo, useState } from 'react';
import { ChevronLeft, ChevronRight, Save } from 'lucide-react';
import { Callout, PageHeader, Scale5, Stat } from '../components/ui';
import EntryList from './tools/EntryList';
import { useJournal } from '../state';
import { buildDayFacts, practiceCount, useAllData, type DayFacts } from '../lib/stats';
import { addDays, dateKey, formatShortKey, parseKey } from '../lib/date';
import { JOURNAL_LABELS, WEEKLY_FIELDS } from '../data/tools';
import { DETOX_HABITS } from '../data/misc';
import { useTitle } from '../lib/hooks';
import type { JournalType } from '../types';

const WEEKS = 16;
const WEEKDAYS = ['pon', 'wt', 'śr', 'czw', 'pt', 'sob', 'nd'];
const longDate = new Intl.DateTimeFormat('pl-PL', { weekday: 'long', day: 'numeric', month: 'long' });

function weekStartOf(key: string): string {
  const dow = (parseKey(key).getDay() + 6) % 7;
  return addDays(key, -dow);
}

function level(count: number): number {
  if (count <= 0) return 0;
  if (count <= 2) return 1;
  if (count <= 4) return 2;
  if (count <= 6) return 3;
  return 4;
}

function describeDay(f: DayFacts | undefined): string[] {
  if (!f) return [];
  const out: string[] = [];
  if (f.morning) out.push('Poranne ustawienie');
  if (f.awakenings) out.push(`Przebudzenia: ${f.awakenings}`);
  if (f.slide) out.push('Sesja slajdu');
  if (f.frame) out.push('Ustawienie kadru');
  if (f.energy) out.push('Ćwiczenie strumieni energii');
  if (f.frajling) out.push('Frajling');
  if (f.koordynacja) out.push('Koordynacja zamiaru');
  if (f.wahadlo) out.push('Detektor wahadeł');
  if (f.waznosc) out.push('Obniżanie ważności');
  if (f.dream) out.push('Dziennik snów');
  if (f.detox.length) out.push(`Detoks: ${f.detox.length} ${f.detox.length === 1 ? 'nawyk' : 'nawyki'}`);
  if (f.program) out.push('Dzień programu');
  if (f.lesson) out.push('Przeczytana lekcja');
  if (f.flashcards) out.push(`Fiszki: ${f.flashcards}`);
  if (f.evening) out.push('Wieczorny przegląd');
  if (f.checkin) out.push('Check-in');
  return out;
}

export default function Week() {
  useTitle('Tydzień i kalendarz');
  const data = useAllData();
  const { entries, addEntry, removeEntry } = useJournal();
  const facts = useMemo(() => buildDayFacts(data), [data]);
  const today = dateKey();
  const [selected, setSelected] = useState<string>(today);
  const [offset, setOffset] = useState(0);
  const [values, setValues] = useState<Record<string, string>>({});
  const [rating, setRating] = useState<number | undefined>();

  const gridStart = addDays(weekStartOf(today), -(WEEKS - 1) * 7);
  const weekStart = addDays(weekStartOf(today), offset * 7);
  const weekDays = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));

  const summary = useMemo(() => {
    const inWeek = (key: string) => key >= weekDays[0] && key <= weekDays[6];
    const days = weekDays.map((d) => facts.get(d));
    const checkins = days.map((d) => d?.checkin).filter(Boolean);
    const avg = (k: 'energia' | 'nastroj' | 'waznosc') => {
      const vals = checkins.map((c) => c?.[k]).filter((v): v is number => typeof v === 'number');
      return vals.length ? (vals.reduce((s, v) => s + v, 0) / vals.length).toFixed(1).replace('.', ',') : '–';
    };
    const types = new Map<JournalType, number>();
    for (const e of data.journal) if (inWeek(e.date)) types.set(e.type, (types.get(e.type) ?? 0) + 1);
    return {
      active: days.filter((d) => practiceCount(d) > 0).length,
      awakenings: days.reduce((s, d) => s + (d?.awakenings ?? 0), 0),
      sessions: data.slides.reduce((s, x) => s + x.sessions.filter((iso) => inWeek(dateKey(new Date(iso)))).length, 0),
      frames: data.frames.reduce((s, f) => s + f.sets.filter((iso) => inWeek(dateKey(new Date(iso)))).length, 0),
      realized: data.frames.filter((f) => f.realizedAt && inWeek(dateKey(new Date(f.realizedAt)))).length,
      energia: avg('energia'),
      nastroj: avg('nastroj'),
      waznosc: avg('waznosc'),
      types: [...types.entries()],
    };
    // weekDays wynika z weekStart
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [facts, data, weekStart]);

  const reviews = entries.filter((e) => e.type === 'tydzien');
  const thisReview = reviews.filter((e) => e.fields.week === weekStart);
  const hasContent = Object.values(values).some((v) => v.trim());

  const saveReview = () => {
    const fields = Object.fromEntries(Object.entries(values).map(([k, v]) => [k, v.trim()]).filter(([, v]) => v));
    addEntry({ type: 'tydzien', fields: { week: weekStart, ...fields }, rating });
    setValues({});
    setRating(undefined);
  };

  const selectedFacts = describeDay(facts.get(selected));
  const detoxNames = (facts.get(selected)?.detox ?? []).map((id) => DETOX_HABITS.find((h) => h.id === id)?.label).filter(Boolean);

  return (
    <div className="page">
      <PageHeader
        icon="calendar"
        title="Tydzień i kalendarz"
        lead="Mapa twojej praktyki z ostatnich 16 tygodni i podsumowanie wybranego tygodnia. Raz w tygodniu zatrzymaj się na kilka minut: co działało, co zmieniasz i jaki kadr ustawiasz na kolejne dni."
      />

      <section className="card">
        <h2 className="card-title">Mapa praktyki</h2>
        <div className="heatmap-wrap">
          <div className="heatmap" role="grid" aria-label="Mapa praktyki z ostatnich 16 tygodni">
            <div className="heatmap-labels" aria-hidden>
              {WEEKDAYS.map((d) => (
                <span key={d}>{d}</span>
              ))}
            </div>
            {Array.from({ length: WEEKS }, (_, w) => (
              <div key={w} className="heatmap-col" role="row">
                {Array.from({ length: 7 }, (_, d) => {
                  const key = addDays(gridStart, w * 7 + d);
                  const future = key > today;
                  const count = practiceCount(facts.get(key));
                  return (
                    <button
                      key={key}
                      type="button"
                      role="gridcell"
                      disabled={future}
                      className={`heat heat-${future ? 'x' : level(count)} ${key === selected ? 'is-selected' : ''} ${key === today ? 'is-today' : ''}`}
                      onClick={() => setSelected(key)}
                      aria-label={`${formatShortKey(key)}: ${count} rodzajów praktyki`}
                      title={`${formatShortKey(key)}: ${count}`}
                    />
                  );
                })}
              </div>
            ))}
          </div>
        </div>
        <div className="heat-legend" aria-hidden>
          <span>mniej</span>
          {[0, 1, 2, 3, 4].map((l) => (
            <span key={l} className={`heat heat-${l}`} />
          ))}
          <span>więcej</span>
        </div>
        <div className="day-detail">
          <p className="eyebrow">{longDate.format(parseKey(selected))}</p>
          {selectedFacts.length ? (
            <ul className="bullets">
              {selectedFacts.map((t) => (
                <li key={t}>{t}</li>
              ))}
              {detoxNames.length > 0 && <li className="muted small">Nawyki detoksu: {detoxNames.join(', ')}</li>}
            </ul>
          ) : (
            <p className="muted">Brak zapisanej praktyki tego dnia.</p>
          )}
        </div>
      </section>

      <section className="section">
        <div className="section-head">
          <h2 className="section-title">
            Tydzień {formatShortKey(weekDays[0])} – {formatShortKey(weekDays[6])}
          </h2>
          <div className="row-actions">
            <button type="button" className="icon-btn" onClick={() => setOffset((o) => o - 1)} aria-label="Poprzedni tydzień">
              <ChevronLeft size={20} />
            </button>
            <button type="button" className="icon-btn" onClick={() => setOffset((o) => Math.min(0, o + 1))} disabled={offset === 0} aria-label="Następny tydzień">
              <ChevronRight size={20} />
            </button>
          </div>
        </div>
        <div className="grid grid-4 stats-grid">
          <Stat icon="calendar" value={`${summary.active}/7`} label="dni z praktyką" />
          <Stat icon="eye" value={summary.awakenings} label="przebudzeń" />
          <Stat icon="image" value={summary.sessions} label="sesji slajdów" />
          <Stat icon="wand" value={summary.frames} label="ustawień kadrów" />
          <Stat icon="gem" value={summary.realized} label="zrealizowanych kadrów" />
          <Stat icon="zap" value={summary.energia} label="średnia energia (1–5)" />
          <Stat icon="heart" value={summary.nastroj} label="średni nastrój (1–5)" />
          <Stat icon="scale" value={summary.waznosc} label="średnia ważność (1–5)" />
        </div>
        {summary.types.length > 0 && (
          <div className="chips">
            {summary.types.map(([type, n]) => (
              <span key={type} className="chip">
                {JOURNAL_LABELS[type]}: {n}
              </span>
            ))}
          </div>
        )}
      </section>

      <section className="section">
        <h2 className="section-title">Przegląd tygodnia</h2>
        {thisReview.length > 0 ? (
          <EntryList entries={thisReview} onRemove={removeEntry} />
        ) : (
          <form
            className="card form"
            onSubmit={(e) => {
              e.preventDefault();
              if (hasContent) saveReview();
            }}
          >
            {WEEKLY_FIELDS.map((f) => (
              <div key={f.key} className="field">
                <label className="field-label" htmlFor={`w-${f.key}`}>
                  {f.label}
                </label>
                <textarea id={`w-${f.key}`} rows={f.key === 'kadr' ? 2 : 3} placeholder={f.placeholder} value={values[f.key] ?? ''} onChange={(e) => setValues((v) => ({ ...v, [f.key]: e.target.value }))} />
              </div>
            ))}
            <div className="field">
              <p className="field-label">Jak oceniam ten tydzień?</p>
              <Scale5 label="Ocena tygodnia" value={rating} onChange={setRating} low="ciężki" high="świetny" />
            </div>
            <div className="form-actions">
              <button type="submit" className="btn btn-primary" disabled={!hasContent}>
                <Save size={18} aria-hidden /> Zapisz przegląd tygodnia
              </button>
            </div>
          </form>
        )}
        {reviews.length > thisReview.length && (
          <details className="card details">
            <summary>Wcześniejsze przeglądy ({reviews.length - thisReview.length})</summary>
            <EntryList entries={reviews.filter((e) => e.fields.week !== weekStart)} onRemove={removeEntry} />
          </details>
        )}
      </section>

      <Callout tone="tip">Najlepszy moment na przegląd to niedziela wieczorem albo poniedziałek rano. Kadr na tydzień ustaw potem w narzędziu Warkocz i kadr.</Callout>
    </div>
  );
}

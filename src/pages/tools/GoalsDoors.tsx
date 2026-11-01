import { useState } from 'react';
import { Link } from 'react-router';
import { Image as ImageIcon, Plus, Star, Trash2 } from 'lucide-react';
import { Callout, EmptyState } from '../../components/ui';
import { useGoals } from '../../state';
import { newId } from '../../lib/storage';
import type { GoalCandidate, GoalTest } from '../../types';

const QUESTIONS: { key: Exclude<keyof GoalTest, 'comfort'>; text: string }[] = [
  { key: 'notMeans', text: 'Czy to cel sam w sobie, a nie środek do czegoś innego (pieniędzy, uznania)?' },
  { key: 'forMe', text: 'Czy chcesz tego dla siebie, a nie po to, żeby coś komuś udowodnić albo dorównać standardom?' },
  { key: 'lightness', text: 'Czy myśl o tym daje lekkość i radość, a nie ciężar i przymus?' },
  { key: 'noPersuasion', text: 'Czy nie musisz się do tego przekonywać ani namawiać?' },
  { key: 'celebration', text: 'Czy wyobrażając sobie, że już to masz, czujesz święto życia?' },
];

const EMPTY_TEST: GoalTest = { notMeans: null, forMe: null, lightness: null, noPersuasion: null, celebration: null, comfort: 5 };

export function soulScore(test?: GoalTest): number | null {
  if (!test) return null;
  const answers = QUESTIONS.map((q) => test[q.key]);
  if (answers.some((a) => a === null)) return null;
  const yes = answers.filter(Boolean).length;
  return Math.round(yes * 12 + test.comfort * 4);
}

function verdict(score: number) {
  if (score >= 75) return { label: 'Wygląda na twój cel', tone: 'high' };
  if (score >= 45) return { label: 'Sprawdź jeszcze: możliwe domieszki cudzych celów', tone: 'mid' };
  return { label: 'Prawdopodobnie cudzy cel', tone: 'low' };
}

type Tab = 'pragnienia' | 'test' | 'drzwi';

export default function GoalsDoors() {
  const [goals, setGoals] = useGoals();
  const [tab, setTab] = useState<Tab>('pragnienia');
  const [text, setText] = useState('');
  const [doorDrafts, setDoorDrafts] = useState<Record<string, string>>({});

  const update = (id: string, patch: Partial<GoalCandidate>) =>
    setGoals((prev) => prev.map((g) => (g.id === id ? { ...g, ...patch } : g)));

  const add = () => {
    const value = text.trim();
    if (!value) return;
    const goal: GoalCandidate = { id: newId(), text: value, createdAt: new Date().toISOString(), chosen: false, doors: [], nextStep: '' };
    setGoals((prev) => [...prev, goal]);
    setText('');
  };

  const remove = (id: string) => {
    if (window.confirm('Usunąć to pragnienie?')) setGoals((prev) => prev.filter((g) => g.id !== id));
  };

  const setAnswer = (goal: GoalCandidate, key: keyof GoalTest, value: boolean | number) =>
    update(goal.id, { test: { ...(goal.test ?? EMPTY_TEST), [key]: value } });

  const addDoor = (goal: GoalCandidate) => {
    const value = (doorDrafts[goal.id] ?? '').trim();
    if (!value) return;
    update(goal.id, { doors: [...goal.doors, value] });
    setDoorDrafts((prev) => ({ ...prev, [goal.id]: '' }));
  };

  const chosen = goals.filter((g) => g.chosen);
  const tested = goals.filter((g) => soulScore(g.test) !== null).length;

  return (
    <div className="tool">
      <div className="segmented segmented-wide" role="tablist" aria-label="Etapy">
        {(
          [
            ['pragnienia', `1. Pragnienia (${goals.length})`],
            ['test', `2. Test duszy (${tested}/${goals.length})`],
            ['drzwi', `3. Cel i drzwi (${chosen.length})`],
          ] as const
        ).map(([id, label]) => (
          <button key={id} type="button" role="tab" aria-selected={tab === id} className={tab === id ? 'is-active' : ''} onClick={() => setTab(id)}>
            {label}
          </button>
        ))}
      </div>

      {tab === 'pragnienia' && (
        <>
          <Callout tone="tip" title="Burza pragnień bez cenzury">
            Wypisz wszystko, czego chcesz: duże i małe rzeczy, rozsądne i szalone. Nie pytaj teraz, czy to realne ani czy wypada. Ocena
            przyjdzie w drugim kroku.
          </Callout>
          <form
            className="add-row"
            onSubmit={(e) => {
              e.preventDefault();
              add();
            }}
          >
            <input type="text" value={text} onChange={(e) => setText(e.target.value)} placeholder="Chcę…" aria-label="Nowe pragnienie" />
            <button type="submit" className="btn btn-primary" disabled={!text.trim()}>
              <Plus size={18} aria-hidden /> Dodaj
            </button>
          </form>
          {goals.length === 0 ? (
            <EmptyState icon="target" title="Lista jest pusta">
              Zacznij od pierwszej rzeczy, która przychodzi ci do głowy.
            </EmptyState>
          ) : (
            <ul className="goal-list">
              {goals.map((g) => (
                <li key={g.id} className="card goal-row">
                  <span>{g.text}</span>
                  <button type="button" className="icon-btn" aria-label={`Usuń: ${g.text}`} onClick={() => remove(g.id)}>
                    <Trash2 size={16} />
                  </button>
                </li>
              ))}
            </ul>
          )}
          {goals.length > 0 && (
            <div className="form-actions">
              <button type="button" className="btn" onClick={() => setTab('test')}>
                Przejdź do testu duszy
              </button>
            </div>
          )}
        </>
      )}

      {tab === 'test' && (
        <>
          <Callout tone="tip" title="Test duszy">
            Przy każdym pragnieniu wyobraź sobie, że już się spełniło, i odpowiedz szczerze. Komfort duchowy to cichy sygnał: lekkość albo
            ciężar, zanim umysł zacznie argumentować.
          </Callout>
          {goals.length === 0 && <EmptyState icon="target" title="Najpierw dodaj pragnienia" />}
          <div className="goal-tests">
            {goals.map((g) => {
              const test = g.test ?? EMPTY_TEST;
              const score = soulScore(g.test);
              const v = score !== null ? verdict(score) : null;
              return (
                <article key={g.id} className="card goal-test">
                  <h3>{g.text}</h3>
                  {QUESTIONS.map((q) => (
                    <div key={q.key} className="yesno">
                      <span>{q.text}</span>
                      <div className="segmented" role="group" aria-label={q.text}>
                        <button type="button" className={test[q.key] === true ? 'is-active' : ''} aria-pressed={test[q.key] === true} onClick={() => setAnswer(g, q.key, true)}>
                          Tak
                        </button>
                        <button type="button" className={test[q.key] === false ? 'is-active' : ''} aria-pressed={test[q.key] === false} onClick={() => setAnswer(g, q.key, false)}>
                          Nie
                        </button>
                      </div>
                    </div>
                  ))}
                  <div className="slider">
                    <label className="field-label" htmlFor={`c-${g.id}`}>
                      Komfort duchowy: <strong>{test.comfort}/10</strong>
                    </label>
                    <input id={`c-${g.id}`} type="range" min={1} max={10} value={test.comfort} onChange={(e) => setAnswer(g, 'comfort', Number(e.target.value))} />
                    <div className="slider-ends">
                      <span>ciężar</span>
                      <span>lekkość i radość</span>
                    </div>
                  </div>
                  {v && score !== null && (
                    <div className={`meter meter-${v.tone}`}>
                      <div className="meter-head">
                        <span>Zgodność z duszą</span>
                        <strong>
                          {score}/100 · {v.label}
                        </strong>
                      </div>
                      <div className="progress">
                        <div className="progress-fill" style={{ width: `${score}%` }} />
                      </div>
                    </div>
                  )}
                  <div className="form-actions">
                    <button type="button" className={`btn ${g.chosen ? 'btn-primary' : ''}`} aria-pressed={g.chosen} onClick={() => update(g.id, { chosen: !g.chosen })}>
                      <Star size={18} aria-hidden /> {g.chosen ? 'Wybrany jako mój cel' : 'Wybieram ten cel'}
                    </button>
                  </div>
                </article>
              );
            })}
          </div>
        </>
      )}

      {tab === 'drzwi' && (
        <>
          <Callout tone="tip" title="Twoje drzwi">
            Drzwi to droga, która cię pociąga i na której czujesz natchnienie. Zapisz kilka możliwych dróg do celu i jeden następny krok.
            Nie musisz od razu wiedzieć, która jest właściwa: sprawdzaj je małymi krokami.
          </Callout>
          {chosen.length === 0 ? (
            <EmptyState icon="door" title="Nie wybrano jeszcze celu">
              W kroku „Test duszy” oznacz cel, który świeci najjaśniej.
            </EmptyState>
          ) : (
            chosen.map((g) => (
              <article key={g.id} className="card goal-test">
                <h3>{g.text}</h3>
                <p className="field-label">Moje drzwi</p>
                {g.doors.length > 0 ? (
                  <ul className="door-list">
                    {g.doors.map((d, i) => (
                      <li key={i}>
                        <span>{d}</span>
                        <button
                          type="button"
                          className="icon-btn"
                          aria-label={`Usuń drzwi: ${d}`}
                          onClick={() => update(g.id, { doors: g.doors.filter((_, j) => j !== i) })}
                        >
                          <Trash2 size={14} />
                        </button>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="muted small">Dodaj co najmniej trzy możliwe drogi.</p>
                )}
                <form
                  className="add-row"
                  onSubmit={(e) => {
                    e.preventDefault();
                    addDoor(g);
                  }}
                >
                  <input
                    type="text"
                    value={doorDrafts[g.id] ?? ''}
                    onChange={(e) => setDoorDrafts((prev) => ({ ...prev, [g.id]: e.target.value }))}
                    placeholder="np. kurs, rozmowa z kimś, kto już to robi, własny projekt…"
                    aria-label="Nowe drzwi"
                  />
                  <button type="submit" className="btn">
                    Dodaj
                  </button>
                </form>
                <div className="field">
                  <label className="field-label" htmlFor={`n-${g.id}`}>
                    Następny mały krok
                  </label>
                  <input id={`n-${g.id}`} type="text" value={g.nextStep} onChange={(e) => update(g.id, { nextStep: e.target.value })} />
                </div>
                <div className="form-actions">
                  <Link to={`/praktyka/slajdy/?cel=${g.id}`} className="btn btn-primary">
                    <ImageIcon size={18} aria-hidden /> Stwórz slajd tego celu
                  </Link>
                  <Link to="/praktyka/warkocz/" className="btn btn-ghost">
                    Ustaw kadr z warkoczem
                  </Link>
                </div>
              </article>
            ))
          )}
        </>
      )}
    </div>
  );
}

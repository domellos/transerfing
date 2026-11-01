import { useState } from 'react';
import { CircleCheck, Circle, Plus, Trash2 } from 'lucide-react';
import { Callout, Stat } from '../../components/ui';
import { useCustomHabits, useDetox } from '../../state';
import { DETOX_HABITS } from '../../data/misc';
import { dateKey, formatShortKey, lastNDays, plural, streak } from '../../lib/date';
import { newId } from '../../lib/storage';

export default function MatrixDetox() {
  const [detox, setDetox] = useDetox();
  const [custom, setCustom] = useCustomHabits();
  const [label, setLabel] = useState('');
  const today = dateKey();
  const habits = [...DETOX_HABITS, ...custom];
  const doneToday = new Set(detox[today] ?? []);
  const days = lastNDays(14);

  const toggle = (id: string, day = today) =>
    setDetox((prev) => {
      const set = new Set(prev[day] ?? []);
      if (set.has(id)) set.delete(id);
      else set.add(id);
      return { ...prev, [day]: [...set] };
    });

  const addHabit = () => {
    const value = label.trim();
    if (!value) return;
    setCustom((prev) => [...prev, { id: `wlasny-${newId()}`, label: value }]);
    setLabel('');
  };

  const removeHabit = (id: string) => {
    if (window.confirm('Usunąć ten nawyk z listy?')) setCustom((prev) => prev.filter((h) => h.id !== id));
  };

  const goodDays = new Set(Object.entries(detox).filter(([, v]) => v.length >= 3).map(([k]) => k));
  const currentStreak = streak(goodDays);

  return (
    <div className="tool">
      <Callout tone="tip">
        Każdy odhaczony nawyk to odzyskana uwaga albo energia. Nie chodzi o perfekcję. Dzień z co najmniej trzema nawykami liczy się do
        serii wolnego gracza.
      </Callout>

      <div className="stats-row">
        <Stat icon="phoneOff" value={`${doneToday.size}/${habits.length}`} label="nawyków dziś" />
        <Stat icon="sparkles" value={currentStreak} label={`${plural(currentStreak, ['dzień', 'dni', 'dni'])} serii (3+ nawyki)`} />
      </div>

      <section className="card">
        <h2 className="card-title">Dziś</h2>
        <ul className="checklist">
          {habits.map((h) => {
            const done = doneToday.has(h.id);
            const isCustom = h.id.startsWith('wlasny-');
            return (
              <li key={h.id} className={done ? 'is-done' : ''}>
                <button type="button" className="check-btn" onClick={() => toggle(h.id)} aria-pressed={done} aria-label={h.label}>
                  {done ? <CircleCheck size={22} /> : <Circle size={22} />}
                </button>
                <span className="checklist-text">
                  {h.label}
                  {h.hint && <span className="muted small"> · {h.hint}</span>}
                </span>
                {isCustom && (
                  <button type="button" className="icon-btn" aria-label={`Usuń nawyk: ${h.label}`} onClick={() => removeHabit(h.id)}>
                    <Trash2 size={16} />
                  </button>
                )}
              </li>
            );
          })}
        </ul>
        <form
          className="add-row"
          onSubmit={(e) => {
            e.preventDefault();
            addHabit();
          }}
        >
          <input type="text" value={label} onChange={(e) => setLabel(e.target.value)} placeholder="Własny nawyk, np. wieczór bez ekranu po 22:00" aria-label="Nowy nawyk" />
          <button type="submit" className="btn">
            <Plus size={18} aria-hidden /> Dodaj
          </button>
        </form>
      </section>

      <section className="card">
        <h2 className="card-title">Ostatnie 14 dni</h2>
        <div className="habit-grid-wrap">
          <table className="habit-grid">
            <thead>
              <tr>
                <th scope="col">Nawyk</th>
                {days.map((d) => (
                  <th key={d} scope="col" title={formatShortKey(d)}>
                    {Number(d.slice(8))}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {habits.map((h) => (
                <tr key={h.id}>
                  <th scope="row">{h.label}</th>
                  {days.map((d) => {
                    const on = (detox[d] ?? []).includes(h.id);
                    return (
                      <td key={d}>
                        <button
                          type="button"
                          className={`cell ${on ? 'is-on' : ''}`}
                          onClick={() => toggle(h.id, d)}
                          aria-label={`${h.label}, ${formatShortKey(d)}: ${on ? 'zrobione' : 'nie zrobione'}`}
                          aria-pressed={on}
                        />
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="muted small">Możesz uzupełnić wcześniejsze dni, klikając w kratki.</p>
      </section>
    </div>
  );
}

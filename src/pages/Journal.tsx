import { useState } from 'react';
import { Link } from 'react-router';
import { Plus, Search } from 'lucide-react';
import { EmptyState, PageHeader } from '../components/ui';
import { useJournal } from '../state';
import { JOURNAL_LABELS } from '../data/tools';
import EntryList from './tools/EntryList';
import { useTitle } from '../lib/hooks';
import { plural } from '../lib/date';
import type { JournalType } from '../types';

const TYPES = Object.keys(JOURNAL_LABELS) as JournalType[];

export default function Journal() {
  useTitle('Dziennik');
  const { entries, addEntry, removeEntry, updateEntry } = useJournal();
  const [filter, setFilter] = useState<JournalType | 'all'>('all');
  const [query, setQuery] = useState('');
  const [note, setNote] = useState('');

  const q = query.trim().toLocaleLowerCase('pl-PL');
  const shown = entries.filter(
    (e) =>
      (filter === 'all' || e.type === filter) &&
      (!q || Object.values(e.fields).some((v) => v.toLocaleLowerCase('pl-PL').includes(q))),
  );
  const counts = Object.fromEntries(TYPES.map((t) => [t, entries.filter((e) => e.type === t).length])) as Record<JournalType, number>;

  const saveNote = () => {
    const value = note.trim();
    if (!value) return;
    addEntry({ type: 'notatka', fields: { tekst: value } });
    setNote('');
  };

  return (
    <div className="page">
      <PageHeader
        icon="notebook"
        eyebrow={`${entries.length} ${plural(entries.length, ['wpis', 'wpisy', 'wpisów'])}`}
        title="Dziennik"
        lead="Wszystkie wpisy z narzędzi w jednym miejscu: poranki, wieczory, wahadła, ważność, koordynacja, frajling i drogowskazy. Wpisy zostają w tej przeglądarce. Kopię zapasową zrobisz w zakładce Postęp."
      />

      <form
        className="card form"
        onSubmit={(e) => {
          e.preventDefault();
          saveNote();
        }}
      >
        <label className="field-label" htmlFor="free-note">
          Szybka notatka
        </label>
        <textarea id="free-note" rows={3} value={note} onChange={(e) => setNote(e.target.value)} placeholder="Obserwacja, zbieg okoliczności, myśl, która przyszła…" />
        <div className="form-actions">
          <button type="submit" className="btn btn-primary" disabled={!note.trim()}>
            <Plus size={18} aria-hidden /> Zapisz notatkę
          </button>
        </div>
      </form>

      <div className="toolbar">
        <label className="search">
          <Search size={18} aria-hidden />
          <input type="search" placeholder="Szukaj we wpisach" value={query} onChange={(e) => setQuery(e.target.value)} aria-label="Szukaj we wpisach" />
        </label>
        <div className="chips" role="group" aria-label="Filtr typu wpisu">
          <button type="button" className={`chip ${filter === 'all' ? 'is-active' : ''}`} onClick={() => setFilter('all')}>
            Wszystkie ({entries.length})
          </button>
          {TYPES.filter((t) => counts[t] > 0).map((t) => (
            <button key={t} type="button" className={`chip ${filter === t ? 'is-active' : ''}`} onClick={() => setFilter(t)}>
              {JOURNAL_LABELS[t]} ({counts[t]})
            </button>
          ))}
        </div>
      </div>

      {entries.length === 0 ? (
        <EmptyState icon="notebook" title="Dziennik jest pusty">
          Zacznij od <Link to="/praktyka/poranek/">porannego ustawienia</Link> albo <Link to="/praktyka/wieczor/">wieczornego przeglądu</Link>.
        </EmptyState>
      ) : shown.length === 0 ? (
        <p className="muted center">Brak wpisów pasujących do filtra.</p>
      ) : (
        <EntryList entries={shown} onRemove={removeEntry} onUpdate={updateEntry} editableKeys={[]} showType />
      )}
    </div>
  );
}

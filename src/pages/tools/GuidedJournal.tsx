import { useState } from 'react';
import { Link } from 'react-router';
import { Save, Wand2 } from 'lucide-react';
import { Callout, EmptyState, Scale5 } from '../../components/ui';
import { useJournal } from '../../state';
import EntryList from './EntryList';
import type { JournalConfig } from '../../types';

const LATER_KEYS = ['skutek'];

export default function GuidedJournal({ config }: { config: JournalConfig }) {
  const { entries, addEntry, removeEntry, updateEntry } = useJournal();
  const [values, setValues] = useState<Record<string, string>>({});
  const [rating, setRating] = useState<number | undefined>();
  const [tags, setTags] = useState<string[]>([]);
  const [saved, setSaved] = useState(false);

  const mine = entries.filter((e) => e.type === config.type);
  const hasContent = Object.values(values).some((v) => v.trim().length > 0);

  const setValue = (key: string, value: string) => {
    setSaved(false);
    setValues((prev) => ({ ...prev, [key]: value }));
  };

  const save = () => {
    const fields = Object.fromEntries(
      Object.entries(values)
        .map(([k, v]) => [k, v.trim()] as const)
        .filter(([, v]) => v.length > 0),
    );
    addEntry({ type: config.type, fields, rating, tags: tags.length ? tags : undefined });
    setValues({});
    setRating(undefined);
    setTags([]);
    setSaved(true);
  };

  return (
    <div className="tool">
      <Callout tone="tip">{config.intro}</Callout>

      <form
        className="card form"
        onSubmit={(e) => {
          e.preventDefault();
          if (hasContent) save();
        }}
      >
        {config.fields
          .filter((f) => !LATER_KEYS.includes(f.key))
          .map((field) => (
            <div key={field.key} className="field">
              <label className="field-label" htmlFor={`f-${field.key}`}>
                {field.label}
              </label>
              {field.rows === 1 ? (
                <input
                  id={`f-${field.key}`}
                  type="text"
                  value={values[field.key] ?? ''}
                  placeholder={field.placeholder}
                  onChange={(e) => setValue(field.key, e.target.value)}
                />
              ) : (
                <textarea
                  id={`f-${field.key}`}
                  rows={field.rows ?? 3}
                  value={values[field.key] ?? ''}
                  placeholder={field.placeholder}
                  onChange={(e) => setValue(field.key, e.target.value)}
                />
              )}
              {field.suggestions && (
                <div className="chips">
                  {field.suggestions.map((s) => (
                    <button key={s} type="button" className="chip chip-sm" onClick={() => setValue(field.key, s)}>
                      {s}
                    </button>
                  ))}
                </div>
              )}
            </div>
          ))}

        {config.tags && (
          <div className="field">
            <p className="field-label">Rodzaj</p>
            <div className="chips">
              {config.tags.map((tag) => (
                <button
                  key={tag}
                  type="button"
                  className={`chip ${tags.includes(tag) ? 'is-active' : ''}`}
                  aria-pressed={tags.includes(tag)}
                  onClick={() => setTags((prev) => (prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]))}
                >
                  {tag}
                </button>
              ))}
            </div>
          </div>
        )}

        {config.rating && (
          <div className="field">
            <p className="field-label">{config.rating.label}</p>
            <Scale5 label={config.rating.label} value={rating} onChange={setRating} low={config.rating.low} high={config.rating.high} />
          </div>
        )}

        <div className="form-actions">
          <button type="submit" className="btn btn-primary" disabled={!hasContent}>
            <Save size={18} aria-hidden /> {config.saveLabel}
          </button>
          {config.type === 'poranek' && (
            <Link to="/praktyka/warkocz/" className="btn btn-ghost">
              <Wand2 size={18} aria-hidden /> Ustaw kadr z warkoczem
            </Link>
          )}
          {saved && (
            <span className="saved-note" role="status">
              Zapisano w dzienniku.
            </span>
          )}
        </div>
      </form>

      <section className="section">
        <h2 className="section-title">Twoje wpisy ({mine.length})</h2>
        {mine.length === 0 ? (
          <EmptyState icon="notebook" title="Brak wpisów">
            Pierwszy wpis pojawi się tutaj. Wszystkie wpisy znajdziesz też w zakładce <Link to="/dziennik/">Dziennik</Link>.
          </EmptyState>
        ) : (
          <EntryList
            entries={mine.slice(0, 30)}
            onRemove={removeEntry}
            onUpdate={updateEntry}
            editableKeys={config.fields.filter((f) => LATER_KEYS.includes(f.key)).map((f) => f.key)}
          />
        )}
      </section>
    </div>
  );
}

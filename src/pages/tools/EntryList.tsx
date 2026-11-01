import { useState } from 'react';
import { Pencil, Trash2 } from 'lucide-react';
import { FIELD_LABELS, JOURNAL_LABELS, RATING_LABELS } from '../../data/tools';
import { formatDateTime } from '../../lib/date';
import type { JournalEntry } from '../../types';

/** Lista wpisów dziennika z możliwością uzupełnienia pól (np. „skutek”) i usunięcia. */
export default function EntryList({
  entries,
  onRemove,
  onUpdate,
  editableKeys = [],
  showType = false,
}: {
  entries: JournalEntry[];
  onRemove: (id: string) => void;
  onUpdate?: (id: string, patch: Partial<JournalEntry>) => void;
  editableKeys?: string[];
  showType?: boolean;
}) {
  const [editing, setEditing] = useState<{ id: string; key: string; value: string } | null>(null);

  return (
    <ul className="entries">
      {entries.map((entry) => {
        const labels = FIELD_LABELS[entry.type];
        const fieldKeys = Array.from(new Set([...Object.keys(entry.fields), ...editableKeys]));
        return (
          <li key={entry.id} className="card entry">
            <div className="entry-head">
              <span className="entry-date">
                {showType && <span className="badge">{JOURNAL_LABELS[entry.type]}</span>} {formatDateTime(entry.createdAt)}
              </span>
              <button
                type="button"
                className="icon-btn"
                aria-label="Usuń wpis"
                onClick={() => window.confirm('Usunąć ten wpis?') && onRemove(entry.id)}
              >
                <Trash2 size={16} />
              </button>
            </div>
            {typeof entry.rating === 'number' && (
              <p className="entry-rating">
                {RATING_LABELS[entry.type] ?? 'Ocena'}: {entry.rating}/5
              </p>
            )}
            {entry.meta && typeof entry.meta.przed === 'number' && (
              <p className="entry-rating">
                Ważność: {entry.meta.przed} → {entry.meta.po ?? '?'} (skala 0–10)
              </p>
            )}
            {entry.meta && typeof entry.meta.sila === 'number' && (
              <p className="entry-rating">Siła haczyka: {entry.meta.sila}%</p>
            )}
            {entry.tags && entry.tags.length > 0 && (
              <p className="entry-tags">
                {entry.tags.map((t) => (
                  <span key={t} className="chip chip-sm">
                    {t}
                  </span>
                ))}
              </p>
            )}
            <dl className="entry-fields">
              {fieldKeys.map((key) => {
                const value = entry.fields[key];
                const isEditing = editing?.id === entry.id && editing.key === key;
                const editable = editableKeys.includes(key) && onUpdate;
                if (!value && !editable) return null;
                return (
                  <div key={key} className="entry-field">
                    <dt>{labels?.[key] ?? key}</dt>
                    {isEditing ? (
                      <dd>
                        <textarea
                          rows={3}
                          value={editing.value}
                          onChange={(e) => setEditing({ ...editing, value: e.target.value })}
                          aria-label={labels?.[key] ?? key}
                        />
                        <div className="row-actions">
                          <button
                            type="button"
                            className="btn btn-primary btn-sm"
                            onClick={() => {
                              onUpdate?.(entry.id, { fields: { ...entry.fields, [key]: editing.value.trim() } });
                              setEditing(null);
                            }}
                          >
                            Zapisz
                          </button>
                          <button type="button" className="btn btn-ghost btn-sm" onClick={() => setEditing(null)}>
                            Anuluj
                          </button>
                        </div>
                      </dd>
                    ) : (
                      <dd>
                        {value ? <span className="pre">{value}</span> : <span className="muted">jeszcze nie uzupełniono</span>}
                        {editable && (
                          <button
                            type="button"
                            className="link-btn"
                            onClick={() => setEditing({ id: entry.id, key, value: value ?? '' })}
                          >
                            <Pencil size={14} aria-hidden /> {value ? 'Edytuj' : 'Uzupełnij'}
                          </button>
                        )}
                      </dd>
                    )}
                  </div>
                );
              })}
            </dl>
          </li>
        );
      })}
    </ul>
  );
}

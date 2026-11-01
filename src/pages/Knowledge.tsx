import { useMemo, useState } from 'react';
import { Link, useSearchParams } from 'react-router';
import { CircleCheck, Clock, Search } from 'lucide-react';
import { PageHeader, ProgressBar, moduleStyle } from '../components/ui';
import { ICONS } from '../components/icons';
import { MODULES } from '../data/modules';
import { LESSONS, lessonText, readingMinutes } from '../data/lessons';
import { useLessonsRead } from '../state';
import { useTitle } from '../lib/hooks';
import type { ModuleId } from '../types';

function normalize(text: string) {
  return text.toLocaleLowerCase('pl-PL').normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/ł/g, 'l');
}

export default function Knowledge() {
  useTitle('Wiedza');
  const [params, setParams] = useSearchParams();
  const [query, setQuery] = useState('');
  const [read] = useLessonsRead();
  const moduleParam = params.get('modul') as ModuleId | null;
  const activeModule = MODULES.some((m) => m.id === moduleParam) ? moduleParam : null;

  const index = useMemo(() => LESSONS.map((l) => ({ lesson: l, text: normalize(lessonText(l)) })), []);
  const q = normalize(query.trim());
  const matches = new Set(index.filter((i) => !q || i.text.includes(q)).map((i) => i.lesson.slug));

  const readCount = LESSONS.filter((l) => read[l.slug]).length;
  const visibleModules = MODULES.filter((m) => !activeModule || m.id === activeModule);

  const selectModule = (id: ModuleId | null) => {
    const next = new URLSearchParams(params);
    if (id) next.set('modul', id);
    else next.delete('modul');
    setParams(next, { replace: true });
  };

  return (
    <div className="page">
      <PageHeader
        icon="book"
        eyebrow={`${readCount} z ${LESSONS.length} lekcji przeczytanych`}
        title="Wiedza"
        lead="Wszystkie główne zasady Transerfingu i technik Tafti, omówione prostym językiem. Każda lekcja zawiera ćwiczenie, typowe błędy i pytania do refleksji."
      />

      <ProgressBar value={readCount} max={LESSONS.length} label="Postęp nauki" />

      <div className="toolbar">
        <label className="search">
          <Search size={18} aria-hidden />
          <input
            type="search"
            placeholder="Szukaj w lekcjach, np. „ważność”, „warkocz”, „pieniądze”"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            aria-label="Szukaj w lekcjach"
          />
        </label>
        <div className="chips" role="group" aria-label="Filtr modułów">
          <button type="button" className={`chip ${!activeModule ? 'is-active' : ''}`} onClick={() => selectModule(null)}>
            Wszystkie
          </button>
          {MODULES.map((m) => (
            <button
              key={m.id}
              type="button"
              className={`chip chip-module ${activeModule === m.id ? 'is-active' : ''}`}
              style={moduleStyle(m.id)}
              onClick={() => selectModule(m.id)}
            >
              {m.short}
            </button>
          ))}
        </div>
      </div>

      {visibleModules.map((m) => {
        const lessons = LESSONS.filter((l) => l.module === m.id);
        const shown = lessons.filter((l) => matches.has(l.slug));
        if (shown.length === 0) return null;
        const Icon = ICONS[m.icon];
        const moduleRead = lessons.filter((l) => read[l.slug]).length;
        return (
          <section key={m.id} className="module-section" style={moduleStyle(m.id)}>
            <div className="module-section-head">
              <div className="module-card-icon">
                <Icon size={22} aria-hidden />
              </div>
              <div>
                <p className="eyebrow">
                  Moduł {MODULES.indexOf(m) + 1} · {moduleRead}/{lessons.length}
                </p>
                <h2>{m.title}</h2>
                <p className="muted">{m.description}</p>
              </div>
            </div>
            <ol className="lesson-list">
              {shown.map((l) => (
                <li key={l.slug}>
                  <Link to={`/wiedza/${l.slug}/`} className="lesson-row">
                    <span className={`lesson-check ${read[l.slug] ? 'is-read' : ''}`} aria-hidden>
                      <CircleCheck size={20} />
                    </span>
                    <span className="lesson-row-body">
                      <span className="lesson-row-title">{l.title}</span>
                      <span className="lesson-row-sub">{l.subtitle}</span>
                    </span>
                    <span className="lesson-row-meta">
                      <Clock size={14} aria-hidden /> {readingMinutes(l)} min
                    </span>
                    <span className="sr-only">{read[l.slug] ? 'przeczytana' : 'nieprzeczytana'}</span>
                  </Link>
                </li>
              ))}
            </ol>
          </section>
        );
      })}

      {matches.size === 0 && (
        <p className="muted center">Nic nie znaleziono. Spróbuj innego słowa albo zajrzyj do słownika pojęć.</p>
      )}
    </div>
  );
}

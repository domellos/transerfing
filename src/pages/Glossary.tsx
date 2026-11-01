import { useState } from 'react';
import { Link } from 'react-router';
import { Search } from 'lucide-react';
import { PageHeader } from '../components/ui';
import { GLOSSARY } from '../data/glossary';
import { LESSON_BY_SLUG } from '../data/lessons';
import { useTitle } from '../lib/hooks';
import { plural } from '../lib/date';

const collator = new Intl.Collator('pl-PL');
const SORTED = [...GLOSSARY].sort((a, b) => collator.compare(a.term.replace(/[„”"]/g, ''), b.term.replace(/[„”"]/g, '')));

export default function Glossary() {
  useTitle('Słownik pojęć');
  const [query, setQuery] = useState('');
  const q = query.trim().toLocaleLowerCase('pl-PL');
  const shown = SORTED.filter((t) => !q || `${t.term} ${t.definition}`.toLocaleLowerCase('pl-PL').includes(q));

  return (
    <div className="page">
      <PageHeader
        icon="library"
        eyebrow={`${GLOSSARY.length} ${plural(GLOSSARY.length, ['pojęcie', 'pojęcia', 'pojęć'])}`}
        title="Słownik pojęć"
        lead="Najważniejsze terminy Transerfingu i technik Tafti w jednym miejscu. Każde hasło prowadzi do lekcji, w której znajdziesz szczegóły i ćwiczenie."
      />
      <label className="search">
        <Search size={18} aria-hidden />
        <input type="search" placeholder="Szukaj pojęcia" value={query} onChange={(e) => setQuery(e.target.value)} aria-label="Szukaj pojęcia" />
      </label>
      <dl className="glossary">
        {shown.map((t) => {
          const lesson = t.lesson ? LESSON_BY_SLUG[t.lesson] : undefined;
          return (
            <div key={t.term} className="glossary-item">
              <dt>{t.term}</dt>
              <dd>
                {t.definition}
                {lesson && (
                  <>
                    {' '}
                    <Link to={`/wiedza/${lesson.slug}/`} className="inline-link">
                      Lekcja: {lesson.title}
                    </Link>
                  </>
                )}
              </dd>
            </div>
          );
        })}
      </dl>
      {shown.length === 0 && <p className="muted center">Nie znaleziono pojęcia.</p>}
    </div>
  );
}

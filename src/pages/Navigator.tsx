import { useMemo, useState } from 'react';
import { Link, useParams, useSearchParams } from 'react-router';
import { ArrowLeft, ArrowRight, Bot, Quote, Search } from 'lucide-react';
import { CrisisCard, ModuleChip, PageHeader } from '../components/ui';
import { ICONS } from '../components/icons';
import { SITUATIONS, SITUATION_BY_ID, SITUATION_CATEGORIES } from '../data/navigator';
import { LESSON_BY_SLUG } from '../data/lessons';
import { TOOL_BY_ID } from '../data/tools';
import { containsCrisis, scoreKeywords } from '../lib/match';
import { useTitle } from '../lib/hooks';
import { STATIC } from '../site';
import NotFound from './NotFound';
import type { Situation } from '../types';

function SituationDetail({ situation }: { situation: Situation }) {
  const category = SITUATION_CATEGORIES.find((c) => c.id === situation.category);
  return (
    <div className="page narrow">
      <nav className="breadcrumbs" aria-label="Okruszki">
        <Link to="/nawigator/">Nawigator</Link>
        <span aria-hidden>/</span>
        <span>{category?.title}</span>
      </nav>
      <PageHeader eyebrow="Co się dzieje?" title={situation.title} icon="compass" />

      <section className="card">
        <p className="eyebrow">Co się dzieje według Transerfingu</p>
        <p className="day-task">{situation.diagnosis}</p>
      </section>

      <section className="card practice-card">
        <p className="eyebrow">Co możesz zrobić teraz</p>
        <ol className="steps">
          {situation.steps.map((step) => (
            <li key={step}>{step}</li>
          ))}
        </ol>
        {situation.phrase && (
          <p className="phrase">
            <Quote size={18} aria-hidden /> {situation.phrase}
          </p>
        )}
        <div className="form-actions">
          {situation.tools.map((id) => {
            const tool = TOOL_BY_ID[id];
            const Icon = ICONS[tool.icon];
            return (
              <Link key={id} to={`/praktyka/${id}/`} className="btn btn-primary">
                <Icon size={18} aria-hidden /> {tool.title}
              </Link>
            );
          })}
        </div>
      </section>

      <section className="section">
        <h2 className="section-title">Przeczytaj więcej</h2>
        <div className="grid grid-3">
          {situation.lessons.map((slug) => {
            const lesson = LESSON_BY_SLUG[slug];
            if (!lesson) return null;
            return (
              <Link key={slug} to={`/wiedza/${slug}/`} className="card card-link related-card">
                <ModuleChip module={lesson.module} />
                <h3>{lesson.title}</h3>
                <p className="muted small">{lesson.subtitle}</p>
              </Link>
            );
          })}
        </div>
      </section>

      <div className="pager">
        <Link to="/nawigator/" className="pager-link">
          <ArrowLeft size={18} aria-hidden />
          <span>
            <span className="muted small">Wróć</span>
            <span>Inna sytuacja</span>
          </span>
        </Link>
        {!STATIC && (
          <Link to={`/asystent/?q=${encodeURIComponent(situation.title)}`} className="pager-link pager-next">
            <span>
              <span className="muted small">Potrzebujesz więcej?</span>
              <span>Zapytaj asystenta AI</span>
            </span>
            <Bot size={18} aria-hidden />
          </Link>
        )}
      </div>
    </div>
  );
}

export default function Navigator() {
  const { id } = useParams();
  const [params] = useSearchParams();
  const situation = id ? SITUATION_BY_ID[id] : undefined;
  useTitle(situation ? situation.title : id ? 'Nie znaleziono' : 'Nawigator: co się dzieje?');
  const [query, setQuery] = useState(() => params.get('q') ?? '');

  const matches = useMemo(() => {
    if (query.trim().length < 3) return [];
    return SITUATIONS.map((s) => ({ s, score: scoreKeywords(query, [...s.keywords, s.title]) }))
      .filter((m) => m.score > 0)
      .sort((a, b) => b.score - a.score)
      .slice(0, 3)
      .map((m) => m.s);
  }, [query]);
  const crisis = containsCrisis(query);

  if (id && !situation) return <NotFound />;
  if (situation) return <SituationDetail situation={situation} />;

  return (
    <div className="page">
      <PageHeader
        icon="compass"
        title="Nawigator: co się dzieje?"
        lead="Opisz sytuację własnymi słowami albo wybierz ją z listy. Nawigator wskaże zasadę Transerfingu, która tu pasuje, kilka kroków do zrobienia od razu i narzędzie do praktyki."
      />

      <label className="search search-lg">
        <Search size={20} aria-hidden />
        <input
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Np. „boję się jutrzejszej rozmowy”, „kłótnia z mamą”, „nic mi nie wychodzi”"
          aria-label="Opisz, co się dzieje"
        />
      </label>

      {crisis && <CrisisCard />}

      {query.trim().length >= 3 && (
        <section className="section-tight">
          {matches.length > 0 ? (
            <div className="grid grid-3">
              {matches.map((s) => (
                <Link key={s.id} to={`/nawigator/${s.id}/`} className="card card-link quick-card match-card">
                  <ArrowRight size={20} aria-hidden />
                  <span>{s.title}</span>
                </Link>
              ))}
            </div>
          ) : (
            <p className="muted">
              {STATIC ? (
                'Nie znalazłem pasującej sytuacji. Wybierz najbliższą z listy poniżej.'
              ) : (
                <>
                  Nie znalazłem pasującej sytuacji. Wybierz najbliższą z listy poniżej albo{' '}
                  <Link to={`/asystent/?q=${encodeURIComponent(query)}`}>zapytaj asystenta AI</Link>.
                </>
              )}
            </p>
          )}
        </section>
      )}

      {SITUATION_CATEGORIES.map((category) => (
        <section key={category.id} className="section">
          <h2 className="section-title">{category.title}</h2>
          <ul className="situation-list">
            {SITUATIONS.filter((s) => s.category === category.id).map((s) => (
              <li key={s.id}>
                <Link to={`/nawigator/${s.id}/`} className="lesson-row">
                  <span className="lesson-row-body">
                    <span className="lesson-row-title">{s.title}</span>
                  </span>
                  <ArrowRight size={16} aria-hidden />
                </Link>
              </li>
            ))}
          </ul>
        </section>
      ))}
    </div>
  );
}

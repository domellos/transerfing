import { Link, useParams } from 'react-router';
import { ArrowRight, TriangleAlert, Waves } from 'lucide-react';
import { Callout, PageHeader } from '../components/ui';
import { ICONS } from '../components/icons';
import { AREAS, AREA_BY_SLUG } from '../data/areas';
import { LESSON_BY_SLUG } from '../data/lessons';
import { TOOL_BY_ID } from '../data/tools';
import { useTitle } from '../lib/hooks';
import NotFound from './NotFound';

export default function AreaPage() {
  const { slug = '' } = useParams();
  const area = AREA_BY_SLUG[slug];
  useTitle(area ? `${area.title}: Transerfing w praktyce` : 'Nie znaleziono');
  if (!area) return <NotFound />;
  const others = AREAS.filter((a) => a.slug !== area.slug);

  return (
    <article className="page narrow">
      <nav className="breadcrumbs" aria-label="Okruszki">
        <Link to="/obszary/">Obszary życia</Link>
        <span aria-hidden>/</span>
        <span>{area.title}</span>
      </nav>
      <PageHeader icon={area.icon} eyebrow="Obszar życia" title={area.title} lead={area.tagline} />

      <section className="lesson-section">
        {area.intro.map((p) => (
          <p key={p}>{p}</p>
        ))}
      </section>

      <div className="grid grid-2">
        <section className="card">
          <h2 className="card-title">
            <Waves size={18} aria-hidden className="inline-icon" /> Typowe wahadła
          </h2>
          <ul className="bullets">
            {area.pendulums.map((p) => (
              <li key={p}>{p}</li>
            ))}
          </ul>
        </section>
        <section className="card">
          <h2 className="card-title">Pułapki ważności</h2>
          <ul className="bullets bullets-warn">
            {area.importance.map((p) => (
              <li key={p}>{p}</li>
            ))}
          </ul>
        </section>
      </div>

      <section className="lesson-section">
        <h2>Jak zastosować zasady</h2>
        <ul className="principles">
          {area.principles.map((p) => {
            const lesson = LESSON_BY_SLUG[p.lesson];
            return (
              <li key={p.principle} className="card principle">
                <p className="eyebrow">
                  <Link to={`/wiedza/${p.lesson}/`}>{p.principle}</Link>
                </p>
                <p>{p.action}</p>
                {lesson && (
                  <Link to={`/wiedza/${lesson.slug}/`} className="link-more small">
                    Lekcja: {lesson.title} <ArrowRight size={14} aria-hidden />
                  </Link>
                )}
              </li>
            );
          })}
        </ul>
      </section>

      <section className="card practice-card">
        <p className="eyebrow">Plan na 7 dni</p>
        <ol className="steps">
          {area.plan.map((task, i) => (
            <li key={task}>
              <strong>Dzień {i + 1}.</strong> {task}
            </li>
          ))}
        </ol>
        <div className="form-actions">
          {area.tools.map((id) => {
            const tool = TOOL_BY_ID[id];
            const Icon = ICONS[tool.icon];
            return (
              <Link key={id} to={`/praktyka/${id}/`} className="btn">
                <Icon size={18} aria-hidden /> {tool.title}
              </Link>
            );
          })}
        </div>
      </section>

      {area.caution && (
        <Callout tone="warn" title="Ważne">
          <TriangleAlert size={16} aria-hidden className="inline-icon" /> {area.caution}
        </Callout>
      )}

      <section className="section">
        <h2 className="section-title">Inne obszary</h2>
        <div className="grid grid-2">
          {others.map((a) => {
            const Icon = ICONS[a.icon];
            return (
              <Link key={a.slug} to={`/obszary/${a.slug}/`} className="card card-link quick-card">
                <Icon size={20} aria-hidden />
                <span>{a.title}</span>
              </Link>
            );
          })}
        </div>
      </section>
    </article>
  );
}

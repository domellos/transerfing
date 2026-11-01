import { Link, useParams } from 'react-router';
import { ArrowLeft, ArrowRight, BookMarked, CircleCheck, Clock, Lightbulb, TriangleAlert } from 'lucide-react';
import { RichText } from '../lib/text';
import { LESSONS, LESSON_BY_SLUG, readingMinutes } from '../data/lessons';
import { MODULE_BY_ID } from '../data/modules';
import { TOOL_BY_ID } from '../data/tools';
import { ICONS } from '../components/icons';
import { ModuleChip, moduleStyle } from '../components/ui';
import { useLessonNotes, useLessonsRead } from '../state';
import { dateKey } from '../lib/date';
import { useTitle } from '../lib/hooks';
import NotFound from './NotFound';

export default function LessonPage() {
  const { slug = '' } = useParams();
  const lesson = LESSON_BY_SLUG[slug];
  useTitle(lesson?.title ?? 'Nie znaleziono');
  const [read, setRead] = useLessonsRead();
  const [notes, setNotes] = useLessonNotes();

  if (!lesson) return <NotFound />;

  const module = MODULE_BY_ID[lesson.module];
  const position = LESSONS.indexOf(lesson);
  const prev = LESSONS[position - 1];
  const next = LESSONS[position + 1];
  const tool = lesson.tool ? TOOL_BY_ID[lesson.tool] : undefined;
  const ToolIcon = tool ? ICONS[tool.icon] : null;
  const isRead = Boolean(read[lesson.slug]);
  const lessonNotes = notes[lesson.slug] ?? {};

  const toggleRead = () =>
    setRead((prevRead) => {
      const copy = { ...prevRead };
      if (copy[lesson.slug]) delete copy[lesson.slug];
      else copy[lesson.slug] = dateKey();
      return copy;
    });

  const setNote = (index: number, value: string) =>
    setNotes((prevNotes) => ({
      ...prevNotes,
      [lesson.slug]: { ...(prevNotes[lesson.slug] ?? {}), [String(index)]: value },
    }));

  return (
    <article className="page lesson" style={moduleStyle(lesson.module)}>
      <nav className="breadcrumbs" aria-label="Okruszki">
        <Link to="/wiedza/">Wiedza</Link>
        <span aria-hidden>/</span>
        <Link to={`/wiedza/?modul=${module.id}`}>{module.title}</Link>
      </nav>

      <header className="lesson-header">
        <div className="lesson-meta">
          <ModuleChip module={lesson.module} link />
          <span className="muted small">
            <Clock size={14} aria-hidden /> {readingMinutes(lesson)} min czytania
          </span>
        </div>
        <h1>{lesson.title}</h1>
        <p className="lead">{lesson.subtitle}</p>
      </header>

      <div className="summary-box">
        <p className="eyebrow">W skrócie</p>
        <p>
          <RichText text={lesson.summary} />
        </p>
      </div>

      {lesson.sections.map((section) => (
        <section key={section.heading} className="lesson-section">
          <h2>{section.heading}</h2>
          {section.body?.map((paragraph, i) => (
            <p key={i}>
              <RichText text={paragraph} />
            </p>
          ))}
          {section.bullets && (
            <ul className="bullets">
              {section.bullets.map((b, i) => (
                <li key={i}>
                  <RichText text={b} />
                </li>
              ))}
            </ul>
          )}
        </section>
      ))}

      <section className="card practice-card">
        <p className="eyebrow">
          <Lightbulb size={16} aria-hidden /> Ćwiczenie
        </p>
        <h2>{lesson.practice.title}</h2>
        <ol className="steps">
          {lesson.practice.steps.map((step, i) => (
            <li key={i}>
              <RichText text={step} />
            </li>
          ))}
        </ol>
        {lesson.practice.tip && (
          <p className="tip">
            <RichText text={lesson.practice.tip} />
          </p>
        )}
        {tool && ToolIcon && (
          <Link to={`/praktyka/${tool.id}/`} className="btn btn-primary">
            <ToolIcon size={18} aria-hidden /> Otwórz narzędzie: {tool.title}
          </Link>
        )}
      </section>

      <section className="lesson-section">
        <h2>
          <TriangleAlert size={20} aria-hidden className="inline-icon" /> Częste błędy
        </h2>
        <ul className="bullets bullets-warn">
          {lesson.mistakes.map((m, i) => (
            <li key={i}>
              <RichText text={m} />
            </li>
          ))}
        </ul>
      </section>

      <section className="lesson-section">
        <h2>Pytania do refleksji</h2>
        <p className="muted small">Twoje odpowiedzi zapisują się automatycznie w tej przeglądarce.</p>
        {lesson.questions.map((question, i) => (
          <div key={i} className="field">
            <label className="field-label" htmlFor={`q-${i}`}>
              {question}
            </label>
            <textarea
              id={`q-${i}`}
              rows={3}
              value={lessonNotes[String(i)] ?? ''}
              onChange={(e) => setNote(i, e.target.value)}
              placeholder="Zapisz swoją odpowiedź…"
            />
          </div>
        ))}
      </section>

      <div className="lesson-done">
        <button type="button" className={`btn btn-lg ${isRead ? '' : 'btn-primary'}`} onClick={toggleRead} aria-pressed={isRead}>
          <CircleCheck size={20} aria-hidden />
          {isRead ? 'Przeczytane (kliknij, aby cofnąć)' : 'Oznacz jako przeczytane'}
        </button>
        <p className="muted small source">
          <BookMarked size={14} aria-hidden /> Źródło idei: {lesson.source}
        </p>
      </div>

      {lesson.related.length > 0 && (
        <section className="lesson-section">
          <h2>Powiązane lekcje</h2>
          <div className="grid grid-3">
            {lesson.related
              .map((s) => LESSON_BY_SLUG[s])
              .filter(Boolean)
              .map((rel) => (
                <Link key={rel.slug} to={`/wiedza/${rel.slug}/`} className="card card-link related-card" style={moduleStyle(rel.module)}>
                  <ModuleChip module={rel.module} />
                  <h3>{rel.title}</h3>
                  <p className="muted small">{rel.subtitle}</p>
                </Link>
              ))}
          </div>
        </section>
      )}

      <nav className="pager" aria-label="Poprzednia i następna lekcja">
        {prev ? (
          <Link to={`/wiedza/${prev.slug}/`} className="pager-link">
            <ArrowLeft size={18} aria-hidden />
            <span>
              <span className="muted small">Poprzednia</span>
              <span>{prev.title}</span>
            </span>
          </Link>
        ) : (
          <span />
        )}
        {next ? (
          <Link to={`/wiedza/${next.slug}/`} className="pager-link pager-next">
            <span>
              <span className="muted small">Następna</span>
              <span>{next.title}</span>
            </span>
            <ArrowRight size={18} aria-hidden />
          </Link>
        ) : (
          <span />
        )}
      </nav>
    </article>
  );
}

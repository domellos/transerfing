import { Link, useNavigate, useParams } from 'react-router';
import { ArrowLeft, ArrowRight, BookOpen, CircleCheck } from 'lucide-react';
import { PROGRAM_DAYS, PROGRAM_LENGTH, weekOfDay } from '../data/program';
import { LESSON_BY_SLUG } from '../data/lessons';
import { TOOL_BY_ID } from '../data/tools';
import { ICONS } from '../components/icons';
import { ModuleChip } from '../components/ui';
import { RichText } from '../lib/text';
import { useProgram } from '../state';
import { dateKey } from '../lib/date';
import { useTitle } from '../lib/hooks';
import NotFound from './NotFound';

export default function ProgramDayPage() {
  const { day = '' } = useParams();
  const number = Number(day);
  const entry = PROGRAM_DAYS.find((d) => d.day === number);
  useTitle(entry ? `Dzień ${entry.day}: ${entry.title}` : 'Nie znaleziono');
  const [program, setProgram] = useProgram();
  const navigate = useNavigate();

  if (!entry) return <NotFound />;

  const week = weekOfDay(entry.day)!;
  const lesson = entry.lesson ? LESSON_BY_SLUG[entry.lesson] : undefined;
  const tool = entry.tool ? TOOL_BY_ID[entry.tool] : lesson?.tool ? TOOL_BY_ID[lesson.tool] : undefined;
  const ToolIcon = tool ? ICONS[tool.icon] : null;
  const key = String(entry.day);
  const done = Boolean(program.done[key]);

  const toggleDone = () => {
    setProgram((p) => {
      const doneMap = { ...p.done };
      if (doneMap[key]) delete doneMap[key];
      else doneMap[key] = dateKey();
      return { ...p, startedAt: p.startedAt ?? dateKey(), done: doneMap };
    });
    if (!done && entry.day < PROGRAM_LENGTH) navigate(`/program/dzien/${entry.day + 1}/`);
  };

  const setNote = (value: string) => setProgram((p) => ({ ...p, notes: { ...p.notes, [key]: value } }));

  return (
    <div className="page narrow">
      <nav className="breadcrumbs" aria-label="Okruszki">
        <Link to="/program/">Program</Link>
        <span aria-hidden>/</span>
        <span>
          Tydzień {week.week}: {week.title}
        </span>
      </nav>

      <header className="page-header">
        <p className="eyebrow">
          Dzień {entry.day} z {PROGRAM_LENGTH}
          {done ? ' · ukończony' : ''}
        </p>
        <h1>{entry.title}</h1>
      </header>

      {lesson && (
        <Link to={`/wiedza/${lesson.slug}/`} className="card card-link day-lesson">
          <BookOpen size={22} aria-hidden />
          <div>
            <p className="eyebrow">Lekcja dnia</p>
            <h2 className="card-title">{lesson.title}</h2>
            <p className="muted small">
              <RichText text={lesson.summary} />
            </p>
            <ModuleChip module={lesson.module} />
          </div>
          <ArrowRight size={20} aria-hidden />
        </Link>
      )}

      <section className="card">
        <p className="eyebrow">Zadanie</p>
        <p className="day-task">{entry.task}</p>
        {tool && ToolIcon && (
          <Link to={`/praktyka/${tool.id}/`} className="btn">
            <ToolIcon size={18} aria-hidden /> {tool.title}
          </Link>
        )}
      </section>

      <section className="card">
        <label className="field-label" htmlFor="reflection">
          Refleksja: {entry.reflection}
        </label>
        <textarea
          id="reflection"
          rows={5}
          value={program.notes[key] ?? ''}
          onChange={(e) => setNote(e.target.value)}
          placeholder="Zapisz swoje obserwacje z dzisiejszego dnia…"
        />
        <p className="muted small">Notatka zapisuje się automatycznie.</p>
      </section>

      <div className="lesson-done">
        <button type="button" className={`btn btn-lg ${done ? '' : 'btn-primary'}`} onClick={toggleDone} aria-pressed={done}>
          <CircleCheck size={20} aria-hidden />
          {done ? 'Ukończony (kliknij, aby cofnąć)' : 'Ukończ dzień i przejdź dalej'}
        </button>
      </div>

      <nav className="pager" aria-label="Poprzedni i następny dzień">
        {entry.day > 1 ? (
          <Link to={`/program/dzien/${entry.day - 1}/`} className="pager-link">
            <ArrowLeft size={18} aria-hidden />
            <span>
              <span className="muted small">Poprzedni</span>
              <span>Dzień {entry.day - 1}</span>
            </span>
          </Link>
        ) : (
          <span />
        )}
        {entry.day < PROGRAM_LENGTH ? (
          <Link to={`/program/dzien/${entry.day + 1}/`} className="pager-link pager-next">
            <span>
              <span className="muted small">Następny</span>
              <span>Dzień {entry.day + 1}</span>
            </span>
            <ArrowRight size={18} aria-hidden />
          </Link>
        ) : (
          <span />
        )}
      </nav>
    </div>
  );
}

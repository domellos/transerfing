import { Link } from 'react-router';
import { ArrowRight, CircleCheck, Circle } from 'lucide-react';
import { PageHeader, ProgressBar } from '../components/ui';
import { PROGRAM, PROGRAM_DAYS, PROGRAM_LENGTH } from '../data/program';
import { useProgram } from '../state';
import { dateKey, daysBetween, formatShortKey } from '../lib/date';
import { useTitle } from '../lib/hooks';

export default function Program() {
  useTitle('Program 8 tygodni');
  const [program, setProgram] = useProgram();
  const doneCount = Object.keys(program.done).length;
  const nextDay = PROGRAM_DAYS.find((d) => !program.done[String(d.day)]);
  const calendarDay = program.startedAt ? Math.min(PROGRAM_LENGTH, daysBetween(program.startedAt, dateKey()) + 1) : 0;

  const start = () => setProgram((p) => ({ ...p, startedAt: dateKey() }));
  const reset = () => {
    if (window.confirm('Zresetować postęp programu? Notatki z dni programu też zostaną usunięte.')) {
      setProgram({ startedAt: null, done: {}, notes: {} });
    }
  };

  return (
    <div className="page">
      <PageHeader
        icon="map"
        eyebrow={`${doneCount} z ${PROGRAM_LENGTH} dni ukończonych`}
        title="Program 8 tygodni"
        lead="Jedno zadanie dziennie. Każdy tydzień skupia się na jednym obszarze Transerfingu, a ostatni łączy wszystko w codzienną praktykę. Idź we własnym tempie: liczy się regularność, nie pośpiech."
      />

      <section className="card program-summary">
        <ProgressBar value={doneCount} max={PROGRAM_LENGTH} label="Postęp programu" />
        {!program.startedAt ? (
          <div className="program-summary-row">
            <p>Program to własna propozycja tego serwisu, ułożona na podstawie zasad z książek Zelanda.</p>
            <button type="button" className="btn btn-primary btn-lg" onClick={start}>
              Rozpocznij dziś <ArrowRight size={18} />
            </button>
          </div>
        ) : (
          <div className="program-summary-row">
            <p>
              Start: {formatShortKey(program.startedAt)}. Dzień kalendarzowy programu: {calendarDay}.{' '}
              {nextDay ? `Następne zadanie: dzień ${nextDay.day}.` : 'Wszystkie dni ukończone.'}
            </p>
            {nextDay && (
              <Link to={`/program/dzien/${nextDay.day}/`} className="btn btn-primary">
                Dzień {nextDay.day}: {nextDay.title} <ArrowRight size={18} />
              </Link>
            )}
          </div>
        )}
      </section>

      {PROGRAM.map((week) => {
        const weekDone = week.days.filter((d) => program.done[String(d.day)]).length;
        return (
          <section key={week.week} className="week">
            <div className="week-head">
              <div>
                <p className="eyebrow">
                  Tydzień {week.week} · {weekDone}/{week.days.length}
                </p>
                <h2>{week.title}</h2>
                <p className="muted">{week.intro}</p>
              </div>
            </div>
            <ol className="day-list">
              {week.days.map((d) => {
                const done = Boolean(program.done[String(d.day)]);
                return (
                  <li key={d.day}>
                    <Link to={`/program/dzien/${d.day}/`} className={`day-row ${done ? 'is-done' : ''}`}>
                      {done ? <CircleCheck size={20} aria-hidden /> : <Circle size={20} aria-hidden />}
                      <span className="day-num">Dzień {d.day}</span>
                      <span className="day-title">{d.title}</span>
                      <span className="sr-only">{done ? 'ukończony' : 'nieukończony'}</span>
                    </Link>
                  </li>
                );
              })}
            </ol>
          </section>
        );
      })}

      {program.startedAt && (
        <p className="center">
          <button type="button" className="btn btn-ghost btn-sm" onClick={reset}>
            Zresetuj postęp programu
          </button>
        </p>
      )}
    </div>
  );
}

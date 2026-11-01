import { Link } from 'react-router';
import { ArrowRight, CircleCheck, Circle } from 'lucide-react';
import { PageHeader, ProgressBar } from '../components/ui';
import { SCENARIOS } from '../data/scenarios';
import { useScenarios } from '../state';
import { useTitle } from '../lib/hooks';

export default function Scenarios() {
  useTitle('Scenariusze');
  const [done] = useScenarios();
  const count = SCENARIOS.filter((s) => done[s.id] !== undefined).length;
  return (
    <div className="page">
      <PageHeader
        icon="route"
        eyebrow={`${count} z ${SCENARIOS.length} przećwiczonych`}
        title="Scenariusze do przećwiczenia"
        lead="Krótkie sytuacje z życia. Wybierz reakcję, która jest najbliższa temu, co zwykle robisz, i zobacz, co według Transerfingu z niej wynika. Nie ma ocen: liczy się to, co zauważysz."
      />
      <ProgressBar value={count} max={SCENARIOS.length} label="Przećwiczone scenariusze" />
      <ol className="lesson-list scenario-list">
        {SCENARIOS.map((s) => (
          <li key={s.id}>
            <Link to={`/scenariusze/${s.id}/`} className="lesson-row">
              <span className={`lesson-check ${done[s.id] !== undefined ? 'is-read' : ''}`} aria-hidden>
                {done[s.id] !== undefined ? <CircleCheck size={20} /> : <Circle size={20} />}
              </span>
              <span className="lesson-row-body">
                <span className="lesson-row-title">{s.title}</span>
                <span className="lesson-row-sub">
                  {s.area} · {s.situation.slice(0, 90)}…
                </span>
              </span>
              <ArrowRight size={16} aria-hidden />
            </Link>
          </li>
        ))}
      </ol>
    </div>
  );
}

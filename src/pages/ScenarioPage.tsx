import { useState } from 'react';
import { Link, useParams } from 'react-router';
import { ArrowLeft, ArrowRight, RotateCcw } from 'lucide-react';
import { PageHeader } from '../components/ui';
import { SCENARIOS, SCENARIO_BY_ID } from '../data/scenarios';
import { LESSON_BY_SLUG } from '../data/lessons';
import { useScenarios } from '../state';
import { useTitle } from '../lib/hooks';
import NotFound from './NotFound';

const VERDICT_LABEL = { najlepsza: 'Najbliżej Transerfingu', częściowo: 'Częściowo', pułapka: 'Pułapka' } as const;

export default function ScenarioPage() {
  const { id = '' } = useParams();
  const scenario = SCENARIO_BY_ID[id];
  useTitle(scenario ? `Scenariusz: ${scenario.title}` : 'Nie znaleziono');
  const [done, setDone] = useScenarios();
  const [choice, setChoice] = useState<number | null>(null);
  if (!scenario) return <NotFound />;

  const position = SCENARIOS.indexOf(scenario);
  const next = SCENARIOS[position + 1];
  const previousChoice = done[scenario.id];
  const answered = choice !== null;

  const choose = (index: number) => {
    setChoice(index);
    setDone((prev) => ({ ...prev, [scenario.id]: index }));
  };

  return (
    <div className="page narrow" key={scenario.id}>
      <nav className="breadcrumbs" aria-label="Okruszki">
        <Link to="/scenariusze/">Scenariusze</Link>
        <span aria-hidden>/</span>
        <span>{scenario.area}</span>
      </nav>
      <PageHeader eyebrow={`Scenariusz ${position + 1} z ${SCENARIOS.length}`} title={scenario.title} icon="route" />

      <section className="card scenario-situation">
        <p className="day-task">{scenario.situation}</p>
        <p className="eyebrow">{scenario.question}</p>
      </section>

      <div className="quiz-options">
        {scenario.options.map((option, i) => {
          const state = !answered ? '' : option.verdict === 'najlepsza' ? 'is-correct' : i === choice ? 'is-wrong' : 'is-dim';
          return (
            <button key={i} type="button" className={`quiz-option ${state}`} onClick={() => choose(i)} disabled={answered}>
              {option.text}
            </button>
          );
        })}
      </div>

      {!answered && previousChoice !== undefined && <p className="muted small">Ostatnio wybrałeś/wybrałaś odpowiedź {previousChoice + 1}. Spróbuj jeszcze raz.</p>}

      {answered && (
        <section className="section" role="status">
          <h2 className="section-title">Co z tego wynika</h2>
          <ul className="feedback-list">
            {scenario.options.map((option, i) => {
              const lesson = LESSON_BY_SLUG[option.lesson];
              return (
                <li key={i} className={`card feedback feedback-${option.verdict === 'najlepsza' ? 'best' : option.verdict === 'częściowo' ? 'mid' : 'trap'} ${i === choice ? 'is-chosen' : ''}`}>
                  <p className="eyebrow">
                    {VERDICT_LABEL[option.verdict]}
                    {i === choice ? ' · twój wybór' : ''}
                  </p>
                  <p className="small muted">{option.text}</p>
                  <p>{option.feedback}</p>
                  {lesson && (
                    <Link to={`/wiedza/${lesson.slug}/`} className="link-more small">
                      Lekcja: {lesson.title} <ArrowRight size={14} aria-hidden />
                    </Link>
                  )}
                </li>
              );
            })}
          </ul>
          <div className="form-actions">
            <button type="button" className="btn btn-ghost" onClick={() => setChoice(null)}>
              <RotateCcw size={18} aria-hidden /> Wybierz ponownie
            </button>
            {next ? (
              <Link to={`/scenariusze/${next.id}/`} className="btn btn-primary" onClick={() => setChoice(null)}>
                Następny scenariusz <ArrowRight size={18} aria-hidden />
              </Link>
            ) : (
              <Link to="/scenariusze/" className="btn btn-primary">
                Wszystkie scenariusze
              </Link>
            )}
          </div>
        </section>
      )}

      <nav className="pager" aria-label="Poprzedni i następny scenariusz">
        {position > 0 ? (
          <Link to={`/scenariusze/${SCENARIOS[position - 1].id}/`} className="pager-link" onClick={() => setChoice(null)}>
            <ArrowLeft size={18} aria-hidden />
            <span>
              <span className="muted small">Poprzedni</span>
              <span>{SCENARIOS[position - 1].title}</span>
            </span>
          </Link>
        ) : (
          <span />
        )}
        {next ? (
          <Link to={`/scenariusze/${next.id}/`} className="pager-link pager-next" onClick={() => setChoice(null)}>
            <span>
              <span className="muted small">Następny</span>
              <span>{next.title}</span>
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

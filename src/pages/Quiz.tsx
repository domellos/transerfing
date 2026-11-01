import { useState } from 'react';
import { Link } from 'react-router';
import { ArrowRight, CircleCheck, CircleX, RotateCcw, Trophy } from 'lucide-react';
import { PageHeader, ProgressBar, moduleStyle } from '../components/ui';
import { QUIZ } from '../data/quiz';
import { MODULES, MODULE_BY_ID } from '../data/modules';
import { LESSON_BY_SLUG } from '../data/lessons';
import { useQuizBest } from '../state';
import { useTitle } from '../lib/hooks';
import { plural } from '../lib/date';
import type { ModuleId, QuizQuestion } from '../types';

type Scope = ModuleId | 'all';

function shuffle<T>(items: T[]): T[] {
  const copy = [...items];
  for (let i = copy.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

export default function Quiz() {
  useTitle('Quiz');
  const [best, setBest] = useQuizBest();
  const [scope, setScope] = useState<Scope | null>(null);
  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  const [index, setIndex] = useState(0);
  const [answer, setAnswer] = useState<number | null>(null);
  const [score, setScore] = useState(0);
  const [finished, setFinished] = useState(false);

  const start = (s: Scope) => {
    const pool = s === 'all' ? QUIZ : QUIZ.filter((q) => q.module === s);
    setQuestions(shuffle(pool).slice(0, s === 'all' ? 12 : pool.length));
    setScope(s);
    setIndex(0);
    setAnswer(null);
    setScore(0);
    setFinished(false);
  };

  const choose = (i: number) => {
    if (answer !== null) return;
    setAnswer(i);
    if (i === questions[index].correct) setScore((s) => s + 1);
  };

  const next = () => {
    if (index + 1 < questions.length) {
      setIndex(index + 1);
      setAnswer(null);
      return;
    }
    setFinished(true);
    if (scope) {
      const pct = Math.round((score / questions.length) * 100);
      setBest((prev) => ({ ...prev, [scope]: Math.max(prev[scope] ?? 0, pct) }));
    }
  };

  if (!scope) {
    return (
      <div className="page">
        <PageHeader
          icon="graduation"
          title="Quiz"
          lead="Sprawdź, ile zostało w pamięci. Po każdej odpowiedzi zobaczysz wyjaśnienie i link do lekcji. Najlepsze wyniki zapisują się automatycznie."
        />
        <div className="grid grid-3">
          <button type="button" className="card card-link quiz-scope" onClick={() => start('all')}>
            <Trophy size={22} aria-hidden />
            <h3>Wszystkie moduły</h3>
            <p className="muted small">12 losowych pytań</p>
            {best.all !== undefined && <span className="badge">Najlepszy wynik: {best.all}%</span>}
          </button>
          {MODULES.map((m) => {
            const count = QUIZ.filter((q) => q.module === m.id).length;
            return (
              <button key={m.id} type="button" className="card card-link quiz-scope" style={moduleStyle(m.id)} onClick={() => start(m.id)}>
                <span className="chip chip-module">{m.short}</span>
                <h3>{m.title}</h3>
                <p className="muted small">
                  {count} {plural(count, ['pytanie', 'pytania', 'pytań'])}
                </p>
                {best[m.id] !== undefined && <span className="badge">Najlepszy wynik: {best[m.id]}%</span>}
              </button>
            );
          })}
        </div>
      </div>
    );
  }

  const title = scope === 'all' ? 'Wszystkie moduły' : MODULE_BY_ID[scope].title;

  if (finished) {
    const pct = Math.round((score / questions.length) * 100);
    return (
      <div className="page narrow">
        <PageHeader icon="graduation" eyebrow={title} title="Wynik quizu" />
        <div className="card result-box center">
          <Trophy size={36} aria-hidden className="result-icon" />
          <p className="result-score">
            {score}/{questions.length} ({pct}%)
          </p>
          <p className="muted">
            {pct >= 80 ? 'Świetnie. Teraz najważniejsze: praktyka.' : pct >= 50 ? 'Dobra baza. Wróć do lekcji, które sprawiły trudność.' : 'Warto jeszcze raz przejrzeć lekcje tego modułu.'}
          </p>
          <div className="form-actions center">
            <button type="button" className="btn btn-primary" onClick={() => start(scope)}>
              <RotateCcw size={18} aria-hidden /> Jeszcze raz
            </button>
            <button type="button" className="btn" onClick={() => setScope(null)}>
              Wybierz inny zakres
            </button>
          </div>
        </div>
      </div>
    );
  }

  const q = questions[index];
  const lesson = LESSON_BY_SLUG[q.lesson];

  return (
    <div className="page narrow">
      <PageHeader icon="graduation" eyebrow={`${title} · pytanie ${index + 1} z ${questions.length}`} title="Quiz" />
      <ProgressBar value={index + (answer !== null ? 1 : 0)} max={questions.length} label="Postęp quizu" />
      <div className="card quiz-card">
        <h2 className="quiz-question">{q.question}</h2>
        <div className="quiz-options">
          {q.options.map((option, i) => {
            const state = answer === null ? '' : i === q.correct ? 'is-correct' : i === answer ? 'is-wrong' : 'is-dim';
            return (
              <button key={i} type="button" className={`quiz-option ${state}`} onClick={() => choose(i)} disabled={answer !== null}>
                {answer !== null && i === q.correct && <CircleCheck size={18} aria-hidden />}
                {answer !== null && i === answer && i !== q.correct && <CircleX size={18} aria-hidden />}
                {option}
              </button>
            );
          })}
        </div>
        {answer !== null && (
          <div className="quiz-explain" role="status">
            <p>
              <strong>{answer === q.correct ? 'Dobrze.' : 'Nie tym razem.'}</strong> {q.explanation}
            </p>
            {lesson && (
              <p className="small">
                <Link to={`/wiedza/${lesson.slug}/`}>Lekcja: {lesson.title}</Link>
              </p>
            )}
            <button type="button" className="btn btn-primary" onClick={next}>
              {index + 1 < questions.length ? 'Następne pytanie' : 'Zobacz wynik'} <ArrowRight size={18} aria-hidden />
            </button>
          </div>
        )}
      </div>
      <p className="center">
        <button type="button" className="btn btn-ghost btn-sm" onClick={() => setScope(null)}>
          Przerwij quiz
        </button>
      </p>
    </div>
  );
}

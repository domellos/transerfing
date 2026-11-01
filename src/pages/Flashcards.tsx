import { useMemo, useState } from 'react';
import { Link } from 'react-router';
import { ArrowRight, Eye, Play, RotateCcw } from 'lucide-react';
import { Callout, PageHeader, ProgressBar, Stat } from '../components/ui';
import { BOX_INTERVALS, FLASHCARDS, MASTERED_BOX, NEW_CARDS_PER_DAY } from '../data/flashcards';
import { LESSON_BY_SLUG } from '../data/lessons';
import { useFlashcards, useFlashcardsLog } from '../state';
import { addDays, dateKey } from '../lib/date';
import { useTitle } from '../lib/hooks';
import type { CardState, Flashcard } from '../types';

type Grade = 'again' | 'hard' | 'good';

function nextState(state: CardState | undefined, grade: Grade, today: string): CardState {
  const box = state?.box ?? 0;
  const reviews = (state?.reviews ?? 0) + 1;
  if (grade === 'again') return { box: 1, due: today, reviews, lastReviewed: today };
  if (grade === 'hard') {
    const keep = Math.max(1, box);
    return { box: keep, due: addDays(today, 1), reviews, lastReviewed: today };
  }
  const up = Math.min(BOX_INTERVALS.length - 1, box + 1);
  return { box: up, due: addDays(today, BOX_INTERVALS[up]), reviews, lastReviewed: today };
}

export default function Flashcards() {
  useTitle('Fiszki');
  const [states, setStates] = useFlashcards();
  const [, setLog] = useFlashcardsLog();
  const today = dateKey();
  const [queue, setQueue] = useState<Flashcard[] | null>(null);
  const [revealed, setRevealed] = useState(false);
  const [reviewed, setReviewed] = useState(0);

  const stats = useMemo(() => {
    const due = FLASHCARDS.filter((c) => states[c.id] && states[c.id].due <= today);
    const fresh = FLASHCARDS.filter((c) => !states[c.id]);
    const newToday = FLASHCARDS.filter((c) => states[c.id]?.reviews === 1 && states[c.id]?.lastReviewed === today).length;
    const mastered = FLASHCARDS.filter((c) => (states[c.id]?.box ?? 0) >= MASTERED_BOX).length;
    return { due, fresh, newAllowed: Math.max(0, NEW_CARDS_PER_DAY - newToday), mastered };
  }, [states, today]);

  const start = () => {
    const due = [...stats.due].sort((a, b) => states[a.id].due.localeCompare(states[b.id].due));
    setQueue([...due, ...stats.fresh.slice(0, stats.newAllowed)]);
    setRevealed(false);
    setReviewed(0);
  };

  const grade = (card: Flashcard, g: Grade) => {
    setStates((prev) => ({ ...prev, [card.id]: nextState(prev[card.id], g, today) }));
    setLog((prev) => ({ ...prev, [today]: (prev[today] ?? 0) + 1 }));
    setReviewed((n) => n + 1);
    setRevealed(false);
    setQueue((q) => {
      if (!q) return q;
      const rest = q.slice(1);
      return g === 'again' ? [...rest, card] : rest;
    });
  };

  const current = queue?.[0];

  return (
    <div className="page narrow">
      <PageHeader
        icon="cards"
        title="Fiszki"
        lead="Pojęcia i zasady Transerfingu wracają w odstępach, które pomagają je zapamiętać: najpierw po dniu, potem po dwóch, czterech, ośmiu i szesnastu dniach. Codziennie dochodzi do 10 nowych kart."
      />

      <div className="stats-row">
        <Stat icon="calendar" value={stats.due.length} label="do powtórki dziś" />
        <Stat icon="sparkles" value={Math.min(stats.fresh.length, stats.newAllowed)} label="nowych na dziś" />
        <Stat icon="gem" value={`${stats.mastered}/${FLASHCARDS.length}`} label="opanowanych" />
      </div>
      <ProgressBar value={stats.mastered} max={FLASHCARDS.length} label="Opanowane fiszki" />

      {!queue && (
        <div className="form-actions">
          <button type="button" className="btn btn-primary btn-lg" onClick={start} disabled={stats.due.length + Math.min(stats.fresh.length, stats.newAllowed) === 0}>
            <Play size={18} aria-hidden /> Rozpocznij powtórkę
          </button>
          {stats.due.length + Math.min(stats.fresh.length, stats.newAllowed) === 0 && <span className="saved-note">Na dziś wszystko powtórzone. Wróć jutro.</span>}
        </div>
      )}

      {queue && current && (
        <section className={`card flashcard ${revealed ? 'is-revealed' : ''}`} aria-live="polite">
          <p className="eyebrow">
            {current.id.startsWith('g-') ? 'Co oznacza pojęcie' : 'Pytanie'} · zostało {queue.length}
          </p>
          <h2 className="flashcard-front">{current.front}</h2>
          {revealed ? (
            <>
              <p className="flashcard-back">{current.back}</p>
              {current.lesson && LESSON_BY_SLUG[current.lesson] && (
                <p className="small">
                  <Link to={`/wiedza/${current.lesson}/`}>Lekcja: {LESSON_BY_SLUG[current.lesson].title}</Link>
                </p>
              )}
              <div className="grade-buttons" role="group" aria-label="Jak poszło?">
                <button type="button" className="btn" onClick={() => grade(current, 'again')}>
                  Nie pamiętałem/pamiętałam
                </button>
                <button type="button" className="btn" onClick={() => grade(current, 'hard')}>
                  Z trudem
                </button>
                <button type="button" className="btn btn-primary" onClick={() => grade(current, 'good')}>
                  Pamiętałem/pamiętałam
                </button>
              </div>
            </>
          ) : (
            <button type="button" className="btn btn-primary" onClick={() => setRevealed(true)}>
              <Eye size={18} aria-hidden /> Pokaż odpowiedź
            </button>
          )}
        </section>
      )}

      {queue && !current && (
        <section className="card result-box center">
          <h2>Powtórka zakończona</h2>
          <p className="muted">Przejrzane karty: {reviewed}. Wróć jutro po kolejną porcję.</p>
          <div className="form-actions center">
            <button type="button" className="btn" onClick={() => setQueue(null)}>
              <RotateCcw size={18} aria-hidden /> Wróć do podsumowania
            </button>
            <Link to="/quiz/" className="btn btn-ghost">
              Sprawdź się w quizie <ArrowRight size={18} aria-hidden />
            </Link>
          </div>
        </section>
      )}

      <Callout tone="tip">
        Oceniaj szczerze. Karta, której nie pamiętasz, wraca jeszcze w tej samej sesji, a ta, którą znasz, pojawi się dopiero za kilka dni.
      </Callout>
    </div>
  );
}

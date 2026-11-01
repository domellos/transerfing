import { useState } from 'react';
import { Link } from 'react-router';
import { ArrowRight } from 'lucide-react';
import { Callout, PageHeader } from '../components/ui';
import { ICONS } from '../components/icons';
import { lessonsOfModule } from '../data/lessons';
import { MATRIX_TEST } from '../data/misc';
import { useLessonsRead, useMatrixTest } from '../state';
import { dateKey, formatShortKey } from '../lib/date';
import { useTitle } from '../lib/hooks';
import type { IconName } from '../types';

const PILLARS: { icon: IconName; title: string; text: string; links: { to: string; label: string }[] }[] = [
  {
    icon: 'eye',
    title: 'Uwaga',
    text: 'Budzisz się z „snu na jawie” i sam/sama decydujesz, na co patrzysz. Ekrany przestają prowadzić cię za rękę.',
    links: [
      { to: '/wiedza/wlasna-uwaga/', label: 'Odzyskaj swoją uwagę' },
      { to: '/praktyka/przebudzenie/', label: 'Narzędzie: Przebudzenie' },
    ],
  },
  {
    icon: 'leaf',
    title: 'Energia',
    text: 'Chronisz się przed informacyjnym śmietnikiem, dbasz o ciało, ruch i naturę. Więcej energii to silniejszy zamiar.',
    links: [
      { to: '/wiedza/zywa-energia/', label: 'Żywa energia' },
      { to: '/wiedza/higiena-informacyjna/', label: 'Higiena informacyjna' },
    ],
  },
  {
    icon: 'waves',
    title: 'Wolność od wahadeł',
    text: 'Widzisz haczyki systemu: lęk, oburzenie, przymus bycia na bieżąco. Uczestniczysz świadomie i na swoich warunkach.',
    links: [
      { to: '/wiedza/system-technogeniczny/', label: 'System technogeniczny' },
      { to: '/praktyka/wahadla/', label: 'Narzędzie: Detektor wahadeł' },
    ],
  },
  {
    icon: 'route',
    title: 'Własna droga',
    text: 'Zamiast stać w kolejce do cudzych marzeń, idziesz do swojego celu przez swoje drzwi.',
    links: [
      { to: '/wiedza/poza-kolejka/', label: 'Wolny gracz poza kolejką' },
      { to: '/praktyka/cele/', label: 'Narzędzie: Cele i drzwi' },
    ],
  },
];

function testResult(score: number) {
  if (score <= 2) return { title: 'Dużo wolności', text: 'Twoja uwaga w dużej mierze należy do ciebie. Pilnuj tego, co już działa, i dbaj o własne drzwi.' };
  if (score <= 5)
    return { title: 'Częściowo w matrixie', text: 'Niektóre odruchy prowadzą cię za rękę. Wybierz dwa nawyki z Detoksu i praktykuj je przez tydzień.' };
  return {
    title: 'Głęboko w matrixie',
    text: 'System ma sporo twojej uwagi i energii. Zacznij łagodnie: poranek bez telefonu, przebudzenia w ciągu dnia i jeden spacer dziennie.',
  };
}

export default function Matrix() {
  useTitle('Wyjście z matrixa');
  const [read] = useLessonsRead();
  const [lastTest, setLastTest] = useMatrixTest();
  const [answers, setAnswers] = useState<Record<number, boolean>>({});
  const lessons = lessonsOfModule('matrix');
  const answered = Object.keys(answers).length;
  const score = Object.values(answers).filter(Boolean).length;
  const complete = answered === MATRIX_TEST.length;
  const result = complete ? testResult(score) : null;

  return (
    <div className="page">
      <PageHeader
        icon="door"
        eyebrow="Specjalna sekcja"
        title="Wyjście z matrixa"
        lead="Zeland opisuje współczesną cywilizację jako system technogeniczny: wielkie wahadło, które żyje z ludzkiej uwagi i energii. Wyjście z niego nie oznacza ucieczki ani walki, tylko odzyskanie uwagi, energii i własnej drogi."
      />

      <section className="section">
        <h2 className="section-title">Cztery filary wolnego gracza</h2>
        <div className="grid grid-2">
          {PILLARS.map((p) => {
            const Icon = ICONS[p.icon];
            return (
              <div key={p.title} className="card pillar">
                <Icon size={24} aria-hidden className="pillar-icon" />
                <h3>{p.title}</h3>
                <p className="muted">{p.text}</p>
                <ul className="pillar-links">
                  {p.links.map((l) => (
                    <li key={l.to}>
                      <Link to={l.to}>
                        {l.label} <ArrowRight size={14} aria-hidden />
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            );
          })}
        </div>
      </section>

      <section className="section">
        <h2 className="section-title">Test: ile matrixa jest w twoim dniu?</h2>
        <p className="muted">Odpowiedz szczerze. Wynik nie jest oceną, tylko punktem wyjścia.</p>
        {lastTest && (
          <p className="muted small">
            Ostatni wynik ({formatShortKey(lastTest.date)}): {lastTest.score}/{MATRIX_TEST.length}
          </p>
        )}
        <div className="card">
          <ol className="test-list">
            {MATRIX_TEST.map((q, i) => (
              <li key={i} className="yesno">
                <span>{q}</span>
                <div className="segmented" role="group" aria-label={q}>
                  <button type="button" className={answers[i] === true ? 'is-active' : ''} aria-pressed={answers[i] === true} onClick={() => setAnswers((a) => ({ ...a, [i]: true }))}>
                    Tak
                  </button>
                  <button type="button" className={answers[i] === false ? 'is-active' : ''} aria-pressed={answers[i] === false} onClick={() => setAnswers((a) => ({ ...a, [i]: false }))}>
                    Nie
                  </button>
                </div>
              </li>
            ))}
          </ol>
          <p className="muted small">
            Odpowiedzi: {answered}/{MATRIX_TEST.length}
          </p>
          {result && (
            <div className="result-box">
              <p className="eyebrow">
                Wynik: {score}/{MATRIX_TEST.length}
              </p>
              <h3>{result.title}</h3>
              <p>{result.text}</p>
              <div className="form-actions">
                <button type="button" className="btn btn-primary" onClick={() => setLastTest({ date: dateKey(), score })}>
                  Zapisz wynik
                </button>
                <Link to="/praktyka/detoks/" className="btn">
                  Przejdź do Detoksu od matrixa
                </Link>
              </div>
            </div>
          )}
        </div>
      </section>

      <section className="section">
        <h2 className="section-title">Lekcje modułu</h2>
        <ol className="lesson-list">
          {lessons.map((l) => (
            <li key={l.slug}>
              <Link to={`/wiedza/${l.slug}/`} className="lesson-row">
                <span className={`lesson-check ${read[l.slug] ? 'is-read' : ''}`} aria-hidden>
                  {read[l.slug] ? '✓' : '•'}
                </span>
                <span className="lesson-row-body">
                  <span className="lesson-row-title">{l.title}</span>
                  <span className="lesson-row-sub">{l.subtitle}</span>
                </span>
                <ArrowRight size={16} aria-hidden />
              </Link>
            </li>
          ))}
        </ol>
      </section>

      <Callout tone="warn" title="Zdrowy rozsądek">
        Wskazówki dotyczące jedzenia i stylu życia to propozycje Zelanda, a nie porady medyczne. Przy istotnych zmianach diety, chorobach
        lub przyjmowaniu leków skonsultuj się z lekarzem. Jeśli zmagasz się z trudnymi emocjami, poproś o wsparcie bliskich lub specjalisty.
      </Callout>
    </div>
  );
}

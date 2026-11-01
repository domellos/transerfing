import { useMemo, useState } from 'react';
import { CircleCheck, Play, Trash2, Undo2 } from 'lucide-react';
import GuidedSequence, { type SequenceStep } from '../../components/GuidedSequence';
import { Callout, EmptyState, Stat } from '../../components/ui';
import { useFrames } from '../../state';
import { newId } from '../../lib/storage';
import { formatDateTime, plural } from '../../lib/date';
import type { Frame } from '../../types';

function buildSteps(text: string, quick: boolean): SequenceStep[] {
  const t = quick ? [5, 10, 20, 8, 5] : [10, 20, 40, 15, 8];
  return [
    {
      title: 'Obudź się',
      seconds: t[0],
      text: (
        <>
          <p className="session-quote">Widzę siebie i widzę rzeczywistość.</p>
          <p>Zauważ swoje ciało i otoczenie. Uwaga wychodzi z ekranów do centrum.</p>
        </>
      ),
    },
    {
      title: 'Poczuj warkocz',
      seconds: t[1],
      text: 'Przenieś uwagę na plecy, mniej więcej między łopatki, trochę od kręgosłupa. Poczuj warkocz, który odstaje od pleców pod kątem. Bez napinania: wystarczy uwaga.',
    },
    {
      title: 'Ustaw kadr',
      seconds: t[2],
      text: (
        <>
          <p>Nie tracąc uczucia warkocza, zobacz swój kadr tak, jakby działo się teraz:</p>
          <p className="session-quote">{text}</p>
          <p>Dodaj przyjemne odczucie: spokojną radość i oczywistość.</p>
        </>
      ),
    },
    {
      title: 'Powiedz to słowami',
      seconds: t[3],
      text: (
        <>
          <p>Wciąż z uwagą na końcu warkocza, powiedz w myślach:</p>
          <p className="session-quote">{text}</p>
        </>
      ),
    },
    {
      title: 'Puść',
      seconds: t[4],
      text: 'Puść. Uwaga wraca do centrum, a ty do swoich spraw. Kadr jest ustawiony, więc nie musisz czekać na wynik.',
    },
  ];
}

export default function BraidFrame() {
  const [frames, setFrames] = useFrames();
  const [text, setText] = useState('');
  const [quick, setQuick] = useState(false);
  const [session, setSession] = useState<{ frameId: string; text: string } | null>(null);
  const [realizing, setRealizing] = useState<{ id: string; note: string } | null>(null);

  const active = frames.filter((f) => f.status === 'aktywny');
  const realized = frames.filter((f) => f.status === 'zrealizowany');
  const totalSets = frames.reduce((s, f) => s + f.sets.length, 0);

  const steps = useMemo(() => (session ? buildSteps(session.text, quick) : []), [session, quick]);

  const startNew = () => {
    const value = text.trim();
    if (!value) return;
    const frame: Frame = { id: newId(), text: value, createdAt: new Date().toISOString(), sets: [], status: 'aktywny' };
    setFrames((prev) => [frame, ...prev]);
    setText('');
    setSession({ frameId: frame.id, text: frame.text });
  };

  const recordSet = (id: string) =>
    setFrames((prev) => prev.map((f) => (f.id === id ? { ...f, sets: [...f.sets, new Date().toISOString()] } : f)));

  const markRealized = () => {
    if (!realizing) return;
    setFrames((prev) =>
      prev.map((f) =>
        f.id === realizing.id ? { ...f, status: 'zrealizowany', realizedAt: new Date().toISOString(), note: realizing.note.trim() || undefined } : f,
      ),
    );
    setRealizing(null);
  };

  const undoRealized = (id: string) =>
    setFrames((prev) => prev.map((f) => (f.id === id ? { ...f, status: 'aktywny', realizedAt: undefined, note: undefined } : f)));

  const remove = (id: string) => {
    if (window.confirm('Usunąć ten kadr?')) setFrames((prev) => prev.filter((f) => f.id !== id));
  };

  return (
    <div className="tool">
      <Callout tone="tip" title="Technika Tafti w czterech krokach">
        Obudź się, poczuj warkocz, zobacz kadr tak, jakby działo się teraz, i puść. Ustawiaj kadr krótko, ale kilka razy dziennie, aż się
        zrealizuje. Formułuj go w czasie teraźniejszym i opisuj to, co ma być, a nie to, czego nie chcesz.
      </Callout>

      <form
        className="card form"
        onSubmit={(e) => {
          e.preventDefault();
          startNew();
        }}
      >
        <div className="field">
          <label className="field-label" htmlFor="frame-text">
            Mój kadr docelowy
          </label>
          <textarea
            id="frame-text"
            rows={3}
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="np. Odbieram telefon z wiadomością, że dostałem/dostałam tę pracę, i czuję spokojną radość."
          />
        </div>
        <div className="form-actions">
          <button type="submit" className="btn btn-primary" disabled={!text.trim()}>
            <Play size={18} aria-hidden /> Ustaw kadr
          </button>
          <label className="check">
            <input type="checkbox" checked={quick} onChange={(e) => setQuick(e.target.checked)} />
            <span>Tryb szybki (ok. 50 s zamiast 1,5 min)</span>
          </label>
        </div>
      </form>

      <div className="stats-row">
        <Stat icon="wand" value={totalSets} label="ustawień kadrów" />
        <Stat icon="sparkles" value={realized.length} label="zrealizowanych kadrów" />
      </div>

      <section className="section">
        <h2 className="section-title">Aktywne kadry ({active.length})</h2>
        {active.length === 0 ? (
          <EmptyState icon="wand" title="Brak aktywnych kadrów">
            Zapisz pierwszy kadr powyżej. Może być mały, np. udana rozmowa albo spokojny dzień.
          </EmptyState>
        ) : (
          <ul className="entries">
            {active.map((f) => (
              <li key={f.id} className="card entry">
                <p className="frame-text">{f.text}</p>
                <p className="muted small">
                  Ustawiony {f.sets.length} {plural(f.sets.length, ['raz', 'razy', 'razy'])}
                  {f.sets.length > 0 ? ` · ostatnio ${formatDateTime(f.sets[f.sets.length - 1])}` : ''}
                </p>
                {realizing?.id === f.id ? (
                  <div className="field">
                    <label className="field-label" htmlFor={`note-${f.id}`}>
                      Jak się zrealizował?
                    </label>
                    <textarea id={`note-${f.id}`} rows={2} value={realizing.note} onChange={(e) => setRealizing({ ...realizing, note: e.target.value })} />
                    <div className="row-actions">
                      <button type="button" className="btn btn-primary btn-sm" onClick={markRealized}>
                        Zapisz w galerii
                      </button>
                      <button type="button" className="btn btn-ghost btn-sm" onClick={() => setRealizing(null)}>
                        Anuluj
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="row-actions">
                    <button type="button" className="btn btn-primary btn-sm" onClick={() => setSession({ frameId: f.id, text: f.text })}>
                      <Play size={16} aria-hidden /> Ustaw ponownie
                    </button>
                    <button type="button" className="btn btn-sm" onClick={() => setRealizing({ id: f.id, note: '' })}>
                      <CircleCheck size={16} aria-hidden /> Zrealizował się
                    </button>
                    <button type="button" className="icon-btn" aria-label="Usuń kadr" onClick={() => remove(f.id)}>
                      <Trash2 size={16} />
                    </button>
                  </div>
                )}
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="section">
        <h2 className="section-title">Galeria zrealizowanych kadrów ({realized.length})</h2>
        {realized.length === 0 ? (
          <p className="muted">Tu pojawią się kadry, które się zrealizowały. To najlepsze przypomnienie, że masz wpływ.</p>
        ) : (
          <ul className="gallery">
            {realized.map((f) => (
              <li key={f.id} className="card gallery-item">
                <CircleCheck size={20} aria-hidden className="gallery-icon" />
                <p className="frame-text">{f.text}</p>
                {f.note && <p className="muted small">{f.note}</p>}
                <p className="muted small">
                  {f.realizedAt ? formatDateTime(f.realizedAt) : ''} · {f.sets.length} {plural(f.sets.length, ['ustawienie', 'ustawienia', 'ustawień'])}
                </p>
                <button type="button" className="link-btn" onClick={() => undoRealized(f.id)}>
                  <Undo2 size={14} aria-hidden /> Przywróć do aktywnych
                </button>
              </li>
            ))}
          </ul>
        )}
      </section>

      {session && (
        <GuidedSequence
          title="Warkocz i kadr"
          steps={steps}
          onClose={() => setSession(null)}
          onFinish={() => recordSet(session.frameId)}
          finishText="Kadr ustawiony. Wróć do niego jeszcze kilka razy dziś, krótko i z lekkością."
        />
      )}
    </div>
  );
}

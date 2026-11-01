import { useState } from 'react';
import { ArrowLeft, ArrowRight, Save } from 'lucide-react';
import { Callout, EmptyState, Stat } from '../../components/ui';
import { useJournal } from '../../state';
import EntryList from './EntryList';

const EMOTIONS: { id: string; label: string; advice: string }[] = [
  { id: 'pragnienie', label: 'silne pragnienie', advice: 'Zamień pragnienie na zamiar: zdecyduj i działaj, bez kurczowego trzymania się wyniku.' },
  { id: 'strach', label: 'strach, niepokój', advice: 'Zaakceptuj najgorszy scenariusz i przygotuj plan B. Strach słabnie, gdy przestajesz uciekać.' },
  { id: 'wina', label: 'poczucie winy', advice: 'Nie usprawiedliwiaj się. Masz prawo być sobą i popełniać błędy.' },
  { id: 'idealizacja', label: 'idealizacja, zachwyt', advice: 'Zobacz osobę lub rzecz taką, jaka jest, bez piedestału. Idealizacja tworzy potencjał, który siły równoważące rozładowują.' },
  { id: 'pogarda', label: 'pogarda, potępienie', advice: 'Pozwól innym być innymi. Potępienie wiąże cię z tym, co potępiasz.' },
  { id: 'porownywanie', label: 'porównywanie się', advice: 'Porzuć porównania. Twój frajl duszy jest niepowtarzalny i nie musi dorównywać standardom.' },
  { id: 'niezadowolenie', label: 'niezadowolenie', advice: 'Doceń to, co już masz. Niezadowolenie z siebie lub świata podnosi ważność.' },
  { id: 'udowadnianie', label: 'potrzeba udowodnienia', advice: 'Nie musisz niczego udowadniać. Ważność wewnętrzna maleje, gdy przestajesz grać przed publicznością.' },
];

interface Draft {
  sprawa: string;
  rodzaj: 'wewnętrzna' | 'zewnętrzna' | '';
  emocje: string[];
  przed: number;
  najgorsze: string;
  planB: string;
  zamiar: string;
  krok: string;
  po: number;
}

const EMPTY: Draft = { sprawa: '', rodzaj: '', emocje: [], przed: 7, najgorsze: '', planB: '', zamiar: '', krok: '', po: 5 };

function Slider({ id, value, onChange, label }: { id: string; value: number; onChange: (v: number) => void; label: string }) {
  return (
    <div className="slider">
      <label className="field-label" htmlFor={id}>
        {label}: <strong>{value}/10</strong>
      </label>
      <input id={id} type="range" min={0} max={10} step={1} value={value} onChange={(e) => onChange(Number(e.target.value))} />
      <div className="slider-ends">
        <span>spokój</span>
        <span>życie albo śmierć</span>
      </div>
    </div>
  );
}

export default function ImportanceMeter() {
  const { entries, addEntry, removeEntry } = useJournal();
  const [step, setStep] = useState(1);
  const [draft, setDraft] = useState<Draft>(EMPTY);
  const [saved, setSaved] = useState(false);
  const history = entries.filter((e) => e.type === 'waznosc');

  const set = <K extends keyof Draft>(key: K, value: Draft[K]) => {
    setSaved(false);
    setDraft((d) => ({ ...d, [key]: value }));
  };

  const withScores = history.filter((e) => typeof e.meta?.przed === 'number' && typeof e.meta?.po === 'number');
  const avgDrop = withScores.length
    ? (withScores.reduce((s, e) => s + ((e.meta!.przed ?? 0) - (e.meta!.po ?? 0)), 0) / withScores.length).toFixed(1)
    : '–';

  const save = () => {
    addEntry({
      type: 'waznosc',
      fields: {
        sprawa: draft.sprawa.trim(),
        rodzaj: draft.rodzaj,
        emocje: EMOTIONS.filter((e) => draft.emocje.includes(e.id)).map((e) => e.label).join(', '),
        najgorsze: draft.najgorsze.trim(),
        planB: draft.planB.trim(),
        zamiar: draft.zamiar.trim(),
        krok: draft.krok.trim(),
      },
      meta: { przed: draft.przed, po: draft.po },
    });
    setDraft(EMPTY);
    setStep(1);
    setSaved(true);
  };

  const advice = EMOTIONS.filter((e) => draft.emocje.includes(e.id));

  return (
    <div className="tool">
      <div className="stats-row">
        <Stat icon="scale" value={history.length} label="przepracowanych spraw" />
        <Stat icon="sparkles" value={avgDrop} label="średni spadek ważności (pkt)" />
      </div>

      <ol className="wizard-steps" aria-label="Kroki">
        {['Nazwij i oceń', 'Obniżaj ważność', 'Oceń ponownie'].map((label, i) => (
          <li key={label} className={step === i + 1 ? 'is-active' : step > i + 1 ? 'is-done' : ''}>
            <span>{i + 1}</span> {label}
          </li>
        ))}
      </ol>

      {saved && <Callout tone="tip">Zapisano. Obniżanie ważności to nawyk, więc wracaj tu, gdy coś znowu cię spina.</Callout>}

      <div className="card form">
        {step === 1 && (
          <>
            <div className="field">
              <label className="field-label" htmlFor="w-sprawa">
                Co jest teraz dla mnie zbyt ważne?
              </label>
              <textarea id="w-sprawa" rows={2} value={draft.sprawa} onChange={(e) => set('sprawa', e.target.value)} placeholder="np. Jutrzejsza prezentacja przed zarządem" />
            </div>
            <fieldset className="field">
              <legend className="field-label">Rodzaj ważności</legend>
              <div className="options options-2">
                {(
                  [
                    ['wewnętrzna', 'Wewnętrzna: chodzi o mnie, moją ocenę, udowadnianie'],
                    ['zewnętrzna', 'Zewnętrzna: chodzi o coś lub kogoś na zewnątrz'],
                  ] as const
                ).map(([value, label]) => (
                  <label key={value} className={`option ${draft.rodzaj === value ? 'is-active' : ''}`}>
                    <input type="radio" name="rodzaj" checked={draft.rodzaj === value} onChange={() => set('rodzaj', value)} />
                    <span>{label}</span>
                  </label>
                ))}
              </div>
            </fieldset>
            <fieldset className="field">
              <legend className="field-label">Jakie emocje się pojawiają?</legend>
              <div className="chips">
                {EMOTIONS.map((e) => (
                  <button
                    key={e.id}
                    type="button"
                    className={`chip ${draft.emocje.includes(e.id) ? 'is-active' : ''}`}
                    aria-pressed={draft.emocje.includes(e.id)}
                    onClick={() =>
                      set('emocje', draft.emocje.includes(e.id) ? draft.emocje.filter((x) => x !== e.id) : [...draft.emocje, e.id])
                    }
                  >
                    {e.label}
                  </button>
                ))}
              </div>
            </fieldset>
            <Slider id="w-przed" label="Ważność teraz" value={draft.przed} onChange={(v) => set('przed', v)} />
            <div className="form-actions">
              <button type="button" className="btn btn-primary" disabled={!draft.sprawa.trim()} onClick={() => setStep(2)}>
                Dalej <ArrowRight size={18} aria-hidden />
              </button>
            </div>
          </>
        )}

        {step === 2 && (
          <>
            <p className="muted">
              Sprawa: <strong>{draft.sprawa}</strong>
            </p>
            {advice.length > 0 && (
              <ul className="bullets">
                {advice.map((a) => (
                  <li key={a.id}>{a.advice}</li>
                ))}
              </ul>
            )}
            <p className="field-label">1. Zauważ: „Nadaję temu zbyt dużą ważność”. Weź oddech i rozluźnij barki.</p>
            <div className="field">
              <label className="field-label" htmlFor="w-naj">
                2. Najgorszy scenariusz: co najgorszego może się stać i jak bym sobie z tym poradził/poradziła?
              </label>
              <textarea id="w-naj" rows={3} value={draft.najgorsze} onChange={(e) => set('najgorsze', e.target.value)} placeholder="np. Prezentacja pójdzie słabo. Wtedy poproszę o drugą szansę, a świat się nie zawali." />
            </div>
            <div className="field">
              <label className="field-label" htmlFor="w-b">
                3. Zabezpiecz się: mój plan B
              </label>
              <textarea id="w-b" rows={2} value={draft.planB} onChange={(e) => set('planB', e.target.value)} />
            </div>
            <div className="field">
              <label className="field-label" htmlFor="w-zam">
                4. Zamień pragnienie na zamiar: „Nie muszę… Zamierzam… i robię…”
              </label>
              <textarea id="w-zam" rows={2} value={draft.zamiar} onChange={(e) => set('zamiar', e.target.value)} placeholder="np. Nie muszę zachwycić zarządu. Zamierzam spokojnie przedstawić projekt i robię dziś jedną próbę na głos." />
            </div>
            <div className="field">
              <label className="field-label" htmlFor="w-krok">
                5. Działaj lekko: mój jeden lekki krok
              </label>
              <input id="w-krok" type="text" value={draft.krok} onChange={(e) => set('krok', e.target.value)} />
            </div>
            <div className="form-actions">
              <button type="button" className="btn btn-ghost" onClick={() => setStep(1)}>
                <ArrowLeft size={18} aria-hidden /> Wstecz
              </button>
              <button type="button" className="btn btn-primary" onClick={() => setStep(3)}>
                Dalej <ArrowRight size={18} aria-hidden />
              </button>
            </div>
          </>
        )}

        {step === 3 && (
          <>
            <p className="muted">
              Przed procedurą: <strong>{draft.przed}/10</strong>. Jak ważna jest ta sprawa teraz?
            </p>
            <Slider id="w-po" label="Ważność po procedurze" value={draft.po} onChange={(v) => set('po', v)} />
            {draft.po < draft.przed && (
              <p className="saved-note">
                Spadek o {draft.przed - draft.po} pkt. Napięcie, które puściłeś/puściłaś, to energia wolna dla działania.
              </p>
            )}
            {draft.po >= draft.przed && (
              <p className="muted small">
                Bez zmiany? To normalne przy dużych sprawach. Wróć do procedury jutro albo spróbuj humoru: wyobraź sobie tę sytuację
                jako scenę z komedii.
              </p>
            )}
            <div className="form-actions">
              <button type="button" className="btn btn-ghost" onClick={() => setStep(2)}>
                <ArrowLeft size={18} aria-hidden /> Wstecz
              </button>
              <button type="button" className="btn btn-primary" onClick={save}>
                <Save size={18} aria-hidden /> Zapisz w dzienniku
              </button>
            </div>
          </>
        )}
      </div>

      <section className="section">
        <h2 className="section-title">Historia ({history.length})</h2>
        {history.length === 0 ? (
          <EmptyState icon="scale" title="Brak wpisów">
            Zacznij od sprawy, która spina cię dziś najbardziej.
          </EmptyState>
        ) : (
          <EntryList entries={history.slice(0, 30)} onRemove={removeEntry} />
        )}
      </section>
    </div>
  );
}

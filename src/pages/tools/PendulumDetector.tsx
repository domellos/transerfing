import { useState } from 'react';
import { Link } from 'react-router';
import { Save } from 'lucide-react';
import { Callout, EmptyState } from '../../components/ui';
import { useJournal } from '../../state';
import EntryList from './EntryList';

interface Sign {
  id: string;
  label: string;
  weight: number;
  advice: string;
}

const SIGNS: Sign[] = [
  { id: 'emocje', label: 'Wywołuje we mnie silne emocje (złość, strach, oburzenie, ekscytację)', weight: 3, advice: 'Silne emocje to główny haczyk. Zanim zareagujesz, zrób trzy oddechy i obudź się: widzę siebie i widzę rzeczywistość.' },
  { id: 'strona', label: 'Wymaga, żebym stanął/stanęła po którejś stronie', weight: 2, advice: 'To walka wahadeł. Nie musisz być ani „za”, ani „przeciw”. Możesz po prostu nie brać udziału.' },
  { id: 'wina', label: 'Budzi poczucie winy lub obowiązku', weight: 3, advice: 'Wina to zaproszenie do manipulacji. Nie usprawiedliwiaj się. Odpowiadaj krótko i spokojnie.' },
  { id: 'obsesja', label: 'Wracam do tego myślami, nie mogę przestać', weight: 2, advice: 'Uwaga uwięziona w ekranie wewnętrznym. Przenieś ją do centrum i na coś, co jest twoje.' },
  { id: 'wszyscy', label: '„Wszyscy” o tym mówią i reagują tak samo', weight: 1, advice: 'Masowa reakcja to typowy znak wahadła. Twoja warstwa świata nie musi tego wpuszczać.' },
  { id: 'energia', label: 'Po kontakcie z tym czuję się wyczerpany/wyczerpana', weight: 3, advice: 'Wahadło pobiera energię. Ogranicz kontakt i odzyskaj siły w naturze, w ruchu, w ciszy.' },
  { id: 'standardy', label: 'Narzuca mi cele lub standardy, które nie są moje', weight: 2, advice: 'Sprawdź w narzędziu Cele i drzwi, czy to twój cel, czy cudzy.' },
  { id: 'strach', label: 'Straszy konsekwencjami, jeśli się nie podporządkuję', weight: 2, advice: 'Zaakceptuj najgorszy scenariusz i przygotuj plan B. Strach słabnie, gdy przestajesz uciekać.' },
  { id: 'pustka', label: 'Daje chwilową przyjemność, ale zostawia pustkę (scroll, plotki)', weight: 1, advice: 'To wahadło-odruch. Zamień odruch na świadomy wybór: po co to robię?' },
];

const STRATEGIES = [
  { id: 'ignoruje', label: 'Ignoruję: niech huśta się w pustce', description: 'Nie reaguję, nie komentuję, nie podsycam.' },
  { id: 'nieoczekiwanie', label: 'Reaguję nieoczekiwanie', description: 'Humor, życzliwość albo spokój zamiast oczekiwanej reakcji.' },
  { id: 'uwaga', label: 'Przenoszę uwagę na swoje', description: 'Na swój cel, zadanie, oddech albo do centrum świadomości.' },
  { id: 'udzial', label: 'Uczestniczę świadomie, na swoich warunkach', description: 'Wykonuję swoją rolę bez fanatyzmu, lęku i walki.' },
];

const MAX = SIGNS.reduce((s, x) => s + x.weight, 0);

export default function PendulumDetector() {
  const { entries, addEntry, removeEntry, updateEntry } = useJournal();
  const [situation, setSituation] = useState('');
  const [checked, setChecked] = useState<string[]>([]);
  const [strategy, setStrategy] = useState<string | null>(null);
  const [plan, setPlan] = useState('');
  const [saved, setSaved] = useState(false);

  const score = Math.round((SIGNS.filter((s) => checked.includes(s.id)).reduce((sum, s) => sum + s.weight, 0) / MAX) * 100);
  const level = score >= 50 ? 'silny' : score >= 25 ? 'średni' : score > 0 ? 'słaby' : null;
  const advice = SIGNS.filter((s) => checked.includes(s.id)).map((s) => s.advice);
  const history = entries.filter((e) => e.type === 'wahadlo');

  const toggle = (id: string) => {
    setSaved(false);
    setChecked((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
  };

  const save = () => {
    const strategyLabel = STRATEGIES.find((s) => s.id === strategy)?.label ?? '';
    addEntry({
      type: 'wahadlo',
      fields: {
        sytuacja: situation.trim(),
        haczyki: SIGNS.filter((s) => checked.includes(s.id)).map((s) => s.label).join('\n'),
        strategia: strategyLabel,
        plan: plan.trim(),
      },
      meta: { sila: score },
    });
    setSituation('');
    setChecked([]);
    setStrategy(null);
    setPlan('');
    setSaved(true);
  };

  return (
    <div className="tool">
      <Callout tone="tip">
        Opisz sytuację, osobę, temat albo strukturę, która cię wciąga. Zaznacz pasujące sygnały, a detektor oceni siłę haczyka
        i podpowie, jak wyjść z rytmu wahadła bez walki.
      </Callout>

      <div className="card form">
        <div className="field">
          <label className="field-label" htmlFor="p-sit">
            Co mnie wciąga?
          </label>
          <textarea
            id="p-sit"
            rows={3}
            value={situation}
            onChange={(e) => {
              setSaved(false);
              setSituation(e.target.value);
            }}
            placeholder="np. Kłótnia o politykę na grupie rodzinnej, która wraca do mnie przez cały dzień."
          />
        </div>

        <fieldset className="field">
          <legend className="field-label">Sygnały wahadła</legend>
          <ul className="checks">
            {SIGNS.map((sign) => (
              <li key={sign.id}>
                <label className="check">
                  <input type="checkbox" checked={checked.includes(sign.id)} onChange={() => toggle(sign.id)} />
                  <span>{sign.label}</span>
                </label>
              </li>
            ))}
          </ul>
        </fieldset>

        {level && (
          <div className={`meter meter-${level === 'silny' ? 'high' : level === 'średni' ? 'mid' : 'low'}`}>
            <div className="meter-head">
              <span>Siła haczyka</span>
              <strong>
                {score}% · {level}
              </strong>
            </div>
            <div className="progress">
              <div className="progress-fill" style={{ width: `${score}%` }} />
            </div>
            <ul className="bullets">
              {advice.map((a) => (
                <li key={a}>{a}</li>
              ))}
            </ul>
          </div>
        )}

        <fieldset className="field">
          <legend className="field-label">Moja strategia uwolnienia</legend>
          <div className="options">
            {STRATEGIES.map((s) => (
              <label key={s.id} className={`option ${strategy === s.id ? 'is-active' : ''}`}>
                <input type="radio" name="strategy" checked={strategy === s.id} onChange={() => setStrategy(s.id)} />
                <span>
                  <strong>{s.label}</strong>
                  <span className="muted small">{s.description}</span>
                </span>
              </label>
            ))}
          </div>
        </fieldset>

        <div className="field">
          <label className="field-label" htmlFor="p-plan">
            Co konkretnie zrobię?
          </label>
          <input id="p-plan" type="text" value={plan} onChange={(e) => setPlan(e.target.value)} placeholder="np. Wyciszam grupę na tydzień i nie komentuję." />
        </div>

        <div className="form-actions">
          <button type="button" className="btn btn-primary" onClick={save} disabled={!situation.trim()}>
            <Save size={18} aria-hidden /> Zapisz w dzienniku
          </button>
          {saved && (
            <span className="saved-note" role="status">
              Zapisano. Wróć później i uzupełnij wynik.
            </span>
          )}
        </div>
      </div>

      <section className="section">
        <h2 className="section-title">Rozpoznane wahadła ({history.length})</h2>
        {history.length === 0 ? (
          <EmptyState icon="waves" title="Brak zapisanych wahadeł">
            Przeczytaj lekcję <Link to="/wiedza/uwalnianie-od-wahadel/">Jak uwolnić się od wahadła</Link>.
          </EmptyState>
        ) : (
          <EntryList entries={history.slice(0, 30)} onRemove={removeEntry} onUpdate={updateEntry} editableKeys={['wynik']} />
        )}
      </section>
    </div>
  );
}

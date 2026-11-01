import { useState } from 'react';
import { Link } from 'react-router';
import { Play } from 'lucide-react';
import GuidedSequence, { type SequenceStep } from '../../components/GuidedSequence';
import { Callout, MiniBars, Stat } from '../../components/ui';
import { useEnergySessions } from '../../state';
import { formatWeekdayKey, lastNDays } from '../../lib/date';
import { isoToKey } from '../../lib/activity';

const STEPS: SequenceStep[] = [
  { title: 'Rozluźnienie', seconds: 30, text: 'Stań lub usiądź prosto. Rozluźnij twarz, barki i brzuch. Oddychaj spokojnie, bez wysiłku.' },
  {
    title: 'Strumień wstępujący',
    seconds: 50,
    text: 'Wyobraź sobie, że od ziemi, przez stopy, w górę ciała płynie strumień energii, nieco przed kręgosłupem. Wychodzi przez czubek głowy i płynie dalej w górę.',
  },
  {
    title: 'Strumień zstępujący',
    seconds: 50,
    text: 'Teraz poczuj strumień, który płynie z góry, przez czubek głowy, w dół ciała, blisko kręgosłupa, i wychodzi przez stopy w ziemię.',
  },
  {
    title: 'Oba strumienie',
    seconds: 60,
    text: 'Poczuj oba strumienie naraz: jeden płynie w górę, drugi w dół. Niech będą swobodne i szerokie. Nie musisz niczego wymuszać.',
  },
  {
    title: 'Fontanny',
    seconds: 40,
    text: 'Wyobraź sobie, że strumienie wybijają ponad głowę i pod stopy jak fontanny, a energia wypełnia całe ciało i przestrzeń wokół.',
  },
  { title: 'Deklaracja', seconds: 20, text: <p className="session-quote">Energia mojego zamiaru rośnie z każdym dniem.</p> },
];

export default function EnergyFlows() {
  const [sessions, setSessions] = useEnergySessions();
  const [running, setRunning] = useState(false);
  const week = lastNDays(7).map((k) => ({ label: formatWeekdayKey(k), value: sessions.filter((s) => isoToKey(s) === k).length }));

  return (
    <div className="tool">
      <Callout tone="info" title="O ćwiczeniu">
        W Transerfingu opisano ćwiczenie z dwoma centralnymi strumieniami energii: wstępującym i zstępującym. Pracujesz wyłącznie
        wyobraźnią i uwagą, z rozluźnionym ciałem. Ćwiczenie trwa około 4 minut. Nie zastępuje snu, ruchu ani odpoczynku.
      </Callout>

      <section className="card awaken-card">
        <p className="eyebrow">Prowadzona sesja</p>
        <p className="awaken-formula">Centralne strumienie energii</p>
        <button type="button" className="btn btn-primary btn-lg" onClick={() => setRunning(true)}>
          <Play size={20} aria-hidden /> Rozpocznij (4 min)
        </button>
        <div className="stats-row">
          <Stat value={sessions.length} label="sesji łącznie" />
        </div>
      </section>

      <section className="card">
        <h2 className="card-title">Ostatnie 7 dni</h2>
        <MiniBars data={week} max={Math.max(2, ...week.map((w) => w.value))} />
      </section>

      <p className="muted">
        Energię odzyskujesz też, gdy przestajesz ją tracić: na wahadła, ważność i informacyjny szum. Zobacz{' '}
        <Link to="/praktyka/detoks/">Detoks od matrixa</Link> i lekcję <Link to="/wiedza/zywa-energia/">Żywa energia</Link>.
      </p>

      {running && (
        <GuidedSequence
          title="Centralne strumienie"
          steps={STEPS}
          onClose={() => setRunning(false)}
          onFinish={() => setSessions((prev) => [...prev, new Date().toISOString()])}
          finishText="Zauważ, jak się teraz czujesz. To dobry moment, żeby ustawić kadr."
        />
      )}
    </div>
  );
}

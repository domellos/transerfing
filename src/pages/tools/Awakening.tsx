import { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router';
import { Bell, BellOff, BellRing, Eye, Plus, Send, X } from 'lucide-react';
import { Callout, MiniBars, Stat } from '../../components/ui';
import { useAccount, useAnchors, useAwakeningCounter, usePushSettings, useSettings } from '../../state';
import { PRIVATE, STATIC } from '../../site';
import { formatWeekdayKey, lastNDays } from '../../lib/date';
import { playBell } from '../../lib/sound';
import { useApiStatus } from '../../lib/api';
import { currentSubscription, disablePush, enablePush, isIos, isStandalone, pushSupported, testPush, updatePush } from '../../lib/push';

const INTERVALS = [15, 30, 45, 60, 90];
const PUSH_INTERVALS = [30, 45, 60, 90, 120];
const DAYS = [
  [1, 'pn'],
  [2, 'wt'],
  [3, 'śr'],
  [4, 'czw'],
  [5, 'pt'],
  [6, 'sob'],
  [7, 'nd'],
] as const;

function PushSection() {
  const { status, loading } = useApiStatus();
  const [account] = useAccount();
  const [settings, setSettings] = usePushSettings();
  const [enabled, setEnabled] = useState<boolean | null>(null);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    void currentSubscription()
      .then((s) => setEnabled(Boolean(s)))
      .catch(() => setEnabled(false));
  }, []);

  const run = async (action: () => Promise<string | void>) => {
    setBusy(true);
    setError(null);
    setMessage(null);
    try {
      const result = await action();
      if (result) setMessage(result);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Coś poszło nie tak.');
    } finally {
      setBusy(false);
    }
  };

  const validWindow = settings.from < settings.to && settings.days.length > 0;

  let body;
  if (loading) body = <p className="muted small">Sprawdzam dostępność powiadomień…</p>;
  else if (!status) body = <p className="muted small">Powiadomienia push działają, gdy serwis jest opublikowany na serwerze z PHP (np. MyDevil) pod adresem https.</p>;
  else if (!status.push || !status.vapidPublicKey)
    body = (
      <p className="muted small">
        {PRIVATE
          ? 'Powiadomienia push nie są jeszcze gotowe: dodaj na serwerze zadanie cron uruchamiane co 5 minut (instrukcja w README).'
          : 'Administrator nie włączył jeszcze powiadomień push na tym serwerze.'}
      </p>
    );
  else if (status.pushRequiresAccount && !account && !enabled)
    body = (
      <p className="muted small">
        Powiadomienia włączysz po zalogowaniu. <Link to="/konto/">Zaloguj się na swoje konto</Link> i wróć tutaj.
      </p>
    );
  else if (!pushSupported())
    body =
      isIos() && !isStandalone() ? (
        <Callout tone="tip">
          Na iPhonie i iPadzie powiadomienia działają po dodaniu strony do ekranu początkowego: w Safari stuknij „Udostępnij” → „Do ekranu początkowego”, otwórz
          serwis z nowej ikony i wróć tutaj.
        </Callout>
      ) : (
        <p className="muted small">Ta przeglądarka nie obsługuje powiadomień push.</p>
      );
  else
    body = (
      <>
        <div className="push-grid">
          <div className="field">
            <label className="field-label" htmlFor="push-interval">
              Co ile minut
            </label>
            <select id="push-interval" value={settings.interval} onChange={(e) => setSettings({ ...settings, interval: Number(e.target.value) })}>
              {PUSH_INTERVALS.map((m) => (
                <option key={m} value={m}>
                  {m} min
                </option>
              ))}
            </select>
          </div>
          <div className="field">
            <label className="field-label" htmlFor="push-from">
              Od
            </label>
            <input id="push-from" type="time" value={settings.from} onChange={(e) => setSettings({ ...settings, from: e.target.value })} />
          </div>
          <div className="field">
            <label className="field-label" htmlFor="push-to">
              Do
            </label>
            <input id="push-to" type="time" value={settings.to} onChange={(e) => setSettings({ ...settings, to: e.target.value })} />
          </div>
        </div>
        <div className="chips" role="group" aria-label="Dni tygodnia">
          {DAYS.map(([n, label]) => {
            const on = settings.days.includes(n);
            return (
              <button
                key={n}
                type="button"
                className={`chip ${on ? 'is-active' : ''}`}
                aria-pressed={on}
                onClick={() => setSettings({ ...settings, days: on ? settings.days.filter((d) => d !== n) : [...settings.days, n].sort() })}
              >
                {label}
              </button>
            );
          })}
        </div>
        <label className="check">
          <input type="checkbox" checked={settings.jitter} onChange={(e) => setSettings({ ...settings, jitter: e.target.checked })} />
          <span>Losowe odstępy (łatwiej się obudzić, gdy dzwonek zaskakuje)</span>
        </label>
        {!validWindow && <p className="error-note">Godzina „od” musi być wcześniejsza niż „do”, a co najmniej jeden dzień musi być zaznaczony.</p>}
        <div className="form-actions">
          {!enabled ? (
            <button
              type="button"
              className="btn btn-primary"
              disabled={busy || !validWindow}
              onClick={() =>
                void run(async () => {
                  await enablePush(status.vapidPublicKey!, settings);
                  setEnabled(true);
                  return 'Powiadomienia włączone. Pierwsze przyjdzie zgodnie z harmonogramem.';
                })
              }
            >
              <BellRing size={18} aria-hidden /> Włącz powiadomienia
            </button>
          ) : (
            <>
              <button type="button" className="btn btn-primary" disabled={busy || !validWindow} onClick={() => void run(async () => { await updatePush(settings); return 'Zapisano harmonogram.'; })}>
                Zapisz harmonogram
              </button>
              <button type="button" className="btn" disabled={busy} onClick={() => void run(() => testPush())}>
                <Send size={18} aria-hidden /> Wyślij próbne
              </button>
              <button
                type="button"
                className="btn btn-ghost"
                disabled={busy}
                onClick={() =>
                  void run(async () => {
                    await disablePush();
                    setEnabled(false);
                    return 'Powiadomienia wyłączone.';
                  })
                }
              >
                <BellOff size={18} aria-hidden /> Wyłącz
              </button>
            </>
          )}
        </div>
        {message && (
          <p className="saved-note" role="status">
            {message}
          </p>
        )}
        {error && (
          <p className="error-note" role="alert">
            {error}
          </p>
        )}
      </>
    );

  return (
    <section className="card" id="push">
      <h2 className="card-title">Powiadomienia push</h2>
      <p className="muted small">Przypomnienia przychodzą także wtedy, gdy strona jest zamknięta. Kliknięcie „Obudziłem/obudziłam się” w powiadomieniu doliczy przebudzenie.</p>
      {body}
    </section>
  );
}

export default function Awakening() {
  const { count, all, add } = useAwakeningCounter();
  const [anchors, setAnchors] = useAnchors();
  const [settings, updateSettings] = useSettings();
  const [anchorText, setAnchorText] = useState('');
  const [pulse, setPulse] = useState(false);
  const [permission, setPermission] = useState(typeof Notification !== 'undefined' ? Notification.permission : 'unsupported');
  const [params, setParams] = useSearchParams();

  // Kliknięcie w powiadomienie push z akcją „Obudziłem się” otwiera stronę z ?obudzony=1.
  useEffect(() => {
    if (params.get('obudzony') !== '1') return;
    add();
    const next = new URLSearchParams(params);
    next.delete('obudzony');
    setParams(next, { replace: true });
  }, [params, setParams, add]);

  const week = lastNDays(7).map((k) => ({ label: formatWeekdayKey(k), value: all[k] ?? 0 }));
  const total = Object.values(all).reduce((s, v) => s + v, 0);

  const awaken = () => {
    add();
    setPulse(true);
    window.setTimeout(() => setPulse(false), 700);
  };

  const toggleReminder = async () => {
    const enable = !settings.reminderEnabled;
    if (enable && typeof Notification !== 'undefined' && Notification.permission === 'default') {
      try {
        setPermission(await Notification.requestPermission());
      } catch {
        // brak zgody nie blokuje dzwonka w karcie
      }
    }
    if (enable) playBell(0.2);
    updateSettings({ reminderEnabled: enable });
  };

  const addAnchor = () => {
    const value = anchorText.trim();
    if (!value || anchors.includes(value)) return;
    setAnchors((prev) => [...prev, value]);
    setAnchorText('');
  };

  return (
    <div className="tool">
      <section className="card awaken-card">
        <p className="eyebrow">Przebudzenie</p>
        <p className="awaken-formula">Widzę siebie i widzę rzeczywistość.</p>
        <p className="muted">
          Zauważ swoje ciało, postawę i emocje, a jednocześnie otoczenie. Przenieś uwagę z ekranów do centrum, a potem kliknij.
        </p>
        <button type="button" className={`awaken-btn ${pulse ? 'is-pulse' : ''}`} onClick={awaken}>
          <Eye size={28} aria-hidden />
          <span>Obudziłem/obudziłam się</span>
        </button>
        <div className="stats-row">
          <Stat value={count} label="dziś" />
          <Stat value={total} label="łącznie" />
        </div>
        <p className="muted small">Cel na start: co najmniej 10 przebudzeń dziennie.</p>
      </section>

      <div className="grid grid-2">
        <section className="card">
          <h2 className="card-title">Ostatnie 7 dni</h2>
          <MiniBars data={week} max={Math.max(10, ...week.map((w) => w.value))} />
        </section>

        <section className="card">
          <h2 className="card-title">Dzwonek przebudzenia</h2>
          <p className="muted small">
            Co kilka minut usłyszysz delikatny dźwięk misy i zobaczysz przypomnienie. Działa, dopóki karta z serwisem jest otwarta.
          </p>
          <div className="segmented" role="group" aria-label="Co ile minut">
            {INTERVALS.map((m) => (
              <button key={m} type="button" className={settings.reminderMinutes === m ? 'is-active' : ''} aria-pressed={settings.reminderMinutes === m} onClick={() => updateSettings({ reminderMinutes: m })}>
                {m} min
              </button>
            ))}
          </div>
          <div className="form-actions">
            <button type="button" className={`btn ${settings.reminderEnabled ? '' : 'btn-primary'}`} onClick={toggleReminder}>
              {settings.reminderEnabled ? <BellOff size={18} aria-hidden /> : <Bell size={18} aria-hidden />}
              {settings.reminderEnabled ? 'Wyłącz dzwonek' : 'Włącz dzwonek'}
            </button>
            <button type="button" className="btn btn-ghost" onClick={() => playBell(0.25)}>
              Posłuchaj dźwięku
            </button>
          </div>
          {settings.reminderEnabled && (
            <p className="saved-note" role="status">
              Dzwonek włączony: co {settings.reminderMinutes} min.
            </p>
          )}
          {permission === 'denied' && (
            <p className="muted small">Powiadomienia systemowe są zablokowane w przeglądarce. Dzwonek w karcie nadal działa.</p>
          )}
        </section>
      </div>

      <section className="card">
        <h2 className="card-title">Kotwice przebudzenia</h2>
        <p className="muted small">
          Codzienne czynności, które przypominają ci o przebudzeniu. Tafti radzi traktować każde zdarzenie jak sygnał: obudź się.
        </p>
        <ul className="anchor-list">
          {anchors.map((a) => (
            <li key={a} className="chip">
              {a}
              <button type="button" className="chip-x" aria-label={`Usuń kotwicę: ${a}`} onClick={() => setAnchors((prev) => prev.filter((x) => x !== a))}>
                <X size={14} />
              </button>
            </li>
          ))}
        </ul>
        <form
          className="add-row"
          onSubmit={(e) => {
            e.preventDefault();
            addAnchor();
          }}
        >
          <input type="text" value={anchorText} onChange={(e) => setAnchorText(e.target.value)} placeholder="np. Czekanie na zielone światło" aria-label="Nowa kotwica" />
          <button type="submit" className="btn">
            <Plus size={18} aria-hidden /> Dodaj
          </button>
        </form>
      </section>

      {!STATIC && <PushSection />}

      <Callout tone="info" title="Wskazówka">
        Nie próbuj utrzymać uwagi w centrum bez przerwy. Uwaga i tak będzie uciekać do ekranów. Liczy się nawyk powracania, a każde
        zauważenie „zasnąłem/zasnęłam” to już przebudzenie.
      </Callout>
    </div>
  );
}

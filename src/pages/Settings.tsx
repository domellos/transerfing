import { useRef, useState } from 'react';
import { Link } from 'react-router';
import { Bell, Download, Trash2, Upload, UserRound, Volume2 } from 'lucide-react';
import { Callout, PageHeader } from '../components/ui';
import { useSettings } from '../state';
import { clearAll, exportAll, importAll } from '../lib/storage';
import { exportImages, importImages } from '../lib/images';
import { idbClear } from '../lib/idb';
import { forgetVaultKey } from '../lib/crypto';
import { speak, speechSupported, usePolishVoices } from '../lib/speech';
import { playBell } from '../lib/sound';
import { dateKey, plural } from '../lib/date';
import { useTitle } from '../lib/hooks';
import { PRIVACY_IN, STATIC } from '../site';
import type { Settings as SettingsType } from '../types';

const INTERVALS = [15, 30, 45, 60, 90];

export default function Settings() {
  useTitle('Ustawienia');
  const [settings, update] = useSettings();
  const voices = usePolishVoices();
  const [withImages, setWithImages] = useState(true);
  const [message, setMessage] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const download = async () => {
    setBusy(true);
    try {
      const file = exportAll();
      if (withImages) file.images = await exportImages();
      const blob = new Blob([JSON.stringify(file)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `transerfing-kopia-${dateKey()}.json`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
      setMessage(`Kopia zapasowa została pobrana${withImages && file.images?.length ? ` (razem ze zdjęciami: ${file.images.length})` : ''}.`);
    } finally {
      setBusy(false);
    }
  };

  const upload = async (file: File) => {
    try {
      const data = JSON.parse(await file.text());
      if (!window.confirm('Import nadpisze dane o tych samych nazwach. Kontynuować?')) return;
      const count = importAll(data);
      const images = await importImages((data as { images?: unknown }).images);
      setMessage(
        `Zaimportowano ${count} ${plural(count, ['zbiór', 'zbiory', 'zbiorów'])} danych${images ? ` i ${images} ${plural(images, ['zdjęcie', 'zdjęcia', 'zdjęć'])}` : ''}.`,
      );
    } catch (error) {
      setMessage(error instanceof Error ? `Nie udało się zaimportować: ${error.message}` : 'Nie udało się zaimportować pliku.');
    }
  };

  const reset = async () => {
    if (!window.confirm('Usunąć wszystkie twoje dane z tej przeglądarki, także zdjęcia i zalogowanie? Kopia na koncie (jeśli je masz) zostanie. Tej operacji nie można cofnąć.')) return;
    clearAll();
    await idbClear('images').catch(() => undefined);
    await forgetVaultKey();
    setMessage('Wszystkie dane zostały usunięte z tej przeglądarki.');
  };

  return (
    <div className="page narrow">
      <PageHeader icon="settings" title="Ustawienia" lead="Wygląd, dźwięk, lektor, przypomnienia i twoje dane." />

      <section className="card form">
        <h2 className="card-title">Ogólne</h2>
        <div className="field">
          <label className="field-label" htmlFor="set-name">
            Jak mam się do ciebie zwracać?
          </label>
          <input id="set-name" type="text" value={settings.name} onChange={(e) => update({ name: e.target.value })} placeholder="Imię (opcjonalnie)" maxLength={40} />
        </div>
        <fieldset className="field">
          <legend className="field-label">Motyw</legend>
          <div className="segmented" role="group" aria-label="Motyw">
            {(
              [
                ['dark', 'Ciemny'],
                ['light', 'Jasny'],
                ['auto', 'Jak w systemie'],
              ] as [SettingsType['theme'], string][]
            ).map(([value, label]) => (
              <button key={value} type="button" className={settings.theme === value ? 'is-active' : ''} aria-pressed={settings.theme === value} onClick={() => update({ theme: value })}>
                {label}
              </button>
            ))}
          </div>
        </fieldset>
        <label className="check">
          <input type="checkbox" checked={settings.sound} onChange={(e) => update({ sound: e.target.checked })} />
          <span>Dźwięk misy w sesjach i przypomnieniach</span>
        </label>
      </section>

      <section className="card form" id="lektor">
        <h2 className="card-title">
          <Volume2 size={18} aria-hidden className="inline-icon" /> Lektor w prowadzonych sesjach
        </h2>
        {!speechSupported() ? (
          <p className="muted">Ta przeglądarka nie obsługuje syntezy mowy.</p>
        ) : (
          <>
            <label className="check">
              <input type="checkbox" checked={settings.voice} onChange={(e) => update({ voice: e.target.checked })} />
              <span>Czytaj na głos kroki slajdów, warkocza i ćwiczenia energii</span>
            </label>
            {voices.length === 0 ? (
              <Callout tone="warn">
                W tym systemie nie znaleziono polskiego głosu. Lektor może czytać z obcym akcentem. Polski głos dodasz w ustawieniach języka i mowy systemu.
              </Callout>
            ) : (
              <div className="field">
                <label className="field-label" htmlFor="set-voice">
                  Głos
                </label>
                <select id="set-voice" value={settings.voiceName} onChange={(e) => update({ voiceName: e.target.value })}>
                  <option value="">Domyślny polski głos</option>
                  {voices.map((v) => (
                    <option key={v.name} value={v.name}>
                      {v.name}
                    </option>
                  ))}
                </select>
              </div>
            )}
            <div className="slider">
              <label className="field-label" htmlFor="set-rate">
                Tempo mowy: <strong>{settings.voiceRate.toFixed(2).replace('.', ',')}×</strong>
              </label>
              <input id="set-rate" type="range" min={0.7} max={1.2} step={0.05} value={settings.voiceRate} onChange={(e) => update({ voiceRate: Number(e.target.value) })} />
            </div>
            <div className="form-actions">
              <button type="button" className="btn" onClick={() => speak('Widzę siebie i widzę rzeczywistość. Zrób spokojny oddech i poczuj warkocz.', { voiceName: settings.voiceName, rate: settings.voiceRate })}>
                <Volume2 size={18} aria-hidden /> Posłuchaj próbki
              </button>
            </div>
          </>
        )}
      </section>

      <section className="card form">
        <h2 className="card-title">
          <Bell size={18} aria-hidden className="inline-icon" /> Przypomnienia o przebudzeniu
        </h2>
        <label className="check">
          <input type="checkbox" checked={settings.reminderEnabled} onChange={(e) => update({ reminderEnabled: e.target.checked })} />
          <span>Dzwonek w otwartej karcie</span>
        </label>
        <div className="segmented" role="group" aria-label="Co ile minut">
          {INTERVALS.map((m) => (
            <button key={m} type="button" className={settings.reminderMinutes === m ? 'is-active' : ''} aria-pressed={settings.reminderMinutes === m} onClick={() => update({ reminderMinutes: m })}>
              {m} min
            </button>
          ))}
        </div>
        <div className="form-actions">
          <button type="button" className="btn btn-ghost" onClick={() => playBell(0.25)}>
            Posłuchaj dzwonka
          </button>
          {!STATIC && (
            <Link to="/praktyka/przebudzenie/" className="btn">
              Powiadomienia push przy zamkniętej stronie
            </Link>
          )}
        </div>
      </section>

      <section className="card form" id="dane">
        <h2 className="card-title">Twoje dane</h2>
        <Callout tone="info">
          {STATIC ? (
            <>
              Wszystko, co zapisujesz, zostaje w tej przeglądarce. Ta wersja serwisu nie ma serwera, więc na inne urządzenie przeniesiesz dane kopią
              zapasową. Szczegóły w <Link to="/prywatnosc/">{PRIVACY_IN}</Link>.
            </>
          ) : (
            <>
              Wszystko, co zapisujesz, zostaje w tej przeglądarce. Na serwer trafia tylko to, co sam/sama wyślesz: zaszyfrowana kopia przy włączonej{' '}
              <Link to="/konto/">synchronizacji</Link>, ustawienia powiadomień push albo pytania do asystenta AI. Szczegóły w{' '}
              <Link to="/prywatnosc/">{PRIVACY_IN}</Link>.
            </>
          )}
        </Callout>
        <label className="check">
          <input type="checkbox" checked={withImages} onChange={(e) => setWithImages(e.target.checked)} />
          <span>Dołącz zdjęcia z tablicy wizji (plik będzie większy)</span>
        </label>
        <div className="form-actions">
          <button type="button" className="btn btn-primary" onClick={() => void download()} disabled={busy}>
            <Download size={18} aria-hidden /> Pobierz kopię zapasową
          </button>
          <button type="button" className="btn" onClick={() => fileRef.current?.click()}>
            <Upload size={18} aria-hidden /> Wczytaj kopię
          </button>
          <input
            ref={fileRef}
            type="file"
            accept="application/json,.json"
            hidden
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) void upload(file);
              e.target.value = '';
            }}
          />
          <button type="button" className="btn btn-danger" onClick={() => void reset()}>
            <Trash2 size={18} aria-hidden /> Usuń wszystkie dane
          </button>
        </div>
        {message && (
          <p className="saved-note" role="status">
            {message}
          </p>
        )}
      </section>

      {!STATIC && (
        <p className="center">
          <Link to="/konto/" className="btn btn-ghost">
            <UserRound size={18} aria-hidden /> Konto i synchronizacja między urządzeniami
          </Link>
        </p>
      )}
    </div>
  );
}

import { useEffect, useState } from 'react';
import { Eye, X } from 'lucide-react';
import { useAwakeningCounter, useSettings } from '../state';
import { playBell } from '../lib/sound';
import { asset } from '../site';

const PROMPTS = [
  'Gdzie jest teraz twoja uwaga? W którym ekranie?',
  'Zatrzymaj się na oddech. Widzisz siebie i to, co się dzieje?',
  'Czy jakieś wahadło właśnie trzyma twoją uwagę?',
  'Jaki kadr ustawiasz na najbliższą godzinę?',
  'Czy coś jest teraz dla ciebie zbyt ważne? Rozluźnij barki.',
  'Wszystko idzie tak, jak trzeba. Wybierasz dalszy ciąg.',
];

const TITLE = 'Obudź się: widzę siebie i widzę rzeczywistość';

async function showSystemNotification(body: string) {
  if (!('Notification' in window) || Notification.permission !== 'granted') return;
  const options = { body, tag: 'przebudzenie', icon: asset('icon-192.png') };
  try {
    const registration = await navigator.serviceWorker?.getRegistration();
    if (registration) {
      await registration.showNotification(TITLE, options);
      return;
    }
    new Notification(TITLE, options);
  } catch {
    // Powiadomienia systemowe są opcjonalne.
  }
}

/**
 * Dzwonek przebudzenia działa, dopóki karta z serwisem jest otwarta.
 * Powiadomienia push (gdy strona jest zamknięta) wysyła serwer, a kliknięcie w nie
 * trafia tutaj przez service worker: pokazujemy przypomnienie albo doliczamy przebudzenie.
 */
export default function ReminderEngine() {
  const [settings] = useSettings();
  const { add } = useAwakeningCounter();
  const [prompt, setPrompt] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  useEffect(() => {
    if (!settings.reminderEnabled) return;
    const minutes = Math.max(5, settings.reminderMinutes);
    const id = window.setInterval(() => {
      const text = PROMPTS[Math.floor(Math.random() * PROMPTS.length)];
      setPrompt(text);
      playBell(0.22);
      if (document.hidden) void showSystemNotification(text);
    }, minutes * 60_000);
    return () => window.clearInterval(id);
  }, [settings.reminderEnabled, settings.reminderMinutes]);

  useEffect(() => {
    const sw = typeof navigator !== 'undefined' ? navigator.serviceWorker : undefined;
    if (!sw) return;
    const onMessage = (event: MessageEvent) => {
      const data = event.data as { type?: string; text?: string } | null;
      if (data?.type === 'transerfing:awake') {
        add();
        setPrompt(null);
        setNotice('Przebudzenie zapisane.');
      } else if (data?.type === 'transerfing:prompt') {
        setPrompt(typeof data.text === 'string' && data.text ? data.text : PROMPTS[0]);
      }
    };
    sw.addEventListener('message', onMessage);
    return () => sw.removeEventListener('message', onMessage);
  }, [add]);

  useEffect(() => {
    if (!notice) return;
    const id = window.setTimeout(() => setNotice(null), 4000);
    return () => window.clearTimeout(id);
  }, [notice]);

  if (notice && !prompt) {
    return (
      <div className="toast" role="status" aria-live="polite">
        <Eye size={22} aria-hidden className="toast-icon" />
        <div className="toast-body">
          <p className="toast-title">{notice}</p>
        </div>
        <button type="button" className="icon-btn" aria-label="Zamknij" onClick={() => setNotice(null)}>
          <X size={18} />
        </button>
      </div>
    );
  }

  if (!prompt) return null;

  return (
    <div className="toast" role="status" aria-live="polite">
      <Eye size={22} aria-hidden className="toast-icon" />
      <div className="toast-body">
        <p className="toast-title">Widzę siebie i widzę rzeczywistość</p>
        <p className="toast-text">{prompt}</p>
        <div className="toast-actions">
          <button
            type="button"
            className="btn btn-primary btn-sm"
            onClick={() => {
              add();
              setPrompt(null);
            }}
          >
            Obudziłem/obudziłam się
          </button>
        </div>
      </div>
      <button type="button" className="icon-btn" aria-label="Zamknij przypomnienie" onClick={() => setPrompt(null)}>
        <X size={18} />
      </button>
    </div>
  );
}

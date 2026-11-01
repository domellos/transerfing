import { useCallback, useEffect, useRef, useState, type ReactNode } from 'react';
import { Pause, Play, RotateCcw, SkipForward, Volume2, VolumeX, X } from 'lucide-react';
import { playBell } from '../lib/sound';
import { useWakeLock } from '../lib/hooks';
import { speak, speechSupported, stopSpeaking } from '../lib/speech';
import { useSettings } from '../state';

export interface SequenceStep {
  title: string;
  text: ReactNode;
  seconds: number;
}

interface Props {
  title: string;
  steps: SequenceStep[];
  onClose: () => void;
  onFinish?: () => void;
  finishText?: ReactNode;
  /** Zdjęcie wyświetlane w tle sesji (np. z tablicy wizji). */
  image?: string | null;
}

function formatTime(total: number) {
  const s = Math.max(0, Math.ceil(total));
  const m = Math.floor(s / 60);
  return `${m}:${String(s % 60).padStart(2, '0')}`;
}

/** Pełnoekranowa, prowadzona sesja z minutnikiem, dzwonkiem między krokami i opcjonalnym lektorem. */
export default function GuidedSequence({ title, steps, onClose, onFinish, finishText, image }: Props) {
  const [settings, updateSettings] = useSettings();
  const [index, setIndex] = useState(0);
  const [remaining, setRemaining] = useState(steps[0]?.seconds ?? 0);
  const [paused, setPaused] = useState(false);
  const [done, setDone] = useState(false);
  const finishedRef = useRef(false);
  const indexRef = useRef(0);
  const dialogRef = useRef<HTMLDivElement>(null);
  const textRef = useRef<HTMLDivElement>(null);
  const titleRef = useRef<HTMLHeadingElement>(null);
  const voiceAvailable = speechSupported();
  const voiceOn = voiceAvailable && settings.voice;

  useWakeLock(!done);

  const advance = useCallback(() => {
    const next = indexRef.current + 1;
    if (next < steps.length) {
      indexRef.current = next;
      setIndex(next);
      setRemaining(steps[next].seconds);
      playBell(0.14);
    } else if (!finishedRef.current) {
      finishedRef.current = true;
      setDone(true);
      playBell(0.26);
      onFinish?.();
    }
  }, [steps, onFinish]);

  useEffect(() => {
    playBell(0.2);
    dialogRef.current?.focus();
    return () => stopSpeaking();
  }, []);

  // Lektor czyta tytuł i treść bieżącego kroku.
  useEffect(() => {
    if (!voiceOn || paused) {
      stopSpeaking();
      return;
    }
    const text = `${titleRef.current?.textContent ?? ''}. ${textRef.current?.textContent ?? ''}`;
    const id = window.setTimeout(() => speak(text, { voiceName: settings.voiceName, rate: settings.voiceRate }), 350);
    return () => window.clearTimeout(id);
  }, [index, done, voiceOn, paused, settings.voiceName, settings.voiceRate]);

  useEffect(() => {
    if (paused || done) return;
    const startedAt = Date.now();
    const startRemaining = remaining;
    const id = window.setInterval(() => {
      const left = startRemaining - (Date.now() - startedAt) / 1000;
      if (left <= 0) {
        window.clearInterval(id);
        setRemaining(0);
        advance();
      } else {
        setRemaining(left);
      }
    }, 200);
    return () => window.clearInterval(id);
    // remaining celowo pominięte: liczymy od wartości z chwili startu lub wznowienia
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [index, paused, done, advance]);

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose();
      if (event.key === ' ' && !done) {
        event.preventDefault();
        setPaused((p) => !p);
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose, done]);

  const restart = () => {
    finishedRef.current = false;
    indexRef.current = 0;
    setDone(false);
    setPaused(false);
    setIndex(0);
    setRemaining(steps[0]?.seconds ?? 0);
    playBell(0.2);
  };

  const step = steps[index];
  const total = step?.seconds ?? 1;
  const progress = done ? 1 : 1 - remaining / total;
  const radius = 54;
  const circumference = 2 * Math.PI * radius;

  return (
    <div className={`session ${image ? 'has-image' : ''}`} role="dialog" aria-modal="true" aria-label={title} tabIndex={-1} ref={dialogRef}>
      {image && <div className="session-image" style={{ backgroundImage: `url("${image}")` }} aria-hidden />}
      <div className="session-glow" aria-hidden />
      <div className="session-top">
        <span className="session-title">{title}</span>
        <div className="session-top-actions">
          {voiceAvailable && (
            <button
              type="button"
              className="icon-btn"
              onClick={() => updateSettings({ voice: !settings.voice })}
              aria-pressed={voiceOn}
              aria-label={voiceOn ? 'Wyłącz lektora' : 'Włącz lektora'}
              title={voiceOn ? 'Wyłącz lektora' : 'Włącz lektora'}
            >
              {voiceOn ? <Volume2 size={22} /> : <VolumeX size={22} />}
            </button>
          )}
          <button type="button" className="icon-btn" onClick={onClose} aria-label="Zamknij sesję">
            <X size={22} />
          </button>
        </div>
      </div>

      {!done && step ? (
        <div className="session-body">
          <p className="session-step-count">
            Krok {index + 1} z {steps.length}
          </p>
          <div className={`session-orb ${paused ? 'is-paused' : ''}`} aria-hidden>
            <svg viewBox="0 0 120 120" width="160" height="160">
              <circle cx="60" cy="60" r={radius} className="session-ring-bg" />
              <circle
                cx="60"
                cy="60"
                r={radius}
                className="session-ring"
                strokeDasharray={circumference}
                strokeDashoffset={circumference * (1 - progress)}
              />
            </svg>
            <span className="session-time">{formatTime(remaining)}</span>
          </div>
          <h2 className="session-step-title" ref={titleRef}>
            {step.title}
          </h2>
          <div className="session-text" aria-live="polite" ref={textRef}>
            {step.text}
          </div>
          <div className="session-controls">
            <button type="button" className="btn" onClick={() => setPaused((p) => !p)}>
              {paused ? <Play size={18} /> : <Pause size={18} />}
              {paused ? 'Wznów' : 'Pauza'}
            </button>
            <button type="button" className="btn btn-ghost" onClick={advance}>
              <SkipForward size={18} />
              Dalej
            </button>
          </div>
        </div>
      ) : (
        <div className="session-body">
          <h2 className="session-step-title" ref={titleRef}>
            Gotowe
          </h2>
          <div className="session-text" ref={textRef}>
            {finishText ?? 'Puść i wróć do dnia z lekkością.'}
          </div>
          <div className="session-controls">
            <button type="button" className="btn btn-primary" onClick={onClose}>
              Zakończ
            </button>
            <button type="button" className="btn btn-ghost" onClick={restart}>
              <RotateCcw size={18} />
              Jeszcze raz
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

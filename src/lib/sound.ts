import { readStore } from './storage';

let context: AudioContext | null = null;

function soundEnabled(): boolean {
  const settings = readStore<{ sound?: boolean }>('settings', {});
  return settings.sound !== false;
}

/** Miękki dźwięk misy/dzwonka generowany w przeglądarce — bez plików audio. */
export function playBell(volume = 0.22) {
  if (!soundEnabled()) return;
  try {
    const Ctor =
      window.AudioContext ??
      (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    if (!Ctor) return;
    context = context ?? new Ctor();
    const ctx = context;
    if (ctx.state === 'suspended') void ctx.resume();

    const now = ctx.currentTime;
    const master = ctx.createGain();
    master.gain.value = volume;
    master.connect(ctx.destination);

    const partials = [1, 2.0, 2.76, 4.07];
    partials.forEach((ratio, index) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.value = 256 * ratio;
      const peak = 0.6 / (index + 1);
      const decay = 4.5 / (index + 1) + 0.6;
      gain.gain.setValueAtTime(0.0001, now);
      gain.gain.exponentialRampToValueAtTime(peak, now + 0.015);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + decay);
      osc.connect(gain);
      gain.connect(master);
      osc.start(now);
      osc.stop(now + decay + 0.1);
    });
  } catch {
    // Dźwięk jest tylko dodatkiem — brak obsługi audio nie przerywa praktyki.
  }
}

import { useEffect, useState } from 'react';

/** Lektor oparty na syntezie mowy wbudowanej w przeglądarkę (Web Speech API). */

export function speechSupported(): boolean {
  return typeof window !== 'undefined' && 'speechSynthesis' in window && typeof SpeechSynthesisUtterance !== 'undefined';
}

export function polishVoices(): SpeechSynthesisVoice[] {
  if (!speechSupported()) return [];
  return window.speechSynthesis.getVoices().filter((v) => v.lang.toLowerCase().startsWith('pl'));
}

/** Lista polskich głosów; przeglądarki wczytują je asynchronicznie. */
export function usePolishVoices(): SpeechSynthesisVoice[] {
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>(() => polishVoices());
  useEffect(() => {
    if (!speechSupported()) return;
    const update = () => setVoices(polishVoices());
    update();
    window.speechSynthesis.addEventListener('voiceschanged', update);
    return () => window.speechSynthesis.removeEventListener('voiceschanged', update);
  }, []);
  return voices;
}

/** Dzieli tekst na krótkie fragmenty: niektóre przeglądarki urywają długie wypowiedzi. */
function chunks(text: string): string[] {
  const sentences = text.replace(/\s+/g, ' ').trim().match(/[^.!?…]+[.!?…]*["”]?/g) ?? [];
  const out: string[] = [];
  for (const sentence of sentences) {
    const s = sentence.trim();
    if (!s) continue;
    if (s.length <= 220) {
      out.push(s);
      continue;
    }
    let rest = s;
    while (rest.length > 220) {
      const cut = rest.lastIndexOf(',', 220) > 80 ? rest.lastIndexOf(',', 220) + 1 : 220;
      out.push(rest.slice(0, cut).trim());
      rest = rest.slice(cut);
    }
    if (rest.trim()) out.push(rest.trim());
  }
  return out;
}

export function stopSpeaking() {
  if (speechSupported()) window.speechSynthesis.cancel();
}

export function speak(text: string, options: { voiceName?: string; rate?: number } = {}) {
  if (!speechSupported() || !text.trim()) return;
  const synth = window.speechSynthesis;
  synth.cancel();
  const voices = polishVoices();
  const voice = voices.find((v) => v.name === options.voiceName) ?? voices[0];
  for (const part of chunks(text)) {
    const utterance = new SpeechSynthesisUtterance(part);
    utterance.lang = voice?.lang ?? 'pl-PL';
    if (voice) utterance.voice = voice;
    utterance.rate = Math.min(1.4, Math.max(0.6, options.rate ?? 0.95));
    synth.speak(utterance);
  }
}

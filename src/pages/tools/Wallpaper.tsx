import { useEffect, useMemo, useRef, useState } from 'react';
import { Download, Share2 } from 'lucide-react';
import { Callout } from '../../components/ui';
import { useFrames, useSlides } from '../../state';
import { useImages, useObjectUrl } from '../../lib/images';
import { thoughtForDay } from '../../data/misc';
import { dayOfYear } from '../../lib/date';

type Source = 'formula' | 'deklaracja' | 'kadr' | 'slajd' | 'mysl';
type Style = 'swit' | 'noc' | 'ocean' | 'las' | 'papier' | 'zdjecie';

const STYLES: Record<Exclude<Style, 'zdjecie'>, { label: string; stops: string[]; text: string; accent: string }> = {
  swit: { label: 'Świt', stops: ['#1a1440', '#5b3a8c', '#f2a65a'], text: '#fff8ec', accent: '#ffe3a3' },
  noc: { label: 'Noc', stops: ['#070a16', '#141c38', '#2b2260'], text: '#eef0f8', accent: '#b69cff' },
  ocean: { label: 'Ocean', stops: ['#06202b', '#0f4a5c', '#7cc6d6'], text: '#f2fbff', accent: '#bdeaf3' },
  las: { label: 'Las', stops: ['#08160f', '#1d4a33', '#6fd6a0'], text: '#f1fff6', accent: '#c9f5dc' },
  papier: { label: 'Papier', stops: ['#fbf7f0', '#f3ebdf', '#e8dcc8'], text: '#1d2235', accent: '#b7791f' },
};

const SIZES: { id: string; label: string; w: number; h: number }[] = [
  { id: 'auto', label: 'Ten ekran', w: 0, h: 0 },
  { id: '1080x1920', label: '1080 × 1920', w: 1080, h: 1920 },
  { id: '1170x2532', label: '1170 × 2532 (iPhone)', w: 1170, h: 2532 },
  { id: '1290x2796', label: '1290 × 2796 (duży iPhone)', w: 1290, h: 2796 },
  { id: '1440x3200', label: '1440 × 3200 (Android)', w: 1440, h: 3200 },
];

const SERIF = "'Iowan Old Style', 'Palatino Linotype', Palatino, 'Book Antiqua', Georgia, serif";
const FORMULA = 'Widzę siebie i widzę rzeczywistość.';

function screenSize(): { w: number; h: number } {
  if (typeof window === 'undefined') return { w: 1080, h: 1920 };
  const dpr = Math.min(3, window.devicePixelRatio || 1);
  let w = Math.round(window.screen.width * dpr);
  let h = Math.round(window.screen.height * dpr);
  if (w > h) [w, h] = [h, w];
  if (w < 720) return { w: 1080, h: 1920 };
  return { w: Math.min(w, 2000), h: Math.min(h, 4000) };
}

function wrap(ctx: CanvasRenderingContext2D, text: string, maxWidth: number): string[] {
  const lines: string[] = [];
  for (const paragraph of text.split('\n')) {
    let line = '';
    for (const word of paragraph.split(/\s+/).filter(Boolean)) {
      const test = line ? `${line} ${word}` : word;
      if (ctx.measureText(test).width > maxWidth && line) {
        lines.push(line);
        line = word;
      } else line = test;
    }
    if (line) lines.push(line);
  }
  return lines;
}

export default function Wallpaper() {
  const [frames] = useFrames();
  const [slides] = useSlides();
  const { images } = useImages();
  const [source, setSource] = useState<Source>('formula');
  const [custom, setCustom] = useState('Mój świat troszczy się o mnie.');
  const [frameId, setFrameId] = useState('');
  const [slideId, setSlideId] = useState('');
  const [style, setStyle] = useState<Style>('swit');
  const [imageId, setImageId] = useState('');
  const [sizeId, setSizeId] = useState('auto');
  const [footer, setFooter] = useState(true);
  const [canShare, setCanShare] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const activeFrames = frames.filter((f) => f.status === 'aktywny');
  const image = images.find((i) => i.id === imageId) ?? images[0];
  const imageUrl = useObjectUrl(style === 'zdjecie' ? image?.blob : null);

  const text = useMemo(() => {
    if (source === 'formula') return FORMULA;
    if (source === 'deklaracja') return custom.trim() || FORMULA;
    if (source === 'mysl') return thoughtForDay(dayOfYear(new Date()));
    if (source === 'kadr') return (activeFrames.find((f) => f.id === frameId) ?? activeFrames[0])?.text ?? FORMULA;
    const slide = slides.find((s) => s.id === slideId) ?? slides[0];
    return slide ? slide.declaration || slide.title : FORMULA;
  }, [source, custom, frameId, slideId, activeFrames, slides]);

  const size = useMemo(() => {
    const preset = SIZES.find((s) => s.id === sizeId);
    return !preset || preset.id === 'auto' ? screenSize() : { w: preset.w, h: preset.h };
  }, [sizeId]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    canvas.width = size.w;
    canvas.height = size.h;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    let cancelled = false;

    const palette = style === 'zdjecie' ? STYLES.noc : STYLES[style];
    const draw = (photo?: HTMLImageElement) => {
      if (cancelled) return;
      const { w, h } = size;
      if (photo) {
        const scale = Math.max(w / photo.naturalWidth, h / photo.naturalHeight);
        const dw = photo.naturalWidth * scale;
        const dh = photo.naturalHeight * scale;
        ctx.drawImage(photo, (w - dw) / 2, (h - dh) / 2, dw, dh);
        const shade = ctx.createLinearGradient(0, 0, 0, h);
        shade.addColorStop(0, 'rgba(5,8,18,0.25)');
        shade.addColorStop(0.45, 'rgba(5,8,18,0.55)');
        shade.addColorStop(1, 'rgba(5,8,18,0.8)');
        ctx.fillStyle = shade;
        ctx.fillRect(0, 0, w, h);
      } else {
        const gradient = ctx.createLinearGradient(0, 0, w * 0.3, h);
        palette.stops.forEach((c, i) => gradient.addColorStop(i / (palette.stops.length - 1), c));
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, w, h);
        const glow = ctx.createRadialGradient(w * 0.5, h * 0.36, 0, w * 0.5, h * 0.36, w * 0.75);
        glow.addColorStop(0, style === 'papier' ? 'rgba(183,121,31,0.18)' : 'rgba(255,227,163,0.22)');
        glow.addColorStop(1, 'rgba(0,0,0,0)');
        ctx.fillStyle = glow;
        ctx.fillRect(0, 0, w, h);
      }

      // Tekst: zawijany, dopasowany rozmiarem, poniżej zegara ekranu blokady.
      const maxWidth = w * 0.8;
      let fontSize = Math.round(w * 0.085);
      let lines: string[] = [];
      for (; fontSize > w * 0.035; fontSize -= 2) {
        ctx.font = `600 ${fontSize}px ${SERIF}`;
        lines = wrap(ctx, text, maxWidth);
        if (lines.length * fontSize * 1.3 <= h * 0.42) break;
      }
      const lineHeight = fontSize * 1.3;
      const blockHeight = lines.length * lineHeight;
      let y = h * 0.6 - blockHeight / 2 + fontSize;
      ctx.textAlign = 'center';
      ctx.fillStyle = photo ? '#ffffff' : palette.text;
      ctx.shadowColor = photo || style !== 'papier' ? 'rgba(0,0,0,0.35)' : 'transparent';
      ctx.shadowBlur = fontSize * 0.25;
      for (const line of lines) {
        ctx.fillText(line, w / 2, y);
        y += lineHeight;
      }
      ctx.shadowBlur = 0;
      if (footer && text !== FORMULA) {
        ctx.font = `500 ${Math.round(w * 0.032)}px ${SERIF}`;
        ctx.fillStyle = photo ? '#ffe3a3' : palette.accent;
        ctx.fillText(FORMULA, w / 2, h * 0.9);
      }
    };

    if (style === 'zdjecie' && imageUrl) {
      const photo = new Image();
      photo.onload = () => draw(photo);
      photo.onerror = () => draw();
      photo.src = imageUrl;
    } else draw();
    return () => {
      cancelled = true;
    };
  }, [text, style, imageUrl, size, footer]);

  useEffect(() => {
    try {
      const probe = new File([new Uint8Array(1)], 'test.png', { type: 'image/png' });
      setCanShare(typeof navigator.canShare === 'function' && navigator.canShare({ files: [probe] }));
    } catch {
      setCanShare(false);
    }
  }, []);

  const toBlob = () =>
    new Promise<Blob | null>((resolve) => {
      const canvas = canvasRef.current;
      if (!canvas) return resolve(null);
      canvas.toBlob((b) => resolve(b), 'image/png');
    });

  const download = async () => {
    const blob = await toBlob();
    if (!blob) return;
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'tapeta-transerfing.png';
    document.body.appendChild(a);
    a.click();
    a.remove();
    setTimeout(() => URL.revokeObjectURL(url), 2000);
  };

  const share = async () => {
    const blob = await toBlob();
    if (!blob) return;
    const file = new File([blob], 'tapeta-transerfing.png', { type: 'image/png' });
    await navigator.share({ files: [file], title: 'Tapeta Transerfing' }).catch(() => undefined);
  };

  return (
    <div className="tool wallpaper-tool">
      <Callout tone="tip">
        Ustaw tapetę na ekranie blokady. Każde spojrzenie na telefon stanie się kotwicą przebudzenia: zatrzymaj się na sekundę i obudź, zanim odblokujesz ekran.
      </Callout>

      <div className="wallpaper-layout">
        <div className="card form">
          <fieldset className="field">
            <legend className="field-label">Tekst</legend>
            <div className="options">
              {(
                [
                  ['formula', 'Formuła przebudzenia'],
                  ['deklaracja', 'Własna deklaracja'],
                  ['kadr', 'Aktywny kadr'],
                  ['slajd', 'Deklaracja slajdu'],
                  ['mysl', 'Myśl dnia'],
                ] as [Source, string][]
              ).map(([value, label]) => (
                <label key={value} className={`option ${source === value ? 'is-active' : ''}`}>
                  <input
                    type="radio"
                    name="source"
                    checked={source === value}
                    onChange={() => setSource(value)}
                    disabled={(value === 'kadr' && activeFrames.length === 0) || (value === 'slajd' && slides.length === 0)}
                  />
                  <span>{label}</span>
                </label>
              ))}
            </div>
          </fieldset>
          {source === 'deklaracja' && (
            <div className="field">
              <label className="field-label" htmlFor="wp-text">
                Twoja deklaracja
              </label>
              <textarea id="wp-text" rows={3} maxLength={160} value={custom} onChange={(e) => setCustom(e.target.value)} />
            </div>
          )}
          {source === 'kadr' && activeFrames.length > 0 && (
            <select value={frameId} onChange={(e) => setFrameId(e.target.value)} aria-label="Kadr">
              {activeFrames.map((f) => (
                <option key={f.id} value={f.id}>
                  {f.text.slice(0, 60)}
                </option>
              ))}
            </select>
          )}
          {source === 'slajd' && slides.length > 0 && (
            <select value={slideId} onChange={(e) => setSlideId(e.target.value)} aria-label="Slajd">
              {slides.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.title}
                </option>
              ))}
            </select>
          )}

          <fieldset className="field">
            <legend className="field-label">Tło</legend>
            <div className="chips">
              {(Object.keys(STYLES) as Exclude<Style, 'zdjecie'>[]).map((s) => (
                <button key={s} type="button" className={`chip ${style === s ? 'is-active' : ''}`} aria-pressed={style === s} onClick={() => setStyle(s)}>
                  {STYLES[s].label}
                </button>
              ))}
              <button type="button" className={`chip ${style === 'zdjecie' ? 'is-active' : ''}`} aria-pressed={style === 'zdjecie'} onClick={() => setStyle('zdjecie')} disabled={images.length === 0}>
                Zdjęcie z tablicy wizji
              </button>
            </div>
            {style === 'zdjecie' && images.length > 0 && (
              <select value={image?.id ?? ''} onChange={(e) => setImageId(e.target.value)} aria-label="Zdjęcie">
                {images.map((img, i) => (
                  <option key={img.id} value={img.id}>
                    {img.caption || `Zdjęcie ${i + 1}`}
                  </option>
                ))}
              </select>
            )}
          </fieldset>

          <div className="field">
            <label className="field-label" htmlFor="wp-size">
              Rozmiar
            </label>
            <select id="wp-size" value={sizeId} onChange={(e) => setSizeId(e.target.value)}>
              {SIZES.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.label}
                </option>
              ))}
            </select>
          </div>
          <label className="check">
            <input type="checkbox" checked={footer} onChange={(e) => setFooter(e.target.checked)} />
            <span>Dodaj formułę przebudzenia na dole</span>
          </label>

          <div className="form-actions">
            <button type="button" className="btn btn-primary" onClick={() => void download()}>
              <Download size={18} aria-hidden /> Pobierz tapetę (PNG)
            </button>
            {canShare && (
              <button type="button" className="btn" onClick={() => void share()}>
                <Share2 size={18} aria-hidden /> Zapisz przez udostępnianie
              </button>
            )}
          </div>
          <p className="muted small">
            Na iPhonie użyj „Zapisz przez udostępnianie” → „Zachowaj obraz”, a potem ustaw tapetę w aplikacji Zdjęcia. Na Androidzie otwórz pobrany plik i wybierz
            „Ustaw jako tapetę”.
          </p>
        </div>

        <div className="wallpaper-preview">
          <canvas ref={canvasRef} aria-label={`Podgląd tapety z tekstem: ${text}`} role="img" />
          <p className="muted small center">
            {size.w} × {size.h} px
          </p>
        </div>
      </div>
    </div>
  );
}

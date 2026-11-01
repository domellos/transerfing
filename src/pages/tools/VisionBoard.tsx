import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router';
import { ChevronLeft, ChevronRight, ImagePlus, Play, Trash2, X } from 'lucide-react';
import { Callout, EmptyState } from '../../components/ui';
import StoredImg from '../../components/StoredImg';
import { addImage, removeImage, updateImage, useImages, useObjectUrl, type StoredImage } from '../../lib/images';
import { useWakeLock } from '../../lib/hooks';
import { useSlides } from '../../state';
import type { Slide } from '../../types';

function Slideshow({ images, slides, onClose }: { images: StoredImage[]; slides: Slide[]; onClose: () => void }) {
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const current = images[index];
  const url = useObjectUrl(current?.blob);
  const slide = slides.find((s) => s.id === current?.slideId);
  const dialogRef = useRef<HTMLDivElement>(null);
  useWakeLock(true);

  useEffect(() => {
    dialogRef.current?.focus();
  }, []);

  useEffect(() => {
    if (paused || images.length < 2) return;
    const id = window.setTimeout(() => setIndex((i) => (i + 1) % images.length), 8000);
    return () => window.clearTimeout(id);
  }, [index, paused, images.length]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
      if (e.key === 'ArrowRight') setIndex((i) => (i + 1) % images.length);
      if (e.key === 'ArrowLeft') setIndex((i) => (i - 1 + images.length) % images.length);
      if (e.key === ' ') {
        e.preventDefault();
        setPaused((p) => !p);
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [images.length, onClose]);

  if (!current) return null;
  return (
    <div className="session slideshow" role="dialog" aria-modal="true" aria-label="Pokaz tablicy wizji" tabIndex={-1} ref={dialogRef}>
      {url && <div className="slideshow-image" style={{ backgroundImage: `url("${url}")` }} role="img" aria-label={current.caption || slide?.title || 'Zdjęcie z tablicy wizji'} />}
      <div className="session-top">
        <span className="session-title">
          {index + 1} / {images.length}
        </span>
        <button type="button" className="icon-btn" onClick={onClose} aria-label="Zamknij pokaz">
          <X size={22} />
        </button>
      </div>
      <div className="slideshow-caption">
        {slide && <p className="eyebrow">{slide.title}</p>}
        <p className="session-quote">{current.caption || slide?.declaration || slide?.title || 'To jest moje. Pozwalam sobie to mieć.'}</p>
        <div className="session-controls">
          <button type="button" className="btn" onClick={() => setIndex((i) => (i - 1 + images.length) % images.length)} aria-label="Poprzednie zdjęcie">
            <ChevronLeft size={18} />
          </button>
          <button type="button" className="btn" onClick={() => setPaused((p) => !p)}>
            {paused ? 'Wznów' : 'Pauza'}
          </button>
          <button type="button" className="btn" onClick={() => setIndex((i) => (i + 1) % images.length)} aria-label="Następne zdjęcie">
            <ChevronRight size={18} />
          </button>
        </div>
      </div>
    </div>
  );
}

export default function VisionBoard() {
  const { images, loading } = useImages();
  const [slides] = useSlides();
  const [target, setTarget] = useState<string>('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [show, setShow] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const upload = async (files: FileList) => {
    setBusy(true);
    setError(null);
    try {
      for (const file of Array.from(files)) await addImage(file, target || null);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Nie udało się dodać zdjęcia.');
    } finally {
      setBusy(false);
    }
  };

  const groups = [
    ...slides.map((s) => ({ id: s.id, title: s.title, items: images.filter((i) => i.slideId === s.id) })),
    { id: '', title: 'Bez przypisanego slajdu', items: images.filter((i) => !i.slideId || !slides.some((s) => s.id === i.slideId)) },
  ].filter((g) => g.items.length > 0);

  return (
    <div className="tool">
      <Callout tone="tip">
        Zbierz zdjęcia, które pokazują świat twojego celu: miejsca, rzeczy, sytuacje. Oglądaj je jak slajd, czyli od środka, z poczuciem, że to normalna część twojego
        życia. Zdjęcia zostają w tej przeglądarce i nie są wysyłane na serwer.
      </Callout>

      <div className="card form">
        <div className="add-row wrap">
          <select value={target} onChange={(e) => setTarget(e.target.value)} aria-label="Przypisz do slajdu">
            <option value="">Bez przypisanego slajdu</option>
            {slides.map((s) => (
              <option key={s.id} value={s.id}>
                Slajd: {s.title}
              </option>
            ))}
          </select>
          <button type="button" className="btn btn-primary" onClick={() => fileRef.current?.click()} disabled={busy}>
            <ImagePlus size={18} aria-hidden /> {busy ? 'Dodaję…' : 'Dodaj zdjęcia'}
          </button>
          <input
            ref={fileRef}
            type="file"
            accept="image/*"
            multiple
            hidden
            onChange={(e) => {
              if (e.target.files?.length) void upload(e.target.files);
              e.target.value = '';
            }}
          />
          {images.length > 0 && (
            <button type="button" className="btn" onClick={() => setShow(true)}>
              <Play size={18} aria-hidden /> Pokaz na pełnym ekranie
            </button>
          )}
        </div>
        {error && (
          <p className="error-note" role="alert">
            {error}
          </p>
        )}
        {slides.length === 0 && (
          <p className="muted small">
            Wskazówka: najpierw stwórz slajd w <Link to="/praktyka/slajdy/">Studiu slajdów</Link>, a zdjęcia pojawią się też w jego sesji.
          </p>
        )}
      </div>

      {!loading && images.length === 0 && (
        <EmptyState icon="images" title="Tablica jest pusta">
          Dodaj pierwsze zdjęcie. Możesz zrobić je telefonem albo wybrać z galerii.
        </EmptyState>
      )}

      {groups.map((group) => (
        <section key={group.id || 'none'} className="section">
          <h2 className="section-title">{group.title}</h2>
          <ul className="vision-grid">
            {group.items.map((img) => (
              <li key={img.id} className="vision-item card">
                <StoredImg image={img} alt={img.caption || group.title} className="vision-img" />
                <input
                  type="text"
                  defaultValue={img.caption}
                  placeholder="Podpis, np. „Mój taras o poranku”"
                  aria-label="Podpis zdjęcia"
                  onBlur={(e) => {
                    if (e.target.value.trim() !== img.caption) void updateImage(img.id, { caption: e.target.value.trim() });
                  }}
                />
                <div className="row-actions">
                  <select value={img.slideId ?? ''} onChange={(e) => void updateImage(img.id, { slideId: e.target.value || null })} aria-label="Slajd">
                    <option value="">Bez slajdu</option>
                    {slides.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.title}
                      </option>
                    ))}
                  </select>
                  <button type="button" className="icon-btn" aria-label="Usuń zdjęcie" onClick={() => window.confirm('Usunąć to zdjęcie?') && void removeImage(img.id)}>
                    <Trash2 size={16} />
                  </button>
                </div>
              </li>
            ))}
          </ul>
        </section>
      ))}

      {show && images.length > 0 && <Slideshow images={images} slides={slides} onClose={() => setShow(false)} />}
    </div>
  );
}

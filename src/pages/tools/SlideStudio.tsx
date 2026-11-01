import { useEffect, useMemo, useRef, useState } from 'react';
import { Link, useSearchParams } from 'react-router';
import { ImagePlus, Pencil, Play, Plus, Trash2 } from 'lucide-react';
import GuidedSequence, { type SequenceStep } from '../../components/GuidedSequence';
import StoredImg from '../../components/StoredImg';
import { Callout, EmptyState } from '../../components/ui';
import { useGoals, useSlides } from '../../state';
import { newId } from '../../lib/storage';
import { addImage, removeImagesOfSlide, useImages, useObjectUrl } from '../../lib/images';
import { formatDateTime, plural } from '../../lib/date';
import type { Slide } from '../../types';

type Draft = Pick<Slide, 'title' | 'scene' | 'feelings' | 'process' | 'declaration'> & { goalId?: string };

const EMPTY_DRAFT: Draft = { title: '', scene: '', feelings: '', process: '', declaration: '' };
const DURATIONS = [3, 5, 10];

function buildSteps(slide: Slide, minutes: number): SequenceStep[] {
  const fixed = 30 + 60 + (slide.process ? 45 : 0) + 20 + 15;
  const sceneSeconds = Math.max(60, minutes * 60 - fixed);
  const steps: SequenceStep[] = [
    {
      title: 'Wycisz się',
      seconds: 30,
      text: 'Usiądź wygodnie, rozluźnij barki i zrób kilka spokojnych oddechów. Obudź się: widzę siebie i widzę rzeczywistość.',
    },
    {
      title: 'Wejdź w scenę',
      seconds: sceneSeconds,
      text: (
        <>
          <p className="session-quote">{slide.scene}</p>
          <p>Nie oglądaj obrazka z boku. Jesteś w środku sceny. Co widzisz, słyszysz, czujesz pod palcami? Dodawaj szczegóły.</p>
          {slide.details.length > 0 && <p className="muted">Szczegóły: {slide.details.join(' · ')}</p>}
        </>
      ),
    },
    {
      title: 'Poczuj',
      seconds: 60,
      text: slide.feelings || 'Poczuj spokojną radość i oczywistość. To jest normalne. Tak po prostu jest.',
    },
  ];
  if (slide.process) {
    steps.push({
      title: 'Wizualizacja procesu',
      seconds: 45,
      text: (
        <>
          <p className="session-quote">{slide.process}</p>
          <p>Zobacz, jak bieżący etap układa się dobrze, krok po kroku.</p>
        </>
      ),
    });
  }
  steps.push(
    {
      title: 'Deklaracja',
      seconds: 20,
      text: <p className="session-quote">{slide.declaration || 'To jest moje. Pozwalam sobie to mieć.'}</p>,
    },
    {
      title: 'Puść',
      seconds: 15,
      text: 'Puść obraz bez oczekiwania. Wracasz do dnia lekko, jakby wszystko było już ustawione.',
    },
  );
  return steps;
}

export default function SlideStudio() {
  const [slides, setSlides] = useSlides();
  const [goals] = useGoals();
  const [params, setParams] = useSearchParams();
  const [draft, setDraft] = useState<Draft | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [playing, setPlaying] = useState<{ id: string; minutes: number } | null>(null);
  const [minutes, setMinutes] = useState(5);
  const [detailDrafts, setDetailDrafts] = useState<Record<string, string>>({});
  const { images } = useImages();
  const [imageError, setImageError] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const uploadFor = useRef<string | null>(null);
  const playingImage = playing ? images.find((i) => i.slideId === playing.id) : undefined;
  const playingImageUrl = useObjectUrl(playingImage?.blob);

  const pickImage = (slideId: string) => {
    uploadFor.current = slideId;
    setImageError(null);
    fileRef.current?.click();
  };

  const uploadImages = async (files: FileList) => {
    const slideId = uploadFor.current;
    if (!slideId) return;
    try {
      for (const file of Array.from(files)) await addImage(file, slideId);
    } catch (e) {
      setImageError(e instanceof Error ? e.message : 'Nie udało się dodać zdjęcia.');
    }
  };

  // Otwarcie formularza z celem przekazanym z narzędzia „Cele i drzwi”.
  const goalId = params.get('cel');
  useEffect(() => {
    if (!goalId) return;
    const goal = goals.find((g) => g.id === goalId);
    if (goal) {
      setDraft({ ...EMPTY_DRAFT, title: goal.text, goalId: goal.id });
      setEditingId(null);
    }
    const next = new URLSearchParams(params);
    next.delete('cel');
    setParams(next, { replace: true });
  }, [goalId, goals, params, setParams]);

  const playingSlide = playing ? slides.find((s) => s.id === playing.id) : undefined;
  const steps = useMemo(
    () => (playingSlide && playing ? buildSteps(playingSlide, playing.minutes) : []),
    // Sesja nie powinna się przebudowywać po zapisaniu jej wyniku.
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [playing],
  );

  const startNew = () => {
    setDraft({ ...EMPTY_DRAFT });
    setEditingId(null);
  };

  const startEdit = (slide: Slide) => {
    setDraft({
      title: slide.title,
      scene: slide.scene,
      feelings: slide.feelings,
      process: slide.process,
      declaration: slide.declaration,
      goalId: slide.goalId,
    });
    setEditingId(slide.id);
  };

  const saveDraft = () => {
    if (!draft || !draft.title.trim() || !draft.scene.trim()) return;
    const clean: Draft = {
      ...draft,
      title: draft.title.trim(),
      scene: draft.scene.trim(),
      feelings: draft.feelings.trim(),
      process: draft.process.trim(),
      declaration: draft.declaration.trim(),
    };
    if (editingId) {
      setSlides((prev) => prev.map((s) => (s.id === editingId ? { ...s, ...clean } : s)));
    } else {
      const slide: Slide = { ...clean, id: newId(), details: [], createdAt: new Date().toISOString(), sessions: [] };
      setSlides((prev) => [slide, ...prev]);
    }
    setDraft(null);
    setEditingId(null);
  };

  const remove = (id: string) => {
    if (!window.confirm('Usunąć ten slajd razem z historią sesji i zdjęciami?')) return;
    setSlides((prev) => prev.filter((s) => s.id !== id));
    void removeImagesOfSlide(id);
  };

  const addDetail = (id: string) => {
    const text = (detailDrafts[id] ?? '').trim();
    if (!text) return;
    setSlides((prev) => prev.map((s) => (s.id === id ? { ...s, details: [...s.details, text] } : s)));
    setDetailDrafts((prev) => ({ ...prev, [id]: '' }));
  };

  const finishSession = (id: string) => {
    setSlides((prev) => prev.map((s) => (s.id === id ? { ...s, sessions: [...s.sessions, new Date().toISOString()] } : s)));
  };

  const update = (key: keyof Draft, value: string) => setDraft((d) => (d ? { ...d, [key]: value } : d));

  return (
    <div className="tool">
      <Callout tone="tip" title="Jak zbudować dobry slajd">
        Opisz jedną scenę z życia, w którym cel jest już zrealizowany. Pisz w czasie teraźniejszym, z perspektywy uczestnika, a
        nie widza. Odtwarzaj slajd krótko i regularnie, a przy każdej sesji dodawaj nowy szczegół.
      </Callout>

      {draft ? (
        <form
          className="card form"
          onSubmit={(e) => {
            e.preventDefault();
            saveDraft();
          }}
        >
          <h2 className="card-title">{editingId ? 'Edytuj slajd' : 'Nowy slajd'}</h2>
          <div className="field">
            <label className="field-label" htmlFor="s-title">
              Cel lub nazwa slajdu *
            </label>
            <input id="s-title" type="text" value={draft.title} onChange={(e) => update('title', e.target.value)} placeholder="np. Mieszkam w jasnym domu nad jeziorem" required />
          </div>
          <div className="field">
            <label className="field-label" htmlFor="s-scene">
              Scena w czasie teraźniejszym *
            </label>
            <textarea
              id="s-scene"
              rows={5}
              value={draft.scene}
              onChange={(e) => update('scene', e.target.value)}
              placeholder="np. Jest sobotni poranek. Otwieram okno, czuję zapach sosen i słyszę wodę. Parzę kawę w swojej kuchni i uśmiecham się, bo to zwyczajny dzień…"
              required
            />
          </div>
          <div className="field">
            <label className="field-label" htmlFor="s-feel">
              Co czuję w tej scenie?
            </label>
            <textarea id="s-feel" rows={2} value={draft.feelings} onChange={(e) => update('feelings', e.target.value)} placeholder="np. spokój, wdzięczność, oczywistość: to jest moje" />
          </div>
          <div className="field">
            <label className="field-label" htmlFor="s-proc">
              Bieżący etap (wizualizacja procesu)
            </label>
            <textarea id="s-proc" rows={2} value={draft.process} onChange={(e) => update('process', e.target.value)} placeholder="np. Co tydzień odkładam część dochodu i oglądam działki. Rozmowy z bankiem idą gładko." />
          </div>
          <div className="field">
            <label className="field-label" htmlFor="s-decl">
              Deklaracja
            </label>
            <input id="s-decl" type="text" value={draft.declaration} onChange={(e) => update('declaration', e.target.value)} placeholder="np. Mój dom czeka na mnie, a ja do niego idę." />
          </div>
          <div className="form-actions">
            <button type="submit" className="btn btn-primary" disabled={!draft.title.trim() || !draft.scene.trim()}>
              Zapisz slajd
            </button>
            <button
              type="button"
              className="btn btn-ghost"
              onClick={() => {
                setDraft(null);
                setEditingId(null);
              }}
            >
              Anuluj
            </button>
          </div>
        </form>
      ) : (
        <div className="form-actions">
          <button type="button" className="btn btn-primary" onClick={startNew}>
            <Plus size={18} aria-hidden /> Nowy slajd
          </button>
          <div className="segmented" role="group" aria-label="Długość sesji">
            {DURATIONS.map((d) => (
              <button key={d} type="button" className={minutes === d ? 'is-active' : ''} aria-pressed={minutes === d} onClick={() => setMinutes(d)}>
                {d} min
              </button>
            ))}
          </div>
        </div>
      )}

      {slides.length === 0 && !draft && (
        <EmptyState icon="image" title="Nie masz jeszcze slajdów">
          Zacznij od jednego celu. Jeśli go jeszcze nie znasz, zajrzyj do narzędzia Cele i drzwi.
        </EmptyState>
      )}

      <div className="slides">
        {slides.map((slide) => {
          const last = slide.sessions[slide.sessions.length - 1];
          return (
            <article key={slide.id} className="card slide-card">
              <div className="slide-card-head">
                <h3>{slide.title}</h3>
                <div className="row-actions">
                  <button type="button" className="icon-btn" aria-label="Edytuj slajd" onClick={() => startEdit(slide)}>
                    <Pencil size={16} />
                  </button>
                  <button type="button" className="icon-btn" aria-label="Usuń slajd" onClick={() => remove(slide.id)}>
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
              <p className="slide-scene">{slide.scene}</p>
              <div className="slide-images">
                {images
                  .filter((img) => img.slideId === slide.id)
                  .slice(0, 6)
                  .map((img) => (
                    <StoredImg key={img.id} image={img} alt={img.caption || slide.title} className="slide-thumb" />
                  ))}
                <button type="button" className="slide-thumb slide-thumb-add" onClick={() => pickImage(slide.id)} aria-label={`Dodaj zdjęcie do slajdu ${slide.title}`}>
                  <ImagePlus size={20} aria-hidden />
                </button>
              </div>
              {slide.details.length > 0 && (
                <ul className="slide-details">
                  {slide.details.map((d, i) => (
                    <li key={i}>{d}</li>
                  ))}
                </ul>
              )}
              <div className="add-detail">
                <input
                  type="text"
                  placeholder="Dodaj nowy szczegół do slajdu…"
                  value={detailDrafts[slide.id] ?? ''}
                  onChange={(e) => setDetailDrafts((prev) => ({ ...prev, [slide.id]: e.target.value }))}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      addDetail(slide.id);
                    }
                  }}
                  aria-label={`Nowy szczegół slajdu ${slide.title}`}
                />
                <button type="button" className="btn btn-sm" onClick={() => addDetail(slide.id)}>
                  Dodaj
                </button>
              </div>
              <div className="slide-foot">
                <span className="muted small">
                  {slide.sessions.length} {plural(slide.sessions.length, ['sesja', 'sesje', 'sesji'])}
                  {last ? ` · ostatnia: ${formatDateTime(last)}` : ''}
                </span>
                <button type="button" className="btn btn-primary" onClick={() => setPlaying({ id: slide.id, minutes })}>
                  <Play size={18} aria-hidden /> Odtwórz ({minutes} min)
                </button>
              </div>
            </article>
          );
        })}
      </div>

      <input
        ref={fileRef}
        type="file"
        accept="image/*"
        multiple
        hidden
        onChange={(e) => {
          if (e.target.files?.length) void uploadImages(e.target.files);
          e.target.value = '';
        }}
      />
      {imageError && (
        <p className="error-note" role="alert">
          {imageError}
        </p>
      )}
      {slides.length > 0 && (
        <p className="muted small">
          Zdjęcia slajdów zobaczysz też w <Link to="/praktyka/wizje/">Tablicy wizji</Link>. Zostają w tej przeglądarce.
        </p>
      )}

      {playing && playingSlide && (
        <GuidedSequence
          title={`Slajd: ${playingSlide.title}`}
          steps={steps}
          image={playingImageUrl}
          onClose={() => setPlaying(null)}
          onFinish={() => finishSession(playing.id)}
          finishText="Sesja zapisana. Wróć do slajdu jutro i dodaj kolejny szczegół."
        />
      )}
    </div>
  );
}

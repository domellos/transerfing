import { useEffect, useState } from 'react';
import { idbDelete, idbGet, idbGetAll, idbPut } from './idb';
import { newId } from './storage';

/** Zdjęcie z tablicy wizji. Przechowywane wyłącznie w tej przeglądarce (IndexedDB). */
export interface StoredImage {
  id: string;
  slideId: string | null;
  caption: string;
  blob: Blob;
  width: number;
  height: number;
  createdAt: string;
}

export interface ExportedImage {
  id: string;
  slideId: string | null;
  caption: string;
  width: number;
  height: number;
  createdAt: string;
  type: string;
  data: string;
}

const EVENT = 'ts-images-changed';
const MAX_SIDE = 1600;

function changed() {
  if (typeof window !== 'undefined') window.dispatchEvent(new Event(EVENT));
}

async function drawable(file: Blob): Promise<{ source: CanvasImageSource; width: number; height: number; done: () => void }> {
  if (typeof createImageBitmap === 'function') {
    const bitmap = await createImageBitmap(file);
    return { source: bitmap, width: bitmap.width, height: bitmap.height, done: () => bitmap.close() };
  }
  const url = URL.createObjectURL(file);
  const img = await new Promise<HTMLImageElement>((resolve, reject) => {
    const el = new Image();
    el.onload = () => resolve(el);
    el.onerror = () => reject(new Error('Nie udało się odczytać zdjęcia.'));
    el.src = url;
  });
  return { source: img, width: img.naturalWidth, height: img.naturalHeight, done: () => URL.revokeObjectURL(url) };
}

/** Zmniejsza zdjęcie (maks. 1600 px) i zapisuje je jako JPEG. */
export async function addImage(file: File, slideId: string | null, caption = ''): Promise<StoredImage> {
  if (!file.type.startsWith('image/')) throw new Error('Wybierz plik graficzny.');
  if (file.size > 30 * 1024 * 1024) throw new Error('Zdjęcie jest za duże (maksymalnie 30 MB).');
  const image = await drawable(file);
  try {
    const scale = Math.min(1, MAX_SIDE / Math.max(image.width, image.height));
    const width = Math.max(1, Math.round(image.width * scale));
    const height = Math.max(1, Math.round(image.height * scale));
    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d');
    if (!ctx) throw new Error('Przeglądarka nie obsługuje edycji obrazów.');
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, width, height);
    ctx.drawImage(image.source, 0, 0, width, height);
    const blob = await new Promise<Blob>((resolve, reject) =>
      canvas.toBlob((b) => (b ? resolve(b) : reject(new Error('Nie udało się zapisać zdjęcia.'))), 'image/jpeg', 0.85),
    );
    const stored: StoredImage = { id: newId(), slideId, caption: caption.trim(), blob, width, height, createdAt: new Date().toISOString() };
    await idbPut('images', stored);
    changed();
    return stored;
  } finally {
    image.done();
  }
}

export async function updateImage(id: string, patch: Partial<Pick<StoredImage, 'caption' | 'slideId'>>) {
  const current = await idbGet<StoredImage>('images', id);
  if (!current) return;
  await idbPut('images', { ...current, ...patch });
  changed();
}

export async function removeImage(id: string) {
  await idbDelete('images', id);
  changed();
}

export async function removeImagesOfSlide(slideId: string) {
  const all = await idbGetAll<StoredImage>('images');
  await Promise.all(all.filter((i) => i.slideId === slideId).map((i) => idbDelete('images', i.id)));
  changed();
}

export function useImages(): { images: StoredImage[]; loading: boolean } {
  const [images, setImages] = useState<StoredImage[]>([]);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    let alive = true;
    const load = () =>
      idbGetAll<StoredImage>('images')
        .then((list) => {
          if (alive) setImages(list.sort((a, b) => b.createdAt.localeCompare(a.createdAt)));
        })
        .catch(() => undefined)
        .finally(() => alive && setLoading(false));
    void load();
    window.addEventListener(EVENT, load);
    return () => {
      alive = false;
      window.removeEventListener(EVENT, load);
    };
  }, []);
  return { images, loading };
}

/** Tymczasowy adres obrazka do wyświetlenia (zwalniany po odmontowaniu). */
export function useObjectUrl(blob: Blob | null | undefined): string | null {
  const [url, setUrl] = useState<string | null>(null);
  useEffect(() => {
    if (!blob) {
      setUrl(null);
      return;
    }
    const next = URL.createObjectURL(blob);
    setUrl(next);
    return () => URL.revokeObjectURL(next);
  }, [blob]);
  return url;
}

function blobToBase64(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result).split(',')[1] ?? '');
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(blob);
  });
}

export async function exportImages(): Promise<ExportedImage[]> {
  const all = await idbGetAll<StoredImage>('images');
  return Promise.all(
    all.map(async (i) => ({
      id: i.id,
      slideId: i.slideId,
      caption: i.caption,
      width: i.width,
      height: i.height,
      createdAt: i.createdAt,
      type: i.blob.type || 'image/jpeg',
      data: await blobToBase64(i.blob),
    })),
  );
}

export async function importImages(list: unknown): Promise<number> {
  if (!Array.isArray(list)) return 0;
  let count = 0;
  for (const item of list) {
    if (!item || typeof item !== 'object') continue;
    const x = item as Partial<ExportedImage>;
    if (typeof x.id !== 'string' || typeof x.data !== 'string' || !/^image\//.test(x.type ?? '')) continue;
    const bytes = Uint8Array.from(atob(x.data), (c) => c.charCodeAt(0));
    await idbPut('images', {
      id: x.id,
      slideId: typeof x.slideId === 'string' ? x.slideId : null,
      caption: typeof x.caption === 'string' ? x.caption : '',
      blob: new Blob([bytes], { type: x.type }),
      width: Number(x.width) || 0,
      height: Number(x.height) || 0,
      createdAt: typeof x.createdAt === 'string' ? x.createdAt : new Date().toISOString(),
    } satisfies StoredImage);
    count += 1;
  }
  changed();
  return count;
}

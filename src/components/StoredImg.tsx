import { useObjectUrl, type StoredImage } from '../lib/images';

/** Obrazek z IndexedDB wyświetlany przez tymczasowy adres blob:. */
export default function StoredImg({ image, alt, className }: { image: StoredImage; alt: string; className?: string }) {
  const url = useObjectUrl(image.blob);
  if (!url) return <div className={`img-placeholder ${className ?? ''}`} aria-hidden />;
  return <img src={url} alt={alt} className={className} loading="lazy" width={image.width || undefined} height={image.height || undefined} />;
}

import { Fragment } from 'react';
import { Link } from 'react-router';

// Obsługiwane znaczniki w treściach: **pogrubienie** oraz [[slug-lekcji|tekst linku]].
const TOKEN = /(\*\*[^*]+\*\*|\[\[[^\]]+\]\])/g;

export function RichText({ text }: { text: string }) {
  const parts = text.split(TOKEN);
  return (
    <>
      {parts.map((part, index) => {
        if (part.startsWith('**') && part.endsWith('**')) {
          return <strong key={index}>{part.slice(2, -2)}</strong>;
        }
        if (part.startsWith('[[') && part.endsWith(']]')) {
          const [slug, label] = part.slice(2, -2).split('|');
          return (
            <Link key={index} to={`/wiedza/${slug}/`} className="inline-link">
              {label ?? slug}
            </Link>
          );
        }
        return <Fragment key={index}>{part}</Fragment>;
      })}
    </>
  );
}

/** Zwykły tekst bez znaczników — do wyszukiwania i liczenia słów. */
export function plainText(text: string): string {
  return text.replace(/\*\*/g, '').replace(/\[\[([^\]|]+)\|?([^\]]*)\]\]/g, (_m, slug: string, label: string) => label || slug);
}

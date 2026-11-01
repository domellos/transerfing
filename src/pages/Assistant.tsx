import { useEffect, useRef, useState } from 'react';
import { Link, useSearchParams } from 'react-router';
import { Bot, Eraser, LoaderCircle, SendHorizontal, UserRound } from 'lucide-react';
import { Callout, CrisisCard, EmptyState, PageHeader } from '../components/ui';
import { ApiError, apiRequest, useApiStatus } from '../lib/api';
import { containsCrisis } from '../lib/match';
import { Markdown } from '../lib/markdown';
import { useAccount, useAssistantChat } from '../state';
import { useTitle } from '../lib/hooks';
import { PRIVACY_IN, STATIC } from '../site';
import type { ChatMessage } from '../types';

const MAX_LENGTH = 1500;
const SUGGESTIONS = [
  'Jak obniżyć ważność przed jutrzejszą rozmową o pracę?',
  'Kłócę się z bratem o politykę. Co mówi o tym Transerfing?',
  'Od czego zacząć ustawianie kadrów, jeśli nic nie czuję przy warkoczu?',
  'Jak odróżnić swój cel od cudzego?',
];

export default function Assistant() {
  useTitle('Asystent AI');
  const { status, loading } = useApiStatus();
  const [account] = useAccount();
  const [chat, setChat] = useAssistantChat();
  const [params, setParams] = useSearchParams();
  const [input, setInput] = useState('');
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [remaining, setRemaining] = useState<number | null>(null);
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const q = params.get('q');
    if (q) {
      setInput(q.slice(0, MAX_LENGTH));
      const next = new URLSearchParams(params);
      next.delete('q');
      setParams(next, { replace: true });
    }
  }, [params, setParams]);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' });
  }, [chat.length, sending]);

  const needsAccount = Boolean(status?.aiRequiresAccount) && !account;
  const available = Boolean(status?.ai);
  const crisis = containsCrisis(input) || chat.some((m) => m.role === 'user' && containsCrisis(m.content));

  const send = async (text: string) => {
    const content = text.trim().slice(0, MAX_LENGTH);
    if (!content || sending) return;
    const userMessage: ChatMessage = { role: 'user', content, at: new Date().toISOString() };
    const history = [...chat, userMessage];
    setChat(history);
    setInput('');
    setSending(true);
    setError(null);
    try {
      const response = await apiRequest<{ reply: string; remaining?: number }>('ai.php', {
        body: { messages: history.slice(-10).map(({ role, content: c }) => ({ role, content: c })) },
        token: account?.token,
      });
      setChat([...history, { role: 'assistant', content: response.reply, at: new Date().toISOString() }]);
      if (typeof response.remaining === 'number') setRemaining(response.remaining);
    } catch (e) {
      setError(e instanceof ApiError || e instanceof Error ? e.message : 'Nie udało się uzyskać odpowiedzi.');
      setChat(history);
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="page narrow">
      <PageHeader
        icon="bot"
        title="Asystent AI"
        lead="Opisz swoją sytuację, a asystent podpowie, które zasady Transerfingu mogą pomóc i od czego zacząć. Odpowiada na podstawie lekcji z tego serwisu."
      />

      {loading ? (
        <p className="muted">Sprawdzam dostępność asystenta…</p>
      ) : !available ? (
        STATIC ? (
          <EmptyState icon="bot" title="Asystent działa tylko w wersji z serwerem">
            Ta kopia serwisu nie ma serwera, więc asystent AI jest niedostępny. Skorzystaj z <Link to="/nawigator/">Nawigatora</Link>, który działa
            bez internetu.
          </EmptyState>
        ) : (
          <EmptyState icon="bot" title="Asystent nie jest jeszcze włączony na tym serwerze">
            {status?.private ? 'Wpisz klucz do usługi AI w pliku config.php na serwerze (instrukcja w README).' : 'Właściciel serwisu musi podłączyć klucz do usługi AI.'}{' '}
            Do tego czasu skorzystaj z <Link to="/nawigator/">Nawigatora</Link>, który działa bez internetu.
          </EmptyState>
        )
      ) : needsAccount ? (
        <EmptyState icon="lock" title="Asystent jest dostępny dla zalogowanych">
          {status?.private ? (
            <>
              <Link to="/konto/">Zaloguj się na swoje konto</Link>. W wersji prywatnej asystent odpowiada tylko tobie.
            </>
          ) : (
            <>
              <Link to="/konto/">Zaloguj się albo załóż darmowe konto</Link>. Limit pytań chroni serwis przed nadużyciami.
            </>
          )}
        </EmptyState>
      ) : (
        <>
          <Callout tone="info">
            Odpowiedzi tworzy model AI. Mogą zawierać błędy i nie zastępują porady lekarza, psychologa ani prawnika. Treść pytań trafia do
            zewnętrznego dostawcy AI, więc nie wpisuj danych, których nie chcesz udostępniać. Szczegóły w{' '}
            <Link to="/prywatnosc/">{PRIVACY_IN}</Link>.
          </Callout>

          {crisis && <CrisisCard />}

          <div className="chat" aria-live="polite">
            {chat.length === 0 && (
              <div className="chat-suggestions">
                <p className="muted small">Przykładowe pytania:</p>
                <div className="chips">
                  {SUGGESTIONS.map((s) => (
                    <button key={s} type="button" className="chip" onClick={() => void send(s)}>
                      {s}
                    </button>
                  ))}
                </div>
              </div>
            )}
            {chat.map((m, i) => (
              <div key={i} className={`chat-msg chat-${m.role}`}>
                <span className="chat-avatar" aria-hidden>
                  {m.role === 'user' ? <UserRound size={18} /> : <Bot size={18} />}
                </span>
                <div className="chat-bubble">
                  <span className="sr-only">{m.role === 'user' ? 'Ty:' : 'Asystent:'}</span>
                  {m.role === 'assistant' ? <Markdown text={m.content} /> : <p>{m.content}</p>}
                </div>
              </div>
            ))}
            {sending && (
              <div className="chat-msg chat-assistant">
                <span className="chat-avatar" aria-hidden>
                  <Bot size={18} />
                </span>
                <div className="chat-bubble muted">
                  <LoaderCircle size={16} className="spin" aria-hidden /> Asystent pisze…
                </div>
              </div>
            )}
            <div ref={endRef} />
          </div>

          {error && (
            <p className="error-note" role="alert">
              {error}
            </p>
          )}

          <form
            className="chat-form"
            onSubmit={(e) => {
              e.preventDefault();
              void send(input);
            }}
          >
            <textarea
              rows={3}
              value={input}
              maxLength={MAX_LENGTH}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  void send(input);
                }
              }}
              placeholder="Napisz, co się dzieje albo o co chcesz zapytać…"
              aria-label="Twoja wiadomość"
            />
            <div className="form-actions">
              <button type="submit" className="btn btn-primary" disabled={!input.trim() || sending}>
                <SendHorizontal size={18} aria-hidden /> Wyślij
              </button>
              {chat.length > 0 && (
                <button type="button" className="btn btn-ghost" onClick={() => setChat([])} disabled={sending}>
                  <Eraser size={18} aria-hidden /> Nowa rozmowa
                </button>
              )}
              <span className="muted small">
                {input.length}/{MAX_LENGTH}
                {remaining !== null ? ` · pozostało dziś: ${remaining}` : ''}
              </span>
            </div>
          </form>
        </>
      )}
    </div>
  );
}

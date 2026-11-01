import { useState, type FormEvent } from 'react';
import { Link } from 'react-router';
import { Cloud, KeyRound, LoaderCircle, LogOut, RefreshCw, ShieldCheck, Trash2 } from 'lucide-react';
import { Callout, EmptyState, PageHeader } from '../components/ui';
import { useApiStatus } from '../lib/api';
import { normalizeUsername, validUsername } from '../lib/crypto';
import { changeAccountPassword, deleteAccount, loginAccount, logoutAccount, registerAccount, resolveFirstSync, syncNow } from '../lib/sync';
import { clearAll } from '../lib/storage';
import { formatDateTime } from '../lib/date';
import { useAccount, useSyncStatus } from '../state';
import { useTitle } from '../lib/hooks';

const MIN_PASSWORD = 10;

function errorText(error: unknown): string {
  return error instanceof Error ? error.message : 'Coś poszło nie tak. Spróbuj ponownie.';
}

/** Ukryty login w formularzach z samym hasłem: menedżery haseł wiedzą wtedy, którego konta dotyczy hasło. */
function UsernameHint({ username }: { username: string }) {
  return <input type="text" name="username" autoComplete="username" value={username} readOnly hidden aria-hidden="true" tabIndex={-1} />;
}

function AuthForms({ accountsEnabled, startWithRegister, onChoice }: { accountsEnabled: boolean; startWithRegister: boolean; onChoice: () => void }) {
  const [mode, setMode] = useState<'login' | 'register'>(startWithRegister ? 'register' : 'login');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [password2, setPassword2] = useState('');
  const [understood, setUnderstood] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    setError(null);
    const login = normalizeUsername(username);
    if (!validUsername(login)) {
      setError('Login: 3–32 znaki, małe litery bez polskich znaków, cyfry, kropka, myślnik lub podkreślnik.');
      return;
    }
    if (mode === 'register') {
      if (password.length < MIN_PASSWORD) return setError(`Hasło musi mieć co najmniej ${MIN_PASSWORD} znaków.`);
      if (password !== password2) return setError('Hasła się różnią.');
      if (!understood) return setError('Potwierdź, że rozumiesz, iż zapomnianego hasła nie da się odzyskać.');
    }
    setBusy(true);
    try {
      if (mode === 'register') await registerAccount(login, password);
      else {
        const result = await loginAccount(login, password);
        if (result.needsChoice) onChoice();
      }
      setPassword('');
      setPassword2('');
    } catch (e) {
      setError(errorText(e));
    } finally {
      setBusy(false);
    }
  };

  return (
    <section className="card form">
      <div className="segmented segmented-wide" role="tablist" aria-label="Logowanie lub rejestracja">
        <button type="button" role="tab" aria-selected={mode === 'login'} className={mode === 'login' ? 'is-active' : ''} onClick={() => setMode('login')}>
          Zaloguj się
        </button>
        <button type="button" role="tab" aria-selected={mode === 'register'} className={mode === 'register' ? 'is-active' : ''} onClick={() => setMode('register')} disabled={!accountsEnabled}>
          Załóż konto
        </button>
      </div>
      <form onSubmit={(e) => void submit(e)}>
        <div className="field">
          <label className="field-label" htmlFor="acc-user">
            Login
          </label>
          <input id="acc-user" type="text" autoComplete="username" value={username} onChange={(e) => setUsername(e.target.value)} maxLength={32} required />
          {mode === 'register' && <p className="field-hint">Nie musi to być e-mail. Nie podawaj imienia i nazwiska, jeśli nie chcesz.</p>}
        </div>
        <div className="field">
          <label className="field-label" htmlFor="acc-pass">
            Hasło
          </label>
          <input id="acc-pass" type="password" autoComplete={mode === 'login' ? 'current-password' : 'new-password'} value={password} onChange={(e) => setPassword(e.target.value)} required />
        </div>
        {mode === 'register' && (
          <>
            <div className="field">
              <label className="field-label" htmlFor="acc-pass2">
                Powtórz hasło
              </label>
              <input id="acc-pass2" type="password" autoComplete="new-password" value={password2} onChange={(e) => setPassword2(e.target.value)} required />
            </div>
            <label className="check">
              <input type="checkbox" checked={understood} onChange={(e) => setUnderstood(e.target.checked)} />
              <span>Rozumiem, że dane są szyfrowane moim hasłem i po jego zapomnieniu nikt nie odzyska kopii z serwera.</span>
            </label>
          </>
        )}
        {error && (
          <p className="error-note" role="alert">
            {error}
          </p>
        )}
        <div className="form-actions">
          <button type="submit" className="btn btn-primary" disabled={busy}>
            {busy ? <LoaderCircle size={18} className="spin" aria-hidden /> : <KeyRound size={18} aria-hidden />}
            {busy ? 'Tworzę klucze szyfrowania…' : mode === 'login' ? 'Zaloguj się' : 'Załóż konto'}
          </button>
        </div>
      </form>
    </section>
  );
}

export default function Account() {
  useTitle('Konto i synchronizacja');
  const { status, loading } = useApiStatus();
  const [account] = useAccount();
  const [sync] = useSyncStatus();
  const [choice, setChoice] = useState(false);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [oldPass, setOldPass] = useState('');
  const [newPass, setNewPass] = useState('');
  const [newPass2, setNewPass2] = useState('');
  const [deletePass, setDeletePass] = useState('');
  const [unlockPass, setUnlockPass] = useState('');
  const [clearOnLogout, setClearOnLogout] = useState(false);

  const run = async (action: () => Promise<void>, success?: string) => {
    setBusy(true);
    setError(null);
    setMessage(null);
    try {
      await action();
      if (success) setMessage(success);
    } catch (e) {
      setError(errorText(e));
    } finally {
      setBusy(false);
    }
  };

  const explanation = (
    <Callout tone="info" title="Jak chronimy twoje dane">
      <p>
        <ShieldCheck size={16} aria-hidden className="inline-icon" /> Dziennik, slajdy, kadry i postępy są szyfrowane w twojej przeglądarce kluczem
        utworzonym z twojego hasła (AES-256, PBKDF2 600 000 iteracji). Serwer przechowuje tylko zaszyfrowaną kopię i nie zna hasła, więc nie może odczytać
        twoich wpisów. Zdjęcia z tablicy wizji zostają na urządzeniu.
      </p>
    </Callout>
  );

  if (loading) return <div className="page narrow"><p className="muted">Sprawdzam dostępność kont…</p></div>;

  if (!status) {
    return (
      <div className="page narrow">
        <PageHeader icon="user" title="Konto i synchronizacja" />
        <EmptyState icon="lock" title="Konta działają tylko na serwerze z PHP">
          Ta kopia serwisu nie ma połączenia z API. Twoje dane są bezpieczne w tej przeglądarce, a na inne urządzenie przeniesiesz je przez{' '}
          <Link to="/ustawienia/">kopię zapasową</Link>.
        </EmptyState>
      </div>
    );
  }

  return (
    <div className="page narrow">
      <PageHeader
        icon="user"
        title="Konto i synchronizacja"
        lead={
          status.private
            ? 'Twoje konto pozwala mieć ten sam dziennik i postępy na telefonie i komputerze. Zmiany łączą się automatycznie: wpisy z obu urządzeń się sumują, a usunięte nie wracają.'
            : 'Konto jest opcjonalne. Pozwala mieć ten sam dziennik i postępy na telefonie i komputerze. Zmiany łączą się automatycznie: wpisy z obu urządzeń się sumują, a usunięte nie wracają.'
        }
      />

      {!account && !status.accounts && (
        <Callout tone="warn">
          {status.private
            ? 'To prywatna wersja serwisu i konto właściciela już istnieje. Zaloguj się na nie na każdym swoim urządzeniu.'
            : 'Zakładanie nowych kont jest na tym serwerze wyłączone. Jeśli masz już konto, możesz się zalogować.'}
        </Callout>
      )}

      {!account && status.accounts && status.private && (
        <Callout tone="tip" title="Wersja prywatna">
          Pierwsze założone konto zostaje kontem właściciela, a rejestracja zamyka się na stałe. Na pozostałych urządzeniach tylko się logujesz.
        </Callout>
      )}

      {explanation}

      {!account ? (
        <>
          {message && (
            <p className="saved-note" role="status">
              {message}
            </p>
          )}
          <AuthForms accountsEnabled={status.accounts} startWithRegister={Boolean(status.private && status.accounts)} onChoice={() => setChoice(true)} />
        </>
      ) : (
        <>
          {choice && (
            <section className="card practice-card" role="alertdialog" aria-label="Dane na koncie i na urządzeniu">
              <h2 className="card-title">Na koncie i na tym urządzeniu są dane</h2>
              <p>Co zrobić z danymi z tego urządzenia?</p>
              <div className="form-actions">
                <button type="button" className="btn btn-primary" disabled={busy} onClick={() => void run(async () => { await resolveFirstSync('merge'); setChoice(false); }, 'Dane zostały połączone.')}>
                  Połącz dane (zalecane)
                </button>
                <button
                  type="button"
                  className="btn"
                  disabled={busy}
                  onClick={() => {
                    if (window.confirm('Usunąć dane z tego urządzenia i pobrać dane z konta?')) void run(async () => { await resolveFirstSync('replace-local'); setChoice(false); }, 'Pobrano dane z konta.');
                  }}
                >
                  Zastąp je danymi z konta
                </button>
              </div>
            </section>
          )}

          <section className="card">
            <div className="card-head">
              <h2 className="card-title">
                <Cloud size={18} aria-hidden className="inline-icon" /> {account.username}
              </h2>
              <span className={`badge ${sync.state === 'error' || sync.state === 'locked' ? 'badge-bad' : sync.state === 'idle' && sync.lastSyncAt ? 'badge-good' : ''}`}>
                {sync.state === 'syncing' ? 'synchronizuję…' : sync.state === 'error' ? 'błąd' : sync.state === 'locked' ? 'zablokowane' : sync.lastSyncAt ? 'zsynchronizowane' : 'oczekuje'}
              </span>
            </div>
            <p className="muted small">
              {sync.lastSyncAt ? `Ostatnia synchronizacja: ${formatDateTime(sync.lastSyncAt)} · wersja ${sync.version}` : 'Jeszcze nie synchronizowano.'}
            </p>
            {sync.error && <p className="error-note">{sync.error}</p>}
            {sync.state === 'locked' && (
              <form
                className="add-row"
                onSubmit={(e) => {
                  e.preventDefault();
                  void run(async () => {
                    const result = await loginAccount(account.username, unlockPass);
                    setUnlockPass('');
                    if (result.needsChoice) await resolveFirstSync('merge');
                  }, 'Synchronizacja odblokowana.');
                }}
              >
                <UsernameHint username={account.username} />
                <input type="password" autoComplete="current-password" value={unlockPass} onChange={(e) => setUnlockPass(e.target.value)} placeholder="Hasło do konta" aria-label="Hasło do konta" />
                <button type="submit" className="btn btn-primary" disabled={busy || !unlockPass}>
                  Odblokuj
                </button>
              </form>
            )}
            <div className="form-actions">
              <button type="button" className="btn btn-primary" disabled={busy || sync.state === 'syncing'} onClick={() => void run(() => syncNow())}>
                <RefreshCw size={18} aria-hidden /> Synchronizuj teraz
              </button>
              <label className="check small">
                <input type="checkbox" checked={clearOnLogout} onChange={(e) => setClearOnLogout(e.target.checked)} />
                <span>Przy wylogowaniu usuń dane z tego urządzenia</span>
              </label>
              <button
                type="button"
                className="btn btn-ghost"
                disabled={busy}
                onClick={() =>
                  void run(async () => {
                    await logoutAccount();
                    if (clearOnLogout) clearAll();
                  }, 'Wylogowano.')
                }
              >
                <LogOut size={18} aria-hidden /> Wyloguj
              </button>
            </div>
            {message && (
              <p className="saved-note" role="status">
                {message}
              </p>
            )}
            {error && (
              <p className="error-note" role="alert">
                {error}
              </p>
            )}
          </section>

          <details className="card details">
            <summary>Zmień hasło</summary>
            <form
              className="form"
              onSubmit={(e) => {
                e.preventDefault();
                if (newPass.length < MIN_PASSWORD) return setError(`Nowe hasło musi mieć co najmniej ${MIN_PASSWORD} znaków.`);
                if (newPass !== newPass2) return setError('Nowe hasła się różnią.');
                void run(async () => {
                  await changeAccountPassword(oldPass, newPass);
                  setOldPass('');
                  setNewPass('');
                  setNewPass2('');
                }, 'Hasło zostało zmienione, a kopia zaszyfrowana nowym kluczem. Na innych urządzeniach zaloguj się ponownie.');
              }}
            >
              <UsernameHint username={account.username} />
              <div className="field">
                <label className="field-label" htmlFor="old-pass">
                  Obecne hasło
                </label>
                <input id="old-pass" type="password" autoComplete="current-password" value={oldPass} onChange={(e) => setOldPass(e.target.value)} required />
              </div>
              <div className="field">
                <label className="field-label" htmlFor="new-pass">
                  Nowe hasło
                </label>
                <input id="new-pass" type="password" autoComplete="new-password" value={newPass} onChange={(e) => setNewPass(e.target.value)} required />
              </div>
              <div className="field">
                <label className="field-label" htmlFor="new-pass2">
                  Powtórz nowe hasło
                </label>
                <input id="new-pass2" type="password" autoComplete="new-password" value={newPass2} onChange={(e) => setNewPass2(e.target.value)} required />
              </div>
              <button type="submit" className="btn" disabled={busy}>
                <KeyRound size={18} aria-hidden /> Zmień hasło
              </button>
            </form>
          </details>

          <details className="card details">
            <summary>Usuń konto</summary>
            <p className="muted small">
              Usuniemy konto, zaszyfrowaną kopię i wszystkie sesje z serwera. Dane na tym urządzeniu zostaną. Tej operacji nie można cofnąć.
            </p>
            <form
              className="add-row"
              onSubmit={(e) => {
                e.preventDefault();
                if (!window.confirm('Na pewno usunąć konto i kopię z serwera?')) return;
                void run(async () => {
                  await deleteAccount(deletePass);
                  setDeletePass('');
                }, 'Konto zostało usunięte.');
              }}
            >
              <UsernameHint username={account.username} />
              <input type="password" autoComplete="current-password" value={deletePass} onChange={(e) => setDeletePass(e.target.value)} placeholder="Hasło do konta" aria-label="Hasło do konta" />
              <button type="submit" className="btn btn-danger" disabled={busy || !deletePass}>
                <Trash2 size={18} aria-hidden /> Usuń konto
              </button>
            </form>
          </details>
        </>
      )}
    </div>
  );
}

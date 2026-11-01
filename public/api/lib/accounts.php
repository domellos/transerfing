<?php
declare(strict_types=1);

/**
 * Konta: rejestracja, logowanie, wylogowanie, zmiana hasła, usunięcie konta.
 *
 * Przeglądarka nigdy nie wysyła hasła. Wysyła „klucz logowania” wyprowadzony z hasła
 * (PBKDF2 600 000 iteracji + HKDF), a serwer przechowuje tylko jego skrót bcrypt.
 * Klucz szyfrowania danych powstaje z hasła osobno i nie opuszcza przeglądarki.
 */

if (!defined('TS_API')) {
    http_response_code(404);
    exit;
}

require_once __DIR__ . '/vault.php';

function ts_handle_auth(TsRequest $request): array
{
    ts_require_method($request, 'POST');
    return match ($request->action()) {
        'register' => ts_auth_register($request),
        'login' => ts_auth_login($request),
        'logout' => ts_auth_logout($request),
        'change_password' => ts_auth_change_password($request),
        'delete' => ts_auth_delete($request),
        default => throw new TsHttpError(400, 'Nieznana operacja.'),
    };
}

function ts_auth_key(mixed $value): string
{
    $key = ts_str($value);
    if (!preg_match('/^[A-Za-z0-9_-]{43}$/', $key)) {
        throw new TsHttpError(400, 'Nieprawidłowe dane logowania.');
    }
    return $key;
}

function ts_username(mixed $value): string
{
    $username = strtolower(trim(ts_str($value)));
    if (!preg_match('/^[a-z0-9][a-z0-9._-]{2,31}$/', $username)) {
        throw new TsHttpError(400, 'Login: 3–32 znaki, małe litery bez polskich znaków, cyfry, kropka, myślnik lub podkreślnik.');
    }
    return $username;
}

function ts_auth_response(int $userId, string $username, int $createdAt): array
{
    return ['token' => ts_create_session($userId), 'username' => $username, 'createdAt' => gmdate('c', $createdAt)];
}

/** Czy można teraz założyć konto (włączone i poniżej limitu kont). */
function ts_registration_open(): bool
{
    $config = ts_config();
    if (!$config['accounts_enabled']) {
        return false;
    }
    $max = max(0, (int) $config['accounts_max']);
    return $max === 0 || (int) ts_query('SELECT COUNT(*) FROM users')->fetchColumn() < $max;
}

function ts_auth_register(TsRequest $request): array
{
    $config = ts_config();
    if (!$config['accounts_enabled']) {
        throw new TsHttpError(403, 'Zakładanie nowych kont jest na tym serwerze wyłączone.');
    }
    $username = ts_username($request->input('username'));
    $auth = ts_auth_key($request->input('auth'));
    ts_rate_hit('register', ts_ip_hash($request), 5, 3600, 'Z tego łącza założono już kilka kont. Spróbuj ponownie za godzinę.');
    ts_rate_hit('register-all', 'all', max(1, (int) $config['accounts_daily_limit']), 86400, 'Na dziś wyczerpano limit nowych kont. Spróbuj jutro.');
    $hash = password_hash($auth, PASSWORD_BCRYPT, TS_BCRYPT);
    $now = ts_now();
    $max = max(0, (int) $config['accounts_max']);
    $private = (bool) $config['private_mode'];
    return ts_transaction(static function (PDO $db) use ($username, $hash, $now, $max, $private): array {
        // Limit kont sprawdzamy w transakcji: dwie równoczesne rejestracje nie przekroczą go razem.
        if ($max > 0 && (int) ts_query('SELECT COUNT(*) FROM users')->fetchColumn() >= $max) {
            throw new TsHttpError(403, $private
                ? 'To prywatna wersja serwisu i konto właściciela już istnieje. Zaloguj się na nie.'
                : 'Na tym serwerze nie można już zakładać nowych kont.');
        }
        if (ts_query('SELECT 1 FROM users WHERE username = ?', [$username])->fetchColumn()) {
            throw new TsHttpError(409, 'Ten login jest już zajęty. Wybierz inny albo zaloguj się.');
        }
        ts_query('INSERT INTO users (username, auth_hash, created_at, last_seen) VALUES (?, ?, ?, ?)', [$username, $hash, $now, $now]);
        return ts_auth_response((int) $db->lastInsertId(), $username, $now);
    });
}

function ts_auth_login(TsRequest $request): array
{
    $username = ts_username($request->input('username'));
    $auth = ts_auth_key($request->input('auth'));
    $ipHash = ts_ip_hash($request);
    if (ts_rate_count('login-fail', $ipHash, 900) >= 10 || ts_rate_count('login-user', $username, 3600) >= 20) {
        throw new TsHttpError(429, 'Zbyt wiele nieudanych prób logowania. Spróbuj ponownie za kwadrans.', ['retryAfter' => 900]);
    }
    $user = ts_query('SELECT id, auth_hash, created_at FROM users WHERE username = ?', [$username])->fetch() ?: null;
    $valid = password_verify($auth, $user['auth_hash'] ?? TS_DUMMY_HASH) && $user !== null;
    if (!$valid) {
        ts_rate_add('login-fail', $ipHash, 900);
        ts_rate_add('login-user', $username, 3600);
        throw new TsHttpError(401, 'Nieprawidłowy login lub hasło.');
    }
    $userId = (int) $user['id'];
    if (password_needs_rehash((string) $user['auth_hash'], PASSWORD_BCRYPT, TS_BCRYPT)) {
        ts_query('UPDATE users SET auth_hash = ? WHERE id = ?', [password_hash($auth, PASSWORD_BCRYPT, TS_BCRYPT), $userId]);
    }
    ts_query('UPDATE users SET last_seen = ? WHERE id = ?', [ts_now(), $userId]);
    return ts_auth_response($userId, $username, (int) $user['created_at']);
}

function ts_auth_logout(TsRequest $request): array
{
    $token = ts_token_from($request);
    if ($token !== null) {
        ts_query('DELETE FROM sessions WHERE token_hash = ?', [hash('sha256', $token)]);
    }
    return ['ok' => true];
}

/** Sprawdza hasło (klucz logowania) zalogowanej osoby przed operacjami nieodwracalnymi. */
function ts_auth_confirm(array $session, mixed $auth, string $message): void
{
    $key = ts_auth_key($auth);
    ts_rate_hit('confirm', 'u' . (int) $session['user_id'], 10, 3600, 'Zbyt wiele prób. Spróbuj ponownie za godzinę.');
    if (!password_verify($key, (string) $session['auth_hash'])) {
        throw new TsHttpError(403, $message);
    }
}

/**
 * Zmiana hasła. Przeglądarka odszyfrowuje kopię starym kluczem i wysyła ją zaszyfrowaną nowym.
 * Kopia i skrót klucza zmieniają się w jednej transakcji, a wszystkie inne sesje są wylogowywane.
 */
function ts_auth_change_password(TsRequest $request): array
{
    $session = ts_session($request);
    ts_auth_confirm($session, $request->input('auth'), 'Obecne hasło jest nieprawidłowe.');
    $newHash = password_hash(ts_auth_key($request->input('newAuth')), PASSWORD_BCRYPT, TS_BCRYPT);
    $baseVersion = ts_int($request->input('baseVersion'));
    [$iv, $data] = ts_vault_payload($request);
    $userId = (int) $session['user_id'];
    return ts_transaction(static function () use ($userId, $baseVersion, $iv, $data, $newHash, $session): array {
        $version = ts_vault_write($userId, $baseVersion, $iv, $data);
        ts_query('UPDATE users SET auth_hash = ? WHERE id = ?', [$newHash, $userId]);
        ts_query('DELETE FROM sessions WHERE user_id = ?', [$userId]);
        return ['token' => ts_create_session($userId), 'username' => (string) $session['username'], 'version' => $version];
    });
}

function ts_auth_delete(TsRequest $request): array
{
    $session = ts_session($request);
    ts_auth_confirm($session, $request->input('auth'), 'Nieprawidłowe hasło.');
    ts_delete_user((int) $session['user_id']);
    return ['ok' => true];
}

function ts_delete_user(int $userId): void
{
    ts_transaction(static function () use ($userId): void {
        ts_query('DELETE FROM vaults WHERE user_id = ?', [$userId]);
        ts_query('DELETE FROM sessions WHERE user_id = ?', [$userId]);
        ts_query('DELETE FROM ai_usage WHERE subject = ?', ['u:' . $userId]);
        ts_query('DELETE FROM users WHERE id = ?', [$userId]);
    });
}

<?php
declare(strict_types=1);

/** Stan usług, zadania okresowe (cron) i diagnostyka serwera. */

if (!defined('TS_API')) {
    http_response_code(404);
    exit;
}

require_once __DIR__ . '/accounts.php';
require_once __DIR__ . '/webpush.php';
require_once __DIR__ . '/assistant.php';

function ts_handle_status(TsRequest $request): array
{
    ts_require_method($request, 'GET');
    $config = ts_config();
    ts_record_origin($request);
    if (random_int(1, 50) === 1) {
        // Bez crona też sprzątamy liczniki i skróty IP (najwyżej doba).
        ts_cleanup_light();
    }
    return [
        'ok' => true,
        'version' => TS_VERSION,
        'private' => (bool) $config['private_mode'],
        'accounts' => ts_registration_open(),
        'push' => ts_push_available(),
        'pushRequiresAccount' => (bool) $config['push_require_account'],
        'ai' => ts_ai_configured(),
        'aiRequiresAccount' => (bool) $config['ai_require_account'],
        'aiDailyLimit' => (int) $config['ai_daily_limit_user'],
        'vapidPublicKey' => ts_push_configured() ? (string) $config['vapid_public'] : null,
        'admin' => ['name' => trim((string) $config['admin_name']), 'email' => trim((string) $config['admin_email'])],
    ];
}

/** Liczniki limitów i dzienne skróty IP: najwyżej doba. */
function ts_cleanup_light(): array
{
    $today = ts_today();
    return [
        'rate' => ts_query('DELETE FROM rate WHERE expires_at < ?', [ts_now()])->rowCount(),
        'ai_usage' => ts_query("DELETE FROM ai_usage WHERE (subject <> 'total' AND day < ?) OR day < ?", [$today, ts_today(-30)])->rowCount(),
    ];
}

/** Sprzątanie: wygasłe sesje (180 dni bez użycia) i konta nieużywane od 24 miesięcy. */
function ts_cleanup(): array
{
    $now = ts_now();
    $stats = ts_cleanup_light();
    $stats['sessions'] = ts_query('DELETE FROM sessions WHERE last_used < ?', [$now - TS_SESSION_TTL])->rowCount();
    $inactive = ts_query('SELECT id FROM users WHERE last_seen < ?', [$now - TS_INACTIVE_TTL])->fetchAll(PDO::FETCH_COLUMN);
    foreach ($inactive as $id) {
        ts_delete_user((int) $id);
    }
    $stats['users'] = count($inactive);
    return $stats;
}

/** Zadanie cron (co 5 minut): powiadomienia push i sprzątanie. */
function ts_cron_main(array $argv): int
{
    $verbose = in_array('--verbose', $argv, true) || in_array('-v', $argv, true);
    $lock = fopen(ts_data_dir() . '/cron.lock', 'c');
    if ($lock === false || !flock($lock, LOCK_EX | LOCK_NB)) {
        if ($verbose) {
            echo "Poprzednie zadanie jeszcze działa.\n";
        }
        return 0;
    }
    try {
        ts_meta_set('cron_last_run', (string) ts_now());
        $push = ts_push_run();
        $cleanup = ts_cleanup();
        if ($verbose) {
            echo 'Powiadomienia: ' . json_encode($push) . "\nSprzątanie: " . json_encode($cleanup) . "\n";
        }
        return 0;
    } catch (Throwable $e) {
        ts_log('cron', get_class($e) . ': ' . $e->getMessage() . ' (' . basename($e->getFile()) . ':' . $e->getLine() . ')');
        fwrite(STDERR, 'Błąd: ' . $e->getMessage() . "\n");
        return 1;
    } finally {
        flock($lock, LOCK_UN);
        fclose($lock);
    }
}

/**
 * Sprawdza konfigurację serwera. Zwraca listę [stan, nazwa, szczegóły], stan: ok | uwaga | błąd.
 * Nie pokazuje sekretów (klucza API, kluczy prywatnych).
 */
function ts_diagnostics(bool $testAi = false): array
{
    $checks = [];
    $add = static function (string $state, string $label, string $detail = '') use (&$checks): void {
        $checks[] = [$state, $label, $detail];
    };

    $add(PHP_VERSION_ID >= 80100 ? 'ok' : 'błąd', 'PHP ' . PHP_VERSION, PHP_VERSION_ID >= 80100 ? '' : 'Wymagane PHP 8.1 lub nowsze.');
    $add(extension_loaded('pdo_sqlite') ? 'ok' : 'błąd', 'Rozszerzenie pdo_sqlite', extension_loaded('pdo_sqlite') ? '' : 'Bez niego nie działają konta, push ani limity.');
    $add(extension_loaded('openssl') ? 'ok' : 'uwaga', 'Rozszerzenie openssl', extension_loaded('openssl') ? '' : 'Potrzebne do powiadomień push.');
    $add(extension_loaded('curl') ? 'ok' : 'uwaga', 'Rozszerzenie curl', extension_loaded('curl') ? '' : 'Potrzebne do powiadomień push i asystenta AI.');

    try {
        $dir = ts_data_dir();
        $add(is_writable($dir) ? 'ok' : 'błąd', 'Katalog danych', $dir . (is_writable($dir) ? '' : ' (brak prawa zapisu)'));
        $config = ts_config();
        $add('ok', 'Plik konfiguracji', $dir . '/config.php');
    } catch (Throwable $e) {
        $add('błąd', 'Katalog danych lub konfiguracja', $e->getMessage());
        return $checks;
    }

    try {
        $db = ts_db();
        $count = static fn (string $table): int => (int) $db->query('SELECT COUNT(*) FROM ' . $table)->fetchColumn();
        $add('ok', 'Baza SQLite', sprintf('konta: %d, kopie: %d, subskrypcje push: %d', $count('users'), $count('vaults'), $count('push_subs')));
    } catch (Throwable $e) {
        $add('błąd', 'Baza SQLite', $e->getMessage());
        return $checks;
    }

    if ($config['private_mode']) {
        $owner = ts_query('SELECT username FROM users ORDER BY id LIMIT 1')->fetchColumn();
        $add('ok', 'Wersja prywatna', $owner !== false
            ? 'konto właściciela: ' . $owner . ($config['accounts_max'] > 0 ? ', rejestracja zamknięta' : '')
            : 'czeka na założenie konta właściciela (zakładka Konto)');
    } else {
        $hasAdmin = trim((string) $config['admin_name']) !== '' && trim((string) $config['admin_email']) !== '';
        $add($hasAdmin ? 'ok' : 'uwaga', 'Administrator danych (RODO)', $hasAdmin ? $config['admin_name'] . ', ' . $config['admin_email'] : 'Uzupełnij admin_name i admin_email w config.php.');
        $add(
            $config['accounts_enabled'] && !$hasAdmin ? 'uwaga' : 'ok',
            'Konta i synchronizacja',
            ($config['accounts_enabled'] ? 'włączone' : 'wyłączone (accounts_enabled)') . ($config['accounts_enabled'] && !$hasAdmin ? ', ale brakuje danych administratora' : ''),
        );
    }

    $site = ts_site_url();
    $add($site !== '' ? 'ok' : 'uwaga', 'Adres serwisu', $site !== '' ? $site : 'Jeszcze nieznany: otwórz serwis przez https albo ustaw site_url.');

    if (!$config['push_enabled']) {
        $add('ok', 'Powiadomienia push', 'wyłączone (push_enabled)');
    } elseif (!ts_push_configured()) {
        $add('błąd', 'Powiadomienia push', 'Brak kluczy VAPID albo rozszerzeń openssl/curl. Nowe klucze do wklejenia w config.php wygeneruje: php diagnostyka.php --vapid');
    } else {
        try {
            $jwt = ts_vapid_jwt('https://fcm.googleapis.com');
            [$header, $claims, $signature] = explode('.', $jwt);
            $public = openssl_pkey_get_details(openssl_pkey_get_private((string) $config['vapid_private_pem']))['key'] ?? '';
            $raw = (string) ts_b64url_decode($signature);
            $der = ts_raw_to_der($raw);
            $valid = openssl_verify($header . '.' . $claims, $der, $public, OPENSSL_ALGO_SHA256) === 1;
            $add($valid ? 'ok' : 'błąd', 'Klucze VAPID', $valid ? 'podpis działa, kontakt: ' . ts_vapid_subject() : 'Podpis nie przechodzi weryfikacji.');
        } catch (Throwable $e) {
            $add('błąd', 'Klucze VAPID', $e->getMessage());
        }
        $last = (int) (ts_meta_get('cron_last_run') ?? 0);
        $ago = $last > 0 ? ts_now() - $last : null;
        $add(
            $ago !== null && $ago < 1800 ? 'ok' : 'uwaga',
            'Zadanie cron',
            $ago === null ? 'Jeszcze nie uruchomiono. Dodaj zadanie co 5 minut (README). Bez niego przycisk powiadomień jest ukryty.' : 'ostatnio ' . intdiv($ago, 60) . ' min temu',
        );
    }

    if (!$config['ai_enabled']) {
        $add('ok', 'Asystent AI', 'wyłączony (ai_enabled)');
    } elseif (!ts_ai_configured()) {
        $add('błąd', 'Asystent AI', 'Uzupełnij ai_key i ai_model w config.php.');
    } else {
        $add('ok', 'Asystent AI', sprintf('format %s, model %s, %s', $config['ai_format'], $config['ai_model'], $config['ai_require_account'] ? 'tylko dla zalogowanych' : 'także bez konta'));
        $knowledge = ts_ai_knowledge();
        $add($knowledge['lessons'] ? 'ok' : 'uwaga', 'Materiały dla asystenta', $knowledge['lessons'] ? count($knowledge['lessons']) . ' lekcji' : 'Brak api/knowledge.json: wgraj cały katalog dist.');
        $lastError = json_decode((string) (ts_meta_get('ai_last_error') ?? ''), true);
        if (is_array($lastError) && ($lastError['at'] ?? 0) > ts_now() - 7 * 86400) {
            $add('uwaga', 'Ostatni błąd dostawcy AI', gmdate('Y-m-d H:i', (int) $lastError['at']) . ' UTC, kod ' . ($lastError['status'] ?? '?') . ': ' . ($lastError['message'] ?? ''));
        }
        $add('ok', 'Pytania do asystenta dziś', (string) ts_ai_usage('total', ts_today()) . ' z ' . (int) $config['ai_daily_limit_total']);
        if ($testAi) {
            try {
                $reply = ts_ai_call('Odpowiadaj po polsku jednym krótkim zdaniem.', [['role' => 'user', 'content' => 'Napisz jednym zdaniem, czym jest wahadło w Transerfingu.']]);
                $add('ok', 'Próbne pytanie do AI', ts_cut($reply, 200));
            } catch (Throwable $e) {
                $add('błąd', 'Próbne pytanie do AI', $e->getMessage() . ' Szczegóły: ' . (string) (ts_meta_get('ai_last_error') ?? ''));
            }
        }
    }
    return $checks;
}

/** Odwrotność ts_der_to_raw (do sprawdzenia podpisu w diagnostyce). */
function ts_raw_to_der(string $raw): string
{
    $encode = static function (string $int): string {
        $int = ltrim($int, "\0");
        if ($int === '' || ord($int[0]) & 0x80) {
            $int = "\0" . $int;
        }
        return "\x02" . chr(strlen($int)) . $int;
    };
    $body = $encode(substr($raw, 0, 32)) . $encode(substr($raw, 32, 32));
    return "\x30" . chr(strlen($body)) . $body;
}

<?php
declare(strict_types=1);

/**
 * Wspólny kod API serwisu „Transerfing w praktyce”.
 *
 * Wymagania: PHP 8.1+ z rozszerzeniami pdo_sqlite, openssl i curl (MyDevil: domyślne PHP 8.3 ma wszystkie).
 * Dane (baza SQLite, konfiguracja, logi) leżą w katalogu „private” obok public_html,
 * czyli poza zasięgiem przeglądarki: /usr/home/LOGIN/domains/DOMENA/private/
 */

if (!defined('TS_API')) {
    http_response_code(404);
    exit;
}

const TS_VERSION = '2.0.0';
const TS_SESSION_TTL = 180 * 86400;
const TS_INACTIVE_TTL = 730 * 86400;
const TS_MAX_BODY = 6 * 1024 * 1024;
const TS_MAX_VAULT = 5 * 1024 * 1024;
const TS_BCRYPT = ['cost' => 10];
/** Skrót bcrypt losowego ciągu: logowanie na nieistniejący login trwa tyle samo co na istniejący. */
const TS_DUMMY_HASH = '$2y$10$P5EEQlz2rjL2RWAzs.Uorus4YrcSuSu7bdJbWr6WXebcxghVGC.NW';

ini_set('display_errors', '0');
error_reporting(E_ALL);
set_error_handler(static function (int $severity, string $message, string $file = '', int $line = 0): bool {
    if (!(error_reporting() & $severity)) {
        return false;
    }
    if ($severity & (E_DEPRECATED | E_USER_DEPRECATED)) {
        // Ostrzeżenia o przestarzałych funkcjach (np. w nowszym PHP) nie mogą przerywać działania.
        return true;
    }
    throw new ErrorException($message, 0, $severity, $file, $line);
});

/** Stan procesu. Testy podmieniają czas, konfigurację i połączenie z bazą. */
final class Ts
{
    public static ?array $config = null;
    public static ?array $configOverride = null;
    public static ?PDO $db = null;
    public static ?int $now = null;
    public static ?string $dataDir = null;

    public static function reset(): void
    {
        self::$config = null;
        self::$configOverride = null;
        self::$db = null;
        self::$now = null;
        self::$dataDir = null;
    }
}

final class TsHttpError extends Exception
{
    public function __construct(public int $status, string $message, public array $extra = [])
    {
        parent::__construct($message);
    }
}

final class TsRequest
{
    /** @param array<string,string> $headers nazwy małymi literami */
    public function __construct(
        public string $method,
        public array $query = [],
        public array $body = [],
        public array $headers = [],
        public string $ip = '',
        public bool $secure = false,
        public string $host = '',
    ) {
    }

    public static function fromGlobals(): self
    {
        $method = strtoupper((string) ($_SERVER['REQUEST_METHOD'] ?? 'GET'));
        $headers = [];
        foreach ($_SERVER as $key => $value) {
            if (is_string($value) && str_starts_with((string) $key, 'HTTP_')) {
                $headers[strtolower(str_replace('_', '-', substr((string) $key, 5)))] = $value;
            }
        }
        if (!isset($headers['authorization']) && isset($_SERVER['REDIRECT_HTTP_AUTHORIZATION'])) {
            $headers['authorization'] = (string) $_SERVER['REDIRECT_HTTP_AUTHORIZATION'];
        }
        $body = [];
        if ($method === 'POST') {
            $length = (int) ($_SERVER['CONTENT_LENGTH'] ?? 0);
            if ($length > TS_MAX_BODY) {
                throw new TsHttpError(413, 'Za dużo danych w jednym zapytaniu.');
            }
            $raw = (string) file_get_contents('php://input', false, null, 0, TS_MAX_BODY + 1);
            if (strlen($raw) > TS_MAX_BODY) {
                throw new TsHttpError(413, 'Za dużo danych w jednym zapytaniu.');
            }
            if (trim($raw) !== '') {
                try {
                    $decoded = json_decode($raw, true, 64, JSON_THROW_ON_ERROR);
                } catch (JsonException) {
                    throw new TsHttpError(400, 'Nieprawidłowe dane zapytania.');
                }
                if (!is_array($decoded)) {
                    throw new TsHttpError(400, 'Nieprawidłowe dane zapytania.');
                }
                $body = $decoded;
            }
        }
        $https = strtolower((string) ($_SERVER['HTTPS'] ?? ''));
        return new self(
            $method,
            $_GET,
            $body,
            $headers,
            ts_client_ip((string) ($_SERVER['REMOTE_ADDR'] ?? '')),
            ($https !== '' && $https !== 'off') || (string) ($_SERVER['SERVER_PORT'] ?? '') === '443',
            strtolower((string) ($_SERVER['HTTP_HOST'] ?? '')),
        );
    }

    public function header(string $name): ?string
    {
        $value = $this->headers[strtolower($name)] ?? null;
        return is_string($value) && $value !== '' ? $value : null;
    }

    public function input(string $key): mixed
    {
        return $this->body[$key] ?? null;
    }

    public function action(): string
    {
        $action = $this->query['action'] ?? '';
        return is_string($action) ? $action : '';
    }
}

// ---------------------------------------------------------------------------
// Czas, ścieżki, logi
// ---------------------------------------------------------------------------

function ts_now(): int
{
    return Ts::$now ?? time();
}

/** Data „dziś” w Polsce (limity dzienne zerują się o północy czasu polskiego). */
function ts_today(int $offsetDays = 0): string
{
    $date = (new DateTimeImmutable('@' . ts_now()))->setTimezone(new DateTimeZone('Europe/Warsaw'));
    if ($offsetDays !== 0) {
        $date = $date->modify(sprintf('%+d days', $offsetDays));
    }
    return $date->format('Y-m-d');
}

/**
 * Katalog danych: „private” obok public_html (np. /usr/home/LOGIN/domains/DOMENA/private).
 * Działa też, gdy serwis leży w podkatalogu public_html.
 */
function ts_data_dir(): string
{
    if (Ts::$dataDir !== null) {
        return Ts::$dataDir;
    }
    $dir = getenv('TRANSERFING_DATA_DIR') ?: '';
    if ($dir === '') {
        $cursor = dirname(__DIR__);
        while ($cursor !== dirname($cursor)) {
            if (basename($cursor) === 'public_html') {
                $dir = dirname($cursor) . '/private';
                break;
            }
            $cursor = dirname($cursor);
        }
    }
    if ($dir === '') {
        $root = (string) ($_SERVER['DOCUMENT_ROOT'] ?? '');
        $dir = $root !== '' ? dirname((string) (realpath($root) ?: $root)) . '/private' : dirname(__DIR__, 3) . '/private';
    }
    $dir = rtrim($dir, '/');
    $root = (string) ($_SERVER['DOCUMENT_ROOT'] ?? '');
    $rootReal = rtrim($root !== '' ? (string) (realpath($root) ?: $root) : '', '/');
    $insideRoot = static fn (string $path): bool => $rootReal !== '' && ($path === $rootReal || str_starts_with($path . '/', $rootReal . '/'));
    // Sprawdzamy przed utworzeniem katalogu i po nim (dowiązania symboliczne).
    if ($insideRoot($dir)) {
        throw new RuntimeException('Katalog danych leży wewnątrz public_html i byłby widoczny z internetu: ' . $dir);
    }
    ts_ensure_dir($dir);
    $real = (string) (realpath($dir) ?: $dir);
    if ($insideRoot($real)) {
        throw new RuntimeException('Katalog danych leży wewnątrz public_html i byłby widoczny z internetu: ' . $real);
    }
    return Ts::$dataDir = $real;
}

function ts_ensure_dir(string $dir): void
{
    if (is_dir($dir)) {
        return;
    }
    if (!@mkdir($dir, 0700, true) && !is_dir($dir)) {
        throw new RuntimeException('Nie można utworzyć katalogu danych: ' . $dir);
    }
}

/** Zapis technicznych zdarzeń (bez treści od użytkowników i bez adresów IP). */
function ts_log(string $channel, string $message): void
{
    try {
        $dir = ts_data_dir() . '/logs';
        ts_ensure_dir($dir);
        $file = $dir . '/' . preg_replace('/[^a-z0-9-]/', '', $channel) . '.log';
        if (is_file($file) && filesize($file) > 1024 * 1024) {
            @rename($file, $file . '.1');
        }
        $line = gmdate('Y-m-d H:i:s') . ' ' . str_replace(["\r", "\n"], ' ', $message) . PHP_EOL;
        @file_put_contents($file, $line, FILE_APPEND | LOCK_EX);
    } catch (Throwable) {
        // Log jest pomocniczy: jego brak nie może przerwać obsługi zapytania.
    }
}

// ---------------------------------------------------------------------------
// Konfiguracja
// ---------------------------------------------------------------------------

/**
 * Wersja serwisu z buildu: plik lib/edition.php tworzy tylko build prywatny (npm run build:private).
 * Testy mogą wskazać inny plik zmienną TRANSERFING_EDITION.
 */
function ts_edition(): array
{
    static $edition = null;
    if ($edition === null) {
        $file = getenv('TRANSERFING_EDITION') ?: __DIR__ . '/edition.php';
        $loaded = is_file($file) ? (static fn (string $path): mixed => require $path)($file) : [];
        $edition = is_array($loaded) ? $loaded : [];
    }
    return $edition;
}

function ts_config_defaults(): array
{
    $private = !empty(ts_edition()['private']);
    return [
        'admin_name' => '',
        'admin_email' => '',
        'site_url' => '',
        // Wersja prywatna: jedno konto (właściciela), powiadomienia i asystent tylko po zalogowaniu.
        'private_mode' => $private,
        'accounts_enabled' => $private,
        'accounts_max' => $private ? 1 : 0,
        'accounts_daily_limit' => 200,
        'push_enabled' => true,
        'push_require_account' => $private,
        'push_max_subscriptions' => $private ? 50 : 5000,
        'ai_enabled' => false,
        'ai_format' => 'openai',
        'ai_url' => '',
        'ai_key' => '',
        'ai_model' => '',
        'ai_max_tokens' => 1500,
        'ai_require_account' => true,
        'ai_daily_limit_user' => 20,
        'ai_daily_limit_anon' => 5,
        'ai_daily_limit_total' => 300,
        'ai_anthropic_version' => '2023-06-01',
        'ai_extra_body' => [],
        'diag_web' => false,
        'secret' => '',
        'vapid_public' => '',
        'vapid_private_pem' => '',
    ];
}

function ts_config(): array
{
    if (Ts::$config !== null) {
        return Ts::$config;
    }
    $file = ts_data_dir() . '/config.php';
    if (!is_file($file)) {
        ts_create_config($file);
    }
    $loaded = (static fn (string $path): mixed => require $path)($file);
    if (!is_array($loaded)) {
        throw new RuntimeException('Plik config.php musi zwracać tablicę (return [...];).');
    }
    $config = array_replace(ts_config_defaults(), $loaded, Ts::$configOverride ?? []);
    if (!is_string($config['secret']) || strlen($config['secret']) < 32) {
        throw new RuntimeException('W config.php brakuje klucza „secret” (co najmniej 32 znaki).');
    }
    return Ts::$config = $config;
}

/** Tworzy config.php przy pierwszym zapytaniu: losowy sekret i klucze VAPID do powiadomień. */
function ts_create_config(string $file): void
{
    $lockHandle = fopen(dirname($file) . '/.init.lock', 'c');
    if ($lockHandle === false) {
        throw new RuntimeException('Nie można utworzyć pliku blokady w katalogu danych.');
    }
    flock($lockHandle, LOCK_EX);
    try {
        if (is_file($file)) {
            return;
        }
        $vapid = ts_generate_vapid();
        $content = ts_render_config([
            'secret' => bin2hex(random_bytes(32)),
            'vapid_public' => $vapid['public'] ?? '',
            'vapid_private_pem' => $vapid['private_pem'] ?? '',
        ]);
        $tmp = $file . '.' . bin2hex(random_bytes(4)) . '.tmp';
        file_put_contents($tmp, $content);
        @chmod($tmp, 0600);
        rename($tmp, $file);
        if (function_exists('opcache_invalidate')) {
            @opcache_invalidate($file, true);
        }
    } finally {
        flock($lockHandle, LOCK_UN);
        fclose($lockHandle);
    }
}

/** Para kluczy VAPID (krzywa P-256): publiczny w base64url (65 bajtów), prywatny w PEM. */
function ts_generate_vapid(): ?array
{
    if (!function_exists('openssl_pkey_new')) {
        return null;
    }
    try {
        $key = openssl_pkey_new(['curve_name' => 'prime256v1', 'private_key_type' => OPENSSL_KEYTYPE_EC]);
        if ($key === false) {
            return null;
        }
        $details = openssl_pkey_get_details($key);
        if (!is_array($details) || empty($details['ec']['x']) || empty($details['ec']['y'])) {
            return null;
        }
        $public = "\x04" . str_pad($details['ec']['x'], 32, "\0", STR_PAD_LEFT) . str_pad($details['ec']['y'], 32, "\0", STR_PAD_LEFT);
        if (!openssl_pkey_export($key, $pem)) {
            return null;
        }
        return ['public' => ts_b64url_encode($public), 'private_pem' => $pem];
    } catch (Throwable $e) {
        ts_log('error', 'VAPID: ' . $e->getMessage());
        return null;
    }
}

function ts_render_config(array $keys): string
{
    $e = static fn (mixed $value): string => var_export($value, true);
    $people = !empty(ts_edition()['private']) ? <<<'TXT'
    // WERSJA PRYWATNA: serwis tylko dla ciebie.
    // Pierwsze założone konto zostaje kontem właściciela, a potem rejestracja się zamyka (accounts_max).
    // Asystent AI i włączanie powiadomień działają tylko po zalogowaniu.
    'private_mode' => true,
    'accounts_enabled' => true,
    'accounts_max' => 1,
    'push_require_account' => true,

    // Dane administratora nie są potrzebne w wersji prywatnej. E-mail (opcjonalny) to kontakt dla usług push.
    'admin_name' => '',
    'admin_email' => '',

    // Adres serwisu, np. 'https://twojadomena.pl'. Opcjonalny: zwykle wykrywany automatycznie.
    'site_url' => '',

    // Najwięcej nowych kont na dobę (ochrona przed botami).
    'accounts_daily_limit' => 200,

    // Powiadomienia push o przebudzeniu. Wymagają zadania cron co 5 minut (instrukcja w README).
    'push_enabled' => true,
    'push_max_subscriptions' => 50,

TXT : <<<'TXT'
    // Administrator danych osobowych: pojawi się w polityce prywatności (wymóg RODO).
    // Uzupełnij przed włączeniem kont. E-mail służy też jako kontakt dla usług push.
    'admin_name' => '',
    'admin_email' => '',

    // Adres serwisu, np. 'https://twojadomena.pl'. Opcjonalny: zwykle wykrywany automatycznie.
    'site_url' => '',

    // Konta i synchronizacja między urządzeniami (szyfrowanie end-to-end).
    // Włącz (true) dopiero po uzupełnieniu danych administratora powyżej.
    'accounts_enabled' => false,
    // Najwięcej kont (0 = bez limitu) i nowych kont na dobę (ochrona przed botami).
    'accounts_max' => 0,
    'accounts_daily_limit' => 200,

    // Powiadomienia push o przebudzeniu. Wymagają zadania cron co 5 minut (instrukcja w README).
    'push_enabled' => true,
    // Czy włączenie powiadomień wymaga zalogowania.
    'push_require_account' => false,
    'push_max_subscriptions' => 5000,

TXT;
    return <<<PHP
<?php
// Konfiguracja serwisu „Transerfing w praktyce”.
// Plik leży poza public_html i nie jest dostępny z internetu. Nie udostępniaj go nikomu.
// Zmiany działają od razu, bez restartu. Zachowaj apostrofy i przecinki na końcach linii.

return [
{$people}
    // Asystent AI. Klucz API trzymaj tylko tutaj.
    // Format 'openai': OpenAI i usługi zgodne z Chat Completions (adres domyślny: https://api.openai.com/v1/chat/completions).
    // Format 'anthropic': API Claude (adres domyślny: https://api.anthropic.com/v1/messages).
    // Przykładowe modele: 'gpt-6-luna' (OpenAI), 'claude-haiku-5-5' (Anthropic). Sprawdź nazwę w panelu dostawcy.
    'ai_enabled' => false,
    'ai_format' => 'openai',
    'ai_url' => '',
    'ai_key' => '',
    'ai_model' => '',
    'ai_max_tokens' => 1500,
    // Czy asystent wymaga konta (zalecane: limit pytań liczony na osobę, a nie na adres IP).
    'ai_require_account' => true,
    'ai_daily_limit_user' => 20,
    'ai_daily_limit_anon' => 5,
    'ai_daily_limit_total' => 300,
    'ai_anthropic_version' => '2023-06-01',
    // Dodatkowe pola zapytania do dostawcy, np. ['reasoning_effort' => 'low'].
    'ai_extra_body' => [],

    // Diagnostyka w przeglądarce (api/diagnostyka.php). Domyślnie działa tylko z konsoli SSH.
    'diag_web' => false,

    // Wygenerowane automatycznie. Zmiana kluczy VAPID wyłączy powiadomienia wszystkim subskrybentom.
    'secret' => {$e($keys['secret'])},
    'vapid_public' => {$e($keys['vapid_public'])},
    'vapid_private_pem' => {$e($keys['vapid_private_pem'])},
];

PHP;
}

// ---------------------------------------------------------------------------
// Baza danych
// ---------------------------------------------------------------------------

function ts_db(): PDO
{
    if (Ts::$db !== null) {
        return Ts::$db;
    }
    $path = ts_data_dir() . '/transerfing.sqlite';
    $isNew = !is_file($path);
    $pdo = new PDO('sqlite:' . $path, null, null, [
        PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
        PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
        PDO::ATTR_TIMEOUT => 10,
    ]);
    if ($isNew) {
        @chmod($path, 0600);
    }
    $pdo->exec('PRAGMA busy_timeout = 10000');
    $pdo->exec('PRAGMA foreign_keys = ON');
    $pdo->query('PRAGMA journal_mode = WAL')->fetchAll();
    $pdo->exec('PRAGMA synchronous = NORMAL');
    if ((int) $pdo->query('PRAGMA user_version')->fetchColumn() < 1) {
        ts_migrate($pdo);
    }
    return Ts::$db = $pdo;
}

function ts_migrate(PDO $pdo): void
{
    $pdo->exec('BEGIN IMMEDIATE');
    try {
        if ((int) $pdo->query('PRAGMA user_version')->fetchColumn() < 1) {
            $pdo->exec(<<<'SQL'
CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY,
    username TEXT NOT NULL UNIQUE,
    auth_hash TEXT NOT NULL,
    created_at INTEGER NOT NULL,
    last_seen INTEGER NOT NULL
);
CREATE TABLE IF NOT EXISTS sessions (
    token_hash TEXT PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    created_at INTEGER NOT NULL,
    last_used INTEGER NOT NULL
);
CREATE INDEX IF NOT EXISTS sessions_user ON sessions(user_id);
CREATE TABLE IF NOT EXISTS vaults (
    user_id INTEGER PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
    version INTEGER NOT NULL,
    iv TEXT NOT NULL,
    data TEXT NOT NULL,
    updated_at INTEGER NOT NULL
);
CREATE TABLE IF NOT EXISTS push_subs (
    id INTEGER PRIMARY KEY,
    endpoint_hash TEXT NOT NULL UNIQUE,
    endpoint TEXT NOT NULL,
    interval_min INTEGER NOT NULL,
    jitter INTEGER NOT NULL,
    from_min INTEGER NOT NULL,
    to_min INTEGER NOT NULL,
    days TEXT NOT NULL,
    tz TEXT NOT NULL,
    next_at INTEGER NOT NULL,
    created_at INTEGER NOT NULL,
    updated_at INTEGER NOT NULL,
    last_sent INTEGER,
    fails INTEGER NOT NULL DEFAULT 0
);
CREATE INDEX IF NOT EXISTS push_next ON push_subs(next_at);
CREATE TABLE IF NOT EXISTS rate (
    bucket TEXT PRIMARY KEY,
    count INTEGER NOT NULL,
    expires_at INTEGER NOT NULL
);
CREATE INDEX IF NOT EXISTS rate_expires ON rate(expires_at);
CREATE TABLE IF NOT EXISTS ai_usage (
    subject TEXT NOT NULL,
    day TEXT NOT NULL,
    count INTEGER NOT NULL,
    PRIMARY KEY (subject, day)
);
CREATE TABLE IF NOT EXISTS meta (
    k TEXT PRIMARY KEY,
    v TEXT NOT NULL
);
PRAGMA user_version = 1;
SQL);
        }
        $pdo->exec('COMMIT');
    } catch (Throwable $e) {
        $pdo->exec('ROLLBACK');
        throw $e;
    }
}

/** Wykonuje funkcję w transakcji z blokadą zapisu (BEGIN IMMEDIATE). */
function ts_transaction(callable $fn): mixed
{
    $db = ts_db();
    $db->exec('BEGIN IMMEDIATE');
    try {
        $result = $fn($db);
        $db->exec('COMMIT');
        return $result;
    } catch (Throwable $e) {
        $db->exec('ROLLBACK');
        throw $e;
    }
}

function ts_query(string $sql, array $params = []): PDOStatement
{
    $statement = ts_db()->prepare($sql);
    $statement->execute($params);
    return $statement;
}

function ts_meta_get(string $key): ?string
{
    $value = ts_query('SELECT v FROM meta WHERE k = ?', [$key])->fetchColumn();
    return $value === false ? null : (string) $value;
}

function ts_meta_set(string $key, string $value): void
{
    ts_query('INSERT INTO meta (k, v) VALUES (?, ?) ON CONFLICT(k) DO UPDATE SET v = excluded.v', [$key, $value]);
}

// ---------------------------------------------------------------------------
// Pomocnicze: dane wejściowe, kodowanie
// ---------------------------------------------------------------------------

function ts_str(mixed $value): string
{
    return is_string($value) ? $value : (is_int($value) || is_float($value) ? (string) $value : '');
}

function ts_int(mixed $value, int $default = -1): int
{
    if (is_int($value)) {
        return $value;
    }
    if (is_float($value) && floor($value) === $value) {
        return (int) $value;
    }
    if (is_string($value) && preg_match('/^-?\d{1,15}$/', $value)) {
        return (int) $value;
    }
    return $default;
}

function ts_b64url_encode(string $bytes): string
{
    return rtrim(strtr(base64_encode($bytes), '+/', '-_'), '=');
}

function ts_b64url_decode(string $text): string|false
{
    $padded = strtr($text, '-_', '+/');
    $padded .= str_repeat('=', (4 - strlen($padded) % 4) % 4);
    return base64_decode($padded, true);
}

/** Ucina tekst do podanej liczby znaków (UTF-8). */
function ts_cut(string $text, int $max): string
{
    if (function_exists('mb_substr')) {
        return mb_substr($text, 0, $max, 'UTF-8');
    }
    return preg_match('/^.{0,' . $max . '}/us', $text, $m) ? $m[0] : substr($text, 0, $max);
}

function ts_length(string $text): int
{
    return function_exists('mb_strlen') ? mb_strlen($text, 'UTF-8') : (int) preg_match_all('/./us', $text);
}

/** Małe litery bez polskich znaków (do wyszukiwania słów kluczowych). */
function ts_normalize_pl(string $text): string
{
    $map = [
        'ą' => 'a', 'ć' => 'c', 'ę' => 'e', 'ł' => 'l', 'ń' => 'n', 'ó' => 'o', 'ś' => 's', 'ź' => 'z', 'ż' => 'z',
        'Ą' => 'a', 'Ć' => 'c', 'Ę' => 'e', 'Ł' => 'l', 'Ń' => 'n', 'Ó' => 'o', 'Ś' => 's', 'Ź' => 'z', 'Ż' => 'z',
    ];
    return strtolower(strtr($text, $map));
}

// ---------------------------------------------------------------------------
// Adres IP, limity zapytań
// ---------------------------------------------------------------------------

/** Adres klienta. Dla IPv6 cała sieć /64 (jedno łącze dostaje zwykle całą pulę). */
function ts_client_ip(string $ip): string
{
    $binary = @inet_pton($ip);
    if ($binary === false) {
        return 'unknown';
    }
    if (strlen($binary) === 16) {
        if (str_starts_with($binary, "\0\0\0\0\0\0\0\0\0\0\xff\xff")) {
            return (string) inet_ntop(substr($binary, 12));
        }
        return bin2hex(substr($binary, 0, 8)) . '::/64';
    }
    return $ip;
}

/** Skrót adresu IP z kluczem zmienianym codziennie: nie da się z niego odtworzyć adresu ani połączyć dni. */
function ts_ip_hash(TsRequest $request): string
{
    $key = ts_config()['secret'] . '|' . gmdate('Y-m-d', ts_now());
    return substr(hash_hmac('sha256', $request->ip, $key), 0, 32);
}

function ts_rate_bucket(string $name, string $subject, int $window): array
{
    $slot = intdiv(ts_now(), $window);
    return [$name . ':' . $subject . ':' . $slot, ($slot + 1) * $window];
}

function ts_rate_count(string $name, string $subject, int $window): int
{
    [$bucket] = ts_rate_bucket($name, $subject, $window);
    return (int) (ts_query('SELECT count FROM rate WHERE bucket = ?', [$bucket])->fetchColumn() ?: 0);
}

function ts_rate_add(string $name, string $subject, int $window): int
{
    [$bucket, $expires] = ts_rate_bucket($name, $subject, $window);
    ts_query(
        'INSERT INTO rate (bucket, count, expires_at) VALUES (?, 1, ?) ON CONFLICT(bucket) DO UPDATE SET count = count + 1',
        [$bucket, $expires],
    );
    return ts_rate_count($name, $subject, $window);
}

/** Liczy zapytanie i przerywa, gdy limit w danym oknie czasu został przekroczony. */
function ts_rate_hit(string $name, string $subject, int $limit, int $window, ?string $message = null): void
{
    if (ts_rate_add($name, $subject, $window) > $limit) {
        [, $expires] = ts_rate_bucket($name, $subject, $window);
        throw new TsHttpError(429, $message ?? 'Zbyt wiele zapytań. Spróbuj ponownie za kilka minut.', ['retryAfter' => max(1, $expires - ts_now())]);
    }
}

// ---------------------------------------------------------------------------
// Sesje
// ---------------------------------------------------------------------------

function ts_token_from(TsRequest $request): ?string
{
    $token = $request->header('x-auth-token');
    if ($token === null) {
        $authorization = $request->header('authorization');
        if ($authorization !== null && preg_match('/^Bearer\s+(\S+)$/i', $authorization, $m)) {
            $token = $m[1];
        }
    }
    return $token !== null && preg_match('/^[A-Za-z0-9_-]{43}$/', $token) ? $token : null;
}

function ts_create_session(int $userId): string
{
    $token = ts_b64url_encode(random_bytes(32));
    $now = ts_now();
    ts_query('INSERT INTO sessions (token_hash, user_id, created_at, last_used) VALUES (?, ?, ?, ?)', [hash('sha256', $token), $userId, $now, $now]);
    return $token;
}

/**
 * Sesja z nagłówka X-Auth-Token albo Authorization: Bearer.
 * Sesja wygasa po 180 dniach bez użycia.
 */
function ts_session(TsRequest $request, bool $required = true): ?array
{
    $token = ts_token_from($request);
    $row = null;
    if ($token !== null) {
        $hash = hash('sha256', $token);
        $row = ts_query(
            'SELECT s.token_hash, s.user_id, s.last_used, u.username, u.auth_hash, u.created_at, u.last_seen
             FROM sessions s JOIN users u ON u.id = s.user_id WHERE s.token_hash = ?',
            [$hash],
        )->fetch() ?: null;
        $now = ts_now();
        if ($row !== null && (int) $row['last_used'] < $now - TS_SESSION_TTL) {
            ts_query('DELETE FROM sessions WHERE token_hash = ?', [$hash]);
            $row = null;
        }
        if ($row !== null) {
            if ((int) $row['last_used'] < $now - 3600) {
                ts_query('UPDATE sessions SET last_used = ? WHERE token_hash = ?', [$now, $hash]);
            }
            if ((int) $row['last_seen'] < $now - 86400) {
                ts_query('UPDATE users SET last_seen = ? WHERE id = ?', [$now, (int) $row['user_id']]);
            }
        }
    }
    if ($row === null && $required) {
        throw new TsHttpError(401, 'Sesja wygasła. Zaloguj się ponownie.');
    }
    return $row;
}

// ---------------------------------------------------------------------------
// HTTP na zewnątrz (powiadomienia push, AI)
// ---------------------------------------------------------------------------

/**
 * Wysyła wiele zapytań HTTPS równolegle. Zwraca [klucz => [status, treść]].
 * Status 0 oznacza błąd sieci. Testy podmieniają wysyłkę przez $GLOBALS['TS_HTTP_MOCK'].
 *
 * @param array<string|int, array{0:string,1:string,2:array<int,string>,3:string}> $requests [metoda, adres, nagłówki, treść]
 */
function ts_http_many(array $requests, int $timeout = 15): array
{
    $results = [];
    if (isset($GLOBALS['TS_HTTP_MOCK']) && is_callable($GLOBALS['TS_HTTP_MOCK'])) {
        foreach ($requests as $key => [$method, $url, $headers, $body]) {
            $results[$key] = ($GLOBALS['TS_HTTP_MOCK'])($method, $url, $headers, $body);
        }
        return $results;
    }
    if (!function_exists('curl_multi_init')) {
        throw new RuntimeException('Brak rozszerzenia PHP curl.');
    }
    foreach (array_chunk($requests, 20, true) as $chunk) {
        $multi = curl_multi_init();
        $handles = [];
        foreach ($chunk as $key => [$method, $url, $headers, $body]) {
            $handle = curl_init($url);
            $options = [
                CURLOPT_CUSTOMREQUEST => $method,
                CURLOPT_RETURNTRANSFER => true,
                CURLOPT_HTTPHEADER => $headers,
                CURLOPT_CONNECTTIMEOUT => 8,
                CURLOPT_TIMEOUT => $timeout,
                CURLOPT_FOLLOWLOCATION => false,
                CURLOPT_SSL_VERIFYPEER => true,
                CURLOPT_SSL_VERIFYHOST => 2,
                CURLOPT_USERAGENT => 'TranserfingWPraktyce/' . TS_VERSION,
            ];
            if (defined('CURLOPT_PROTOCOLS_STR')) {
                $options[CURLOPT_PROTOCOLS_STR] = 'https';
            } else {
                $options[CURLOPT_PROTOCOLS] = CURLPROTO_HTTPS;
            }
            if ($method === 'POST') {
                $options[CURLOPT_POSTFIELDS] = $body;
            }
            curl_setopt_array($handle, $options);
            curl_multi_add_handle($multi, $handle);
            $handles[$key] = $handle;
        }
        do {
            $status = curl_multi_exec($multi, $running);
            if ($running > 0) {
                curl_multi_select($multi, 1.0);
            }
        } while ($running > 0 && $status === CURLM_OK);
        foreach ($handles as $key => $handle) {
            $code = (int) curl_getinfo($handle, CURLINFO_RESPONSE_CODE);
            $content = curl_multi_getcontent($handle);
            $results[$key] = [$code, is_string($content) ? $content : ''];
            curl_multi_remove_handle($multi, $handle);
        }
        unset($handles);
        curl_multi_close($multi);
    }
    return $results;
}

function ts_http(string $method, string $url, array $headers, string $body, int $timeout = 15): array
{
    return ts_http_many(['one' => [$method, $url, $headers, $body]], $timeout)['one'];
}

/** Zapamiętuje adres serwisu (https://domena), potrzebny w tokenach VAPID wysyłanych z crona. */
function ts_record_origin(TsRequest $request): void
{
    if (!$request->secure || !preg_match('/^[a-z0-9.-]+(:\d{1,5})?$/', $request->host)) {
        return;
    }
    if (preg_match('/^(localhost|127\.|\[?::1)/', $request->host)) {
        return;
    }
    $origin = 'https://' . $request->host;
    if (ts_meta_get('site_origin') !== $origin) {
        ts_meta_set('site_origin', $origin);
    }
}

function ts_site_url(): string
{
    $configured = rtrim(trim((string) ts_config()['site_url']), '/');
    if ($configured !== '') {
        return $configured;
    }
    return ts_meta_get('site_origin') ?? '';
}

// ---------------------------------------------------------------------------
// Obsługa zapytań
// ---------------------------------------------------------------------------

function ts_require_method(TsRequest $request, string ...$methods): void
{
    if (!in_array($request->method, $methods, true)) {
        throw new TsHttpError(405, 'Niedozwolona metoda zapytania.');
    }
}

/** Wywołuje funkcję obsługi i zamienia wynik albo błąd na [status, dane JSON]. */
function ts_dispatch(callable $handler, TsRequest $request): array
{
    try {
        $payload = $handler($request);
        return [200, $payload];
    } catch (TsHttpError $e) {
        return [$e->status, ['error' => $e->getMessage()] + $e->extra];
    } catch (Throwable $e) {
        ts_log('error', get_class($e) . ': ' . $e->getMessage() . ' (' . basename($e->getFile()) . ':' . $e->getLine() . ')');
        return [500, ['error' => 'Wystąpił błąd serwera. Spróbuj ponownie za chwilę.']];
    }
}

function ts_send(int $status, array $payload): never
{
    http_response_code($status);
    header('Content-Type: application/json; charset=utf-8');
    header('Cache-Control: no-store, max-age=0');
    header('Pragma: no-cache');
    header('X-Content-Type-Options: nosniff');
    header('Referrer-Policy: no-referrer');
    header('X-Robots-Tag: noindex, nofollow');
    if (isset($payload['retryAfter'])) {
        header('Retry-After: ' . (int) $payload['retryAfter']);
    }
    echo json_encode($payload, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES | JSON_INVALID_UTF8_SUBSTITUTE);
    exit;
}

function ts_run(callable $handler): never
{
    try {
        $request = TsRequest::fromGlobals();
    } catch (TsHttpError $e) {
        ts_send($e->status, ['error' => $e->getMessage()]);
    }
    [$status, $payload] = ts_dispatch($handler, $request);
    ts_send($status, $payload);
}

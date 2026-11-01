<?php
declare(strict_types=1);

/**
 * Powiadomienia push o przebudzeniu (Web Push z kluczami VAPID).
 *
 * Wysyłamy puste powiadomienia bez treści, więc nie trzeba ich szyfrować, a usługi push
 * (Google, Mozilla, Apple, Microsoft) nie dostają żadnych danych. Tekst losuje service worker.
 * Harmonogram (co ile minut, w jakich godzinach i dniach) zapisujemy przy adresie subskrypcji.
 * Zadanie cron co 5 minut wysyła powiadomienia, którym nadszedł czas.
 */

if (!defined('TS_API')) {
    http_response_code(404);
    exit;
}

/** Usługi push przeglądarek. Inne adresy odrzucamy, żeby serwera nie dało się użyć do zapytań w dowolne miejsca. */
const TS_PUSH_HOSTS = ['fcm.googleapis.com', 'android.googleapis.com', 'push.services.mozilla.com', 'push.apple.com', 'notify.windows.com'];
const TS_PUSH_TTL = 600;

function ts_push_configured(): bool
{
    $config = ts_config();
    return (bool) $config['push_enabled']
        && function_exists('openssl_sign')
        && function_exists('curl_multi_init')
        && strlen((string) $config['vapid_public']) === 87
        && str_contains((string) $config['vapid_private_pem'], 'PRIVATE KEY');
}

/** Powiadomienia oferujemy tylko wtedy, gdy cron działa (inaczej nic by nie przychodziło). */
function ts_push_available(): bool
{
    if (!ts_push_configured()) {
        return false;
    }
    $lastRun = (int) (ts_meta_get('cron_last_run') ?? 0);
    return $lastRun > ts_now() - 30 * 60;
}

/** Podpis ECDSA z OpenSSL (DER) zamieniony na 64 bajty r||s wymagane przez JWT (ES256). */
function ts_der_to_raw(string $der): string
{
    $pos = 0;
    $length = strlen($der);
    $read = static function () use ($der, &$pos, $length): int {
        if ($pos >= $length) {
            throw new RuntimeException('Nieprawidłowy podpis DER');
        }
        return ord($der[$pos++]);
    };
    if ($read() !== 0x30) {
        throw new RuntimeException('Nieprawidłowy podpis DER');
    }
    $seqLength = $read();
    if ($seqLength & 0x80) {
        $bytes = $seqLength & 0x7f;
        for ($i = 0; $i < $bytes; $i++) {
            $read();
        }
    }
    $raw = '';
    for ($part = 0; $part < 2; $part++) {
        if ($read() !== 0x02) {
            throw new RuntimeException('Nieprawidłowy podpis DER');
        }
        $intLength = $read();
        $int = ltrim(substr($der, $pos, $intLength), "\0");
        $pos += $intLength;
        if (strlen($int) > 32) {
            throw new RuntimeException('Nieprawidłowy podpis DER');
        }
        $raw .= str_pad($int, 32, "\0", STR_PAD_LEFT);
    }
    return $raw;
}

/** Kontakt dla usług push w tokenie VAPID: e-mail administratora albo adres serwisu (https). */
function ts_vapid_subject(): string
{
    $email = trim((string) ts_config()['admin_email']);
    if ($email !== '' && filter_var($email, FILTER_VALIDATE_EMAIL)) {
        return 'mailto:' . $email;
    }
    $site = ts_site_url();
    if (str_starts_with($site, 'https://') && !preg_match('~^https://(localhost|127\.|\[::1\])~', $site)) {
        return $site;
    }
    return 'mailto:webpush@' . (preg_replace('/[^a-z0-9.-]/', '', strtolower((string) (gethostname() ?: 'localhost'))) ?: 'localhost');
}

function ts_vapid_jwt(string $audience): string
{
    static $cache = [];
    $now = ts_now();
    if (isset($cache[$audience]) && $cache[$audience]['exp'] - 1800 > $now) {
        return $cache[$audience]['jwt'];
    }
    $config = ts_config();
    $exp = $now + 6 * 3600;
    $header = ts_b64url_encode('{"typ":"JWT","alg":"ES256"}');
    $claims = ts_b64url_encode(json_encode(['aud' => $audience, 'exp' => $exp, 'sub' => ts_vapid_subject()], JSON_UNESCAPED_SLASHES | JSON_THROW_ON_ERROR));
    $input = $header . '.' . $claims;
    $key = openssl_pkey_get_private((string) $config['vapid_private_pem']);
    if ($key === false || !openssl_sign($input, $der, $key, OPENSSL_ALGO_SHA256)) {
        throw new RuntimeException('Nie udało się podpisać tokenu VAPID. Sprawdź vapid_private_pem w config.php.');
    }
    $jwt = $input . '.' . ts_b64url_encode(ts_der_to_raw($der));
    $cache[$audience] = ['jwt' => $jwt, 'exp' => $exp];
    return $jwt;
}

function ts_push_endpoint(mixed $value): string
{
    $endpoint = ts_str($value);
    if ($endpoint === '' || strlen($endpoint) > 1024 || preg_match('/[\s\x00-\x1f\x7f\\\\]/', $endpoint)) {
        throw new TsHttpError(400, 'Nieprawidłowy adres subskrypcji.');
    }
    $parts = parse_url($endpoint);
    if (!is_array($parts) || ($parts['scheme'] ?? '') !== 'https' || empty($parts['host']) || isset($parts['user']) || isset($parts['pass'])
        || (isset($parts['port']) && (int) $parts['port'] !== 443)) {
        throw new TsHttpError(400, 'Nieprawidłowy adres subskrypcji.');
    }
    $host = strtolower($parts['host']);
    foreach (TS_PUSH_HOSTS as $allowed) {
        if ($host === $allowed || str_ends_with($host, '.' . $allowed)) {
            return $endpoint;
        }
    }
    throw new TsHttpError(400, 'Ta usługa powiadomień push nie jest obsługiwana.');
}

function ts_push_origin(string $endpoint): string
{
    $parts = parse_url($endpoint);
    return 'https://' . strtolower((string) ($parts['host'] ?? ''));
}

function ts_minutes(mixed $value): ?int
{
    $text = ts_str($value);
    if (!preg_match('/^([01]\d|2[0-3]):([0-5]\d)$/', $text, $m)) {
        return null;
    }
    return (int) $m[1] * 60 + (int) $m[2];
}

/** Sprawdza harmonogram z przeglądarki. */
function ts_push_settings(mixed $value, mixed $tz): array
{
    $settings = is_array($value) ? $value : [];
    $interval = ts_int($settings['interval'] ?? null);
    if ($interval < 15 || $interval > 240) {
        throw new TsHttpError(400, 'Odstęp między powiadomieniami musi wynosić od 15 do 240 minut.');
    }
    $from = ts_minutes($settings['from'] ?? null);
    $to = ts_minutes($settings['to'] ?? null);
    if ($from === null || $to === null || $from >= $to) {
        throw new TsHttpError(400, 'Godzina „od” musi być wcześniejsza niż „do”.');
    }
    $days = [];
    foreach (is_array($settings['days'] ?? null) ? $settings['days'] : [] as $day) {
        $n = ts_int($day);
        if ($n >= 1 && $n <= 7) {
            $days[$n] = $n;
        }
    }
    if (!$days) {
        throw new TsHttpError(400, 'Zaznacz co najmniej jeden dzień tygodnia.');
    }
    ksort($days);
    $zone = ts_str($tz);
    if (!preg_match('~^[A-Za-z0-9_+/-]{1,64}$~', $zone)) {
        $zone = 'Europe/Warsaw';
    }
    try {
        new DateTimeZone($zone);
    } catch (Throwable) {
        $zone = 'Europe/Warsaw';
    }
    return [
        'interval_min' => $interval,
        'jitter' => !empty($settings['jitter']) ? 1 : 0,
        'from_min' => $from,
        'to_min' => $to,
        'days' => implode('', $days),
        'tz' => $zone,
    ];
}

function ts_push_zone(array $sub): DateTimeZone
{
    try {
        return new DateTimeZone((string) $sub['tz']);
    } catch (Throwable) {
        return new DateTimeZone('Europe/Warsaw');
    }
}

function ts_push_in_window(array $sub, int $time): bool
{
    $local = (new DateTimeImmutable('@' . $time))->setTimezone(ts_push_zone($sub));
    $minute = (int) $local->format('G') * 60 + (int) $local->format('i');
    return str_contains((string) $sub['days'], $local->format('N')) && $minute >= (int) $sub['from_min'] && $minute < (int) $sub['to_min'];
}

/** Najbliższy moment w oknie „od–do” w wybrane dni, nie wcześniej niż $time. */
function ts_push_fit(array $sub, int $time): int
{
    $zone = ts_push_zone($sub);
    $from = (int) $sub['from_min'];
    $local = (new DateTimeImmutable('@' . $time))->setTimezone($zone);
    $moved = false;
    for ($i = 0; $i < 9; $i++) {
        $minute = (int) $local->format('G') * 60 + (int) $local->format('i');
        if (str_contains((string) $sub['days'], $local->format('N'))) {
            if ($minute >= $from && $minute < (int) $sub['to_min']) {
                // Po przeskoku na początek okna rozkładamy wysyłki w pierwszych minutach.
                return $local->getTimestamp() + ($moved ? random_int(0, 300) : 0);
            }
            if ($minute < $from) {
                return $local->setTime(intdiv($from, 60), $from % 60)->getTimestamp() + random_int(0, 300);
            }
        }
        $local = $local->setTime(0, 0)->modify('+1 day')->setTime(intdiv($from, 60), $from % 60);
        $moved = true;
    }
    return $time + 86400;
}

/** Termin kolejnego powiadomienia: odstęp (z losowym rozrzutem ±30%, jeśli włączony) dopasowany do okna. */
function ts_push_next(array $sub, int $now): int
{
    $interval = (int) $sub['interval_min'] * 60;
    $factor = !empty($sub['jitter']) ? 0.7 + 0.6 * (random_int(0, 1_000_000) / 1_000_000) : 1.0;
    return ts_push_fit($sub, $now + (int) round($interval * $factor));
}

function ts_push_request(string $endpoint): array
{
    $config = ts_config();
    $jwt = ts_vapid_jwt(ts_push_origin($endpoint));
    return ['POST', $endpoint, [
        'TTL: ' . TS_PUSH_TTL,
        'Urgency: normal',
        'Topic: przebudzenie',
        'Content-Type:',
        'Authorization: vapid t=' . $jwt . ', k=' . $config['vapid_public'],
    ], ''];
}

/**
 * Zapisuje wynik wysyłki: sukces planuje następne powiadomienie, 404/410 usuwa subskrypcję
 * (przeglądarka ją unieważniła), powtarzające się odrzucenia też ją usuwają.
 */
function ts_push_apply_result(array $sub, int $status, int $now): string
{
    $id = (int) $sub['id'];
    if ($status >= 200 && $status < 300) {
        ts_query('UPDATE push_subs SET last_sent = ?, fails = 0, next_at = ? WHERE id = ?', [$now, ts_push_next($sub, $now), $id]);
        return 'sent';
    }
    if ($status === 404 || $status === 410) {
        ts_query('DELETE FROM push_subs WHERE id = ?', [$id]);
        return 'gone';
    }
    if (in_array($status, [400, 401, 403, 413], true)) {
        if ((int) $sub['fails'] + 1 >= 3) {
            ts_query('DELETE FROM push_subs WHERE id = ?', [$id]);
            return 'gone';
        }
        ts_query('UPDATE push_subs SET fails = fails + 1, next_at = ? WHERE id = ?', [ts_push_next($sub, $now), $id]);
        return 'rejected';
    }
    // 429, 5xx, błąd sieci: spróbujemy zgodnie z harmonogramem.
    ts_query('UPDATE push_subs SET next_at = ? WHERE id = ?', [ts_push_next($sub, $now), $id]);
    return 'error';
}

/** Wysyła zaległe powiadomienia (wywoływane z crona). */
function ts_push_run(int $limit = 500): array
{
    $stats = ['due' => 0, 'sent' => 0, 'gone' => 0, 'rejected' => 0, 'error' => 0, 'skipped' => 0];
    if (!ts_push_configured()) {
        return $stats;
    }
    $now = ts_now();
    $due = ts_query('SELECT * FROM push_subs WHERE next_at <= ? ORDER BY next_at LIMIT ' . max(1, $limit), [$now])->fetchAll();
    $stats['due'] = count($due);
    $send = [];
    $requests = [];
    foreach ($due as $sub) {
        if (!ts_push_in_window($sub, $now)) {
            ts_query('UPDATE push_subs SET next_at = ? WHERE id = ?', [ts_push_fit($sub, $now), (int) $sub['id']]);
            $stats['skipped']++;
            continue;
        }
        $send[(int) $sub['id']] = $sub;
        $requests[(int) $sub['id']] = ts_push_request((string) $sub['endpoint']);
    }
    if ($requests) {
        $results = ts_http_many($requests, 15);
        foreach ($send as $id => $sub) {
            $result = ts_push_apply_result($sub, (int) ($results[$id][0] ?? 0), $now);
            $stats[$result]++;
        }
    }
    return $stats;
}

function ts_handle_push(TsRequest $request): array
{
    ts_require_method($request, 'POST');
    $action = $request->action();
    if ($action === 'unsubscribe') {
        // Wypisać się można zawsze, nawet gdy administrator wyłączył powiadomienia.
        $endpoint = ts_push_endpoint($request->input('endpoint'));
        ts_query('DELETE FROM push_subs WHERE endpoint_hash = ?', [hash('sha256', $endpoint)]);
        return ['ok' => true];
    }
    if (!ts_push_configured()) {
        throw new TsHttpError(503, 'Powiadomienia push są na tym serwerze wyłączone.');
    }
    ts_record_origin($request);
    return match ($action) {
        'subscribe' => ts_push_subscribe($request),
        'resubscribe' => ts_push_resubscribe($request),
        'test' => ts_push_test($request),
        default => throw new TsHttpError(400, 'Nieznana operacja.'),
    };
}

function ts_push_subscribe(TsRequest $request): array
{
    if (ts_config()['push_require_account'] && ts_session($request, false) === null) {
        throw new TsHttpError(401, 'Zaloguj się na swoje konto, żeby włączyć powiadomienia.');
    }
    $subscription = $request->input('subscription');
    $endpoint = ts_push_endpoint(is_array($subscription) ? ($subscription['endpoint'] ?? null) : null);
    $settings = ts_push_settings($request->input('settings'), $request->input('tz'));
    ts_rate_hit('push-sub', ts_ip_hash($request), 30, 3600);
    $hash = hash('sha256', $endpoint);
    $now = ts_now();
    $next = ts_push_next($settings, $now);
    return ts_transaction(static function () use ($endpoint, $hash, $settings, $now, $next): array {
        $exists = (bool) ts_query('SELECT 1 FROM push_subs WHERE endpoint_hash = ?', [$hash])->fetchColumn();
        if (!$exists && (int) ts_query('SELECT COUNT(*) FROM push_subs')->fetchColumn() >= (int) ts_config()['push_max_subscriptions']) {
            throw new TsHttpError(503, 'Serwer osiągnął limit subskrypcji powiadomień. Spróbuj później.');
        }
        ts_query(
            'INSERT INTO push_subs (endpoint_hash, endpoint, interval_min, jitter, from_min, to_min, days, tz, next_at, created_at, updated_at, fails)
             VALUES (:hash, :endpoint, :interval, :jitter, :from, :to, :days, :tz, :next, :now, :now, 0)
             ON CONFLICT(endpoint_hash) DO UPDATE SET interval_min = excluded.interval_min, jitter = excluded.jitter, from_min = excluded.from_min,
             to_min = excluded.to_min, days = excluded.days, tz = excluded.tz, next_at = excluded.next_at, updated_at = excluded.updated_at, fails = 0',
            [
                'hash' => $hash, 'endpoint' => $endpoint, 'interval' => $settings['interval_min'], 'jitter' => $settings['jitter'],
                'from' => $settings['from_min'], 'to' => $settings['to_min'], 'days' => $settings['days'], 'tz' => $settings['tz'],
                'next' => $next, 'now' => $now,
            ],
        );
        return ['ok' => true, 'nextAt' => $next * 1000];
    });
}

/** Przeglądarka wymieniła subskrypcję (zdarzenie pushsubscriptionchange): przenosimy harmonogram. */
function ts_push_resubscribe(TsRequest $request): array
{
    $old = ts_push_endpoint($request->input('oldEndpoint'));
    $subscription = $request->input('subscription');
    $new = ts_push_endpoint(is_array($subscription) ? ($subscription['endpoint'] ?? null) : null);
    ts_rate_hit('push-sub', ts_ip_hash($request), 30, 3600);
    $oldHash = hash('sha256', $old);
    $newHash = hash('sha256', $new);
    return ts_transaction(static function () use ($oldHash, $newHash, $new): array {
        if ($oldHash !== $newHash && ts_query('SELECT 1 FROM push_subs WHERE endpoint_hash = ?', [$newHash])->fetchColumn()) {
            ts_query('DELETE FROM push_subs WHERE endpoint_hash = ?', [$oldHash]);
            return ['ok' => true];
        }
        $moved = ts_query('UPDATE push_subs SET endpoint = ?, endpoint_hash = ?, fails = 0, updated_at = ? WHERE endpoint_hash = ?', [$new, $newHash, ts_now(), $oldHash])->rowCount();
        if ($moved === 0) {
            throw new TsHttpError(404, 'Nie znaleziono subskrypcji.');
        }
        return ['ok' => true];
    });
}

function ts_push_test(TsRequest $request): array
{
    $endpoint = ts_push_endpoint($request->input('endpoint'));
    $hash = hash('sha256', $endpoint);
    $sub = ts_query('SELECT * FROM push_subs WHERE endpoint_hash = ?', [$hash])->fetch();
    if (!$sub) {
        throw new TsHttpError(404, 'Serwer nie zna tej subskrypcji. Wyłącz i włącz powiadomienia ponownie.');
    }
    ts_rate_hit('push-test', substr($hash, 0, 32), 5, 600, 'Wysłano już kilka powiadomień próbnych. Spróbuj za kilka minut.');
    ts_rate_hit('push-test-ip', ts_ip_hash($request), 10, 600, 'Wysłano już kilka powiadomień próbnych. Spróbuj za kilka minut.');
    [$status] = ts_http_many(['test' => ts_push_request($endpoint)], 15)['test'];
    if ($status >= 200 && $status < 300) {
        return ['message' => 'Wysłano powiadomienie próbne. Powinno pojawić się w ciągu kilku sekund.'];
    }
    if ($status === 404 || $status === 410) {
        ts_query('DELETE FROM push_subs WHERE endpoint_hash = ?', [$hash]);
        throw new TsHttpError(410, 'Przeglądarka unieważniła tę subskrypcję. Wyłącz i włącz powiadomienia ponownie.');
    }
    ts_log('push', 'Test: usługa ' . ts_push_origin($endpoint) . ' zwróciła ' . $status);
    if ($status === 401 || $status === 403) {
        throw new TsHttpError(502, 'Usługa push odrzuciła podpis serwera. Wyłącz i włącz powiadomienia ponownie.');
    }
    throw new TsHttpError(502, $status === 0 ? 'Nie udało się połączyć z usługą push. Spróbuj ponownie za chwilę.' : 'Usługa push nie przyjęła powiadomienia (kod ' . $status . '). Spróbuj ponownie za chwilę.');
}

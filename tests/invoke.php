<?php
declare(strict_types=1);

/**
 * Testy: wywołuje jedną funkcję API w procesie CLI, bez serwera WWW.
 * Wejście (STDIN, JSON): dataDir, handler, method, query, body, headers, ip, secure, host,
 * now (czas uniksowy), config (nadpisanie konfiguracji), http (odpowiedzi udawanych usług zewnętrznych).
 * Wyjście (STDOUT, JSON): status, body, http (lista zapytań wysłanych na zewnątrz).
 */

const TS_API = true;
require_once __DIR__ . '/../public/api/lib/bootstrap.php';
require_once __DIR__ . '/../public/api/lib/service.php';

$input = json_decode((string) stream_get_contents(STDIN), true, 512, JSON_THROW_ON_ERROR);
Ts::$dataDir = (string) $input['dataDir'];
if (!is_dir(Ts::$dataDir)) {
    mkdir(Ts::$dataDir, 0700, true);
}
Ts::$now = isset($input['now']) ? (int) $input['now'] : null;
Ts::$configOverride = isset($input['config']) && is_array($input['config']) ? $input['config'] : null;

$httpLog = [];
$httpSpec = is_array($input['http'] ?? null) ? $input['http'] : [];
$GLOBALS['TS_HTTP_MOCK'] = static function (string $method, string $url, array $headers, string $body) use (&$httpLog, &$httpSpec): array {
    $httpLog[] = ['method' => $method, 'url' => $url, 'headers' => $headers, 'body' => $body];
    foreach ($httpSpec['rules'] ?? [] as $index => $rule) {
        if (str_contains($url, (string) $rule['match']) && (!isset($rule['bodyMatch']) || str_contains($body, (string) $rule['bodyMatch']))) {
            if (!empty($rule['once'])) {
                unset($httpSpec['rules'][$index]);
            }
            return [(int) $rule['status'], is_string($rule['body'] ?? null) ? $rule['body'] : json_encode($rule['body'] ?? new stdClass())];
        }
    }
    $default = $httpSpec['default'] ?? [201, ''];
    return [(int) $default[0], is_string($default[1] ?? null) ? $default[1] : json_encode($default[1] ?? new stdClass())];
};

$request = new TsRequest(
    strtoupper((string) ($input['method'] ?? 'GET')),
    is_array($input['query'] ?? null) ? $input['query'] : [],
    is_array($input['body'] ?? null) ? $input['body'] : [],
    array_change_key_case(is_array($input['headers'] ?? null) ? $input['headers'] : [], CASE_LOWER),
    ts_client_ip((string) ($input['ip'] ?? '203.0.113.7')),
    (bool) ($input['secure'] ?? true),
    strtolower((string) ($input['host'] ?? 'transerfing.example.pl')),
);

$handlers = [
    'status' => 'ts_handle_status',
    'auth' => 'ts_handle_auth',
    'sync' => 'ts_handle_sync',
    'push' => 'ts_handle_push',
    'ai' => 'ts_handle_ai',
    'cron' => static function (): array {
        ob_start();
        $code = ts_cron_main(['cron.php', '--verbose']);
        return ['code' => $code, 'output' => (string) ob_get_clean()];
    },
    'pushRun' => static fn (): array => ts_push_run(),
    'cleanup' => static fn (): array => ts_cleanup(),
    'diag' => static fn (): array => ['checks' => ts_diagnostics(false)],
    'jwt' => static fn (TsRequest $r): array => ['jwt' => ts_vapid_jwt((string) ($r->body['aud'] ?? '')), 'public' => ts_config()['vapid_public']],
    'next' => static fn (TsRequest $r): array => ['next' => ts_push_next($r->body['sub'], (int) $r->body['now']), 'fit' => ts_push_fit($r->body['sub'], (int) $r->body['now'])],
    'pick' => static fn (TsRequest $r): array => ts_ai_pick(ts_ai_knowledge(), (string) ($r->body['query'] ?? '')),
    'sql' => static fn (TsRequest $r): array => ['rows' => ts_query((string) $r->body['sql'], (array) ($r->body['params'] ?? []))->fetchAll()],
];
$handler = $handlers[(string) $input['handler']] ?? null;
if ($handler === null) {
    fwrite(STDERR, 'Nieznany handler: ' . $input['handler'] . "\n");
    exit(2);
}
[$status, $payload] = ts_dispatch($handler, $request);
if ($status === 500) {
    $log = Ts::$dataDir . '/logs/error.log';
    $payload['log'] = is_file($log) ? substr((string) file_get_contents($log), -2000) : '';
}
echo json_encode(['status' => $status, 'body' => $payload, 'http' => $httpLog], JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);

<?php
declare(strict_types=1);

// Diagnostyka serwera. Uruchom przez SSH:
//   php ~/domains/DOMENA/public_html/api/diagnostyka.php          (sprawdzenie konfiguracji)
//   php ~/domains/DOMENA/public_html/api/diagnostyka.php --ai     (dodatkowo próbne pytanie do AI)
//   php ~/domains/DOMENA/public_html/api/diagnostyka.php --vapid  (nowe klucze VAPID do wklejenia w config.php)
//   php ~/domains/DOMENA/public_html/api/diagnostyka.php --usun-konta --potwierdzam  (reset kont, np. po zapomnianym hasle)
// W przeglądarce działa tylko po ustawieniu 'diag_web' => true w config.php. Nie pokazuje sekretów.

const TS_API = true;
require_once __DIR__ . '/lib/bootstrap.php';
require_once __DIR__ . '/lib/service.php';

$cli = PHP_SAPI === 'cli';
$args = $cli ? array_slice($argv, 1) : [];

if (!$cli) {
    try {
        $allowed = (bool) ts_config()['diag_web'];
    } catch (Throwable) {
        $allowed = false;
    }
    if (!$allowed) {
        http_response_code(404);
        exit;
    }
    header('Content-Type: text/plain; charset=utf-8');
    header('Cache-Control: no-store');
    header('X-Robots-Tag: noindex');
}

// Zapomniane hasło do jedynego konta (wersja prywatna): usuń konta i załóż swoje od nowa. Tylko z konsoli.
if (in_array('--usun-konta', $args, true)) {
    if (!in_array('--potwierdzam', $args, true)) {
        echo "To usunie z serwera wszystkie konta, sesje i zaszyfrowane kopie danych. Dane w przegladarkach zostana.\n";
        echo "Zeby potwierdzic, uruchom: php diagnostyka.php --usun-konta --potwierdzam\n";
        exit(1);
    }
    $count = (int) ts_db()->query('SELECT COUNT(*) FROM users')->fetchColumn();
    ts_transaction(static function (): void {
        ts_query('DELETE FROM vaults');
        ts_query('DELETE FROM sessions');
        ts_query("DELETE FROM ai_usage WHERE subject LIKE 'u:%'");
        ts_query('DELETE FROM users');
    });
    echo "Usunieto konta: {$count}. Nowe konto zalozysz w zakladce Konto.\n";
    exit(0);
}

if (in_array('--vapid', $args, true)) {
    $keys = ts_generate_vapid();
    if ($keys === null) {
        echo "Nie udało się wygenerować kluczy (sprawdź rozszerzenie openssl).\n";
        exit(1);
    }
    echo "Wklej do config.php (zastępując stare wartości). Dotychczasowe subskrypcje push przestaną działać.\n\n";
    echo "    'vapid_public' => " . var_export($keys['public'], true) . ",\n";
    echo "    'vapid_private_pem' => " . var_export($keys['private_pem'], true) . ",\n";
    exit(0);
}

echo 'Transerfing w praktyce: diagnostyka serwera (wersja ' . TS_VERSION . ")\n\n";
$failed = false;
$labels = ['ok' => 'OK', 'uwaga' => 'UWAGA', 'błąd' => 'BŁĄD'];
foreach (ts_diagnostics(in_array('--ai', $args, true)) as [$state, $label, $detail]) {
    $failed = $failed || $state === 'błąd';
    printf("[%s] %s%s\n", $labels[$state] ?? $state, $label, $detail !== '' ? ': ' . $detail : '');
}
echo $failed ? "\nSą błędy do poprawienia.\n" : "\nGotowe.\n";
exit($failed ? 1 : 0);

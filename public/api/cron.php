<?php
declare(strict_types=1);

// Zadanie okresowe: powiadomienia push i sprzątanie. Uruchamiane tylko z konsoli (cron), nie z przeglądarki.
// MyDevil, panel „Zadania Cron”, co 5 minut:
//   /usr/local/bin/php /usr/home/LOGIN/domains/DOMENA/public_html/api/cron.php

if (PHP_SAPI !== 'cli') {
    http_response_code(404);
    exit;
}

const TS_API = true;
require_once __DIR__ . '/lib/bootstrap.php';
require_once __DIR__ . '/lib/service.php';
exit(ts_cron_main($argv));

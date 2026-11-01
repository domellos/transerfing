<?php
declare(strict_types=1);

const TS_API = true;
require_once __DIR__ . '/lib/bootstrap.php';
require_once __DIR__ . '/lib/accounts.php';
ts_run('ts_handle_auth');

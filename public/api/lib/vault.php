<?php
declare(strict_types=1);

/**
 * Synchronizacja: zaszyfrowana kopia danych jednej osoby („sejf”) z numerem wersji.
 *
 * Serwer nie zna klucza i nie widzi treści. Zapis wymaga podania wersji, na której
 * oparto zmiany. Gdy w międzyczasie inne urządzenie zapisało nowszą, serwer zwraca 409,
 * a przeglądarka pobiera nowszą kopię, scala ją ze swoimi zmianami i próbuje ponownie.
 */

if (!defined('TS_API')) {
    http_response_code(404);
    exit;
}

function ts_handle_sync(TsRequest $request): array
{
    ts_require_method($request, 'GET', 'POST');
    $session = ts_session($request);
    $userId = (int) $session['user_id'];
    ts_rate_hit('sync', 'u' . $userId, 240, 600, 'Zbyt wiele synchronizacji naraz. Spróbuj ponownie za kilka minut.');
    $action = $request->action();
    if ($request->method === 'GET' || $action === 'pull') {
        return ts_vault_read($userId);
    }
    if ($action !== '' && $action !== 'push') {
        throw new TsHttpError(400, 'Nieznana operacja.');
    }
    $baseVersion = ts_int($request->input('baseVersion'));
    [$iv, $data] = ts_vault_payload($request);
    $version = ts_transaction(static fn (): int => ts_vault_write($userId, $baseVersion, $iv, $data));
    return ['version' => $version];
}

function ts_vault_read(int $userId): array
{
    $row = ts_query('SELECT version, iv, data, updated_at FROM vaults WHERE user_id = ?', [$userId])->fetch();
    if (!$row) {
        return ['version' => 0];
    }
    return ['version' => (int) $row['version'], 'iv' => (string) $row['iv'], 'data' => (string) $row['data'], 'updatedAt' => (int) $row['updated_at'] * 1000];
}

/** Sprawdza zaszyfrowaną kopię: wektor IV (12 bajtów) i szyfrogram AES-GCM w base64. */
function ts_vault_payload(TsRequest $request): array
{
    $iv = ts_str($request->input('iv'));
    $data = ts_str($request->input('data'));
    if (strlen($iv) !== 16 || base64_decode($iv, true) === false || strlen((string) base64_decode($iv, true)) !== 12) {
        throw new TsHttpError(400, 'Nieprawidłowe dane synchronizacji.');
    }
    if (strlen($data) > TS_MAX_VAULT) {
        throw new TsHttpError(413, 'Kopia danych przekracza 5 MB. Usuń najstarsze wpisy albo pobierz kopię zapasową i zacznij od nowa.');
    }
    $body = rtrim($data, '=');
    $alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';
    if (strlen($data) < 24 || strlen($data) % 4 !== 0 || strlen($data) - strlen($body) > 2 || strspn($body, $alphabet) !== strlen($body)) {
        throw new TsHttpError(400, 'Nieprawidłowe dane synchronizacji.');
    }
    return [$iv, $data];
}

/** Zapisuje nową wersję (wywoływać w transakcji). Zwraca numer nowej wersji albo rzuca 409. */
function ts_vault_write(int $userId, int $baseVersion, string $iv, string $data): int
{
    $current = (int) (ts_query('SELECT version FROM vaults WHERE user_id = ?', [$userId])->fetchColumn() ?: 0);
    if ($baseVersion !== $current) {
        throw new TsHttpError(409, 'Na serwerze jest nowsza wersja danych.', ['version' => $current]);
    }
    $version = $current + 1;
    ts_query(
        'INSERT INTO vaults (user_id, version, iv, data, updated_at) VALUES (?, ?, ?, ?, ?)
         ON CONFLICT(user_id) DO UPDATE SET version = excluded.version, iv = excluded.iv, data = excluded.data, updated_at = excluded.updated_at',
        [$userId, $version, $iv, $data, ts_now()],
    );
    return $version;
}

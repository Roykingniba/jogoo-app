<?php
// Shared helpers for the JOGOO client API. PHP 7.4+ (works on 8.x).
declare(strict_types=1);

const JOGOO_STAGES = [
    'signed_up', 'contacted', 'site_visit', 'quote_sent',
    'payment_made', 'installation_scheduled', 'installed',
];
const SESSION_COOKIE = 'jogoo_session';

require_once __DIR__ . '/security.php';

// ---------------------------------------------------------------- config

function config(): array
{
    static $cfg = null;
    if ($cfg !== null) return $cfg;
    $candidates = [
        getenv('JOGOO_CONFIG') ?: '',
        // Outside the website folder: /home/<user>/jogoo-private/config.php
        dirname(__DIR__, 3) . '/jogoo-private/config.php',
        dirname(__DIR__, 4) . '/jogoo-private/config.php',
        // Fallback inside api/ (blocked from the web by .htaccess).
        dirname(__DIR__) . '/config.local.php',
    ];
    foreach ($candidates as $file) {
        if ($file !== '' && is_file($file)) {
            $cfg = require $file;
            // Optional app.php next to config.php: app settings kept apart from
            // the database password (email sender, super admins, secret).
            $extra = dirname($file) . '/app.php';
            if (is_file($extra)) $cfg = array_merge($cfg, require $extra);
            $cfg['_file'] = $file;
            return $cfg;
        }
    }
    fail(500, 'not_configured');
}

function db(): PDO
{
    static $pdo = null;
    if ($pdo) return $pdo;
    $c = config();
    if (($c['db_user'] ?? '') === '' || ($c['db_pass'] ?? '') === '') fail(503, 'not_configured');
    try {
        $pdo = new PDO(
            "mysql:host={$c['db_host']};dbname={$c['db_name']};charset=utf8mb4",
            $c['db_user'],
            $c['db_pass'],
            [
                PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
                PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
                PDO::ATTR_EMULATE_PREPARES => false,
            ]
        );
        $pdo->exec("SET time_zone = '+00:00'");
        // Upgrade older databases in place (no-op once current).
        if ($pdo->query("SHOW TABLES LIKE 'users'")->fetchColumn()) migrate($pdo);
    } catch (PDOException $e) {
        error_log('JOGOO db connect failed: ' . $e->getMessage());
        fail(503, 'database_unavailable');
    }
    return $pdo;
}

// ---------------------------------------------------------------- http

function send_security_headers(): void
{
    header('Content-Type: application/json; charset=utf-8');
    header('Cache-Control: no-store');
    header('X-Content-Type-Options: nosniff');
    header('Referrer-Policy: strict-origin-when-cross-origin');
    header("Content-Security-Policy: default-src 'none'; frame-ancestors 'none'");
}

/** @return never */
function respond(int $status, $body)
{
    http_response_code($status);
    echo json_encode($body, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
    exit;
}

/** Error responses carry a stable code the app translates. @return never */
function fail(int $status, string $code, array $extra = [])
{
    respond($status, ['error' => $code] + $extra);
}

function json_body(): array
{
    $raw = file_get_contents('php://input', false, null, 0, 65536);
    if ($raw === '' || $raw === false) return [];
    $data = json_decode($raw, true);
    if (!is_array($data)) fail(400, 'invalid_json');
    return $data;
}

/**
 * Blocks cross-site requests. State-changing calls must come from an allowed
 * origin and carry the X-Jogoo-Client header, which browsers will not send
 * cross-site without a CORS preflight (and we never answer preflights).
 */
function check_request_origin(string $method): void
{
    if ($method === 'GET' || $method === 'HEAD') return;
    if (($_SERVER['HTTP_X_JOGOO_CLIENT'] ?? '') !== 'web') fail(403, 'forbidden');
    $origin = $_SERVER['HTTP_ORIGIN'] ?? '';
    if ($origin === '') return; // same-origin requests may omit it
    $self = (is_https() ? 'https://' : 'http://') . ($_SERVER['HTTP_HOST'] ?? '');
    $allowed = array_merge([$self], config()['allowed_origins'] ?? []);
    if (!in_array($origin, $allowed, true)) fail(403, 'forbidden');
}

function is_https(): bool
{
    return (!empty($_SERVER['HTTPS']) && $_SERVER['HTTPS'] !== 'off')
        || (($_SERVER['HTTP_X_FORWARDED_PROTO'] ?? '') === 'https')
        || (($_SERVER['SERVER_PORT'] ?? '') === '443');
}

function client_ip(): string
{
    return substr((string)($_SERVER['REMOTE_ADDR'] ?? '0.0.0.0'), 0, 45);
}

function uuid4(): string
{
    $b = random_bytes(16);
    $b[6] = chr((ord($b[6]) & 0x0f) | 0x40);
    $b[8] = chr((ord($b[8]) & 0x3f) | 0x80);
    return vsprintf('%s%s-%s-%s-%s-%s%s%s', str_split(bin2hex($b), 4));
}

function now_utc(): string
{
    return gmdate('Y-m-d H:i:s');
}

/** MySQL UTC datetime → ISO 8601 for the app. */
function iso(?string $dt): ?string
{
    if ($dt === null) return null;
    return str_replace(' ', 'T', substr($dt, 0, 19)) . 'Z';
}

// ---------------------------------------------------------------- validation

function str_field(array $in, string $key, int $max, bool $required = true): ?string
{
    $v = $in[$key] ?? null;
    if ($v === null || (is_string($v) && trim($v) === '')) {
        if ($required) fail(422, 'missing_field', ['field' => $key]);
        return null;
    }
    if (!is_string($v)) fail(422, 'invalid_field', ['field' => $key]);
    $v = trim(preg_replace('/[\x00-\x1F\x7F]/u', ' ', $v) ?? '');
    if (mb_strlen($v) > $max) fail(422, 'field_too_long', ['field' => $key]);
    return $v;
}

function email_field(array $in): string
{
    $email = mb_strtolower(str_field($in, 'email', 254) ?? '');
    if (!filter_var($email, FILTER_VALIDATE_EMAIL)) fail(422, 'invalid_email');
    return $email;
}

function password_field(array $in, string $key = 'password'): string
{
    $p = $in[$key] ?? null;
    if (!is_string($p) || $p === '') fail(422, 'missing_field', ['field' => $key]);
    if (strlen($p) < 8) fail(422, 'weak_password');
    // bcrypt only uses the first 72 bytes.
    if (strlen($p) > 72) fail(422, 'password_too_long');
    return $p;
}

function hash_password(string $p): string
{
    // bcrypt: portable to Supabase Auth (GoTrue), which also uses bcrypt.
    return password_hash($p, PASSWORD_BCRYPT, ['cost' => 12]);
}

// ---------------------------------------------------------------- rate limits

function too_many(string $kind, string $col, string $value, int $limit, int $minutes): bool
{
    $st = db()->prepare(
        "SELECT COUNT(*) FROM auth_attempts WHERE kind = ? AND $col = ? AND created_at > (UTC_TIMESTAMP() - INTERVAL ? MINUTE)"
    );
    $st->execute([$kind, $value, $minutes]);
    return (int)$st->fetchColumn() >= $limit;
}

function record_attempt(string $kind, ?string $email): void
{
    db()->prepare('INSERT INTO auth_attempts (kind, ip, email, created_at) VALUES (?, ?, ?, ?)')
        ->execute([$kind, client_ip(), $email, now_utc()]);
    // Housekeeping: keep the table small.
    if (random_int(1, 50) === 1) {
        db()->exec('DELETE FROM auth_attempts WHERE created_at < (UTC_TIMESTAMP() - INTERVAL 2 DAY)');
        db()->exec('DELETE FROM sessions WHERE expires_at < UTC_TIMESTAMP()');
        db()->exec('DELETE FROM auth_challenges WHERE expires_at < UTC_TIMESTAMP()');
        db()->exec('DELETE FROM trusted_devices WHERE expires_at < UTC_TIMESTAMP()');
    }
}

// ---------------------------------------------------------------- sessions

function start_session(string $userId): void
{
    $token = random_token();
    $days = (int)(config()['session_days'] ?? 30);
    $expires = time() + $days * 86400;
    db()->prepare('INSERT INTO sessions (token_hash, user_id, created_at, expires_at, user_agent) VALUES (?, ?, ?, ?, ?)')
        ->execute([hash('sha256', $token), $userId, now_utc(), gmdate('Y-m-d H:i:s', $expires),
            substr((string)($_SERVER['HTTP_USER_AGENT'] ?? ''), 0, 255)]);
    set_session_cookie($token, $expires);
}

function set_session_cookie(string $value, int $expires): void
{
    setcookie(SESSION_COOKIE, $value, [
        'expires' => $expires,
        'path' => '/',
        'secure' => is_https(),
        'httponly' => true,
        'samesite' => 'Lax',
    ]);
}

function end_session(): void
{
    $token = $_COOKIE[SESSION_COOKIE] ?? '';
    if (is_string($token) && $token !== '') {
        db()->prepare('DELETE FROM sessions WHERE token_hash = ?')->execute([hash('sha256', $token)]);
    }
    set_session_cookie('', time() - 3600);
}

/** The signed-in user's id and profile, or null. */
function current_user(): ?array
{
    static $cached = false;
    if ($cached !== false) return $cached;
    $cached = null;
    $token = $_COOKIE[SESSION_COOKIE] ?? '';
    if (!is_string($token) || strlen($token) < 20 || strlen($token) > 100) return null;
    $st = db()->prepare(
        'SELECT u.id, u.email, u.created_at AS user_created_at, p.full_name, p.phone, p.location, p.farm_size_ha, p.role, p.lang, p.created_at
           FROM sessions s JOIN users u ON u.id = s.user_id JOIN profiles p ON p.id = u.id
          WHERE s.token_hash = ? AND s.expires_at > UTC_TIMESTAMP()'
    );
    $st->execute([hash('sha256', $token)]);
    $row = $st->fetch();
    if ($row) $cached = $row;
    return $cached;
}

function require_user(): array
{
    $u = current_user();
    if (!$u) fail(401, 'not_signed_in');
    return $u;
}

function require_admin(): array
{
    $u = require_user();
    if (!is_staff($u)) fail(403, 'forbidden');
    return $u;
}

// ---------------------------------------------------------------- shaping

function profile_json(array $row): array
{
    return [
        'id' => $row['id'],
        'email' => $row['email'],
        'fullName' => $row['full_name'],
        'phone' => $row['phone'],
        'location' => $row['location'],
        'farmSizeHa' => $row['farm_size_ha'] === null ? null : (float)$row['farm_size_ha'],
        'role' => $row['role'],
        'lang' => $row['lang'],
        'createdAt' => iso($row['created_at']),
    ];
}

function journey_for(string $clientId): array
{
    $st = db()->prepare(
        'SELECT e.id, e.stage, e.note, e.created_at, a.full_name AS author
           FROM journey_events e LEFT JOIN profiles a ON a.id = e.created_by
          WHERE e.client_id = ? ORDER BY e.created_at ASC, e.id ASC'
    );
    $st->execute([$clientId]);
    $events = [];
    foreach ($st->fetchAll() as $r) {
        $events[] = [
            'id' => $r['id'],
            'stage' => $r['stage'],
            'note' => $r['note'],
            'at' => iso($r['created_at']),
            'by' => $r['author'],
        ];
    }
    $current = $events ? $events[count($events) - 1]['stage'] : 'signed_up';
    return ['stages' => JOGOO_STAGES, 'current' => $current, 'events' => $events];
}

function add_event(string $clientId, string $stage, ?string $note, ?string $by): void
{
    db()->prepare('INSERT INTO journey_events (id, client_id, stage, note, created_by, created_at) VALUES (?, ?, ?, ?, ?, ?)')
        ->execute([uuid4(), $clientId, $stage, $note, $by,
            (new DateTime('now', new DateTimeZone('UTC')))->format('Y-m-d H:i:s.v')]);
}

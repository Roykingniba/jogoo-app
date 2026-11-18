<?php
// Schema upgrades, email, 2-step verification codes, trusted devices and
// role helpers. Loaded by bootstrap.php.
declare(strict_types=1);

const CHALLENGE_COOKIE = 'jogoo_challenge';
const DEVICE_COOKIE = 'jogoo_device';
const SCHEMA_VERSION = 2;
const CODE_TTL_MIN = 10;
const CODE_MAX_TRIES = 5;
const CODE_FAILS_PER_HOUR = 10;

// ---------------------------------------------------------------- migrations

/** Brings any existing database up to SCHEMA_VERSION. Safe to run repeatedly. */
function migrate(PDO $pdo): void
{
    $pdo->exec('CREATE TABLE IF NOT EXISTS meta (k VARCHAR(64) NOT NULL PRIMARY KEY, v VARCHAR(255) NOT NULL)
                ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci');
    $v = (int)($pdo->query("SELECT v FROM meta WHERE k = 'schema_version'")->fetchColumn() ?: 1);
    if ($v >= SCHEMA_VERSION) return;

    if ($v < 2) {
        $has = function (string $table, string $col) use ($pdo): bool {
            $st = $pdo->prepare('SELECT 1 FROM information_schema.COLUMNS WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = ? AND COLUMN_NAME = ?');
            $st->execute([$table, $col]);
            return (bool)$st->fetchColumn();
        };
        if (!$has('users', 'email_verified_at')) {
            $pdo->exec('ALTER TABLE users ADD COLUMN email_verified_at DATETIME NULL AFTER password_hash');
            // Accounts created before 2-step verification existed keep working.
            $pdo->exec('UPDATE users SET email_verified_at = created_at');
        }
        $pdo->exec("ALTER TABLE profiles MODIFY role ENUM('client','admin','super_admin') NOT NULL DEFAULT 'client'");
        $pdo->exec('ALTER TABLE auth_attempts MODIFY kind VARCHAR(24) NOT NULL');
        $pdo->exec('CREATE TABLE IF NOT EXISTS auth_challenges (
            token_hash   CHAR(64)    NOT NULL PRIMARY KEY,
            user_id      CHAR(36)    NOT NULL,
            purpose      ENUM(\'verify_email\',\'login\',\'reset_password\') NOT NULL,
            code_hash    CHAR(64)    NOT NULL,
            attempts     TINYINT UNSIGNED NOT NULL DEFAULT 0,
            sends        TINYINT UNSIGNED NOT NULL DEFAULT 1,
            last_sent_at DATETIME    NOT NULL,
            expires_at   DATETIME    NOT NULL,
            created_at   DATETIME    NOT NULL DEFAULT CURRENT_TIMESTAMP,
            CONSTRAINT auth_challenges_user_fkey FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
            KEY auth_challenges_expiry_idx (expires_at)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci');
        $pdo->exec('CREATE TABLE IF NOT EXISTS trusted_devices (
            token_hash  CHAR(64)  NOT NULL PRIMARY KEY,
            user_id     CHAR(36)  NOT NULL,
            created_at  DATETIME  NOT NULL DEFAULT CURRENT_TIMESTAMP,
            expires_at  DATETIME  NOT NULL,
            CONSTRAINT trusted_devices_user_fkey FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
            KEY trusted_devices_user_idx (user_id)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci');
    }
    $pdo->prepare("REPLACE INTO meta (k, v) VALUES ('schema_version', ?)")->execute([(string)SCHEMA_VERSION]);
}

// ---------------------------------------------------------------- roles

function is_staff(array $u): bool
{
    return in_array($u['role'] ?? '', ['admin', 'super_admin'], true);
}

/** Emails listed in config 'super_admin_emails' become super admins once they prove they own the address. */
function apply_super_admin(string $userId, string $email): void
{
    $list = array_map('mb_strtolower', config()['super_admin_emails'] ?? []);
    if (in_array(mb_strtolower($email), $list, true)) {
        db()->prepare("UPDATE profiles SET role = 'super_admin' WHERE id = ?")->execute([$userId]);
    }
}

// ---------------------------------------------------------------- tokens & cookies

function random_token(): string
{
    return rtrim(strtr(base64_encode(random_bytes(32)), '+/', '-_'), '=');
}

function set_cookie(string $name, string $value, int $expires): void
{
    setcookie($name, $value, [
        'expires' => $expires, 'path' => '/', 'secure' => is_https(), 'httponly' => true, 'samesite' => 'Lax',
    ]);
}

function code_hash(string $code): string
{
    return hash_hmac('sha256', $code, app_secret());
}

/** The secret for hashing codes: app_secret (or, for older installs, setup_key). Refuses placeholders. */
function app_secret(): string
{
    foreach (['app_secret', 'setup_key'] as $k) {
        $s = (string)(config()[$k] ?? '');
        if (strlen($s) >= 16 && strncmp($s, 'CHANGE-ME', 9) !== 0) return $s;
    }
    error_log('JOGOO: app_secret is missing or still the sample value; set a long random app_secret in jogoo-private/app.php');
    fail(500, 'not_configured');
}

// ---------------------------------------------------------------- email

function mask_email(string $email): string
{
    [$user, $domain] = array_pad(explode('@', $email, 2), 2, '');
    $shown = mb_substr($user, 0, min(2, max(1, mb_strlen($user) - 1)));
    return $shown . str_repeat('•', max(2, mb_strlen($user) - mb_strlen($shown))) . '@' . $domain;
}

/** Sends a plain + HTML email. In development, set 'mail_log' in config to write emails to a file instead. */
function send_mail(string $to, string $subject, string $text, string $html): bool
{
    $c = config();
    $fromAddr = $c['mail_from'] ?? 'no-reply@jogoo.africa';
    $fromName = $c['mail_from_name'] ?? 'JOGOO Agriculture';
    if (!empty($c['mail_log'])) {
        file_put_contents($c['mail_log'], json_encode(['to' => $to, 'subject' => $subject, 'text' => $text]) . "\n", FILE_APPEND | LOCK_EX);
        return true;
    }
    $boundary = 'b' . bin2hex(random_bytes(12));
    $headers = [
        'From: ' . mb_encode_mimeheader($fromName, 'UTF-8') . " <$fromAddr>",
        "Reply-To: $fromAddr",
        'MIME-Version: 1.0',
        "Content-Type: multipart/alternative; boundary=\"$boundary\"",
        'X-Auto-Response-Suppress: All',
        'Auto-Submitted: auto-generated',
    ];
    $body = "--$boundary\r\nContent-Type: text/plain; charset=UTF-8\r\nContent-Transfer-Encoding: base64\r\n\r\n"
        . chunk_split(base64_encode($text))
        . "--$boundary\r\nContent-Type: text/html; charset=UTF-8\r\nContent-Transfer-Encoding: base64\r\n\r\n"
        . chunk_split(base64_encode($html))
        . "--$boundary--\r\n";
    $ok = mail($to, mb_encode_mimeheader($subject, 'UTF-8'), $body, implode("\r\n", $headers), '-f' . $fromAddr);
    if (!$ok) error_log("JOGOO mail to $to failed");
    return $ok;
}

/** The 6-digit code email, in the client's language. */
function send_code_email(string $to, string $name, string $code, string $purpose, string $lang): bool
{
    $fr = $lang === 'fr';
    $what = [
        'verify_email' => $fr ? 'confirmer votre adresse e-mail' : 'confirm your email address',
        'login' => $fr ? 'vous connecter' : 'sign in',
        'reset_password' => $fr ? 'choisir un nouveau mot de passe' : 'choose a new password',
    ][$purpose];
    $subject = $fr ? "Votre code JOGOO : $code" : "Your JOGOO code: $code";
    // Only greet by name on sign-in codes: those go to verified accounts whose
    // owner chose the name. Sign-up and reset emails can be triggered by
    // anyone for any address, so they must not carry text a stranger typed.
    $hello = $purpose === 'login'
        ? ($fr ? "Bonjour $name," : "Hello $name,")
        : ($fr ? 'Bonjour,' : 'Hello,');
    $line = $fr ? "Voici votre code pour $what :" : "Here is your code to $what:";
    $valid = $fr ? 'Il est valable ' . CODE_TTL_MIN . ' minutes.' : 'It is valid for ' . CODE_TTL_MIN . ' minutes.';
    $ignore = $fr
        ? "Si vous n'avez rien demandé, ignorez cet e-mail : votre compte reste protégé. Ne partagez jamais ce code, même avec JOGOO."
        : "If you didn't ask for this, ignore this email: your account stays protected. Never share this code, not even with JOGOO.";
    $text = "$hello\n\n$line\n\n    $code\n\n$valid\n\n$ignore\n\nJOGOO Agriculture";
    $e = fn($s) => htmlspecialchars($s, ENT_QUOTES);
    $html = '<!doctype html><html><body style="margin:0;background:#f3f0e8;font-family:Arial,Helvetica,sans-serif;color:#0e2338">'
        . '<table role="presentation" width="100%" cellpadding="0" cellspacing="0"><tr><td align="center" style="padding:24px 12px">'
        . '<table role="presentation" width="100%" style="max-width:480px;background:#ffffff;border-radius:20px" cellpadding="0" cellspacing="0">'
        . '<tr><td style="background:#004a87;border-radius:20px 20px 0 0;padding:20px 24px;color:#ffffff;font-size:20px;font-weight:bold;letter-spacing:2px">JOGOO</td></tr>'
        . '<tr><td style="padding:24px">'
        . '<p style="margin:0 0 12px">' . $e($hello) . '</p><p style="margin:0 0 16px">' . $e($line) . '</p>'
        . '<p style="margin:0 0 16px;font-size:34px;font-weight:bold;letter-spacing:8px;color:#004a87">' . $e($code) . '</p>'
        . '<p style="margin:0 0 16px;color:#56657a">' . $e($valid) . '</p>'
        . '<p style="margin:0;color:#56657a;font-size:13px">' . $e($ignore) . '</p>'
        . '</td></tr></table></td></tr></table></body></html>';
    return send_mail($to, $subject, $text, $html);
}

/** Sent instead of a code when someone signs up with an email that already has an account. */
function send_account_exists_email(string $to, string $lang): bool
{
    $fr = $lang === 'fr';
    $subject = $fr ? 'Vous avez déjà un compte JOGOO' : 'You already have a JOGOO account';
    $lines = $fr
        ? ['Bonjour,', "Quelqu'un (peut-être vous) a essayé de créer un compte JOGOO avec cette adresse e-mail, mais elle a déjà un compte.",
           'Connectez-vous avec votre mot de passe. Si vous l\'avez oublié, utilisez « Mot de passe oublié ? » sur l\'écran de connexion.',
           "Si ce n'était pas vous, ignorez cet e-mail : votre compte reste protégé."]
        : ['Hello,', 'Someone (maybe you) tried to create a JOGOO account with this email address, but it already has an account.',
           'Sign in with your password. If you forgot it, use "Forgot password?" on the sign-in screen.',
           "If this wasn't you, ignore this email: your account stays protected."];
    $text = implode("\n\n", $lines) . "\n\nJOGOO Agriculture";
    $html = '<!doctype html><html><body style="font-family:Arial,Helvetica,sans-serif;color:#0e2338">'
        . implode('', array_map(fn($l) => '<p>' . htmlspecialchars($l, ENT_QUOTES) . '</p>', $lines))
        . '<p>JOGOO Agriculture</p></body></html>';
    return send_mail($to, $subject, $text, $html);
}

// ---------------------------------------------------------------- 2-step codes

/**
 * Starts a verification challenge: emails a 6-digit code and binds the
 * challenge to this browser with an HttpOnly cookie.
 */
function start_challenge(array $user, string $purpose): void
{
    $pdo = db();
    $pdo->prepare('DELETE FROM auth_challenges WHERE user_id = ? AND purpose = ?')->execute([$user['id'], $purpose]);
    $token = random_token();
    $code = str_pad((string)random_int(0, 999999), 6, '0', STR_PAD_LEFT);
    $expires = time() + CODE_TTL_MIN * 60;
    $pdo->prepare('INSERT INTO auth_challenges (token_hash, user_id, purpose, code_hash, last_sent_at, expires_at, created_at) VALUES (?, ?, ?, ?, ?, ?, ?)')
        ->execute([hash('sha256', $token), $user['id'], $purpose, code_hash($code), now_utc(), gmdate('Y-m-d H:i:s', $expires), now_utc()]);
    set_cookie(CHALLENGE_COOKIE, $token, $expires);
    record_attempt('code_sent', $user['email']);
    if (!send_code_email($user['email'], $user['full_name'], $code, $purpose, $user['lang'] ?? 'en')) {
        fail(502, 'email_failed');
    }
}

/** The challenge bound to this browser, or null. */
function current_challenge(): ?array
{
    $token = $_COOKIE[CHALLENGE_COOKIE] ?? '';
    if (!is_string($token) || strlen($token) < 20 || strlen($token) > 100) return null;
    $st = db()->prepare(
        'SELECT c.*, u.email, p.full_name, p.lang FROM auth_challenges c
           JOIN users u ON u.id = c.user_id JOIN profiles p ON p.id = c.user_id
          WHERE c.token_hash = ? AND c.expires_at > UTC_TIMESTAMP()'
    );
    $st->execute([hash('sha256', $token)]);
    return $st->fetch() ?: null;
}

/** Checks a code against this browser's challenge. Returns the challenge row on success; fails otherwise. */
function verify_challenge_code(string $code, array $purposes): array
{
    $ch = current_challenge();
    if (!$ch || !in_array($ch['purpose'], $purposes, true)) {
        record_attempt('code_fail', null);
        fail(410, 'code_expired');
    }
    if ((int)$ch['attempts'] >= CODE_MAX_TRIES) {
        db()->prepare('DELETE FROM auth_challenges WHERE token_hash = ?')->execute([$ch['token_hash']]);
        fail(410, 'code_expired');
    }
    // Cap wrong codes per account across challenges and resends, so a code
    // can't be guessed by asking for new ones (at most CODE_FAILS_PER_HOUR
    // guesses an hour out of a million codes).
    if (too_many('code_fail', 'email', $ch['email'], CODE_FAILS_PER_HOUR, 60)) {
        db()->prepare('DELETE FROM auth_challenges WHERE token_hash = ?')->execute([$ch['token_hash']]);
        fail(429, 'too_many_attempts');
    }
    $code = preg_replace('/\D/', '', $code) ?? '';
    if (strlen($code) !== 6 || !hash_equals($ch['code_hash'], code_hash($code))) {
        record_attempt('code_fail', $ch['email']);
        db()->prepare('UPDATE auth_challenges SET attempts = attempts + 1 WHERE token_hash = ?')->execute([$ch['token_hash']]);
        $left = CODE_MAX_TRIES - (int)$ch['attempts'] - 1;
        if ($left <= 0) {
            db()->prepare('DELETE FROM auth_challenges WHERE token_hash = ?')->execute([$ch['token_hash']]);
            fail(410, 'code_expired');
        }
        fail(401, 'invalid_code', ['attemptsLeft' => $left]);
    }
    db()->prepare('DELETE FROM auth_challenges WHERE token_hash = ?')->execute([$ch['token_hash']]);
    set_cookie(CHALLENGE_COOKIE, '', time() - 3600);
    return $ch;
}

/** Re-sends a fresh code for this browser's challenge (max once a minute, 5 times). */
function resend_challenge(): array
{
    $ch = current_challenge();
    if (!$ch) fail(410, 'code_expired');
    if ((int)$ch['sends'] >= 5) fail(429, 'too_many_attempts');
    if (strtotime($ch['last_sent_at'] . ' UTC') > time() - 60) fail(429, 'wait_before_resend', ['retryIn' => 60]);
    $code = str_pad((string)random_int(0, 999999), 6, '0', STR_PAD_LEFT);
    $expires = time() + CODE_TTL_MIN * 60;
    db()->prepare('UPDATE auth_challenges SET code_hash = ?, sends = sends + 1, last_sent_at = ?, expires_at = ? WHERE token_hash = ?')
        ->execute([code_hash($code), now_utc(), gmdate('Y-m-d H:i:s', $expires), $ch['token_hash']]);
    set_cookie(CHALLENGE_COOKIE, (string)$_COOKIE[CHALLENGE_COOKIE], $expires);
    if (!send_code_email($ch['email'], $ch['full_name'], $code, $ch['purpose'], $ch['lang'] ?? 'en')) fail(502, 'email_failed');
    return $ch;
}

// ---------------------------------------------------------------- trusted devices

function trust_this_device(string $userId): void
{
    $token = random_token();
    $expires = time() + 30 * 86400;
    db()->prepare('INSERT INTO trusted_devices (token_hash, user_id, created_at, expires_at) VALUES (?, ?, ?, ?)')
        ->execute([hash('sha256', $token), $userId, now_utc(), gmdate('Y-m-d H:i:s', $expires)]);
    set_cookie(DEVICE_COOKIE, $token, $expires);
}

function device_is_trusted(string $userId): bool
{
    $token = $_COOKIE[DEVICE_COOKIE] ?? '';
    if (!is_string($token) || strlen($token) < 20 || strlen($token) > 100) return false;
    $st = db()->prepare('SELECT 1 FROM trusted_devices WHERE token_hash = ? AND user_id = ? AND expires_at > UTC_TIMESTAMP()');
    $st->execute([hash('sha256', $token), $userId]);
    return (bool)$st->fetchColumn();
}

/** After a password change or reset: sign out everywhere and forget trusted devices. */
function revoke_all(string $userId, ?string $keepSessionToken = null): void
{
    if ($keepSessionToken) {
        db()->prepare('DELETE FROM sessions WHERE user_id = ? AND token_hash <> ?')->execute([$userId, hash('sha256', $keepSessionToken)]);
    } else {
        db()->prepare('DELETE FROM sessions WHERE user_id = ?')->execute([$userId]);
    }
    db()->prepare('DELETE FROM trusted_devices WHERE user_id = ?')->execute([$userId]);
    db()->prepare('DELETE FROM auth_challenges WHERE user_id = ?')->execute([$userId]);
}

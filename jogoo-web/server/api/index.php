<?php
// JOGOO client API. All routes live under /api/ and speak JSON.
//
//   GET  /api/health
//   POST /api/auth/signup     {email, password, fullName, phone?, location?, farmSizeHa?, lang?} → 202 {next:'verify_email'}
//   POST /api/auth/login      {email, password} → 200 {profile} (trusted device) | 202 {next:'login_code'|'verify_email'}
//   POST /api/auth/verify     {code, rememberDevice?} → 200 {profile}
//   POST /api/auth/resend
//   POST /api/auth/reset/request {email} → 202 {next:'reset_code'}
//   POST /api/auth/reset/confirm {code, newPassword, rememberDevice?} → 200 {profile}
//   POST /api/auth/logout
//   GET  /api/auth/me
//   PATCH /api/me/profile     {fullName?, phone?, location?, farmSizeHa?, lang?}
//   POST /api/me/password     {currentPassword, newPassword}
//   DELETE /api/me            {password}  (deletes the account)
//   GET  /api/me/journey
//   GET  /api/admin/clients?q=&stage=&page=      (staff only)
//   GET  /api/admin/clients/{id}                 (staff only)
//   POST /api/admin/clients/{id}/events {stage, note?}  (staff only)
//   POST /api/admin/clients/{id}/role {role: client|admin}  (super admin only)
declare(strict_types=1);
require __DIR__ . '/lib/bootstrap.php';

const DUMMY_HASH = '$2y$12$0asqqIkHkM0Ng6nuuk5c6OoPxiQNxg3ITd8XGrnlujZ/FNoUKBsjm';

send_security_headers();

$method = $_SERVER['REQUEST_METHOD'] ?? 'GET';
$path = parse_url($_SERVER['REQUEST_URI'] ?? '/', PHP_URL_PATH) ?: '/';
$path = '/' . trim((string)preg_replace('#^.*?/api/?#', '', $path), '/');

check_request_origin($method);

try {
    route($method, $path);
} catch (Throwable $e) {
    error_log('JOGOO API error: ' . $e->getMessage() . ' @ ' . $e->getFile() . ':' . $e->getLine());
    fail(500, 'server_error');
}

function route(string $method, string $path): void
{
    if ($path === '/health' && $method === 'GET') {
        db()->query('SELECT 1');
        respond(200, ['ok' => true]);
    }

    // ------------------------------------------------------------ auth
    // Sign-up and sign-in are two steps: password, then a 6-digit code sent
    // by email (sign-up: confirms the address; sign-in: second factor unless
    // the device was trusted in the last 30 days).
    if ($path === '/auth/signup' && $method === 'POST') {
        $in = json_body();
        $email = email_field($in);
        $password = password_field($in);
        $fullName = str_field($in, 'fullName', 120);
        $phone = str_field($in, 'phone', 32, false);
        if ($phone !== null && !preg_match('/^[+0-9 ()-]{6,32}$/', $phone)) fail(422, 'invalid_phone');
        $location = str_field($in, 'location', 120, false);
        $farm = $in['farmSizeHa'] ?? null;
        if ($farm !== null && $farm !== '') {
            if (!is_numeric($farm) || (float)$farm < 0 || (float)$farm > 100000) fail(422, 'invalid_field', ['field' => 'farmSizeHa']);
            $farm = round((float)$farm, 2);
        } else {
            $farm = null;
        }
        $lang = ($in['lang'] ?? 'en') === 'fr' ? 'fr' : 'en';

        if (too_many('signup', 'ip', client_ip(), 10, 60)) fail(429, 'too_many_attempts');
        record_attempt('signup', $email);

        $pdo = db();
        $exists = $pdo->prepare('SELECT id, email_verified_at FROM users WHERE email = ?');
        $exists->execute([$email]);
        $old = $exists->fetch();
        if ($old && $old['email_verified_at'] !== null) {
            // Don't reveal that this email has an account: answer exactly like
            // a new sign-up, and tell the owner by email instead.
            if (too_many('code_sent', 'email', $email, 8, 60)) fail(429, 'too_many_attempts');
            record_attempt('code_sent', $email);
            hash_password($password); // same work as a real sign-up
            set_cookie(CHALLENGE_COOKIE, random_token(), time() + CODE_TTL_MIN * 60);
            send_account_exists_email($email, $lang);
            respond(202, ['next' => 'verify_email', 'email' => mask_email($email)]);
        }

        $pdo->beginTransaction();
        try {
            // An unconfirmed sign-up for this email (e.g. a typo or someone
            // else's attempt) is replaced: only whoever reads the inbox can confirm it.
            if ($old) $pdo->prepare('DELETE FROM users WHERE id = ?')->execute([$old['id']]);
            $id = uuid4();
            $pdo->prepare('INSERT INTO users (id, email, password_hash, email_verified_at, created_at) VALUES (?, ?, ?, NULL, ?)')
                ->execute([$id, $email, hash_password($password), now_utc()]);
            $pdo->prepare('INSERT INTO profiles (id, full_name, phone, location, farm_size_ha, role, lang, created_at) VALUES (?, ?, ?, ?, ?, \'client\', ?, ?)')
                ->execute([$id, $fullName, $phone, $location, $farm, $lang, now_utc()]);
            add_event($id, 'signed_up', null, null);
            $pdo->commit();
        } catch (PDOException $e) {
            $pdo->rollBack();
            if ($e->getCode() === '23000') fail(409, 'email_taken');
            throw $e;
        }
        if (too_many('code_sent', 'email', $email, 8, 60)) fail(429, 'too_many_attempts');
        start_challenge(['id' => $id, 'email' => $email, 'full_name' => $fullName, 'lang' => $lang], 'verify_email');
        respond(202, ['next' => 'verify_email', 'email' => mask_email($email)]);
    }

    if ($path === '/auth/login' && $method === 'POST') {
        $in = json_body();
        $email = mb_strtolower(trim((string)($in['email'] ?? '')));
        $password = (string)($in['password'] ?? '');
        if ($email === '' || $password === '') fail(422, 'invalid_credentials');
        if (too_many('login_fail', 'ip', client_ip(), 30, 15) || too_many('login_fail', 'email', $email, 8, 15)) {
            fail(429, 'too_many_attempts');
        }
        $st = db()->prepare('SELECT u.id, u.email, u.password_hash, u.email_verified_at, p.full_name, p.lang FROM users u JOIN profiles p ON p.id = u.id WHERE u.email = ?');
        $st->execute([$email]);
        $row = $st->fetch();
        // Same work whether or not the account exists (no user enumeration by timing).
        $hash = $row['password_hash'] ?? DUMMY_HASH;
        $ok = password_verify($password, $hash) && $row;
        if (!$ok) {
            record_attempt('login_fail', $email);
            fail(401, 'invalid_credentials');
        }
        if (password_needs_rehash($row['password_hash'], PASSWORD_BCRYPT, ['cost' => 12])) {
            db()->prepare('UPDATE users SET password_hash = ? WHERE id = ?')->execute([hash_password($password), $row['id']]);
        }
        if ($row['email_verified_at'] === null) {
            if (too_many('code_sent', 'email', $email, 8, 60)) fail(429, 'too_many_attempts');
            start_challenge($row, 'verify_email');
            respond(202, ['next' => 'verify_email', 'email' => mask_email($email)]);
        }
        if (device_is_trusted($row['id'])) {
            finish_sign_in($row['id'], $row['email'], false);
        }
        if (too_many('code_sent', 'email', $email, 8, 60)) fail(429, 'too_many_attempts');
        start_challenge($row, 'login');
        respond(202, ['next' => 'login_code', 'email' => mask_email($email)]);
    }

    if ($path === '/auth/verify' && $method === 'POST') {
        $in = json_body();
        if (too_many('code_fail', 'ip', client_ip(), 30, 15)) fail(429, 'too_many_attempts');
        $code = (string)($in['code'] ?? '');
        $ch = verify_challenge_code($code, ['verify_email', 'login']);
        if ($ch['purpose'] === 'verify_email') {
            db()->prepare('UPDATE users SET email_verified_at = COALESCE(email_verified_at, ?) WHERE id = ?')->execute([now_utc(), $ch['user_id']]);
        }
        finish_sign_in($ch['user_id'], $ch['email'], !empty($in['rememberDevice']));
    }

    if ($path === '/auth/resend' && $method === 'POST') {
        $ch = resend_challenge();
        respond(202, ['next' => $ch['purpose'], 'email' => mask_email($ch['email'])]);
    }

    if ($path === '/auth/reset/request' && $method === 'POST') {
        $in = json_body();
        $email = mb_strtolower(trim((string)($in['email'] ?? '')));
        if (!filter_var($email, FILTER_VALIDATE_EMAIL)) fail(422, 'invalid_email');
        if (too_many('reset_request', 'ip', client_ip(), 10, 60) || too_many('reset_request', 'email', $email, 5, 60)) {
            fail(429, 'too_many_attempts');
        }
        record_attempt('reset_request', $email);
        $st = db()->prepare('SELECT u.id, u.email, p.full_name, p.lang FROM users u JOIN profiles p ON p.id = u.id WHERE u.email = ?');
        $st->execute([$email]);
        $row = $st->fetch();
        if ($row) {
            start_challenge($row, 'reset_password');
        } else {
            // Don't reveal whether the email has an account: answer the same,
            // after a similar delay, with a decoy challenge cookie.
            usleep(random_int(300000, 700000));
            set_cookie(CHALLENGE_COOKIE, random_token(), time() + CODE_TTL_MIN * 60);
        }
        respond(202, ['next' => 'reset_code', 'email' => mask_email($email)]);
    }

    if ($path === '/auth/reset/confirm' && $method === 'POST') {
        $in = json_body();
        $new = password_field($in, 'newPassword');
        if (too_many('code_fail', 'ip', client_ip(), 30, 15)) fail(429, 'too_many_attempts');
        $ch = verify_challenge_code((string)($in['code'] ?? ''), ['reset_password']);
        db()->prepare('UPDATE users SET password_hash = ?, email_verified_at = COALESCE(email_verified_at, ?) WHERE id = ?')
            ->execute([hash_password($new), now_utc(), $ch['user_id']]);
        revoke_all($ch['user_id']);
        finish_sign_in($ch['user_id'], $ch['email'], !empty($in['rememberDevice']));
    }

    if ($path === '/auth/logout' && $method === 'POST') {
        end_session();
        set_cookie(CHALLENGE_COOKIE, '', time() - 3600);
        respond(200, ['ok' => true]);
    }

    if ($path === '/auth/me' && $method === 'GET') {
        // 200 with null when signed out, so the app's first check isn't logged as an error.
        $u = current_user();
        respond(200, ['profile' => $u ? profile_json($u) : null]);
    }

    // ------------------------------------------------------------ me
    if ($path === '/me/profile' && $method === 'PATCH') {
        $u = require_user();
        $in = json_body();
        $sets = [];
        $vals = [];
        if (array_key_exists('fullName', $in)) { $sets[] = 'full_name = ?'; $vals[] = str_field($in, 'fullName', 120); }
        if (array_key_exists('phone', $in)) {
            $phone = str_field($in, 'phone', 32, false);
            if ($phone !== null && !preg_match('/^[+0-9 ()-]{6,32}$/', $phone)) fail(422, 'invalid_phone');
            $sets[] = 'phone = ?'; $vals[] = $phone;
        }
        if (array_key_exists('location', $in)) { $sets[] = 'location = ?'; $vals[] = str_field($in, 'location', 120, false); }
        if (array_key_exists('farmSizeHa', $in)) {
            $f = $in['farmSizeHa'];
            if ($f !== null && $f !== '' && (!is_numeric($f) || (float)$f < 0 || (float)$f > 100000)) fail(422, 'invalid_field', ['field' => 'farmSizeHa']);
            $sets[] = 'farm_size_ha = ?'; $vals[] = ($f === null || $f === '') ? null : round((float)$f, 2);
        }
        if (array_key_exists('lang', $in)) { $sets[] = 'lang = ?'; $vals[] = $in['lang'] === 'fr' ? 'fr' : 'en'; }
        if ($sets) {
            $vals[] = $u['id'];
            db()->prepare('UPDATE profiles SET ' . implode(', ', $sets) . ' WHERE id = ?')->execute($vals);
        }
        respond(200, ['profile' => profile_json(require_fresh_user($u['id']))]);
    }

    if ($path === '/me/password' && $method === 'POST') {
        $u = require_user();
        $in = json_body();
        $new = password_field($in, 'newPassword');
        $st = db()->prepare('SELECT password_hash FROM users WHERE id = ?');
        $st->execute([$u['id']]);
        if (!password_verify((string)($in['currentPassword'] ?? ''), (string)$st->fetchColumn())) fail(401, 'invalid_credentials');
        db()->prepare('UPDATE users SET password_hash = ? WHERE id = ?')->execute([hash_password($new), $u['id']]);
        // Sign out every other device and forget trusted devices.
        revoke_all($u['id'], (string)($_COOKIE[SESSION_COOKIE] ?? ''));
        respond(200, ['ok' => true]);
    }

    if ($path === '/me' && $method === 'DELETE') {
        // Deletes the account and everything stored about the client
        // (profile, journey, sessions, codes, trusted devices: ON DELETE CASCADE).
        $u = require_user();
        $in = json_body();
        if (too_many('login_fail', 'email', $u['email'], 8, 15)) fail(429, 'too_many_attempts');
        $st = db()->prepare('SELECT password_hash FROM users WHERE id = ?');
        $st->execute([$u['id']]);
        if (!password_verify((string)($in['password'] ?? ''), (string)$st->fetchColumn())) {
            record_attempt('login_fail', $u['email']);
            fail(401, 'invalid_credentials');
        }
        db()->prepare('DELETE FROM users WHERE id = ?')->execute([$u['id']]);
        error_log("JOGOO audit: account {$u['id']} deleted by its owner");
        set_session_cookie('', time() - 3600);
        set_cookie(DEVICE_COOKIE, '', time() - 3600);
        set_cookie(CHALLENGE_COOKIE, '', time() - 3600);
        respond(200, ['ok' => true]);
    }

    if ($path === '/me/journey' && $method === 'GET') {
        $u = require_user();
        respond(200, journey_for($u['id']));
    }

    // ------------------------------------------------------------ admin
    if ($path === '/admin/clients' && $method === 'GET') {
        require_admin();
        $q = trim((string)($_GET['q'] ?? ''));
        $stage = (string)($_GET['stage'] ?? '');
        $page = min(10000, max(1, (int)($_GET['page'] ?? 1)));
        $per = 50;
        // ?role=staff lists JOGOO staff (for the super admin); default lists clients.
        $where = [($_GET['role'] ?? '') === 'staff' ? "p.role IN ('admin','super_admin')" : "p.role = 'client'"];
        $vals = [];
        if ($q !== '') {
            $where[] = '(p.full_name LIKE ? OR u.email LIKE ? OR p.phone LIKE ? OR p.location LIKE ?)';
            $like = '%' . addcslashes(mb_substr($q, 0, 100), '%_\\') . '%';
            array_push($vals, $like, $like, $like, $like);
        }
        // Current stage = stage of the latest event.
        $currentSql = '(SELECT e.stage FROM journey_events e WHERE e.client_id = p.id ORDER BY e.created_at DESC LIMIT 1)';
        $updatedSql = '(SELECT MAX(e.created_at) FROM journey_events e WHERE e.client_id = p.id)';
        if ($stage !== '') {
            if (!in_array($stage, JOGOO_STAGES, true)) fail(422, 'invalid_stage');
            $where[] = "COALESCE($currentSql, 'signed_up') = ?";
            $vals[] = $stage;
        }
        $whereSql = implode(' AND ', $where);
        $count = db()->prepare("SELECT COUNT(*) FROM profiles p JOIN users u ON u.id = p.id WHERE $whereSql");
        $count->execute($vals);
        $total = (int)$count->fetchColumn();
        $st = db()->prepare(
            "SELECT p.id, u.email, p.full_name, p.phone, p.location, p.farm_size_ha, p.role, p.lang, p.created_at,
                    COALESCE($currentSql, 'signed_up') AS stage, $updatedSql AS stage_at
               FROM profiles p JOIN users u ON u.id = p.id
              WHERE $whereSql
              ORDER BY stage_at DESC, p.created_at DESC
              LIMIT $per OFFSET " . (($page - 1) * $per)
        );
        $st->execute($vals);
        $clients = [];
        foreach ($st->fetchAll() as $r) {
            $clients[] = profile_json($r) + ['stage' => $r['stage'], 'stageAt' => iso($r['stage_at'])];
        }
        // Counts per stage for the filter pills.
        $counts = array_fill_keys(JOGOO_STAGES, 0);
        $cs = db()->query(
            "SELECT COALESCE($currentSql, 'signed_up') AS stage, COUNT(*) AS n FROM profiles p WHERE p.role = 'client' GROUP BY stage"
        );
        foreach ($cs->fetchAll() as $r) $counts[$r['stage']] = (int)$r['n'];
        $staffCount = (int)db()->query("SELECT COUNT(*) FROM profiles WHERE role IN ('admin','super_admin')")->fetchColumn();
        respond(200, ['clients' => $clients, 'total' => $total, 'page' => $page, 'perPage' => $per, 'stageCounts' => $counts, 'staffCount' => $staffCount]);
    }

    if (preg_match('#^/admin/clients/([0-9a-f-]{36})$#', $path, $m) && $method === 'GET') {
        require_admin();
        $client = require_fresh_user($m[1]);
        respond(200, ['profile' => profile_json($client), 'journey' => journey_for($m[1])]);
    }

    if (preg_match('#^/admin/clients/([0-9a-f-]{36})/events$#', $path, $m) && $method === 'POST') {
        $admin = require_admin();
        require_fresh_user($m[1]);
        $in = json_body();
        $stage = (string)($in['stage'] ?? '');
        if (!in_array($stage, JOGOO_STAGES, true)) fail(422, 'invalid_stage');
        $note = str_field($in, 'note', 1000, false);
        add_event($m[1], $stage, $note, $admin['id']);
        respond(201, journey_for($m[1]));
    }

    if (preg_match('#^/admin/clients/([0-9a-f-]{36})/role$#', $path, $m) && $method === 'POST') {
        $me = require_admin();
        if ($me['role'] !== 'super_admin') fail(403, 'forbidden');
        $target = require_fresh_user($m[1]);
        if ($target['role'] === 'super_admin' || $m[1] === $me['id']) fail(403, 'forbidden');
        $role = (string)(json_body()['role'] ?? '');
        if (!in_array($role, ['client', 'admin'], true)) fail(422, 'invalid_field', ['field' => 'role']);
        db()->prepare('UPDATE profiles SET role = ? WHERE id = ?')->execute([$role, $m[1]]);
        error_log("JOGOO audit: {$me['id']} set role of {$m[1]} to $role");
        // Their sessions pick up the new role on the next request.
        respond(200, ['profile' => profile_json(require_fresh_user($m[1]))]);
    }

    fail(404, 'not_found');
}

/** Completes a sign-in: session cookie, optional trusted device, super admin role. @return never */
function finish_sign_in(string $userId, string $email, bool $rememberDevice)
{
    apply_super_admin($userId, $email);
    db()->prepare('UPDATE users SET last_sign_in_at = ? WHERE id = ?')->execute([now_utc(), $userId]);
    start_session($userId);
    if ($rememberDevice) trust_this_device($userId);
    respond(200, ['profile' => profile_json(require_fresh_user($userId))]);
}

function require_fresh_user(string $id): array
{
    $st = db()->prepare(
        'SELECT u.id, u.email, p.full_name, p.phone, p.location, p.farm_size_ha, p.role, p.lang, p.created_at
           FROM users u JOIN profiles p ON p.id = u.id WHERE u.id = ?'
    );
    $st->execute([$id]);
    $row = $st->fetch();
    if (!$row) fail(404, 'not_found');
    return $row;
}

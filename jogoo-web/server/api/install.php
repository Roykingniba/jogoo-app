<?php
// One-time installer: connects the API to its MySQL database (you type the
// database user and password you created in cPanel; they're saved in
// config.php OUTSIDE the website folder) and creates the tables.
// Staff accounts are not created here: the emails in 'super_admin_emails'
// become super admins when they sign up and confirm their email.
// Protected by the setup key. Delete this file after installing.
declare(strict_types=1);
require __DIR__ . '/lib/bootstrap.php';

header('Content-Type: text/html; charset=utf-8');
header('Cache-Control: no-store');
header('X-Content-Type-Options: nosniff');
header('Referrer-Policy: no-referrer');
header("Content-Security-Policy: default-src 'none'; style-src 'unsafe-inline'; form-action 'self'; frame-ancestors 'none'");

function page(string $body): void
{
    echo "<!doctype html><html lang=en><meta charset=utf-8><meta name=viewport content='width=device-width,initial-scale=1'><meta name=robots content=noindex><title>JOGOO setup</title>
<style>body{font-family:system-ui,sans-serif;background:#f3f0e8;color:#0e2338;display:grid;place-items:center;min-height:100vh;margin:0;padding:16px}
main{background:#fff;border-radius:24px;padding:28px;max-width:460px;width:100%;box-shadow:0 6px 28px rgba(14,35,56,.12)}
h1{color:#004a87;margin:0 0 8px}label{display:block;font-weight:700;font-size:14px;margin:12px 0 6px}
input{width:100%;box-sizing:border-box;padding:12px 14px;border-radius:14px;border:1.5px solid #e6e2d8;font:inherit}
small{color:#56657a}button{margin-top:20px;width:100%;padding:14px;border:0;border-radius:999px;background:#004a87;color:#fff;font:inherit;font-weight:700;cursor:pointer}
.err{background:#f7d9e8;color:#b12176;padding:10px 14px;border-radius:14px;margin-top:12px}.ok{background:#e5efc4;color:#5b7a12;padding:12px 14px;border-radius:14px}</style>
<main><h1>JOGOO setup</h1>$body</main></html>";
    exit;
}
$h = fn($s) => htmlspecialchars((string)$s, ENT_QUOTES);

$cfg = config();
$cfgFile = $cfg['_file'];
$done = '<p class=ok>Setup is complete. The database is ready.</p>
<p>Next: <a href="../#/signup">create your account</a> with one of the <code>super_admin_emails</code> from <code>app.php</code>. After you confirm the email code it becomes the super admin account.</p>
<p><small>For safety, delete <code>api/install.php</code> from the server.</small></p>';
$installed = '<p class=ok>JOGOO is already installed.</p><p><small>Delete <code>api/install.php</code> from the server.</small></p>';

function connect(array $c): PDO
{
    return new PDO("mysql:host={$c['db_host']};dbname={$c['db_name']};charset=utf8mb4", $c['db_user'], $c['db_pass'],
        [PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION, PDO::ATTR_EMULATE_PREPARES => false]);
}
function install_schema(PDO $pdo): void
{
    $sql = @file_get_contents(dirname(__DIR__) . '/sql/schema.mysql.sql') ?: @file_get_contents(__DIR__ . '/schema.mysql.sql');
    if (!$sql) page('<p class=err>schema.mysql.sql is missing next to install.php.</p>');
    foreach (array_filter(array_map('trim', explode(";\n", $sql))) as $stmt) {
        if (trim(preg_replace('/^\s*--.*$/m', '', $stmt)) === '') continue;
        $pdo->exec($stmt);
    }
    migrate($pdo);
}

$needsDb = ($cfg['db_user'] ?? '') === '' || ($cfg['db_pass'] ?? '') === '';
if (!$needsDb) {
    try {
        $pdo = connect($cfg);
        // Once the tables exist this page does nothing, whoever opens it.
        if ($pdo->query("SHOW TABLES LIKE 'users'")->fetchColumn()) page($installed);
        install_schema($pdo);
        page($done);
    } catch (PDOException $e) {
        $needsDb = true; // stored credentials no longer work: ask again
    }
}

$error = '';
if (($_SERVER['REQUEST_METHOD'] ?? '') === 'POST') {
    $expected = (string)($cfg['setup_key'] ?? '');
    if (strlen($expected) < 16 || strncmp($expected, 'CHANGE-ME', 9) === 0 || !hash_equals($expected, (string)($_POST['setup_key'] ?? ''))) {
        sleep(2);
        $error = 'Wrong setup key.';
    } else {
        $c = $cfg;
        $c['db_user'] = trim((string)($_POST['db_user'] ?? ''));
        $c['db_pass'] = (string)($_POST['db_pass'] ?? '');
        try {
            $pdo = connect($c);
        } catch (PDOException $e) {
            $pdo = null;
            $error = 'Could not connect with that user and password. In cPanel → Manage My Databases, check the user exists and has ALL PRIVILEGES on ' . $c['db_name'] . '.';
        }
        if ($pdo) {
            unset($c['_file']);
            $php = "<?php\n// Written by api/install.php. Keep this file outside the website folder.\nreturn " . var_export($c, true) . ";\n";
            if (@file_put_contents($cfgFile, $php, LOCK_EX) === false) {
                $error = 'Could not save the database settings to ' . $cfgFile . '.';
            } else {
                @chmod($cfgFile, 0600);
                if (function_exists('opcache_invalidate')) @opcache_invalidate($cfgFile, true);
                install_schema($pdo);
                page($done);
            }
        }
    }
}

$e = $error ? '<p class=err>' . $h($error) . '</p>' : '';
$prefix = explode('_', (string)$cfg['db_name'])[0] . '_';
page("<p>Connects the app to its MySQL database <b>{$h($cfg['db_name'])}</b> and creates the tables.</p>$e
<form method=post autocomplete=off>
<label for=k>Setup key</label><input id=k name=setup_key type=password required>
<label for=du>Database user</label><input id=du name=db_user required value='{$h($_POST['db_user'] ?? $prefix)}'>
<small>The MySQL user you created in cPanel and added to the database.</small>
<label for=dp>Database password</label><input id=dp name=db_pass type=password required autocomplete=new-password>
<button type=submit>Finish setup</button></form>");

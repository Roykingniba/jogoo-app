<?php
// JOGOO mail relay: lets the Supabase `auth-codes` function send the 6-digit
// code emails through this hosting's mail server (SPF/DKIM already valid for
// jogoo.africa). Only callers holding the shared secret can use it.
//
// POST JSON {to, subject, text, html}
// Headers: X-Jogoo-Timestamp: <unix seconds>
//          X-Jogoo-Signature: hex(HMAC-SHA256(secret, timestamp + "." + body))
// Secret: /home/<user>/jogoo-private/mailer.php → return ['secret' => '...', 'from' => '...'];
declare(strict_types=1);
header('Content-Type: application/json');
header('Cache-Control: no-store');
header('X-Robots-Tag: noindex');

function out(int $status, array $body): void { http_response_code($status); echo json_encode($body); exit; }

if (($_SERVER['REQUEST_METHOD'] ?? '') !== 'POST') out(405, ['error' => 'method']);
$cfgFile = null;
foreach ([dirname(__DIR__, 2) . '/jogoo-private/mailer.php', dirname(__DIR__) . '/jogoo-private/mailer.php'] as $f) {
    if (is_file($f)) { $cfgFile = $f; break; }
}
if (!$cfgFile) out(500, ['error' => 'not_configured']);
$cfg = require $cfgFile;
$secret = (string)($cfg['secret'] ?? '');
if (strlen($secret) < 32) out(500, ['error' => 'not_configured']);

$body = file_get_contents('php://input', false, null, 0, 200000) ?: '';
$ts = (string)($_SERVER['HTTP_X_JOGOO_TIMESTAMP'] ?? '');
$sig = (string)($_SERVER['HTTP_X_JOGOO_SIGNATURE'] ?? '');
if (!ctype_digit($ts) || abs(time() - (int)$ts) > 300) out(401, ['error' => 'stale']);
if (!hash_equals(hash_hmac('sha256', $ts . '.' . $body, $secret), $sig)) out(401, ['error' => 'signature']);

$m = json_decode($body, true);
$to = is_array($m) ? trim((string)($m['to'] ?? '')) : '';
$subject = is_array($m) ? (string)($m['subject'] ?? '') : '';
$text = is_array($m) ? (string)($m['text'] ?? '') : '';
$html = is_array($m) ? (string)($m['html'] ?? '') : '';
if (!filter_var($to, FILTER_VALIDATE_EMAIL) || $subject === '' || $text === '' || preg_match('/[\r\n]/', $to . $subject)) {
    out(422, ['error' => 'invalid']);
}

// Rate limit per recipient: 12 an hour (codes are rate-limited upstream too).
$rateFile = dirname($cfgFile) . '/mailer-rate.json';
$fh = fopen($rateFile, 'c+');
if ($fh && flock($fh, LOCK_EX)) {
    $rates = json_decode(stream_get_contents($fh) ?: '{}', true) ?: [];
    $now = time();
    foreach ($rates as $k => $list) {
        $rates[$k] = array_values(array_filter($list, fn($t) => $t > $now - 3600));
        if (!$rates[$k]) unset($rates[$k]);
    }
    $key = hash('sha256', strtolower($to));
    if (count($rates[$key] ?? []) >= 12) { flock($fh, LOCK_UN); fclose($fh); out(429, ['error' => 'rate']); }
    $rates[$key][] = $now;
    ftruncate($fh, 0); rewind($fh); fwrite($fh, json_encode($rates));
    flock($fh, LOCK_UN); fclose($fh);
}

$fromAddr = (string)($cfg['from'] ?? 'no-reply@jogoo.africa');
$fromName = (string)($cfg['from_name'] ?? 'JOGOO Agriculture');
$boundary = 'b' . bin2hex(random_bytes(12));
$headers = [
    'From: ' . mb_encode_mimeheader($fromName, 'UTF-8') . " <$fromAddr>",
    "Reply-To: $fromAddr",
    'MIME-Version: 1.0',
    "Content-Type: multipart/alternative; boundary=\"$boundary\"",
    'Auto-Submitted: auto-generated',
    'X-Auto-Response-Suppress: All',
];
$mime = "--$boundary\r\nContent-Type: text/plain; charset=UTF-8\r\nContent-Transfer-Encoding: base64\r\n\r\n" . chunk_split(base64_encode($text));
if ($html !== '') $mime .= "--$boundary\r\nContent-Type: text/html; charset=UTF-8\r\nContent-Transfer-Encoding: base64\r\n\r\n" . chunk_split(base64_encode($html));
$mime .= "--$boundary--\r\n";
$ok = mail($to, mb_encode_mimeheader($subject, 'UTF-8'), $mime, implode("\r\n", $headers), '-f' . $fromAddr);
if (!$ok) { error_log("jogoo-mailer: mail() failed for $to"); out(502, ['error' => 'send_failed']); }
out(200, ['ok' => true]);

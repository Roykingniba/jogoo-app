<?php
// Local development only: `php -S localhost:8080 server/dev-router.php` from
// the project root after `npm run build`. Mimics the Apache .htaccess rules.
$path = parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH);
if ($path === '/api/install.php') { require __DIR__ . '/api/install.php'; return true; }
if (strncmp($path, '/api/', 5) === 0 || $path === '/api') { require __DIR__ . '/api/index.php'; return true; }
$file = dirname(__DIR__) . '/dist' . $path;
if ($path !== '/' && is_file($file)) {
    $types = ['js'=>'text/javascript','css'=>'text/css','png'=>'image/png','jpg'=>'image/jpeg','ttf'=>'font/ttf','webmanifest'=>'application/manifest+json','html'=>'text/html','svg'=>'image/svg+xml'];
    $ext = pathinfo($file, PATHINFO_EXTENSION);
    header('Content-Type: ' . ($types[$ext] ?? 'application/octet-stream'));
    readfile($file); return true;
}
header('Content-Type: text/html'); readfile(dirname(__DIR__) . '/dist/index.html'); return true;

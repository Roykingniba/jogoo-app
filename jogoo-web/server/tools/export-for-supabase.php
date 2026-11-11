<?php
// Exports client accounts from MySQL as SQL you can run in the Supabase SQL
// editor (after the 20261104120000_client_journey migration):
//   php server/tools/export-for-supabase.php > import.sql
// Passwords move as bcrypt hashes, so clients keep signing in with the same
// password; nobody has to reset. Run it on the server (cPanel Terminal) or
// anywhere that can reach the MySQL database. Keep the output private.
declare(strict_types=1);
require __DIR__ . '/../api/lib/bootstrap.php';

$q = fn($v) => $v === null ? 'null' : "'" . str_replace("'", "''", (string)$v) . "'";
echo "begin;\n-- Profiles/first step are created by the sign-up trigger; disable it for the import.\n";
echo "alter table auth.users disable trigger on_auth_user_created;\n";
foreach (db()->query('SELECT u.*, p.full_name, p.phone, p.location, p.farm_size_ha, p.role, p.lang, p.created_at AS p_created FROM users u JOIN profiles p ON p.id = u.id') as $r) {
    // PHP writes $2y$; Supabase (Go bcrypt) expects $2a$. Same algorithm.
    $hash = preg_replace('/^\$2y\$/', '\$2a\$', $r['password_hash']);
    printf("insert into auth.users (instance_id, id, aud, role, email, encrypted_password, email_confirmed_at, created_at, updated_at, raw_app_meta_data, raw_user_meta_data) values ('00000000-0000-0000-0000-000000000000', %s, 'authenticated', 'authenticated', %s, %s, now(), %s, now(), '{\"provider\":\"email\",\"providers\":[\"email\"]}', '{}');\n",
        $q($r['id']), $q($r['email']), $q($hash), $q($r['created_at'] . '+00'));
    printf("insert into auth.identities (id, user_id, provider_id, provider, identity_data, created_at, updated_at) values (gen_random_uuid(), %s, %s, 'email', jsonb_build_object('sub', %s, 'email', %s), now(), now());\n",
        $q($r['id']), $q($r['id']), $q($r['id']), $q($r['email']));
    printf("insert into public.profiles (id, full_name, phone, location, farm_size_ha, role, lang, created_at) values (%s, %s, %s, %s, %s, %s, %s, %s);\n",
        $q($r['id']), $q($r['full_name']), $q($r['phone']), $q($r['location']), $r['farm_size_ha'] ?? 'null', $q($r['role']), $q($r['lang']), $q($r['p_created'] . '+00'));
}
foreach (db()->query('SELECT * FROM journey_events ORDER BY created_at') as $e) {
    printf("insert into public.journey_events (id, client_id, stage, note, created_by, created_at) values (%s, %s, %s, %s, %s, %s);\n",
        $q($e['id']), $q($e['client_id']), $q($e['stage']), $q($e['note']), $q($e['created_by']), $q($e['created_at'] . '+00'));
}
echo "alter table auth.users enable trigger on_auth_user_created;\ncommit;\n";

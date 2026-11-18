#!/usr/bin/env bash
# Runs the PHP API against a throwaway MariaDB in Docker and tests it end to end.
#   bash server/tests/run.sh          (from jogoo-web/)
# Needs Docker and Node 20+. Nothing is installed on the machine itself.
set -euo pipefail
cd "$(dirname "$0")/../.."
ROOT="$PWD"
NET=jogoo-test-net DB=jogoo-test-db API=jogoo-test-api PORT="${JOGOO_TEST_PORT:-8099}"
TMP="$(mktemp -d)"
cleanup() { docker rm -f "$API" "$DB" >/dev/null 2>&1 || true; docker network rm "$NET" >/dev/null 2>&1 || true; rm -rf "$TMP"; }
trap cleanup EXIT
cleanup; TMP="$(mktemp -d)"

docker build -q -t jogoo-php-test server/tests >/dev/null
docker network create "$NET" >/dev/null
docker run -d --name "$DB" --network "$NET" -e MARIADB_ROOT_PASSWORD=root -e MARIADB_DATABASE=jogoo \
  -v "$ROOT/server/sql/schema.mysql.sql:/docker-entrypoint-initdb.d/schema.sql:ro" mariadb:10.11 >/dev/null

mkdir -p "$TMP/private" && chmod 777 "$TMP/private"
cat > "$TMP/private/config.php" <<'PHP'
<?php return [
  'db_host' => 'jogoo-test-db', 'db_name' => 'jogoo', 'db_user' => 'root', 'db_pass' => 'root',
  'setup_key' => 'test-setup-key-0123456789',
  'app_secret' => 'test-app-secret-0123456789abcdef',
  'super_admin_emails' => ['boss@example.com'],
  'mail_log' => '/private/mail.log',
  'session_days' => 30,
  'allowed_origins' => ['https://meha.jogoo.africa'],
];
PHP
touch "$TMP/private/mail.log" && chmod 666 "$TMP/private/mail.log"

echo -n "Waiting for MariaDB"
for _ in $(seq 60); do
  if docker exec "$DB" mariadb -uroot -proot jogoo -e 'SELECT 1 FROM users LIMIT 1' >/dev/null 2>&1; then break; fi
  echo -n .; sleep 1
done; echo

docker run -d --name "$API" --network "$NET" -p "127.0.0.1:$PORT:8080" \
  -e JOGOO_CONFIG=/private/config.php -v "$TMP/private:/private" -v "$ROOT/server:/app/server:ro" -w /app \
  jogoo-php-test php -S 0.0.0.0:8080 server/dev-router.php >/dev/null
for _ in $(seq 30); do curl -sf "http://127.0.0.1:$PORT/api/health" >/dev/null && break; sleep 0.5; done

JOGOO_API="http://127.0.0.1:$PORT/api" JOGOO_MAIL_LOG="$TMP/private/mail.log" JOGOO_DB_CONTAINER="$DB" \
  node --test server/tests/api.test.mjs
status=$?
if [ "$status" -ne 0 ]; then echo "--- API container log"; docker logs "$API" 2>&1 | tail -40; fi
exit $status

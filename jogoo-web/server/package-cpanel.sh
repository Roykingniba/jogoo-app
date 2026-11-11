#!/usr/bin/env bash
# Builds jogoo-meha-cpanel.zip: the web app + /api, ready to extract into the
# subdomain's folder on cPanel.
set -euo pipefail
cd "$(dirname "$0")/.."
OUT=build-cpanel
rm -rf "$OUT" && mkdir -p "$OUT/api/lib"
cp -r dist/. "$OUT/"
rm -f "$OUT/_headers"
cp server/root.htaccess "$OUT/.htaccess"
cp server/api/index.php server/api/install.php server/api/.htaccess "$OUT/api/"
cp server/api/lib/*.php "$OUT/api/lib/"
cp server/sql/schema.mysql.sql "$OUT/api/schema.mysql.sql"
rm -f jogoo-meha-cpanel.zip
(cd "$OUT" && zip -qr ../jogoo-meha-cpanel.zip .)
echo "Built jogoo-meha-cpanel.zip ($(du -h jogoo-meha-cpanel.zip | cut -f1))"

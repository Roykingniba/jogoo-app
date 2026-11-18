#!/usr/bin/env bash
# Builds everything a push to main publishes (used by GitHub Actions, works locally too):
#   build-cpanel/          the website for meha.jogoo.africa
#   release/live/          bundle-<BUILD>.zip + latest.json for the app's live updates
# BUILD defaults to the current UTC time (YYYYMMDDHHmm); it only ever goes up.
set -euo pipefail
cd "$(dirname "$0")/.."
BUILD="${BUILD:-$(date -u +%Y%m%d%H%M)}"
export VITE_BUILD="$BUILD"

npm run build
bash server/package-cpanel.sh

OUT=release/live
rm -rf "$OUT" && mkdir -p "$OUT"
ZIP="bundle-$BUILD.zip"
# The app ships its own files; it has no service worker.
(cd dist && zip -qr "../$OUT/$ZIP" . -x 'sw.js' 'workbox-*.js' '_headers')
SUM=$(sha256sum "$OUT/$ZIP" | cut -d' ' -f1)
MIN_NATIVE=$(node -p "require('./live-update.json').minNative")
NAME=$(grep -m1 'versionName' android/app/build.gradle | sed -E 's/.*"(.*)".*/\1/')
cat > "$OUT/latest.json" <<JSON
{
  "build": $BUILD,
  "version": "$NAME+$BUILD",
  "url": "$ZIP",
  "checksum": "$SUM",
  "minNative": $MIN_NATIVE,
  "publishedAt": "$(date -u +%Y-%m-%dT%H:%M:%SZ)"
}
JSON
cp server/meha-updates.htaccess "$OUT/.htaccess"
echo "Build $BUILD: $(du -h "$OUT/$ZIP" | cut -f1) bundle, website in build-cpanel/"

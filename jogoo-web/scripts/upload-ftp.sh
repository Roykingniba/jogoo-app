#!/usr/bin/env bash
# Uploads the output of build-release.sh to the JOGOO hosting over FTPS.
# Needs FTP_SERVER, FTP_USERNAME, FTP_PASSWORD (GitHub secrets). Folders are
# relative to the FTP account's home; override with FTP_WEB_DIR / FTP_UPDATES_DIR.
set -euo pipefail
cd "$(dirname "$0")/.."
WEB_DIR="${FTP_WEB_DIR:-meha.jogoo.africa}"
UPD_DIR="${FTP_UPDATES_DIR:-jogoo.africa/meha-updates}"
BUILD=$(node -p "require('./release/live/latest.json').build")

lftp_run() {
  lftp -u "$FTP_USERNAME","$FTP_PASSWORD" "$FTP_SERVER" -e "
    set ftp:ssl-force true; set ftp:ssl-protect-data true; set ssl:verify-certificate true;
    set net:max-retries 3; set net:timeout 30;
    $1
    bye"
}

# 1. Website: new files first, index.html last, nothing deleted (old asset
#    files stay so pages already open keep working). The PHP API is left alone.
lftp_run "mkdir -p -f $WEB_DIR;
  mirror -R --no-perms --exclude-glob api/ --exclude-glob index.html build-cpanel $WEB_DIR;
  put -O $WEB_DIR build-cpanel/index.html"

# 2. App update: the bundle first, latest.json last, so the app never sees a
#    latest.json pointing at a file that is not there yet.
lftp_run "mkdir -p -f $UPD_DIR;
  put -O $UPD_DIR release/live/.htaccess;
  put -O $UPD_DIR release/live/bundle-$BUILD.zip;
  put -O $UPD_DIR release/live/latest.json"

# 3. Keep the 5 newest bundles.
OLD=$(lftp_run "cls -1 --sort=name $UPD_DIR/bundle-*.zip" 2>/dev/null | head -n -5 || true)
for f in $OLD; do lftp_run "rm $f" || true; done
echo "Published build $BUILD"

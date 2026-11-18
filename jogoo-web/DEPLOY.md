# Publishing changes (website + app live updates)

A push to `main` on GitHub that changes anything in `jogoo-web/` publishes the
new version by itself:

1. GitHub Actions (`.github/workflows/meha-deploy.yml`, copy of
   `deploy/meha-deploy.yml`) builds the app with `scripts/build-release.sh`.
2. `scripts/upload-ftp.sh` uploads it over FTPS to the JOGOO hosting:
   - the website to `meha.jogoo.africa/`
   - the app update to `jogoo.africa/meha-updates/` (`bundle-<build>.zip`, then `latest.json`)
3. The Android app (version 1.5 and later) checks `latest.json` when it opens
   and each time it comes back to the screen (at most every 30 minutes), downloads the new bundle in the background, checks its
   SHA-256, and switches to it the next time it is closed or put in the
   background. If a new bundle fails to start, the app goes back to the
   previous one by itself.

Watch a run under the repository's **Actions** tab. A run takes 2–4 minutes;
phones get the update the next time the app is opened and then closed.

## One-time set-up

1. **FTP account** (cPanel → FTP Accounts): create one whose directory is the
   home folder (`/home/jogoxbmj`), so it can reach both `meha.jogoo.africa/`
   and `jogoo.africa/meha-updates/`. To use separate folders instead, set the
   repository variables `FTP_WEB_DIR` and `FTP_UPDATES_DIR`.
2. **GitHub secrets** (repository → Settings → Secrets and variables →
   Actions → New repository secret):
   - `FTP_SERVER` = `premium77.web-hosting.com`
   - `FTP_USERNAME` = the full FTP user name, e.g. `deploy@jogoo.africa`
   - `FTP_PASSWORD` = its password
3. Copy `jogoo-web/deploy/meha-deploy.yml` to `.github/workflows/meha-deploy.yml`
   at the root of the repository and push.
4. Install APK 1.5 or later once on each phone. From then on, updates arrive by themselves.

## What still needs a new APK

Live updates replace the web code (screens, text, images, logic). A new APK is
needed when native parts change: a new Capacitor plugin, an Android
permission, the app icon or name, or the Capacitor version. In that case:

1. Raise `versionCode`/`versionName` in `android/app/build.gradle`.
2. Set `minNative` in `live-update.json` to that new `versionCode`, so older
   APKs stay on the last bundle they can run.
3. Build with `npm run android:release` and share the new APK (or Play Store).

## Local test

```
BUILD=$(date -u +%Y%m%d%H%M) bash scripts/build-release.sh   # outputs build-cpanel/ and release/live/
```

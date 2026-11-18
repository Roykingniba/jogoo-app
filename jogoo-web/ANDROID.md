# Jogoo for Android

The Android app is the same React app wrapped with
[Capacitor](https://capacitorjs.com) 8. The web build (`dist/`) is bundled
inside the APK, so the app opens without a network connection; only account
features need the backend.

| | |
|---|---|
| Package (app ID) | `com.jogoo.meha` |
| App name | Jogoo |
| Android versions | 7.0 (API 24) and newer, targets API 36 |
| Config | `capacitor.config.ts`, native project in `android/` |
| Permissions | Internet, Camera (QR scanner and "take a photo") |

## Build the debug APK

Requirements: Node 22+, JDK 21, and the Android SDK (`platform-tools`,
`platforms;android-36`, `build-tools;35.0.0`). In this build environment the
SDK is at `/home/claude/android-sdk` (set in `android/local.properties`, or
export `ANDROID_HOME`).

```bash
npm install
npm run android:apk
```

That runs `npm run build`, `npx cap sync android` and
`./gradlew assembleDebug`, then copies the APK to
`release/jogoo-debug.apk`.

Backend settings are read at build time by Vite, so pass them as environment
variables (or a `.env.production.local` file) when building:

```bash
VITE_SUPABASE_URL=https://xxxx.supabase.co \
VITE_SUPABASE_PUBLISHABLE_KEY=sb_publishable_... \
npm run android:apk
```

Other commands:

- `npm run android:sync`: rebuild the web app and copy it into `android/`
  (do this after any change in `src/`, then build in Android Studio).
- `npx cap open android`: open the project in Android Studio.

The first Gradle build downloads Gradle and its dependencies (about 1 GB in
`~/.gradle`). If Maven Central answers "429 Too Many Requests", wait a minute
and run `cd android && ./gradlew assembleDebug` again.

## Install on a phone

The debug APK is signed with a debug key: fine for testing, not for the Play
Store.

1. Copy `release/jogoo-debug.apk` to the phone (USB cable, Google Drive,
   email, WhatsApp "Document", etc.).
2. Open the file on the phone. Android asks to allow installs from that app
   (Files, Chrome, Drive...): tap **Settings**, turn on
   **Allow from this source**, go back and tap **Install**.
   (On older phones: *Settings → Security → Unknown sources*.)
3. If Play Protect warns about an unknown developer, choose
   **More details → Install anyway**.

With a USB cable and developer options enabled you can also run
`adb install -r release/jogoo-debug.apk`.

To update, install a newer APK over the old one; data is kept as long as it
is signed with the same key. A debug APK built on another machine has a
different debug key, so uninstall the old app first.

## What is different in the app

- No service worker (the files are already in the APK) and no
  "Install the app" banner or menu item.
- PDFs (preview, download, maintenance-log share) are written to the app's
  cache folder and opened in Android's share sheet, from where they can be
  opened in a PDF viewer, saved or sent. Android WebView can't download
  `blob:` files.
- Call buttons open the phone dialler and WhatsApp buttons open WhatsApp (or
  the browser), through `@capacitor/app-launcher`. Other links to websites
  open in the browser.
- The camera is requested the first time the QR scanner or "take a photo"
  is used.
- The status bar is navy with light icons.
- The Android back button closes an open sheet, otherwise goes back one
  screen; on Home it closes the app.

The code for this is in `src/utils/native.ts`, `src/app/nativeApp.ts` and the
`isNative()` branches in `src/main.tsx`, `src/utils/actions.ts`,
`src/utils/pdf.ts`, `src/utils/pdfActions.ts` and `src/app/install.tsx`.

Icons (`android/app/src/main/res/mipmap-*`) and splash images
(`drawable*/splash.png`, JOGOO mark on cream `#f3f0e8`) were generated from
the JOGOO mark. To replace them, overwrite those PNGs at the same sizes, or use
`npx @capacitor/assets generate --android`.

## Signed release build (Play Store or direct download)

Do this once, and keep the keystore and passwords safe and backed up: every
future update must be signed with the same key. Never commit them.

1. Create an upload/release keystore (JDK `keytool`):

   ```bash
   keytool -genkeypair -v -keystore ~/jogoo-release.jks -alias jogoo \
     -keyalg RSA -keysize 4096 -validity 10000
   ```

2. Create `android/keystore.properties` (add it to `android/.gitignore`):

   ```properties
   storeFile=/home/you/jogoo-release.jks
   storePassword=...
   keyAlias=jogoo
   keyPassword=...
   ```

3. In `android/app/build.gradle`, load it and add a signing config:

   ```groovy
   def keystoreProps = new Properties()
   def keystoreFile = rootProject.file('keystore.properties')
   if (keystoreFile.exists()) keystoreProps.load(new FileInputStream(keystoreFile))

   android {
       signingConfigs {
           release {
               if (keystoreFile.exists()) {
                   storeFile file(keystoreProps['storeFile'])
                   storePassword keystoreProps['storePassword']
                   keyAlias keystoreProps['keyAlias']
                   keyPassword keystoreProps['keyPassword']
               }
           }
       }
       buildTypes {
           release {
               signingConfig signingConfigs.release
               // ...existing settings
           }
       }
   }
   ```

4. Raise `versionCode` (must grow with every release) and `versionName` in
   `android/app/build.gradle`.

5. Build:

   ```bash
   npm run android:sync
   cd android
   ./gradlew assembleRelease   # app/build/outputs/apk/release/app-release.apk (direct install)
   ./gradlew bundleRelease     # app/build/outputs/bundle/release/app-release.aab (Google Play)
   ```

For Google Play, enrol in Play App Signing: Google keeps the app signing key
and your keystore becomes the upload key. Check a signed APK with
`apksigner verify --print-certs app-release.apk` (in `build-tools`).

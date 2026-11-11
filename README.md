# Jogoo mobile

Bilingual (English/French) client app for JOGOO Agriculture, for Android and
iOS. Version 1 implements the 20 screens of the client app showcase (phase 1).
The 5-screen "simple version" is not built yet.

## What is in version 1

| # | Screen | File in `lib/screens/` |
|---|--------|------------------------|
| 01 | Home | `home_screen.dart` |
| 02 | My farm (equipment, orders, invoices) | `my_farm_screen.dart` |
| 03 | Equipment detail | `equipment_screen.dart` |
| 04 | Shop (and cart) | `shop_screen.dart` |
| 05 | Product | `product_screen.dart` |
| 06 | Mia assistant | `mia_screen.dart` |
| 07 | Learn (and guide reader) | `learn_screen.dart`, `guide_screen.dart` |
| 08 | Service | `service_screen.dart` |
| 09 | Service request | `service_request_screen.dart` |
| 10 | Profile | `profile_screen.dart` |
| 11 | Spare parts | `spare_parts_screen.dart` |
| 12 | Reorder inputs | `reorder_inputs_screen.dart` |
| 13 | Delivery tracking | `delivery_screen.dart` |
| 14 | Report a problem | `report_problem_screen.dart` |
| 15 | Agronomist channel | `agronomist_screen.dart` |
| 16 | My documents | `documents_screen.dart` |
| 17 | Maintenance log | `maintenance_log_screen.dart` |
| 18 | New log entry | `new_log_entry_screen.dart` |
| 19 | Notifications | `notifications_screen.dart` |
| 20 | Offline library | `offline_library_screen.dart` |

**Data is demo data.** Every screen reads `JogooStore`
(`lib/data/jogoo_store.dart`), which is filled from `lib/data/demo_data.dart`
(the design persona, Royking Niba in Obala). The client's actions — quote and
price requests, cart orders, problem reports, log entries, ratings, notes — are
kept in memory and labelled "saved", never "sent". Nothing reaches JOGOO and
nothing survives an app restart until the store is backed by PowerSync tables;
only the language choice is stored on the phone. Each list in the store maps to
one future Supabase table.

The spare-parts screen can scan equipment QR stickers or accept a serial number.
Learn videos are represented in this demo by offline, illustrated step-by-step
walkthroughs (the project does not include video or audio clips). Document
previews and downloads generate clearly marked demo PDFs from the sample data;
they are not original JOGOO technical documents. Maintenance logs can be shared
as a PDF. These features work without backend credentials. Call and WhatsApp
buttons work and use `DemoData.jogooPhone`.

Mia answers through the `mia` Edge Function when Supabase is configured and the
user is signed in. Otherwise the chat offers a phone call or WhatsApp instead.

### Low-end phones

- Fonts (Poppins, Montserrat; SIL OFL) and images are bundled, so text and
  pictures render offline. Images are pre-sized to 320 px or less and decoded
  at display size.
- Only the visible tab is built. No heavy packages (maps, ML scanners).
- Layout is tested at 360 × 640 dp in both languages and at 130% system text.
- Build per-ABI release APKs to keep downloads small:
  `flutter build apk --release --split-per-abi`.

Brand colours, type and shared components are in `lib/app/theme.dart` and
`lib/widgets/`. Text lives in `lib/l10n/app_en.arb` and `app_fr.arb`; both must
keep the same keys.

## Local development

From this directory:

```powershell
flutter pub get
flutter run
```

### Running without a phone

The app also runs in Chrome, which is the quickest way to try it on this PC:

```powershell
flutter run -d chrome
```

or build once and serve the result:

```powershell
flutter build web --release
python -m http.server 8080 --bind 127.0.0.1 --directory build/web
```

then open http://127.0.0.1:8080. On the web, PowerSync stores the database in
the browser using `web/sqlite3.wasm` and the `web/powersync_*.worker.js` files.
Re-run `dart run powersync:setup_web` after upgrading the `powersync` package.

The Android emulator is installed but cannot start on this PC: it needs
hardware acceleration, which requires an administrator to enable **Windows
Hypervisor Platform** (Windows Features) and reboot. Until then, use Chrome or a
real Android phone with USB debugging (`flutter devices`, then `flutter run`).

Checks:

```powershell
flutter analyze
flutter test
```

Without configuration the app runs offline against its on-device database.
To connect it to Supabase and PowerSync, copy `config/dev.example.json` to
`config/dev.json` (git-ignored), fill in the public project values, and run:

```powershell
flutter run --dart-define-from-file=config/dev.json
```

Only the Supabase URL, the publishable key, and the PowerSync URL go in that
file. Never put service-role keys or third-party API keys in it.

The first Android build downloads Gradle and lets plugins install the SDK
platforms, CMake, and NDK 28.2.13676358 they need; expect it to take ~15
minutes. Later builds are incremental.

The Android SDK is installed per-user at `%LOCALAPPDATA%\Android\Sdk`, with API
36 and Build Tools 36.0.0. Android Studio was not installed because its Windows
installer requires administrator access. Android builds use the user-local
Temurin JDK 21. iOS builds and CocoaPods require macOS with Xcode.

## Android release

Release builds must be signed with JOGOO's own upload key. Without it they
fall back to the debug key, which the Play Store rejects.

1. Create the key once and keep it, and its passwords, somewhere safe and
   backed up. Losing it means you cannot update the app.

   ```powershell
   keytool -genkey -v -keystore jogoo-upload.jks -keyalg RSA -keysize 2048 -validity 10000 -alias upload
   ```

2. Create `android/key.properties` (git-ignored):

   ```properties
   storeFile=C:/path/to/jogoo-upload.jks
   storePassword=...
   keyAlias=upload
   keyPassword=...
   ```

3. Build: `flutter build appbundle --release` for the Play Store, or
   `flutter build apk --release --split-per-abi` for direct installs.

The app id `com.jogoo.jogoo_app` cannot change after the first Play Store
release. Raise `version:` in `pubspec.yaml` for every release.

## Honest requests

The app cannot send requests, orders or reports to JOGOO yet. Every request
point opens `contactJogooAbout()` (`lib/utils/actions.dart`): it says nothing
was sent and offers a prefilled WhatsApp message or a call. The farm, shop and
service tabs show an "Example data" banner. Remove both once requests reach
JOGOO through the backend.

## Integrations

- `powersync` and `supabase_flutter` provide local-first database sync,
  phone-based Supabase Auth, functions, and Storage. The local schema is in
  `lib/data/schema.dart`; it must match the Supabase migrations and
  `powersync/sync-rules.yaml`, which you paste into the PowerSync dashboard.
  Sync starts when a user signs in. On sign-out the local data is cleared,
  including any changes that have not been uploaded yet.
- `supabase/migrations/*_farm_tenancy.sql` defines `farms` and
  `farm_members`. Row-level security limits each user to their own farms;
  future farm tables should reference `farms.id` and reuse
  `private.is_farm_member()` in their policies.
- The `mia` Edge Function only accepts signed-in users.
- Firebase (Messaging, Crashlytics) was removed because nothing used it and
  it added background services to the app. To add push notifications later,
  add `firebase_core` and `firebase_messaging` back, create a Firebase project
  and run `flutterfire configure`.
- Deno and the project-local Supabase CLI are ready for Edge Functions. Run
  `npm.cmd exec -- supabase --help` for commands. Starting the full local
  Supabase stack additionally requires Docker Desktop.
- Claude, Zoho CRM, SMS/WhatsApp, and mobile-money credentials belong in
  Supabase function secrets, never in the Flutter app.
- Select and verify Cameroon coverage and pricing for the SMS and mobile-money
  providers before wiring those integrations.

The Supabase project has not been linked to a hosted project, and no service
credentials have been added.

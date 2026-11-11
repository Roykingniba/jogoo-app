# Jogoo web

React + TypeScript version of the JOGOO Agriculture client app (Flutter v1, all
20 screens), built for stakeholder review. It adapts to phones, tablets and
desktops, runs in English and French, and can be installed on a phone's home
screen as an app (PWA) that also works offline.

**Data is demo data**, exactly as in the Flutter app: the client's actions
(cart orders, quote requests, problem reports, log entries, ratings, notes) are
kept in memory for the session and labelled "saved", never "sent". Only the
language choice is stored on the device.

## Client accounts and status tracking

Clients sign up with email and password, then see a **Status** tab
(*Suivi* in French) that follows their project through 7 stages:
Signed up → Contacted → Site visit done → Quote sent → Payment made →
Installation scheduled → Installed. JOGOO staff accounts get a **Clients** tab
instead: search all sign-ups, filter by stage, open a client, move them to a
stage and add a note the client sees.

Accounts are stored by a small PHP + MySQL API in `server/` that runs on the
cPanel hosting next to the app (`/api`). Passwords are bcrypt-hashed, sign-in
uses an HttpOnly, Secure, SameSite cookie, sign-in and sign-up are
rate-limited, and every query is parameterised. The plan to move to Supabase
is in [SUPABASE.md](SUPABASE.md).

**Two-step verification:** sign-up confirms the email with a 6-digit code,
and every sign-in asks for a fresh emailed code unless the person ticked
"Trust this device for 30 days". Codes are valid 10 minutes, allow 5 tries,
and are stored only as hashes. Changing or resetting a password signs out
every other device and forgets trusted devices.

**Forgotten passwords:** "Forgot password?" on the sign-in screen emails a
code; the client enters it with a new password. No staff involvement.

**Roles:** `client`, `admin` (JOGOO staff: Clients page) and `super_admin`.
Emails listed in `super_admin_emails` (in `jogoo-private/app.php` on the
server) become super admin when they sign up and confirm the code. The super
admin sees a **Staff** filter on the Clients page and can give or remove staff
access for anyone.

**Email:** codes are sent with PHP `mail()` from `mail_from`
(`no-reply@jogoo.africa`, whose SPF and DKIM pass on this hosting). For local
development set `mail_log` in the config to write emails to a file.

## Run it

```bash
npm install
npm run dev        # http://localhost:5173
npm run build      # production build in dist/
npm run preview    # serve dist/ at http://localhost:4173
npm run lint
```

## Deploy

### cPanel (meha.jogoo.africa)

`npm run package:cpanel` builds `jogoo-meha-cpanel.zip`. Extract it into the
subdomain folder. It contains the app, `.htaccess` and `api/`. Then:

1. Create a MySQL database and user (cPanel → MySQL Database Wizard).
2. Create `/home/<cpanel-user>/jogoo-private/config.php` from
   `server/config.sample.php`. The folder sits outside the website, so it can't
   be downloaded. Leave `db_user`/`db_pass` empty if you want to type them
   into the installer.
3. Optionally add `jogoo-private/app.php` with `app_secret`,
   `super_admin_emails` and `mail_from` (see `server/config.sample.php`).
4. Open `https://<site>/api/install.php`, enter the setup key and the
   database user and password. Then delete `api/install.php`.
5. Sign up in the app with a super admin email.

PHP 7.4 or newer with PDO MySQL is required (Namecheap: *Select PHP Version*).

### Other static hosts (app only, no accounts)

`dist/` is a static site; any static host works. URLs use `#/...` so no server
rewrite rules are needed. Security headers (CSP, frame blocking, etc.) are
included for each host.

- **Vercel**: import the repo; `vercel.json` sets the build and headers.
- **Netlify** / **Cloudflare Pages**: import the repo, or drag `dist/` into
  Netlify Drop. `netlify.toml` and `public/_headers` set the build and headers.
- **GitHub Pages**: Settings → Pages → Source: GitHub Actions. The workflow in
  `.github/workflows/deploy-pages.yml` builds with `BASE_PATH=/<repo>/`.
- **Sub-folder**: build with `BASE_PATH=/some/path/ npm run build`.

HTTPS is required for installing the app and for the QR scanner's camera
(all the hosts above provide it).

## Install on a phone

- **Android (Chrome, Edge, Samsung Internet)**: open the site; tap **Install**
  on the Home banner, or the browser menu → *Install app*.
- **iPhone/iPad (Safari)**: Share → *Add to Home Screen*.
- **Desktop (Chrome/Edge)**: *Install the app* at the bottom of the sidebar.

## Layout

| Width | Navigation | Content |
|---|---|---|
| < 720 px (phones) | bottom tabs, like the Flutter app | single column |
| 720 – 1079 px (tablets) | icon rail on the left | 2 columns where useful |
| ≥ 1080 px (desktops) | sidebar with logo, tabs, quick access, language | dashboards, grids, side columns, max 1180 px |

## Project structure

```
src/
  app/          App (routes), Shell (responsive navigation), install prompt
  screens/      one file per screen (20 screens + walkthrough), lazy-loaded
  components/   ui.tsx (ports of jogoo_widgets.dart), overlays (toast, sheet,
                media picker), Icon (Material names → Lucide icons), feature parts
  data/         models.ts, demoData.ts, store.ts (zustand, = JogooStore), miaClient.ts
  i18n/         en.json / fr.json converted from the Flutter ARB files,
                web_en/web_fr.json for web-only strings
  utils/        formatting, call/WhatsApp/share actions, PDF exports (jsPDF, lazy-loaded)
  styles/       global.css (brand tokens, layout) + per-feature CSS
routes.ts       every screen's URL
```

Brand colours, fonts (Poppins, Montserrat; SIL OFL) and images come from the
Flutter project and are bundled, so nothing loads from third-party servers.

## Differences from the Flutter app

- Camera/gallery uses the browser's file picker (camera on phones).
- QR scanning uses the camera in the browser (`qr-scanner`); without a camera
  or permission it falls back to typing the serial number.
- Document previews open in the browser's PDF viewer; the maintenance log is
  shared with the phone's share sheet or downloaded.
- Firebase push notifications and Crashlytics are not included.
- Mia answers only when Supabase is configured and the user is signed in
  (`.env.example`); sign-in is not part of this build, so the chat offers a
  call or WhatsApp, as the Flutter app does without a backend.
- A few web-only strings live in `src/i18n/web_*.json`. If you edit text in
  the Flutter ARB files, copy them again into `src/i18n/en.json` / `fr.json`.

## Security notes

- No secrets are in the app. Claude, Zoho, SMS/WhatsApp and mobile-money keys
  belong in Supabase function secrets, never in the web build.
- Strict Content-Security-Policy: the app only loads its own files and may only
  connect to `*.supabase.co`.
- Text typed by users is rendered by React (escaped); there is no
  `dangerouslySetInnerHTML`.

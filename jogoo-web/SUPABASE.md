# Moving client accounts to Supabase

Today client accounts and their status live in MySQL on the cPanel hosting
(`server/`). Everything was built so the move to Supabase (the backend the
Flutter mobile app is planned on) is a copy, not a rebuild:

| Today (MySQL, `server/sql/schema.mysql.sql`) | Supabase |
|---|---|
| `users` (uuid id, email, bcrypt hash) | `auth.users` (Supabase Auth, also bcrypt) |
| `profiles` (role `client`/`admin`) | `public.profiles` |
| `journey_events` (append-only; latest = current stage) | `public.journey_events` + `client_stage` view |
| `sessions`, `auth_attempts` | handled by Supabase Auth |

The web app only talks to the `Backend` interface in
`src/data/backend/types.ts`. The screens never call the API directly.

## Steps when you're ready

1. In the Supabase project used by the mobile app, apply
   `supabase/migrations/20261104120000_client_journey.sql` (put it in
   `jogoo-app/supabase/migrations/` next to `farm_tenancy`; it reuses the
   `private` schema and doesn't touch `farms`).
2. On the server (cPanel → Terminal): `php server/tools/export-for-supabase.php > import.sql`,
   then run `import.sql` in the Supabase SQL editor. Passwords carry over, so
   clients keep their password. Delete `import.sql` afterwards (it contains
   password hashes).
3. Add `src/data/backend/supabaseBackend.ts` implementing `Backend` with
   `@supabase/supabase-js` (sign-up passes `full_name`, `phone`, `location`,
   `farm_size_ha`, `lang` as user metadata; the trigger creates the profile and
   the first "Signed up" step). Point `src/data/backend/index.ts` at it and set
   `VITE_SUPABASE_URL` / `VITE_SUPABASE_PUBLISHABLE_KEY`.
4. Rebuild, deploy, and remove `/api` from the cPanel site.

Row-level security in the migration gives the same rules as the PHP API:
clients see only their own profile and journey; staff (`role = 'admin'`) see
everyone and are the only ones who can add steps or change roles.

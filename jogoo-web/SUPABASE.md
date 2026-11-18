# Supabase backend

The app uses Supabase when `VITE_SUPABASE_URL` and `VITE_SUPABASE_PUBLISHABLE_KEY`
are set at build time (`.env.production`, public values). Without them it falls
back to the PHP API in `server/` (cPanel).

Project: `kyrajnbcrtxwdnwcgbzz` (https://kyrajnbcrtxwdnwcgbzz.supabase.co).

## What's in Supabase

| Piece | Where | What it does |
|---|---|---|
| Accounts | Supabase Auth | Email + password |
| `profiles`, `journey_events` | `supabase/migrations/20261118120000_client_accounts.sql` | Client details, role (`client` / `admin` / `super_admin`), the 7 project stages |
| 2-step verification | same migration (`private.*` tables) + Edge Function `auth-codes` | 6-digit email codes at sign-up and sign-in, trusted devices (30 days), password reset by code |
| Staff page | SQL functions `admin_*` | List/search clients, move stage, add notes; super admin gives/removes staff access |

Every table and function requires a session that passed the email code: a
password alone reads nothing. Super admin emails live in
`private.super_admin_emails` (seeded with roykingnibajogoo@gmail.com).

## Settings that must be in place

1. **Authentication → Sign In / Providers → Email → "Confirm email": OFF.**
   Email ownership is confirmed by our own 6-digit code instead.
2. **Edge Functions → auth-codes → Settings → "Verify JWT with legacy secret": OFF**
   (the function checks the user's token itself; some actions work signed out).
3. **Edge Functions → Secrets** (code emails go through the mail relay on the JOGOO hosting):
   - `MAILER_URL` = `https://jogoo.africa/jogoo-mailer/` (files: `server/mailer/`)
   - `MAILER_SECRET` = the same value as `secret` in `/home/<cpanel user>/jogoo-private/mailer.php`
     (outside public_html; never in git). Change it in both places together.
   - Without the relay, SMTP is used instead: `SMTP_USER`, `SMTP_PASS`, optional `SMTP_HOST`,
     `SMTP_PORT`, `MAIL_FROM_NAME`. Optional for both: `ALLOWED_ORIGINS`.

## Updating

- SQL: paste the migration into the SQL editor and run it (it is safe to run again),
  or `npx supabase db push`.
- Function: `npx supabase functions deploy auth-codes --project-ref kyrajnbcrtxwdnwcgbzz`
  (`supabase/config.toml` keeps `verify_jwt = false`), or paste
  `supabase/functions/auth-codes/index.ts` into the dashboard editor.

## Moving accounts from the cPanel version

If anyone signed up on the PHP version: in cPanel → Terminal run
`php ~/meha.jogoo.africa/../jogoo-web/server/tools/export-for-supabase.php > import.sql`
(or wherever `server/tools` is uploaded), run `import.sql` in the Supabase SQL
editor, then delete it. Passwords carry over (bcrypt).

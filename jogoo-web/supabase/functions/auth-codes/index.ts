// auth-codes: email-code 2-step verification for the Jogoo app.
//
// Actions (POST JSON {action, ...}):
//   start          (signed in)  {deviceToken?}                     → {verified:true} | {next, challenge, email}
//   verify         (signed in)  {challenge, code, rememberDevice?}  → {verified:true, deviceToken?}
//   resend                      {challenge}                         → {next, email}
//   reset_request               {email, lang?}                      → {next:'reset_code', challenge, email}
//   reset_confirm               {challenge, code, newPassword, rememberDevice?} → {email, deviceToken}
//   change_password (signed in) {currentPassword, newPassword}      → {ok:true}
//
// Secrets (Dashboard → Edge Functions → Secrets). Email goes out through EITHER
//   MAILER_URL + MAILER_SECRET (the PHP relay in server/mailer on the JOGOO hosting), OR
//   SMTP_HOST (default premium77.web-hosting.com), SMTP_PORT (465),
//   SMTP_USER (no-reply@jogoo.africa), SMTP_PASS, MAIL_FROM_NAME (JOGOO Agriculture),
//   ALLOWED_ORIGINS (comma list; defaults below).
// "Verify JWT" must be OFF for this function: it checks the user's token itself.
import { createClient } from 'npm:@supabase/supabase-js@2';
import nodemailer from 'npm:nodemailer@6';

const URL = Deno.env.get('SUPABASE_URL')!;
// New projects expose named keys as JSON ({"default": "sb_secret_…"}); older
// ones the legacy JWT keys. Use whichever is present.
const named = (v: string | undefined) => {
  try { return v ? (JSON.parse(v).default as string | undefined) : undefined; } catch { return undefined; }
};
const SERVICE_KEY = named(Deno.env.get('SUPABASE_SECRET_KEYS')) ?? Deno.env.get('SUPABASE_SECRET_KEY') ??
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
const ANON_KEY = named(Deno.env.get('SUPABASE_PUBLISHABLE_KEYS')) ?? Deno.env.get('SUPABASE_PUBLISHABLE_KEY') ??
  Deno.env.get('SUPABASE_ANON_KEY') ?? '';
const CODE_TTL_MIN = 10;
const ORIGINS = (Deno.env.get('ALLOWED_ORIGINS') ??
  'https://meha.jogoo.africa,https://jogoo.africa,https://www.jogoo.africa,https://localhost,capacitor://localhost,http://localhost:5173,http://localhost:4173')
  .split(',').map((s) => s.trim()).filter(Boolean);

const admin = createClient(URL, SERVICE_KEY, { auth: { persistSession: false, autoRefreshToken: false } });

const smtp = nodemailer.createTransport({
  host: Deno.env.get('SMTP_HOST') ?? 'premium77.web-hosting.com',
  port: Number(Deno.env.get('SMTP_PORT') ?? '465'),
  secure: Number(Deno.env.get('SMTP_PORT') ?? '465') === 465,
  auth: { user: Deno.env.get('SMTP_USER') ?? '', pass: Deno.env.get('SMTP_PASS') ?? '' },
});

// ------------------------------------------------------------------ http helpers

function cors(origin: string | null): Record<string, string> {
  const allow = origin && ORIGINS.includes(origin) ? origin : ORIGINS[0];
  return {
    'Access-Control-Allow-Origin': allow,
    'Access-Control-Allow-Headers': 'authorization, apikey, content-type, x-client-info',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Vary': 'Origin',
  };
}

class Fail extends Error {
  constructor(public status: number, public code: string, public extra: Record<string, unknown> = {}) {
    super(code);
  }
}

const rpc = async <T>(fn: string, args: Record<string, unknown>): Promise<T> => {
  const { data, error } = await admin.rpc(fn, args);
  if (error) {
    console.error(fn, error.message);
    throw new Fail(500, 'server_error');
  }
  return data as T;
};

/** The signed-in user and their session id, from the Authorization header. */
async function caller(req: Request) {
  const jwt = (req.headers.get('authorization') ?? '').replace(/^Bearer\s+/i, '');
  if (!jwt || jwt.split('.').length !== 3) throw new Fail(401, 'not_signed_in');
  const { data, error } = await admin.auth.getUser(jwt);
  if (error || !data.user) throw new Fail(401, 'not_signed_in');
  const payload = JSON.parse(atob(jwt.split('.')[1].replace(/-/g, '+').replace(/_/g, '/')));
  if (!payload.session_id) throw new Fail(401, 'not_signed_in');
  return { uid: data.user.id, sid: payload.session_id as string, jwt };
}

const clientIp = (req: Request) =>
  (req.headers.get('x-forwarded-for') ?? '').split(',')[0].trim() || 'unknown';

async function limit(kind: string, key: string, max: number, minutes: number) {
  const ok = await rpc<boolean>('svc_rate', { kind, key, max_count: max, minutes });
  if (!ok) throw new Fail(429, 'too_many_attempts');
}

function maskEmail(email: string) {
  const [u, d = ''] = email.split('@');
  const shown = u.slice(0, Math.min(2, Math.max(1, u.length - 1)));
  return `${shown}${'•'.repeat(Math.max(2, u.length - shown.length))}@${d}`;
}

// ------------------------------------------------------------------ email

type Purpose = 'verify_email' | 'login' | 'reset_password';
interface UserInfo { id: string; email: string; fullName: string; lang: 'en' | 'fr'; emailVerified: boolean }

async function sendCode(user: UserInfo, code: string, purpose: Purpose) {
  const fr = user.lang === 'fr';
  const what = {
    verify_email: fr ? 'confirmer votre adresse e-mail' : 'confirm your email address',
    login: fr ? 'vous connecter' : 'sign in',
    reset_password: fr ? 'choisir un nouveau mot de passe' : 'choose a new password',
  }[purpose];
  const subject = fr ? `Votre code JOGOO : ${code}` : `Your JOGOO code: ${code}`;
  const hello = fr ? `Bonjour ${user.fullName},` : `Hello ${user.fullName},`;
  const line = fr ? `Voici votre code pour ${what} :` : `Here is your code to ${what}:`;
  const valid = fr ? `Il est valable ${CODE_TTL_MIN} minutes.` : `It is valid for ${CODE_TTL_MIN} minutes.`;
  const ignore = fr
    ? "Si vous n'avez rien demandé, ignorez cet e-mail : votre compte reste protégé. Ne partagez jamais ce code, même avec JOGOO."
    : "If you didn't ask for this, ignore this email: your account stays protected. Never share this code, not even with JOGOO.";
  const esc = (s: string) => s.replace(/[&<>"']/g, (c) => `&#${c.charCodeAt(0)};`);
  const html = `<!doctype html><html><body style="margin:0;background:#f3f0e8;font-family:Arial,Helvetica,sans-serif;color:#0e2338">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0"><tr><td align="center" style="padding:24px 12px">
<table role="presentation" width="100%" style="max-width:480px;background:#ffffff;border-radius:20px" cellpadding="0" cellspacing="0">
<tr><td style="background:#004a87;border-radius:20px 20px 0 0;padding:20px 24px;color:#ffffff;font-size:20px;font-weight:bold;letter-spacing:2px">JOGOO</td></tr>
<tr><td style="padding:24px"><p style="margin:0 0 12px">${esc(hello)}</p><p style="margin:0 0 16px">${esc(line)}</p>
<p style="margin:0 0 16px;font-size:34px;font-weight:bold;letter-spacing:8px;color:#004a87">${code}</p>
<p style="margin:0 0 16px;color:#56657a">${esc(valid)}</p><p style="margin:0;color:#56657a;font-size:13px">${esc(ignore)}</p>
</td></tr></table></td></tr></table></body></html>`;
  const text = `${hello}\n\n${line}\n\n    ${code}\n\n${valid}\n\n${ignore}\n\nJOGOO Agriculture`;
  const relayUrl = Deno.env.get('MAILER_URL');
  const relaySecret = Deno.env.get('MAILER_SECRET');
  if (relayUrl && relaySecret) {
    await sendViaRelay(relayUrl, relaySecret, { to: user.email, subject, text, html });
    return;
  }
  try {
    await smtp.sendMail({
      from: { name: Deno.env.get('MAIL_FROM_NAME') ?? 'JOGOO Agriculture', address: Deno.env.get('SMTP_USER') ?? '' },
      to: user.email,
      subject,
      text,
      html,
      headers: { 'Auto-Submitted': 'auto-generated', 'X-Auto-Response-Suppress': 'All' },
    });
  } catch (e) {
    console.error('smtp', (e as Error).message);
    throw new Fail(502, 'email_failed');
  }
}

/** Sends through the JOGOO hosting's mail relay (server/mailer), signed with MAILER_SECRET. */
async function sendViaRelay(url: string, secret: string, msg: Record<string, string>) {
  const body = JSON.stringify(msg);
  const ts = String(Math.floor(Date.now() / 1000));
  const key = await crypto.subtle.importKey('raw', new TextEncoder().encode(secret), { name: 'HMAC', hash: 'SHA-256' }, false, ['sign']);
  const mac = await crypto.subtle.sign('HMAC', key, new TextEncoder().encode(`${ts}.${body}`));
  const sig = [...new Uint8Array(mac)].map((b) => b.toString(16).padStart(2, '0')).join('');
  let res: Response;
  try {
    res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'X-Jogoo-Timestamp': ts, 'X-Jogoo-Signature': sig },
      body,
    });
  } catch (e) {
    console.error('relay', (e as Error).message);
    throw new Fail(502, 'email_failed');
  }
  if (!res.ok) {
    console.error('relay', res.status, await res.text().catch(() => ''));
    throw new Fail(res.status === 429 ? 429 : 502, res.status === 429 ? 'too_many_attempts' : 'email_failed');
  }
}

async function startChallenge(user: UserInfo, purpose: Purpose) {
  await limit('code_sent', user.id, 8, 60);
  const c = await rpc<{ token: string; code: string }>('svc_start_challenge', { uid: user.id, purpose, ttl_minutes: CODE_TTL_MIN });
  await sendCode(user, c.code, purpose);
  return c.token;
}

const nextFor = (p: Purpose) => (p === 'verify_email' ? 'verify_email' : p === 'login' ? 'login_code' : 'reset_code');

function checkPassword(p: unknown) {
  if (typeof p !== 'string' || p.length < 8) throw new Fail(422, 'weak_password');
  if (new TextEncoder().encode(p).length > 72) throw new Fail(422, 'password_too_long');
  return p;
}

// ------------------------------------------------------------------ actions

async function handle(req: Request, body: Record<string, unknown>) {
  const ip = clientIp(req);
  switch (body.action) {
    case 'start': {
      const { uid, sid } = await caller(req);
      const user = await rpc<UserInfo>('svc_user', { uid });
      if (user.emailVerified && typeof body.deviceToken === 'string' &&
          await rpc<boolean>('svc_device_ok', { uid, token: body.deviceToken })) {
        await rpc('svc_verify_session', { sid, uid });
        return { verified: true };
      }
      const purpose: Purpose = user.emailVerified ? 'login' : 'verify_email';
      const challenge = await startChallenge(user, purpose);
      return { next: nextFor(purpose), challenge, email: maskEmail(user.email) };
    }

    case 'verify': {
      const { uid, sid } = await caller(req);
      await limit('code_check', ip, 30, 15);
      const v = await rpc<{ ok: boolean; error?: string; attemptsLeft?: number; userId?: string; purpose?: Purpose }>(
        'svc_verify_challenge', { token: String(body.challenge ?? ''), code: String(body.code ?? ''), purposes: ['verify_email', 'login'] });
      if (!v.ok) throw new Fail(v.error === 'invalid_code' ? 401 : 410, v.error!, { attemptsLeft: v.attemptsLeft });
      if (v.userId !== uid) throw new Fail(403, 'forbidden');
      if (v.purpose === 'verify_email') await rpc('svc_email_verified', { uid });
      await rpc('svc_verify_session', { sid, uid });
      const deviceToken = body.rememberDevice ? await rpc<string>('svc_trust_device', { uid, days: 30 }) : undefined;
      return { verified: true, deviceToken };
    }

    case 'resend': {
      const r = await rpc<{ error?: string; code?: string; userId?: string; purpose?: Purpose }>(
        'svc_resend_challenge', { token: String(body.challenge ?? ''), ttl_minutes: CODE_TTL_MIN });
      if (r.error) throw new Fail(r.error === 'code_expired' ? 410 : 429, r.error);
      const user = await rpc<UserInfo>('svc_user', { uid: r.userId });
      await sendCode(user, r.code!, r.purpose!);
      return { next: nextFor(r.purpose!), email: maskEmail(user.email) };
    }

    case 'reset_request': {
      const email = String(body.email ?? '').trim().toLowerCase();
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) throw new Fail(422, 'invalid_email');
      await limit('reset_ip', ip, 10, 60);
      await limit('reset_email', email, 5, 60);
      const user = await rpc<UserInfo | null>('svc_user', { mail: email });
      let challenge: string;
      if (user) {
        challenge = await startChallenge(user, 'reset_password');
      } else {
        // Same answer whether or not the account exists.
        await new Promise((r) => setTimeout(r, 300 + Math.random() * 400));
        challenge = crypto.randomUUID().replace(/-/g, '') + crypto.randomUUID().replace(/-/g, '');
      }
      return { next: 'reset_code', challenge, email: maskEmail(email) };
    }

    case 'reset_confirm': {
      const password = checkPassword(body.newPassword);
      await limit('code_check', ip, 30, 15);
      const v = await rpc<{ ok: boolean; error?: string; attemptsLeft?: number; userId?: string }>(
        'svc_verify_challenge', { token: String(body.challenge ?? ''), code: String(body.code ?? ''), purposes: ['reset_password'] });
      if (!v.ok) throw new Fail(v.error === 'invalid_code' ? 401 : 410, v.error!, { attemptsLeft: v.attemptsLeft });
      const uid = v.userId!;
      const { error } = await admin.auth.admin.updateUserById(uid, { password });
      if (error) throw new Fail(422, /weak|short|pwned/i.test(error.message) ? 'weak_password' : 'server_error');
      await rpc('svc_email_verified', { uid });
      await rpc('svc_revoke_all', { uid, keep_session: null });
      // A grant so the sign-in that follows doesn't ask for yet another code.
      const deviceToken = body.rememberDevice
        ? await rpc<string>('svc_trust_device', { uid, days: 30 })
        : await rpc<string>('svc_grant_device', { uid, minutes: 5 });
      const user = await rpc<UserInfo>('svc_user', { uid });
      return { email: user.email, deviceToken, remembered: Boolean(body.rememberDevice) };
    }

    case 'change_password': {
      const { uid, sid } = await caller(req);
      const password = checkPassword(body.newPassword);
      await limit('pw_change', uid, 5, 15);
      const user = await rpc<UserInfo>('svc_user', { uid });
      // Check the current password with a throwaway sign-in, then end that session.
      const res = await fetch(`${URL}/auth/v1/token?grant_type=password`, {
        method: 'POST',
        headers: { apikey: ANON_KEY || SERVICE_KEY, 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: user.email, password: String(body.currentPassword ?? '') }),
      });
      if (!res.ok) throw new Fail(401, 'invalid_credentials');
      const probe = await res.json();
      await admin.auth.admin.signOut(probe.access_token, 'local').catch(() => {});
      const { error } = await admin.auth.admin.updateUserById(uid, { password });
      if (error) throw new Fail(422, 'weak_password');
      await rpc('svc_revoke_all', { uid, keep_session: sid });
      return { ok: true };
    }
  }
  throw new Fail(404, 'not_found');
}

Deno.serve(async (req) => {
  const headers = { ...cors(req.headers.get('origin')), 'Content-Type': 'application/json', 'Cache-Control': 'no-store' };
  if (req.method === 'OPTIONS') return new Response(null, { status: 204, headers });
  if (req.method !== 'POST') return new Response(JSON.stringify({ error: 'not_found' }), { status: 404, headers });
  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return new Response(JSON.stringify({ error: 'invalid_json' }), { status: 400, headers });
  }
  try {
    return new Response(JSON.stringify(await handle(req, body)), { status: 200, headers });
  } catch (e) {
    const f = e instanceof Fail ? e : new Fail(500, 'server_error');
    if (!(e instanceof Fail)) console.error(e);
    return new Response(JSON.stringify({ error: f.code, ...f.extra }), { status: f.status, headers });
  }
});

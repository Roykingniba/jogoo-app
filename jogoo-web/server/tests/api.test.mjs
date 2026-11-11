// End-to-end tests for the PHP API. Run through server/tests/run.sh, which
// starts the API and a throwaway database and sets these variables.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { execFileSync } from 'node:child_process';

const API = process.env.JOGOO_API;
const MAIL_LOG = process.env.JOGOO_MAIL_LOG;
const DB = process.env.JOGOO_DB_CONTAINER;
if (!API || !MAIL_LOG || !DB) throw new Error('Run via server/tests/run.sh');

/** A browser: keeps its own cookies. */
function client() {
  const jar = new Map();
  async function call(method, path, body, { header = true } = {}) {
    const headers = { Accept: 'application/json' };
    if (header) headers['X-Jogoo-Client'] = 'web';
    if (body !== undefined) headers['Content-Type'] = 'application/json';
    if (jar.size) headers.Cookie = [...jar].map(([k, v]) => `${k}=${v}`).join('; ');
    const res = await fetch(API + path, { method, headers, body: body === undefined ? undefined : JSON.stringify(body) });
    for (const c of res.headers.getSetCookie()) {
      const [kv, ...attrs] = c.split(';');
      const i = kv.indexOf('=');
      const k = kv.slice(0, i).trim();
      const v = kv.slice(i + 1).trim();
      const expired = attrs.some((a) => /expires=.*1970/i.test(a)) || v === '' || v === 'deleted'
        || attrs.some((a) => /max-age=0/i.test(a.trim()));
      if (expired) jar.delete(k); else jar.set(k, v);
    }
    let data = null;
    try { data = await res.json(); } catch { /* empty */ }
    return { status: res.status, data };
  }
  return { call, jar };
}

const sql = (q) => execFileSync('docker', ['exec', DB, 'mariadb', '-uroot', '-proot', 'jogoo', '-N', '-e', q]).toString().trim();
const resetLimits = () => sql('DELETE FROM auth_attempts');

const mails = () => readFileSync(MAIL_LOG, 'utf8').split('\n').filter(Boolean).map((l) => JSON.parse(l));
const lastMail = (to) => mails().filter((m) => m.to === to).at(-1);
const lastCode = (to) => lastMail(to)?.text.match(/\b(\d{6})\b/)?.[1];

let n = 0;
const email = (p = 'c') => `${p}${Date.now()}${n++}@example.com`;
const PASS = 'correct horse 1';

async function signUpVerified(addr, name = 'Awa Test') {
  const b = client();
  const r = await b.call('POST', '/auth/signup', { email: addr, password: PASS, fullName: name, lang: 'en' });
  assert.equal(r.status, 202);
  const v = await b.call('POST', '/auth/verify', { code: lastCode(addr) });
  assert.equal(v.status, 200, JSON.stringify(v.data));
  return b;
}

test('health and CSRF guard', async () => {
  const b = client();
  assert.equal((await b.call('GET', '/health')).status, 200);
  const r = await b.call('POST', '/auth/login', { email: 'x@example.com', password: 'y' }, { header: false });
  assert.equal(r.status, 403);
});

test('sign-up emails a code without the typed name, then signs in', async () => {
  resetLimits();
  const addr = email();
  const b = client();
  const r = await b.call('POST', '/auth/signup', { email: addr, password: PASS, fullName: 'Call +237 000 now', lang: 'en' });
  assert.equal(r.status, 202);
  assert.equal(r.data.next, 'verify_email');
  const mail = lastMail(addr);
  assert.ok(!mail.text.includes('Call +237'), 'sign-up email must not contain the typed name');
  const bad = await b.call('POST', '/auth/verify', { code: '000000' === lastCode(addr) ? '111111' : '000000' });
  assert.equal(bad.status, 401);
  assert.equal(bad.data.attemptsLeft, 4);
  const ok = await b.call('POST', '/auth/verify', { code: lastCode(addr) });
  assert.equal(ok.status, 200);
  assert.equal(ok.data.profile.role, 'client');
  assert.equal((await b.call('GET', '/auth/me')).data.profile.email, addr);
});

test('sign-up with an existing email looks the same and notifies the owner', async () => {
  resetLimits();
  const addr = email();
  await signUpVerified(addr);
  const r = await client().call('POST', '/auth/signup', { email: addr, password: 'another pass 2', fullName: 'X', lang: 'en' });
  assert.equal(r.status, 202);
  assert.equal(r.data.next, 'verify_email');
  assert.match(lastMail(addr).subject, /already have a JOGOO account/);
  // The original password still works.
  const l = await client().call('POST', '/auth/login', { email: addr, password: PASS });
  assert.equal(l.status, 202);
  assert.equal(l.data.next, 'login_code');
  assert.match(lastMail(addr).text, /Hello Awa Test,/);
});

test('resending a code does not reset the guess counter', async () => {
  resetLimits();
  const addr = email();
  await signUpVerified(addr);
  const b = client();
  await b.call('POST', '/auth/login', { email: addr, password: PASS });
  const wrong = () => b.call('POST', '/auth/verify', { code: String((Number(lastCode(addr)) + 1) % 1000000).padStart(6, '0') });
  assert.equal((await wrong()).data.attemptsLeft, 4);
  assert.equal((await wrong()).data.attemptsLeft, 3);
  sql("UPDATE auth_challenges SET last_sent_at = last_sent_at - INTERVAL 2 MINUTE");
  assert.equal((await b.call('POST', '/auth/resend')).status, 202);
  assert.equal((await wrong()).data.attemptsLeft, 2);
});

test('wrong codes are capped per account across new challenges', async () => {
  resetLimits();
  const addr = email();
  await signUpVerified(addr);
  let last;
  for (let round = 0; round < 3; round++) {
    const b = client();
    await b.call('POST', '/auth/reset/request', { email: addr });
    for (let i = 0; i < 4; i++) {
      last = await b.call('POST', '/auth/reset/confirm', { code: String((Number(lastCode(addr)) + 1) % 1000000).padStart(6, '0'), newPassword: 'new password 9' });
      if (last.status === 429) break;
    }
    if (last.status === 429) break;
  }
  assert.equal(last.status, 429, 'expected the per-account cap to stop guessing');
});

test('password reset, sign-out everywhere', async () => {
  resetLimits();
  const addr = email();
  const old = await signUpVerified(addr);
  const b = client();
  const r = await b.call('POST', '/auth/reset/request', { email: addr });
  assert.equal(r.status, 202);
  assert.ok(!lastMail(addr).text.includes('Awa'), 'reset email must not contain the name');
  const c = await b.call('POST', '/auth/reset/confirm', { code: lastCode(addr), newPassword: 'brand new pass 3' });
  assert.equal(c.status, 200);
  assert.equal((await old.call('GET', '/auth/me')).data.profile, null, 'other sessions are signed out');
  assert.equal((await client().call('POST', '/auth/login', { email: addr, password: PASS })).status, 401);
  assert.equal((await client().call('POST', '/auth/login', { email: addr, password: 'brand new pass 3' })).status, 202);
  // Unknown email answers the same.
  const u = await client().call('POST', '/auth/reset/request', { email: email('nobody') });
  assert.equal(u.status, 202);
});

test('roles: clients are kept out, super admin manages staff', async () => {
  resetLimits();
  const clientB = await signUpVerified(email());
  assert.equal((await clientB.call('GET', '/admin/clients')).status, 403);

  sql("DELETE FROM users WHERE email = 'boss@example.com'");
  const boss = await signUpVerified('boss@example.com', 'Boss');
  assert.equal((await boss.call('GET', '/auth/me')).data.profile.role, 'super_admin');
  const list = await boss.call('GET', '/admin/clients?page=99999999999999999999');
  assert.equal(list.status, 200);

  const staffAddr = email('staff');
  const staff = await signUpVerified(staffAddr);
  const staffId = (await staff.call('GET', '/auth/me')).data.profile.id;
  const promoted = await boss.call('POST', `/admin/clients/${staffId}/role`, { role: 'admin' });
  assert.equal(promoted.status, 200);
  assert.equal((await staff.call('GET', '/admin/clients')).status, 200);
  const clientId = (await clientB.call('GET', '/auth/me')).data.profile.id;
  assert.equal((await staff.call('POST', `/admin/clients/${clientId}/role`, { role: 'admin' })).status, 403);
  const ev = await staff.call('POST', `/admin/clients/${clientId}/events`, { stage: 'contacted', note: 'Called' });
  assert.equal(ev.status, 201);
  assert.equal((await clientB.call('GET', '/me/journey')).data.current, 'contacted');
});

test('clients can delete their account', async () => {
  resetLimits();
  const addr = email();
  const b = await signUpVerified(addr);
  assert.equal((await b.call('DELETE', '/me', { password: 'wrong password' })).status, 401);
  assert.equal((await b.call('DELETE', '/me', { password: PASS })).status, 200);
  assert.equal((await b.call('GET', '/auth/me')).data.profile, null);
  assert.equal(sql(`SELECT COUNT(*) FROM users WHERE email = '${addr}'`), '0');
  assert.equal((await client().call('POST', '/auth/login', { email: addr, password: PASS })).status, 401);
});

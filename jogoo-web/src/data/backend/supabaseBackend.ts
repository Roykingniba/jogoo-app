// Backend on Supabase: Supabase Auth for email + password, the `auth-codes`
// Edge Function for the emailed 6-digit codes, and SQL functions (RPC) for
// the profile, the journey and the staff page. The database only serves data
// to sessions that passed the code step (see supabase/migrations/*_client_accounts.sql).
import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import {
  BackendError, type Backend, type Journey, type MyFarm, type Pending, type Visit, type Profile,
} from './types';

const url = import.meta.env.VITE_SUPABASE_URL as string;
const key = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY as string;

let client: SupabaseClient | null = null;
/** The shared Supabase client (also used by the staff app). */
export function supabaseClient(): SupabaseClient {
  return sb();
}
function sb(): SupabaseClient {
  if (!client) {
    client = createClient(url, key, {
      auth: { persistSession: true, autoRefreshToken: true, detectSessionInUrl: false, storageKey: 'jogoo.auth' },
    });
  }
  return client;
}

// ------------------------------------------------------------------ device tokens
// "Trust this device for 30 days" = a random token per account, kept on this
// device only. It skips the emailed code when presented with the right password.
const DEVICE_KEY = 'jogoo.devices';
function deviceTokens(): Record<string, string> {
  try { return JSON.parse(localStorage.getItem(DEVICE_KEY) ?? '{}'); } catch { return {}; }
}
function setDeviceToken(email: string, token: string | null) {
  try {
    const all = deviceTokens();
    if (token) all[email.toLowerCase()] = token; else delete all[email.toLowerCase()];
    localStorage.setItem(DEVICE_KEY, JSON.stringify(all));
  } catch { /* storage blocked */ }
}

// The open code step (kept in memory: a reload starts over).
let challenge: string | null = null;
let resetEmail = '';
let resetPassword = '';
let currentEmail = '';

// ------------------------------------------------------------------ calls

async function fn<T>(body: Record<string, unknown>, signedIn = false): Promise<T> {
  const headers: Record<string, string> = { apikey: key, 'Content-Type': 'application/json' };
  if (signedIn) {
    const { data } = await sb().auth.getSession();
    if (!data.session) throw new BackendError('not_signed_in', 401);
    headers.Authorization = `Bearer ${data.session.access_token}`;
  }
  let res: Response;
  try {
    res = await fetch(`${url}/functions/v1/auth-codes`, { method: 'POST', headers, body: JSON.stringify(body) });
  } catch {
    throw new BackendError('offline');
  }
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new BackendError(data.error ?? (res.status >= 500 ? 'server_error' : 'unknown'), res.status, undefined, data.attemptsLeft);
  return data as T;
}

async function rpc<T>(name: string, args?: Record<string, unknown>): Promise<T> {
  const { data, error, status } = await sb().rpc(name, args ?? {});
  if (error) {
    if (!status || error.message?.includes('Failed to fetch')) throw new BackendError('offline');
    const known = /\b(invalid_name|invalid_area|invalid_date|invalid_photo|too_many)\b/.exec(error.message)?.[1];
    const code = known ?? (/not_verified|forbidden/.test(error.message) ? 'forbidden' : /not_found/.test(error.message) ? 'not_found' : 'server_error');
    throw new BackendError(code, status);
  }
  return data as T;
}

function authError(message: string | undefined, status?: number): BackendError {
  const m = (message ?? '').toLowerCase();
  if (m.includes('fetch') || m.includes('network')) return new BackendError('offline');
  if (m.includes('invalid login')) return new BackendError('invalid_credentials', 401);
  if (m.includes('already registered') || m.includes('already been registered')) return new BackendError('email_taken', 409);
  if (m.includes('password')) return new BackendError('weak_password', 422);
  if (m.includes('email') && m.includes('invalid')) return new BackendError('invalid_email', 422);
  if (m.includes('rate') || status === 429) return new BackendError('too_many_attempts', 429);
  return new BackendError('server_error', status ?? 0);
}

async function currentProfile(): Promise<Profile | null> {
  const r = await rpc<{ verified: boolean; profile: Profile | null } | null>('me');
  return r?.verified ? r.profile : null;
}

/** After the password: either signed in (trusted device) or the code step. */
async function secondStep(email: string): Promise<Profile | Pending> {
  currentEmail = email;
  const r = await fn<{ verified?: boolean; next?: Pending['next']; challenge?: string; email?: string }>(
    { action: 'start', deviceToken: deviceTokens()[email.toLowerCase()] }, true);
  if (r.verified) {
    const p = await currentProfile();
    if (p) return p;
  }
  challenge = r.challenge ?? null;
  return { next: r.next!, email: r.email! };
}

export const supabaseBackend: Backend = {
  async me() {
    const { data } = await sb().auth.getSession();
    if (!data.session) return null;
    const p = await currentProfile();
    // A session that never finished the code step isn't kept.
    if (!p && !challenge) await sb().auth.signOut({ scope: 'local' }).catch(() => {});
    return p;
  },

  async signUp(input) {
    const { data, error } = await sb().auth.signUp({
      email: input.email,
      password: input.password,
      options: {
        data: {
          full_name: input.fullName, phone: input.phone ?? '', location: input.location ?? '',
          farm_size_ha: input.farmSizeHa ?? '', lang: input.lang,
        },
      },
    });
    if (error) throw authError(error.message, error.status);
    // With "Confirm email" switched on in Supabase, no session comes back.
    if (!data.session) throw new BackendError(data.user?.identities?.length === 0 ? 'email_taken' : 'server_error');
    const r = await secondStep(input.email);
    if ('next' in r) return r;
    return { next: 'verify_email', email: input.email };
  },

  async signIn(email, password) {
    const { error } = await sb().auth.signInWithPassword({ email, password });
    if (error) throw authError(error.message, error.status);
    return secondStep(email);
  },

  async verifyCode(code, rememberDevice) {
    const r = await fn<{ deviceToken?: string }>({ action: 'verify', challenge, code, rememberDevice }, true);
    challenge = null;
    if (r.deviceToken && currentEmail) setDeviceToken(currentEmail, r.deviceToken);
    const p = await currentProfile();
    if (!p) throw new BackendError('server_error');
    return p;
  },

  async resendCode() {
    const r = await fn<Pending>({ action: 'resend', challenge });
    return { next: r.next, email: r.email };
  },

  async requestPasswordReset(email) {
    await sb().auth.signOut({ scope: 'local' }).catch(() => {});
    const r = await fn<{ next: Pending['next']; challenge: string; email: string }>({ action: 'reset_request', email });
    challenge = r.challenge;
    resetEmail = email;
    return { next: r.next, email: r.email };
  },

  async confirmPasswordReset(code, newPassword, rememberDevice) {
    const r = await fn<{ email: string; deviceToken: string; remembered: boolean }>(
      { action: 'reset_confirm', challenge, code, newPassword, rememberDevice });
    challenge = null;
    resetPassword = newPassword;
    const email = r.email || resetEmail;
    if (r.remembered) setDeviceToken(email, r.deviceToken);
    const { error } = await sb().auth.signInWithPassword({ email, password: resetPassword });
    resetPassword = '';
    if (error) throw authError(error.message, error.status);
    currentEmail = email;
    const s = await fn<{ verified?: boolean; challenge?: string }>({ action: 'start', deviceToken: r.deviceToken }, true);
    if (!s.verified) throw new BackendError('server_error');
    const p = await currentProfile();
    if (!p) throw new BackendError('server_error');
    return p;
  },

  async signOut() {
    challenge = null;
    await sb().auth.signOut({ scope: 'local' });
  },

  updateProfile: (patch) => rpc<Profile>('update_my_profile', { patch }),

  async changePassword(currentPassword, newPassword) {
    await fn({ action: 'change_password', currentPassword, newPassword }, true);
  },

  myJourney: () => rpc<Journey>('my_journey'),
  myFarm: () => rpc<MyFarm>('my_farm'),
  saveFarm: (farm) => rpc<MyFarm>('save_my_farm', { f: farm }),
  saveEquipment: (equipment) => rpc<MyFarm>('save_my_equipment', { e: equipment }),
  removeEquipment: (id) => rpc<MyFarm>('remove_my_equipment', { eid: id }),
  myVisits: () => rpc<Visit[]>('my_visits'),

};

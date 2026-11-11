// Backend implementation for the PHP API in server/api (same origin, /api/).
// The session lives in an HttpOnly cookie, so no token is ever readable by JS.
import { BackendError, sessionEvents, SESSION_EXPIRED, type Backend, type Pending, type Profile } from './types';

const base = `${import.meta.env.BASE_URL}api`;
/** On 2G a request can hang for minutes; give up and treat it as offline. */
const TIMEOUT_MS = 15000;

async function call<T>(method: string, path: string, body?: unknown): Promise<T> {
  let res: Response;
  const abort = new AbortController();
  const timer = window.setTimeout(() => abort.abort(), TIMEOUT_MS);
  try {
    res = await fetch(`${base}${path}`, {
      method,
      signal: abort.signal,
      credentials: 'same-origin',
      headers: {
        Accept: 'application/json',
        'X-Jogoo-Client': 'web',
        ...(body !== undefined ? { 'Content-Type': 'application/json' } : {}),
      },
      body: body !== undefined ? JSON.stringify(body) : undefined,
    });
  } catch {
    window.clearTimeout(timer);
    throw new BackendError('offline');
  }
  let data: unknown = null;
  try { data = await res.json(); } catch { /* empty or HTML error page */ }
  window.clearTimeout(timer);
  if (!res.ok) {
    const d = (data ?? {}) as { error?: string; field?: string; attemptsLeft?: number };
    // Session expired or revoked (e.g. password changed on another device).
    if (d.error === 'not_signed_in' && !path.startsWith('/auth/')) sessionEvents.dispatchEvent(new Event(SESSION_EXPIRED));
    throw new BackendError(d.error ?? (res.status >= 500 ? 'server_error' : 'unknown'), res.status, d.field, d.attemptsLeft);
  }
  return data as T;
}

export const phpBackend: Backend = {
  async me() {
    try {
      return (await call<{ profile: Profile | null }>('GET', '/auth/me')).profile;
    } catch (e) {
      if (e instanceof BackendError && e.status === 401) return null;
      throw e;
    }
  },
  signUp: (input) => call<Pending>('POST', '/auth/signup', input),
  async signIn(email, password) {
    const r = await call<{ profile: Profile } | Pending>('POST', '/auth/login', { email, password });
    return 'profile' in r ? r.profile : r;
  },
  async verifyCode(code, rememberDevice) {
    return (await call<{ profile: Profile }>('POST', '/auth/verify', { code, rememberDevice })).profile;
  },
  resendCode: () => call<Pending>('POST', '/auth/resend'),
  requestPasswordReset: (email) => call<Pending>('POST', '/auth/reset/request', { email }),
  async confirmPasswordReset(code, newPassword, rememberDevice) {
    return (await call<{ profile: Profile }>('POST', '/auth/reset/confirm', { code, newPassword, rememberDevice })).profile;
  },
  async signOut() {
    await call('POST', '/auth/logout');
  },
  async updateProfile(patch) {
    return (await call<{ profile: Profile }>('PATCH', '/me/profile', patch)).profile;
  },
  async changePassword(currentPassword, newPassword) {
    await call('POST', '/me/password', { currentPassword, newPassword });
  },
  async deleteAccount(password) {
    await call('DELETE', '/me', { password });
  },
  myJourney: () => call('GET', '/me/journey'),
  admin: {
    listClients({ search = '', stage = '', page = 1, staff = false }) {
      const q = new URLSearchParams({ q: search, stage, page: String(page), role: staff ? 'staff' : '' });
      return call('GET', `/admin/clients?${q}`);
    },
    getClient: (id) => call('GET', `/admin/clients/${encodeURIComponent(id)}`),
    addEvent: (clientId, stage, note) =>
      call('POST', `/admin/clients/${encodeURIComponent(clientId)}/events`, { stage, note: note || undefined }),
    async setRole(userId, role) {
      return (await call<{ profile: Profile }>('POST', `/admin/clients/${encodeURIComponent(userId)}/role`, { role })).profile;
    },
  },
};

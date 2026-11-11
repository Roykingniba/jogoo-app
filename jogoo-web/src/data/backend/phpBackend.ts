// Backend implementation for the PHP API in server/api (same origin, /api/).
// The session lives in an HttpOnly cookie, so no token is ever readable by JS.
import { BackendError, type Backend, type Pending, type Profile } from './types';

const base = `${import.meta.env.BASE_URL}api`;

async function call<T>(method: string, path: string, body?: unknown): Promise<T> {
  let res: Response;
  try {
    res = await fetch(`${base}${path}`, {
      method,
      credentials: 'same-origin',
      headers: {
        Accept: 'application/json',
        'X-Jogoo-Client': 'web',
        ...(body !== undefined ? { 'Content-Type': 'application/json' } : {}),
      },
      body: body !== undefined ? JSON.stringify(body) : undefined,
    });
  } catch {
    throw new BackendError('offline');
  }
  let data: unknown = null;
  try { data = await res.json(); } catch { /* empty or HTML error page */ }
  if (!res.ok) {
    const d = (data ?? {}) as { error?: string; field?: string; attemptsLeft?: number };
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

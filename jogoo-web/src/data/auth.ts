// Signed-in account state. The profile is cached on the device (name, email,
// role only — never the password or session token) so the installed app still
// opens offline for someone who signed in before.
import { create } from 'zustand';
import {
  backend, BackendError, sessionEvents, SESSION_EXPIRED,
  type Pending, type Profile, type ProfilePatch, type SignUpInput,
} from './backend';
import { useStore, resetSessionState } from './store';

const CACHE_KEY = 'jogoo.account';
// The code step survives a reload (low-memory phones often kill the tab while
// the person reads the email). Only the masked email and step are kept, in
// this tab only; the challenge itself is an HttpOnly cookie.
const PENDING_KEY = 'jogoo.pending';

type Status = 'loading' | 'signedOut' | 'signedIn';

interface AuthState {
  status: Status;
  profile: Profile | null;
  /** True when the app is showing the cached account because the server is unreachable. */
  offline: boolean;
  /** Waiting for the 6-digit email code (after sign-up, sign-in or a reset request). */
  pending: Pending | null;
  /** Why the person is looking at the sign-in screen, if not by choice. */
  notice: 'sessionExpired' | 'accountDeleted' | null;
  init: () => Promise<void>;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (input: SignUpInput) => Promise<void>;
  verifyCode: (code: string, rememberDevice: boolean) => Promise<void>;
  resendCode: () => Promise<void>;
  requestPasswordReset: (email: string) => Promise<void>;
  confirmPasswordReset: (code: string, newPassword: string, rememberDevice: boolean) => Promise<void>;
  cancelPending: () => void;
  signOut: () => Promise<void>;
  updateProfile: (patch: ProfilePatch) => Promise<void>;
  deleteAccount: (password: string) => Promise<void>;
}

function readCache(): Profile | null {
  try {
    const raw = localStorage.getItem(CACHE_KEY);
    return raw ? (JSON.parse(raw) as Profile) : null;
  } catch {
    return null;
  }
}
function writeCache(p: Profile | null) {
  try {
    if (p) localStorage.setItem(CACHE_KEY, JSON.stringify(p));
    else localStorage.removeItem(CACHE_KEY);
  } catch { /* storage blocked */ }
}
function readPending(): Pending | null {
  try {
    const raw = sessionStorage.getItem(PENDING_KEY);
    return raw ? (JSON.parse(raw) as Pending) : null;
  } catch {
    return null;
  }
}
function writePending(p: Pending | null) {
  try {
    if (p) sessionStorage.setItem(PENDING_KEY, JSON.stringify(p));
    else sessionStorage.removeItem(PENDING_KEY);
  } catch { /* storage blocked */ }
}

/** Puts the account into the app and loads the client's own farm. */
function applyToApp(p: Profile) {
  const first = p.fullName.trim().split(/\s+/)[0] || p.fullName;
  const store = useStore.getState();
  // Another account on this device: start from a blank app.
  if (store.owner && store.owner !== p.id) store.reset();
  useStore.setState((s) => ({
    profile: {
      ...s.profile,
      clientName: p.fullName,
      firstName: first,
      clientSince: new Date(p.createdAt),
      location: s.farm?.location ?? p.location ?? '',
      areaHa: s.farm?.areaHa ?? p.farmSizeHa ?? 0,
    },
  }));
  if (useStore.getState().owner !== p.id || useStore.getState().farmStatus !== 'ready') {
    void useStore.getState().loadFarm(p.id);
  }
}

function signedIn(p: Profile, offline = false, adoptLang = false) {
  writeCache(p);
  writePending(null);
  applyToApp(p);
  useAuth.setState({ status: 'signedIn', profile: p, offline, pending: null, notice: null });
  // On a fresh sign-in, use the language saved on the account.
  if (adoptLang && p.lang !== useStore.getState().lang) useStore.getState().setLang(p.lang);
}

/** Back to the sign-in screen, forgetting this person's data on the device. */
function signedOut(notice: AuthState['notice'] = null) {
  writeCache(null);
  writePending(null);
  useStore.getState().reset(); // farm cache, Mia conversation
  resetSessionState();
  useAuth.setState({ status: 'signedOut', profile: null, pending: null, notice });
}

const setPending = (pending: Pending) => {
  writePending(pending);
  useAuth.setState({ pending, notice: null });
};

export const useAuth = create<AuthState>((set, get) => ({
  status: 'loading',
  profile: null,
  offline: typeof navigator !== 'undefined' && navigator.onLine === false,
  pending: readPending(),
  notice: null,

  init: async () => {
    // Open straight away for someone who signed in before; check with the
    // server in the background instead of holding everyone on a splash
    // screen over a slow connection. The server still checks every request.
    const cached = readCache();
    if (cached && get().status === 'loading') signedIn(cached, get().offline);
    try {
      const p = await backend.me();
      if (p) signedIn(p);
      else if (get().status === 'signedIn') signedOut(cached ? 'sessionExpired' : null);
      // Not signed in yet: keep any code step in progress (pending).
      else set({ status: 'signedOut', profile: null });
    } catch (e) {
      const offline = e instanceof BackendError && (e.code === 'offline' || e.status >= 500);
      if (offline && cached) signedIn(cached, true);
      else if (get().status !== 'signedIn') set({ status: 'signedOut', profile: null, offline });
    }
  },

  signIn: async (email, password) => {
    const r = await backend.signIn(email.trim(), password);
    if ('next' in r) setPending(r);
    else signedIn(r, false, true);
  },

  signUp: async (input) => {
    setPending(await backend.signUp({ ...input, email: input.email.trim() }));
  },

  verifyCode: async (code, remember) => {
    signedIn(await backend.verifyCode(code, remember), false, true);
  },

  resendCode: async () => {
    setPending(await backend.resendCode());
  },

  requestPasswordReset: async (email) => {
    setPending(await backend.requestPasswordReset(email.trim()));
  },

  confirmPasswordReset: async (code, newPassword, remember) => {
    signedIn(await backend.confirmPasswordReset(code, newPassword, remember), false, true);
  },

  cancelPending: () => {
    writePending(null);
    set({ pending: null });
  },

  signOut: async () => {
    try { await backend.signOut(); } catch { /* sign out locally anyway */ }
    signedOut();
  },

  updateProfile: async (patch) => {
    if (!get().profile) return;
    signedIn(await backend.updateProfile(patch));
  },

  deleteAccount: async (password) => {
    await backend.deleteAccount(password);
    signedOut('accountDeleted');
  },
}));


// The server ended the session (expired, or password changed elsewhere).
sessionEvents.addEventListener(SESSION_EXPIRED, () => {
  if (useAuth.getState().status === 'signedIn') signedOut('sessionExpired');
});

// Keep the offline banner true to the connection, and re-check the account
// when the connection comes back.
if (typeof window !== 'undefined') {
  window.addEventListener('offline', () => useAuth.setState({ offline: true }));
  window.addEventListener('online', () => {
    useAuth.setState({ offline: false });
    void useAuth.getState().init();
  });
}

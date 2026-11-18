// Signed-in account state. The profile is cached on the device (name, email,
// role only — never the password or session token) so the installed app still
// opens offline for someone who signed in before.
import { create } from 'zustand';
import { backend, BackendError, type Pending, type Profile, type ProfilePatch, type SignUpInput } from './backend';
import { useStore } from './store';

const CACHE_KEY = 'jogoo.account';

type Status = 'loading' | 'signedOut' | 'signedIn';

interface AuthState {
  status: Status;
  profile: Profile | null;
  /** True when the app is showing the cached account because the server is unreachable. */
  offline: boolean;
  /** Waiting for the 6-digit email code (after sign-up, sign-in or a reset request). */
  pending: Pending | null;
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
  applyToApp(p);
  useAuth.setState({ status: 'signedIn', profile: p, offline, pending: null });
  // On a fresh sign-in, use the language saved on the account.
  if (adoptLang && p.lang !== useStore.getState().lang) useStore.getState().setLang(p.lang);
}

export const useAuth = create<AuthState>((set, get) => ({
  status: 'loading',
  profile: null,
  offline: false,
  pending: null,

  init: async () => {
    try {
      const p = await backend.me();
      if (p) signedIn(p);
      else {
        writeCache(null);
        set({ status: 'signedOut', profile: null, offline: false });
      }
    } catch (e) {
      const cached = readCache();
      if (e instanceof BackendError && (e.code === 'offline' || e.status >= 500) && cached) signedIn(cached, true);
      else set({ status: 'signedOut', profile: null, offline: e instanceof BackendError && e.code === 'offline' });
    }
  },

  signIn: async (email, password) => {
    const r = await backend.signIn(email.trim(), password);
    if ('next' in r) set({ pending: r });
    else signedIn(r, false, true);
  },

  signUp: async (input) => {
    set({ pending: await backend.signUp({ ...input, email: input.email.trim() }) });
  },

  verifyCode: async (code, remember) => {
    signedIn(await backend.verifyCode(code, remember), false, true);
  },

  resendCode: async () => {
    set({ pending: await backend.resendCode() });
  },

  requestPasswordReset: async (email) => {
    set({ pending: await backend.requestPasswordReset(email.trim()) });
  },

  confirmPasswordReset: async (code, newPassword, remember) => {
    signedIn(await backend.confirmPasswordReset(code, newPassword, remember), false, true);
  },

  cancelPending: () => set({ pending: null }),

  signOut: async () => {
    try { await backend.signOut(); } catch { /* sign out locally anyway */ }
    writeCache(null);
    useStore.getState().reset();
    set({ status: 'signedOut', profile: null, offline: false });
  },

  updateProfile: async (patch) => {
    if (!get().profile) return;
    signedIn(await backend.updateProfile(patch));
  },
}));



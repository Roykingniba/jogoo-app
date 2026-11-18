// App state for the client app, ported from lib/data/jogoo_store.dart.
// Every account starts from a clean slate: the farm and its equipment are what
// the client types in (saved in Supabase, cached on the device); requests,
// logs and chats start empty. Only JOGOO's own content (shop catalogue, spare
// parts, guides) comes from the bundled catalogue in demoData.ts.
import { create } from 'zustand';
import { DemoData } from './demoData';
import { backend, type Farm, type FarmEquipment, type MyFarm, type Visit } from './backend';
import { CROPS, choiceBi, toEquipment } from './farm';
import { CATALOGUE } from './catalogue';
import {
  bi, same, isOpen,
  type AppNotification, type Bi, type CartLine, type ChatMessage, type Equipment,
  type FarmInput, type FarmProfile, type Lang, type LogEntry, type NotificationChannel, type Order,
  type Product, type SalesRequest, type SeasonGoal, type ServiceRequest, type SparePart,
  type Guide, type Invoice, type FarmDocument,
} from './models';
import { forgetMiaSession, miaHistory, miaSend } from './miaClient';

const LANG_KEY = 'jogoo.lang';
const FARM_KEY = 'jogoo.farm';

function initialLang(): Lang {
  try {
    const saved = localStorage.getItem(LANG_KEY);
    if (saved === 'en' || saved === 'fr') return saved;
  } catch { /* storage blocked */ }
  const nav = (typeof navigator !== 'undefined' ? navigator.language : 'en').toLowerCase();
  return nav.startsWith('fr') ? 'fr' : 'en';
}

export const emptyProfile = (): FarmProfile => ({
  clientName: '', firstName: '', clientSince: new Date(), location: '', areaHa: 0, crops: [],
});

/** The farm cached on this device, so the installed app opens offline. */
function readFarmCache(owner: string): MyFarm | null {
  try {
    const raw = JSON.parse(localStorage.getItem(FARM_KEY) ?? 'null');
    return raw && raw.owner === owner ? (raw.data as MyFarm) : null;
  } catch { return null; }
}
function writeFarmCache(owner: string | null, data: MyFarm | null) {
  try {
    if (owner && data) localStorage.setItem(FARM_KEY, JSON.stringify({ owner, data }));
    else localStorage.removeItem(FARM_KEY);
  } catch { /* storage blocked */ }
}

export type FarmStatus = 'idle' | 'loading' | 'ready' | 'error';

export interface JogooState {
  // Language
  lang: Lang;
  setLang: (lang: Lang) => void;

  // Farm and profile
  profile: FarmProfile;
  /** Account whose farm is loaded (for the device cache). */
  owner: string | null;
  farm: Farm | null;
  farmStatus: FarmStatus;
  /** The client's own equipment, as the screens show it. */
  equipment: Equipment[];
  rawEquipment: FarmEquipment[];
  loadFarm: (owner: string) => Promise<void>;
  saveFarm: (farm: Farm) => Promise<void>;
  saveEquipment: (equipment: FarmEquipment) => Promise<void>;
  removeEquipment: (id: string) => Promise<void>;
  /** Back to a blank app (sign-out). */
  reset: () => void;
  goals: SeasonGoal[];
  toggleGoal: (goal: SeasonGoal) => void;

  // Visits JOGOO planned at the farm (Service tab)
  visits: Visit[];
  visitsStatus: FarmStatus;
  loadVisits: () => Promise<void>;

  // Shop
  cart: CartLine[];
  addToCart: (line: CartLine) => void;
  removeFromCart: (id: string) => void;
  /** Turns the cart into one order request for JOGOO sales to confirm. */
  submitCart: () => void;
  salesRequests: SalesRequest[];
  requestFromSales: (subject: Bi) => void;
  seasonReminder: boolean;
  setSeasonReminder: (v: boolean) => void;

  // Service
  serviceRequests: ServiceRequest[];
  reportProblem: (a: { equipmentId: string; problem: Bi; description: string; mediaPaths: string[] }) => ServiceRequest;
  rateRequest: (id: string, rating: number) => void;
  addRequestNote: (id: string, note: string) => void;

  // Learn and documents
  wifiOnly: boolean;
  setWifiOnly: (v: boolean) => void;

  // Maintenance log
  log: LogEntry[];
  addLogEntry: (entry: LogEntry) => void;

  // Notifications
  notifications: AppNotification[];
  markNotificationsRead: () => void;
  channels: Record<NotificationChannel, boolean>;
  setChannel: (c: NotificationChannel, enabled: boolean) => void;

  // Mia and the agronomists
  miaChat: ChatMessage[];
  miaBusy: boolean;
  /** Returns false when Mia cannot be reached, so the screen can offer a call. */
  sendToMia: (a: { text: string }) => Promise<boolean>;
  miaLoaded: boolean;
  /** Brings back the conversation started earlier on this device. */
  loadMiaHistory: () => Promise<void>;
  agronomistChat: ChatMessage[];
  sendToAgronomists: (text: string) => void;
}

export const useStore = create<JogooState>((set, get) => ({
  lang: initialLang(),
  setLang: (lang) => {
    try { localStorage.setItem(LANG_KEY, lang); } catch { /* ignore */ }
    document.documentElement.lang = lang;
    set({ lang });
  },

  profile: emptyProfile(),
  owner: null,
  farm: null,
  farmStatus: 'idle',
  equipment: [],
  rawEquipment: [],
  loadFarm: async (owner) => {
    const cached = readFarmCache(owner);
    if (cached) set(farmState(cached, owner));
    else set({ owner, farmStatus: 'loading' });
    try {
      const data = await backend.myFarm();
      writeFarmCache(owner, data);
      if (get().owner === owner) set(farmState(data, owner));
    } catch {
      if (get().owner === owner && !cached) set({ farmStatus: 'error' });
    }
  },
  saveFarm: async (farm) => apply(await backend.saveFarm(farm)),
  saveEquipment: async (equipment) => apply(await backend.saveEquipment(equipment)),
  removeEquipment: async (id) => apply(await backend.removeEquipment(id)),
  reset: () => {
    writeFarmCache(null, null);
    forgetMiaSession();
    set({
      profile: emptyProfile(), owner: null, farm: null, farmStatus: 'idle', equipment: [], rawEquipment: [],
      visits: [], visitsStatus: 'idle',
      goals: [], cart: [], salesRequests: [], serviceRequests: [], log: [], notifications: [],
      miaChat: [], miaLoaded: false, agronomistChat: [],
    });
  },
  visits: [],
  visitsStatus: 'idle',
  loadVisits: async () => {
    if (get().visitsStatus === 'idle') set({ visitsStatus: 'loading' });
    try {
      set({ visits: await backend.myVisits(), visitsStatus: 'ready' });
    } catch {
      if (get().visitsStatus !== 'ready') set({ visitsStatus: 'error' });
    }
  },
  goals: [],
  toggleGoal: (goal) =>
    set((s) => ({ goals: s.goals.includes(goal) ? s.goals.filter((g) => g !== goal) : [...s.goals, goal] })),

  cart: [],
  addToCart: (line) =>
    set((s) => {
      const i = s.cart.findIndex((l) => l.id === line.id);
      if (i === -1) return { cart: [...s.cart, line] };
      const cart = [...s.cart];
      cart[i] = { ...cart[i], quantity: cart[i].quantity + line.quantity };
      return { cart };
    }),
  removeFromCart: (id) => set((s) => ({ cart: s.cart.filter((l) => l.id !== id) })),
  submitCart: () => {
    const { cart } = get();
    if (cart.length === 0) return;
    const en = cart.map((l) => `${l.title.en} × ${l.quantity}`).join(', ');
    const fr = cart.map((l) => `${l.title.fr} × ${l.quantity}`).join(', ');
    set((s) => ({ salesRequests: [...s.salesRequests, { subject: bi(en, fr), at: new Date() }], cart: [] }));
  },
  salesRequests: [],
  requestFromSales: (subject) => set((s) => ({ salesRequests: [...s.salesRequests, { subject, at: new Date() }] })),
  seasonReminder: true,
  setSeasonReminder: (seasonReminder) => set({ seasonReminder }),

  serviceRequests: [],
  reportProblem: ({ equipmentId, problem, description, mediaPaths }) => {
    const now = new Date();
    const s = get();
    const request: ServiceRequest = {
      id: `SR-${1001 + s.serviceRequests.length}`,
      equipmentId,
      title: problem,
      createdAt: now,
      description: description.trim() === '' ? undefined : description,
      mediaPaths,
      notes: [],
      steps: [
        { kind: 'received', at: now, done: true },
        { kind: 'diagnosed' },
        { kind: 'booked' },
        { kind: 'fixed' },
      ],
    };
    set({ serviceRequests: [request, ...s.serviceRequests] });
    return request;
  },
  rateRequest: (id, rating) =>
    set((s) => ({ serviceRequests: s.serviceRequests.map((r) => (r.id === id ? { ...r, rating } : r)) })),
  addRequestNote: (id, note) =>
    set((s) => ({ serviceRequests: s.serviceRequests.map((r) => (r.id === id ? { ...r, notes: [...r.notes, note] } : r)) })),

  wifiOnly: true,
  setWifiOnly: (wifiOnly) => set({ wifiOnly }),

  log: [],
  addLogEntry: (entry) => set((s) => ({ log: [...s.log, entry] })),

  notifications: [],
  markNotificationsRead: () =>
    set((s) => (s.notifications.some((n) => n.unread)
      ? { notifications: s.notifications.map((n) => ({ ...n, unread: false })) }
      : s)),
  channels: { push: true, sms: true, whatsApp: false },
  setChannel: (c, enabled) => set((s) => ({ channels: { ...s.channels, [c]: enabled } })),

  miaChat: [],
  miaBusy: false,
  miaLoaded: false,
  loadMiaHistory: async () => {
    if (get().miaLoaded) return;
    const history = await miaHistory();
    // Keep anything typed while the history was loading.
    set((s) => ({ miaLoaded: true, miaChat: history.length && s.miaChat.length === 0 ? history : s.miaChat }));
  },
  sendToMia: async ({ text }) => {
    set((s) => ({ miaChat: [...s.miaChat, { author: 'client', text: same(text) }], miaBusy: true }));
    const bubbles = await miaSend(text);
    if (bubbles == null) { set({ miaBusy: false }); return false; }
    // Short messages arrive one after the other, like someone typing on WhatsApp.
    for (let i = 0; i < bubbles.length; i++) {
      if (i > 0) await new Promise((r) => setTimeout(r, Math.min(1800, Math.max(600, bubbles[i].length * 18))));
      set((s) => ({ miaChat: [...s.miaChat, { author: 'mia', text: same(bubbles[i]) }], miaBusy: i < bubbles.length - 1 }));
    }
    if (bubbles.length === 0) set({ miaBusy: false });
    return true;
  },
  agronomistChat: [],
  sendToAgronomists: (text) =>
    set((s) => ({ agronomistChat: [...s.agronomistChat, { author: 'client', text: same(text) }] })),
}));

/** Applies what the server returned after a change, and caches it. */
function apply(data: MyFarm) {
  const owner = useStore.getState().owner;
  writeFarmCache(owner, data);
  useStore.setState(farmState(data, owner));
}

function farmState(data: MyFarm, owner: string | null): Partial<JogooState> {
  const farm = data.farm;
  const profile = useStore.getState().profile;
  return {
    owner,
    farm,
    farmStatus: 'ready',
    rawEquipment: data.equipment,
    equipment: data.equipment.map(toEquipment),
    profile: {
      ...profile,
      location: farm?.location ?? profile.location,
      areaHa: farm?.areaHa ?? profile.areaHa,
      crops: (farm?.crops ?? []).map((c) => choiceBi(CROPS, c)),
    },
  };
}

// ---------------------------------------------------------------------------
// The client's equipment (from the store) and JOGOO's catalogue (bundled).

export const useEquipmentList = () => useStore((s) => s.equipment);
export const useEquipmentById = (id: string | null | undefined) =>
  useStore((s) => (id ? s.equipment.find((e) => e.id === id) : undefined));
export const equipmentById = (id: string) => useStore.getState().equipment.find((e) => e.id === id);

// JOGOO's catalogue (Irrigation section of the 2026 catalogue), price on request.
export const products: Product[] = CATALOGUE;
export const productById = (id: string) => products.find((p) => p.id === id);

export const spareParts: SparePart[] = DemoData.spareParts.map((p) => ({ ...p, dueOn: undefined }));
export const partByCode = (code: string) => spareParts.find((p) => p.code === code);

// Orders, invoices and project documents come from JOGOO once the client buys;
// a new account has none.
export const orders: Order[] = [];
export const orderById = (id: string) => orders.find((o) => o.id === id);
export const invoices: Invoice[] = [];

export const guides: Guide[] = DemoData.guides;
export const guideById = (id: string) => guides.find((g) => g.id === id);
export const documents: FarmDocument[] = [];

export const otherInputs: FarmInput[] = DemoData.otherInputs.map((i) => ({
  ...i,
  lastBought: undefined,
  note: i.note.en.includes('{date}') ? bi('For fertigation', 'Pour la fertigation') : i.note,
}));
export const usualInput: FarmInput = { ...DemoData.usualInput, lastBought: undefined };

// ---------------------------------------------------------------------------
// Derived values. Call them with state from useStore, e.g.
//   const cart = useStore((s) => s.cart); cartTotal(cart)

export const cartCount = (cart: CartLine[]) => cart.reduce((n, l) => n + l.quantity, 0);
export const cartTotal = (cart: CartLine[]) => cart.reduce((n, l) => n + l.unitPrice * l.quantity, 0);
export const inCart = (cart: CartLine[], id: string) => cart.some((l) => l.id === id);

export const recommendedBags = (profile: FarmProfile) =>
  Math.min(99, Math.max(1, Math.round(profile.areaHa * DemoData.npkBagsPerHa)));

export const openRequestCount = (rs: ServiceRequest[]) => rs.filter(isOpen).length;
export const requestById = (rs: ServiceRequest[], id: string) => rs.find((r) => r.id === id);
export const openRequestFor = (rs: ServiceRequest[], equipmentId: string) =>
  rs.find((r) => r.equipmentId === equipmentId && isOpen(r));
/** The next confirmed technician visit, shown on Home. */
export const nextVisit = (rs: ServiceRequest[]) =>
  rs.filter((r) => isOpen(r) && r.visitAt).sort((a, b) => a.visitAt!.getTime() - b.visitAt!.getTime())[0];

export const logFor = (log: LogEntry[], equipmentId: string) =>
  log.filter((e) => e.equipmentId === equipmentId).sort((a, b) => b.date.getTime() - a.date.getTime());
export const pendingLogCount = (log: LogEntry[], equipmentId: string) =>
  logFor(log, equipmentId).filter((e) => !e.synced).length;

export const unreadCount = (ns: AppNotification[]) => ns.filter((n) => n.unread).length;

/** Visits still to come or under way, soonest first. */
export const activeVisits = (vs: Visit[]) =>
  vs.filter((v) => v.status !== 'done' && v.status !== 'cancelled')
    .sort((a, b) => a.startsAt.localeCompare(b.startsAt));

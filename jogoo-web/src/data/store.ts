// App state for the client app, ported from lib/data/jogoo_store.dart.
// Phase 1 is backed by DemoData in memory: the client's actions are kept for
// this session and labelled "saved", never "sent". Only the language choice
// is stored on the device.
import { create } from 'zustand';
import { DemoData } from './demoData';
import {
  bi, same, isOpen,
  type AppNotification, type Bi, type CartLine, type ChatMessage, type Equipment,
  type FarmProfile, type Lang, type LogEntry, type NotificationChannel, type Order,
  type Product, type SalesRequest, type SeasonGoal, type ServiceRequest, type SparePart,
  type Guide,
} from './models';
import { miaReply } from './miaClient';

const LANG_KEY = 'jogoo.lang';

function initialLang(): Lang {
  try {
    const saved = localStorage.getItem(LANG_KEY);
    if (saved === 'en' || saved === 'fr') return saved;
  } catch { /* storage blocked */ }
  const nav = (typeof navigator !== 'undefined' ? navigator.language : 'en').toLowerCase();
  return nav.startsWith('fr') ? 'fr' : 'en';
}

export interface JogooState {
  // Language
  lang: Lang;
  setLang: (lang: Lang) => void;

  // Farm and profile
  profile: FarmProfile;
  updateFarm: (location: string, areaHa: number) => void;
  goals: SeasonGoal[];
  toggleGoal: (goal: SeasonGoal) => void;

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
  sendToMia: (a: { text: string; photoFile?: string }) => Promise<boolean>;
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

  profile: DemoData.profile,
  updateFarm: (location, areaHa) => set((s) => ({ profile: { ...s.profile, location, areaHa } })),
  goals: ['higherYields', 'moreLandWatered'],
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

  serviceRequests: [...DemoData.serviceRequests],
  reportProblem: ({ equipmentId, problem, description, mediaPaths }) => {
    const now = new Date();
    const s = get();
    const request: ServiceRequest = {
      id: `SR-${1043 + s.serviceRequests.length - DemoData.serviceRequests.length}`,
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

  log: [...DemoData.logEntries],
  addLogEntry: (entry) => set((s) => ({ log: [...s.log, entry] })),

  notifications: [...DemoData.notifications],
  markNotificationsRead: () =>
    set((s) => (s.notifications.some((n) => n.unread)
      ? { notifications: s.notifications.map((n) => ({ ...n, unread: false })) }
      : s)),
  channels: { push: true, sms: true, whatsApp: false },
  setChannel: (c, enabled) => set((s) => ({ channels: { ...s.channels, [c]: enabled } })),

  miaChat: [...DemoData.miaChat],
  miaBusy: false,
  sendToMia: async ({ text, photoFile }) => {
    set((s) => ({ miaChat: [...s.miaChat, { author: 'client', text: same(text), photoFile }], miaBusy: true }));
    const reply = await miaReply(get().miaChat, get().lang);
    set((s) => ({
      miaBusy: false,
      miaChat: reply == null ? s.miaChat : [...s.miaChat, { author: 'mia', text: same(reply) }],
    }));
    return reply != null;
  },
  agronomistChat: [...DemoData.agronomistChat],
  sendToAgronomists: (text) =>
    set((s) => ({ agronomistChat: [...s.agronomistChat, { author: 'client', text: same(text) }] })),
}));

// ---------------------------------------------------------------------------
// Read-only lookups over the demo catalogue (these lists never change in v1).

export const equipmentList: Equipment[] = DemoData.equipment;
export const equipmentById = (id: string) => equipmentList.find((e) => e.id === id);
export const equipmentBySerial = (serial: string) => {
  const wanted = serial.trim().toUpperCase();
  return equipmentList.find((e) => e.serial === wanted);
};

export const products: Product[] = DemoData.products;
export const productById = (id: string) => products.find((p) => p.id === id);

export const partsFor = (equipmentId: string): SparePart[] =>
  DemoData.spareParts.filter((p) => p.equipmentId === equipmentId);
export const partByCode = (code: string) => DemoData.spareParts.find((p) => p.code === code);

export const orders: Order[] = DemoData.orders;
export const orderById = (id: string) => orders.find((o) => o.id === id);
export const invoices = DemoData.invoices;

export const guides: Guide[] = DemoData.guides;
export const guideById = (id: string) => guides.find((g) => g.id === id);
export const documents = DemoData.documents;

export const usualInput = DemoData.usualInput;
export const otherInputs = DemoData.otherInputs;

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

// Everything except the language, as it was when the app opened.
const freshState = useStore.getState();
/** Forgets everything the previous person did in this session (cart, chats, notes...). */
export function resetSessionState() {
  useStore.setState({ ...freshState, lang: useStore.getState().lang }, true);
}

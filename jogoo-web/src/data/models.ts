// Data model for the JOGOO client app. Ported 1:1 from lib/models/models.dart.
// Each list in the store maps to one future Supabase table.

import type { IconName } from '../components/Icon';

/** Content written by JOGOO in both languages. Client-typed text uses same(). */
export interface Bi {
  en: string;
  fr: string;
}
export const bi = (en: string, fr: string): Bi => ({ en, fr });
export const same = (text: string): Bi => ({ en: text, fr: text });

export type Lang = 'en' | 'fr';
export type Tone = 'blue' | 'lime' | 'orange' | 'pink' | 'cyan';

/** Builds a local date with a 1-based month, like Dart's DateTime(y, m, d, h, min). */
export const dt = (y: number, m: number, d = 1, h = 0, min = 0): Date =>
  new Date(y, m - 1, d, h, min);

export interface Person {
  name: string;
  role: Bi;
  phone: string;
}

export type EquipmentHealth = 'good' | 'open' | 'dueSoon';
export type TimelineState = 'done' | 'current' | 'due' | 'pending';

export interface MaintenanceStep {
  title: Bi;
  state: TimelineState;
  date: Date;
  note?: Bi;
  price?: number;
  /** Spare part to order when this step is due. */
  partCode?: string;
}

export interface Equipment {
  id: string;
  name: Bi;
  shortName: Bi;
  serial: string;
  health: EquipmentHealth;
  healthNote: Bi;
  installedOn: Date;
  warrantyMonths: number;
  warrantyMonthsLeft: number;
  icon: IconName;
  tone: Tone;
  photo?: string;
  lastService?: Date;
  nextVisit?: Date;
  maintenance: MaintenanceStep[];
}
export const underWarranty = (e: Equipment) => e.warrantyMonthsLeft > 0;

export type ProductCategory = 'filters' | 'valves' | 'sprinklers' | 'pivots' | 'kits';

export interface AddOn {
  id: string;
  /** May contain {date}, replaced by fittingDate. */
  title: Bi;
  price: number;
  icon: IconName;
  tone: Tone;
  fittingDate?: Date;
  selectedByDefault?: boolean;
}

export interface Product {
  id: string;
  name: Bi;
  category: ProductCategory;
  /** 0 means "price on quote". */
  price: number;
  photo: string;
  fitNote?: Bi;
  /** Green "fits" notes confirm compatibility; grey ones explain the use. */
  highlightFit?: boolean;
  addOns: AddOn[];
  recommended?: boolean;
}

export interface SparePart {
  code: string;
  name: Bi;
  price: number;
  equipmentId: string;
  icon: IconName;
  tone: Tone;
  dueOn?: Date;
}

export interface FarmInput {
  id: string;
  name: Bi;
  /** May contain {date}, replaced by lastBought. */
  note: Bi;
  icon: IconName;
  tone: Tone;
  lastBought?: Date;
}

export type RequestStepKind = 'received' | 'diagnosed' | 'booked' | 'fixed';

export interface RequestStep {
  kind: RequestStepKind;
  /** Overrides the standard label, e.g. the diagnosis itself. */
  title?: Bi;
  note?: Bi;
  at?: Date;
  done?: boolean;
}

export interface ServiceRequest {
  id: string;
  equipmentId: string;
  title: Bi;
  createdAt: Date;
  steps: RequestStep[];
  description?: string;
  technician?: Person;
  visitAt?: Date;
  resolvedOn?: Date;
  rating?: number;
  /** Object URLs of photos/videos picked on this device. */
  mediaPaths: string[];
  notes: string[];
}
export const isOpen = (r: ServiceRequest) => r.resolvedOn == null;

export interface TrackStep {
  title: Bi;
  note?: Bi;
  at?: Date;
  done?: boolean;
}

export interface Order {
  id: string;
  item: Bi;
  total: number;
  orderedOn: Date;
  steps: TrackStep[];
  arrivalWindow?: Bi;
  dropOff?: string;
  collectionCode?: string;
  driver?: Person;
  delivered?: boolean;
}

export interface Invoice {
  id: string;
  title: Bi;
  amount: number;
  issuedOn: Date;
  paid: boolean;
}

export type GuideKind = 'video' | 'article' | 'cropSheet';

export interface Guide {
  id: string;
  title: Bi;
  kind: GuideKind;
  minutes: number;
  body: Bi;
  icon: IconName;
  tone: Tone;
  photo?: string;
  savedOffline?: boolean;
}

export type DocumentType = 'plan' | 'electrical' | 'warranty' | 'specification' | 'manual';

export interface FarmDocument {
  id: string;
  equipmentId: string;
  title: Bi;
  type: DocumentType;
  sizeMb: number;
  savedOffline: boolean;
}

export type LogEntryType = 'service' | 'partReplaced' | 'fertigation';

export interface LogEntry {
  id: string;
  equipmentId: string;
  type: LogEntryType;
  title: Bi;
  date: Date;
  loggedBy: string;
  synced: boolean;
  checklist: string[];
}

export interface AppNotification {
  title: Bi;
  detail: Bi;
  at: Date;
  icon: IconName;
  tone: Tone;
  unread?: boolean;
}

export interface WateringPlot {
  badge: string;
  name: Bi;
  schedule: Bi;
  tone: Tone;
}

export type ChatAuthor = 'client' | 'mia' | 'agronomist';

export interface ChatMessage {
  author: ChatAuthor;
  text: Bi;
  /** Bundled image path (demo history). */
  photo?: string;
  /** Object URL of a photo picked on this device. */
  photoFile?: string;
  /** Guide in the Learn library linked from Mia's answer. */
  guideId?: string;
  /** Team name shown above agronomist replies. */
  sender?: Bi;
}

export type SeasonGoal = 'higherYields' | 'moreLandWatered' | 'saveWater' | 'lessLabour';
export type NotificationChannel = 'push' | 'sms' | 'whatsApp';

export interface FarmProfile {
  clientName: string;
  firstName: string;
  clientSince: Date;
  location: string;
  areaHa: number;
  crops: Bi[];
}

/** A quote or price request passed to JOGOO sales (Zoho CRM via Mia). */
export interface SalesRequest {
  subject: Bi;
  at: Date;
}

export interface CartLine {
  id: string;
  title: Bi;
  unitPrice: number;
  quantity: number;
}
export const lineTotal = (l: CartLine) => l.unitPrice * l.quantity;

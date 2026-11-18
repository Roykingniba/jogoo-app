// Account and journey types shared by every backend implementation.
// Field names match the API JSON (camelCase) and map 1:1 to the database
// columns (snake_case) in server/sql/schema.mysql.sql and the Supabase migration.

export const STAGES = [
  'signed_up', 'site_visit', 'quote_sent',
  'payment_made', 'installation_scheduled', 'installed',
] as const;
export type Stage = (typeof STAGES)[number];

export type Role = 'client' | 'admin' | 'super_admin';

export interface Profile {
  id: string;
  email: string;
  fullName: string;
  phone: string | null;
  location: string | null;
  farmSizeHa: number | null;
  role: Role;
  lang: 'en' | 'fr';
  createdAt: string;
}

export interface JourneyEvent {
  id: string;
  stage: Stage;
  note: string | null;
  /** ISO 8601, UTC. */
  at: string;
  /** Staff member who recorded the step (null for automatic steps). */
  by: string | null;
}

export interface Journey {
  stages: Stage[];
  current: Stage;
  events: JourneyEvent[];
}

export interface AdminClient extends Profile {
  stage: Stage;
  stageAt: string | null;
}

export interface ClientList {
  clients: AdminClient[];
  total: number;
  page: number;
  perPage: number;
  stageCounts: Record<Stage, number>;
  staffCount: number;
}

/** One extra detail the client adds to their farm, e.g. {label: "Soil", value: "Clay"}. */
export interface FarmExtra {
  label: string;
  value: string;
}

/** The client's own farm, typed in by them (table public.farms). */
export interface Farm {
  name: string;
  location: string | null;
  areaHa: number | null;
  crops: string[];
  waterSources: string[];
  irrigation: string | null;
  extra: FarmExtra[];
  notes: string | null;
  createdAt?: string;
  updatedAt?: string;
}

/** One piece of the client's equipment (table public.farm_equipment). */
export interface FarmEquipment {
  id?: string;
  name: string;
  kind: string | null;
  serial: string | null;
  /** yyyy-mm-dd */
  installedOn: string | null;
  notes: string | null;
  createdAt?: string;
}

export interface MyFarm {
  farm: Farm | null;
  equipment: FarmEquipment[];
}

export type VisitKind = 'site_visit' | 'installation' | 'maintenance' | 'repair' | 'training' | 'other';
export type VisitStatus = 'planned' | 'confirmed' | 'on_the_way' | 'on_site' | 'done' | 'cancelled';
export const VISIT_KINDS: VisitKind[] = ['site_visit', 'installation', 'maintenance', 'repair', 'training', 'other'];
export const VISIT_STATUSES: VisitStatus[] = ['planned', 'confirmed', 'on_the_way', 'on_site', 'done', 'cancelled'];

export interface Technician {
  id: string;
  name: string;
  role: string | null;
  phone: string | null;
  photoUrl: string | null;
  /** Staff only. */
  photoPath?: string | null;
  active?: boolean;
}

export interface VisitStep {
  id?: string;
  title: string;
  place: string | null;
  /** ISO 8601. */
  plannedAt: string | null;
  doneAt: string | null;
  note: string | null;
}

export interface VisitHotel {
  name: string | null;
  address: string | null;
  phone: string | null;
  /** yyyy-mm-dd */
  checkIn: string | null;
  checkOut: string | null;
}

/** A visit JOGOO planned at the client's farm (table public.visits). */
export interface Visit {
  id: string;
  clientId: string;
  kind: VisitKind;
  status: VisitStatus;
  startsAt: string;
  endsAt: string | null;
  siteAddress: string | null;
  purpose: string | null;
  hotel: VisitHotel | null;
  transport: string | null;
  toPrepare: string | null;
  updatedAt: string;
  technician: Technician | null;
  steps: VisitStep[];
  /** Staff overview only. */
  clientName?: string;
  clientPhone?: string | null;
}

/** What the server wants next after a password step. */
export type NextStep = 'verify_email' | 'login_code' | 'reset_code';
export interface Pending {
  next: NextStep;
  /** Masked address the code was sent to, e.g. "aw••@example.cm". */
  email: string;
}

export interface SignUpInput {
  email: string;
  password: string;
  fullName: string;
  phone?: string;
  location?: string;
  farmSizeHa?: number | null;
  lang: 'en' | 'fr';
}

export type ProfilePatch = Partial<Pick<Profile, 'fullName' | 'phone' | 'location' | 'farmSizeHa' | 'lang'>>;

/**
 * Everything the app needs from a backend. Today: PHP + MySQL on the JOGOO
 * web hosting (phpBackend.ts). Later: Supabase (see SUPABASE.md); only this
 * interface needs a second implementation, the screens don't change.
 */
export interface Backend {
  me(): Promise<Profile | null>;
  /** Always continues with an email code (confirms the address). */
  signUp(input: SignUpInput): Promise<Pending>;
  /** A profile when this device is trusted, otherwise the code step. */
  signIn(email: string, password: string): Promise<Profile | Pending>;
  verifyCode(code: string, rememberDevice: boolean): Promise<Profile>;
  resendCode(): Promise<Pending>;
  requestPasswordReset(email: string): Promise<Pending>;
  confirmPasswordReset(code: string, newPassword: string, rememberDevice: boolean): Promise<Profile>;
  signOut(): Promise<void>;
  updateProfile(patch: ProfilePatch): Promise<Profile>;
  changePassword(currentPassword: string, newPassword: string): Promise<void>;
  /** Deletes the account and everything stored about it. Needs the password. */
  deleteAccount(password: string): Promise<void>;
  myJourney(): Promise<Journey>;
  myFarm(): Promise<MyFarm>;
  saveFarm(farm: Farm): Promise<MyFarm>;
  /** Adds the equipment, or updates it when it has an id. */
  saveEquipment(equipment: FarmEquipment): Promise<MyFarm>;
  removeEquipment(id: string): Promise<MyFarm>;
  myVisits(): Promise<Visit[]>;
}

/** Error with a stable code ("invalid_credentials", "email_taken", "offline"...) the UI translates. */
export class BackendError extends Error {
  code: string;
  status: number;
  field?: string;
  /** For invalid_code: tries left before the code is cancelled. */
  attemptsLeft?: number;
  constructor(code: string, status = 0, field?: string, attemptsLeft?: number) {
    super(code);
    this.code = code;
    this.status = status;
    this.field = field;
    this.attemptsLeft = attemptsLeft;
  }
}

/** Fired by a backend when the server says the session is gone (expired or signed out elsewhere). */
export const sessionEvents = new EventTarget();
export const SESSION_EXPIRED = 'expired';

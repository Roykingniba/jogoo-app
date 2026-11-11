// Account and journey types shared by every backend implementation.
// Field names match the API JSON (camelCase) and map 1:1 to the database
// columns (snake_case) in server/sql/schema.mysql.sql and the Supabase migration.

export const STAGES = [
  'signed_up', 'contacted', 'site_visit', 'quote_sent',
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
  admin: {
    listClients(q: { search?: string; stage?: Stage | ''; page?: number; staff?: boolean }): Promise<ClientList>;
    getClient(id: string): Promise<{ profile: Profile; journey: Journey }>;
    addEvent(clientId: string, stage: Stage, note?: string): Promise<Journey>;
    /** Super admin only. */
    setRole(userId: string, role: 'client' | 'admin'): Promise<Profile>;
  };
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

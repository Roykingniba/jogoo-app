// The backend the app talks to:
//  - Supabase when VITE_SUPABASE_URL and VITE_SUPABASE_PUBLISHABLE_KEY are set
//    at build time (web app and Android APK),
//  - otherwise the PHP API on the cPanel hosting (same-origin /api).
import { phpBackend } from './phpBackend';
import { supabaseBackend } from './supabaseBackend';
import type { Backend } from './types';

export const usingSupabase = Boolean(import.meta.env.VITE_SUPABASE_URL && import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY);
export const backend: Backend = usingSupabase ? supabaseBackend : phpBackend;
export * from './types';

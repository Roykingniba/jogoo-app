// The backend the app talks to. Switch to Supabase later by adding a
// supabaseBackend.ts that implements the same Backend interface.
import { phpBackend } from './phpBackend';
import type { Backend } from './types';

export const backend: Backend = phpBackend;
export * from './types';

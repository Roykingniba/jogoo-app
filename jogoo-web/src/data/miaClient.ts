// Talks to Mia, JOGOO's AI sales and agronomy assistant (repo "jogoo-agent",
// running on agent.jogoo.fr). The app only uses the agent's public chat API;
// the Claude and Kommo keys stay on that server.
//
//   POST /api/public/chat    {message, session_id?} → {session_id, bubbles[], buffered?}
//   GET  /api/public/history?session_id=…           → {messages: [{role, content}]}
//
// One conversation per device and account: the session id is kept on the
// device and forgotten when the person signs out.
import { same, type ChatMessage } from './models';

export const MIA_API = 'https://agent.jogoo.fr/api/public';
const SESSION_KEY = 'jogoo.mia';
/** Mia waits ~3 s for follow-up messages, then thinks: allow a generous minute. */
const TIMEOUT_MS = 90_000;

function readSession(): string {
  try { return localStorage.getItem(SESSION_KEY) ?? ''; } catch { return ''; }
}
function writeSession(id: string | null) {
  try {
    if (id) localStorage.setItem(SESSION_KEY, id); else localStorage.removeItem(SESSION_KEY);
  } catch { /* storage blocked: the chat still works, it just won't resume */ }
}
/** Sign-out: the next person on this device starts a new conversation. */
export const forgetMiaSession = () => writeSession(null);

async function call(path: string, init?: RequestInit): Promise<Response> {
  const ctl = new AbortController();
  const timer = window.setTimeout(() => ctl.abort(), TIMEOUT_MS);
  try {
    return await fetch(`${MIA_API}${path}`, { ...init, signal: ctl.signal });
  } finally {
    window.clearTimeout(timer);
  }
}

/**
 * Sends one message. Returns Mia's reply as one or more short bubbles, or null
 * when Mia cannot be reached (the screen then offers a call or WhatsApp).
 */
export async function miaSend(message: string): Promise<string[] | null> {
  try {
    const res = await call('/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message, session_id: readSession() || undefined }),
    });
    if (!res.ok) return null;
    const data = await res.json() as { session_id?: string; bubbles?: string[]; reply?: string; buffered?: boolean };
    if (data.session_id) writeSession(data.session_id);
    // "buffered": the server merged this message into a newer one still being answered.
    if (data.buffered) return [];
    const bubbles = (data.bubbles ?? []).filter((b) => typeof b === 'string' && b.trim() !== '');
    if (bubbles.length) return bubbles;
    return data.reply ? [data.reply] : null;
  } catch {
    return null;
  }
}

/** The conversation so far on this device (empty when there is none or Mia is offline). */
export async function miaHistory(): Promise<ChatMessage[]> {
  const sid = readSession();
  if (!sid) return [];
  try {
    const res = await call(`/history?session_id=${encodeURIComponent(sid)}`);
    if (!res.ok) return [];
    const data = await res.json() as { messages?: { role: string; content: string }[] };
    return (data.messages ?? [])
      .filter((m) => (m.role === 'user' || m.role === 'assistant') && m.content)
      .map((m) => ({ author: m.role === 'user' ? 'client' : 'mia', text: same(m.content) }));
  } catch {
    return [];
  }
}

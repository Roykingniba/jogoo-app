// Talks to Mia. The Claude API is only ever called by the `mia` Supabase Edge
// Function; the web app never holds an API key.
//
// Mia answers only when Supabase is configured (VITE_SUPABASE_URL and
// VITE_SUPABASE_PUBLISHABLE_KEY) AND the user is signed in. Sign-in is not part
// of this stakeholder build, so Mia returns null and the chat offers a phone
// call or WhatsApp instead, exactly like the Flutter app without a backend.
import type { ChatMessage, Lang } from './models';

const url = import.meta.env.VITE_SUPABASE_URL as string | undefined;
const key = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY as string | undefined;

/** Access token of the signed-in Supabase user. Wire this to supabase-js auth later. */
let accessToken: string | null = null;
export const setMiaAccessToken = (token: string | null) => { accessToken = token; };

export async function miaReply(history: ChatMessage[], lang: Lang): Promise<string | null> {
  if (!url || !key || !accessToken) {
    await new Promise((r) => setTimeout(r, 700)); // feels like a real round-trip
    return null;
  }
  try {
    const res = await fetch(`${url}/functions/v1/mia`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', apikey: key, Authorization: `Bearer ${accessToken}` },
      body: JSON.stringify({
        language: lang,
        messages: history
          .filter((m) => m.text.en !== '')
          .map((m) => ({ role: m.author === 'client' ? 'user' : 'assistant', content: lang === 'fr' ? m.text.fr : m.text.en })),
      }),
    });
    if (!res.ok) return null;
    const data = await res.json();
    return typeof data?.reply === 'string' ? data.reply : null;
  } catch {
    return null;
  }
}

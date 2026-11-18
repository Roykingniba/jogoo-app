// Translations come straight from the Flutter ARB files (ICU message format),
// so lib/l10n/app_en.arb and app_fr.arb stay the single source of truth.
import { useMemo } from 'react';
import { IntlMessageFormat } from 'intl-messageformat';
import en from './en.json';
import fr from './fr.json';
import webEn from './web_en.json';
import webFr from './web_fr.json';
import { useStore } from '../data/store';
import type { Bi, Lang } from '../data/models';

// web_*.json hold strings that exist only in the web build (install prompt...).
// The staff app adds its own strings at start-up (registerMessages); only their
// TYPE is imported here, so the client bundle never contains them.
type StaffKey = keyof typeof import('../staff/staff_en.json');
export type MsgKey = keyof typeof en | keyof typeof webEn | StaffKey;
export function registerMessages(lang: Lang, messages: Record<string, string>) {
  Object.assign(catalogs[lang], messages);
}
const catalogs: Record<Lang, Record<string, string>> = { en: { ...en, ...webEn }, fr: { ...fr, ...webFr } };
const cache = new Map<string, IntlMessageFormat>();

export function translate(lang: Lang, key: MsgKey, params?: Record<string, string | number>): string {
  const src = catalogs[lang][key] ?? catalogs.en[key] ?? key;
  if (!params) return src.includes('{') ? fmt(lang, key, src, {}) : src;
  // Like Flutter, plain {placeholders} print numbers as-is ("18500"); only
  // plural arguments need real numbers.
  const values: Record<string, string | number> = {};
  for (const [k, v] of Object.entries(params)) {
    values[k] = typeof v === 'number' && !new RegExp(`\\{${k},\\s*plural`).test(src) ? String(v) : v;
  }
  return fmt(lang, key, src, values);
}

function fmt(lang: Lang, key: string, src: string, values: Record<string, string | number>) {
  const id = `${lang}:${key}`;
  let m = cache.get(id);
  if (!m) {
    m = new IntlMessageFormat(src, lang, undefined, { ignoreTag: true });
    cache.set(id, m);
  }
  return String(m.format(values));
}

export type T = (key: MsgKey, params?: Record<string, string | number>) => string;

/** Hook: `const { t, lang, b } = useI18n()`; b() picks the language of a Bi. */
export function useI18n() {
  const lang = useStore((s) => s.lang);
  // Stable per language, so screens can safely list t in effect dependencies.
  return useMemo(() => {
    const t: T = (key, params) => translate(lang, key, params);
    const b = (v: Bi | undefined | null) => (v ? (lang === 'fr' ? v.fr : v.en) : '');
    return { t, lang, b, fr: lang === 'fr' };
  }, [lang]);
}

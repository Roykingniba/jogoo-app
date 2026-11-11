// Date and number formatting, ported from lib/utils/format.dart.
import type { Lang } from '../data/models';

const loc = (l: Lang) => (l === 'fr' ? 'fr-FR' : 'en-GB');

/** Groups thousands with a space, as written in Cameroon: 18 500. */
export function formatAmount(value: number): string {
  const digits = Math.abs(Math.round(value)).toString();
  let out = value < 0 ? '-' : '';
  for (let i = 0; i < digits.length; i++) {
    if (i > 0 && (digits.length - i) % 3 === 0) out += ' ';
    out += digits[i];
  }
  return out;
}

const part = (l: Lang, d: Date, o: Intl.DateTimeFormatOptions) => new Intl.DateTimeFormat(loc(l), o).format(d);

const weekdayShort = (l: Lang, d: Date) => {
  const w = part(l, d, { weekday: 'short' });
  return l === 'fr' ? (w.endsWith('.') ? w : `${w}.`) : w;
};
const monthShort = (l: Lang, d: Date) => {
  const m = part(l, d, { month: 'short' });
  // en-GB gives "Sept"; Dart's intl gives "Sep".
  return l === 'en' ? m.replace('Sept', 'Sep') : m;
};

/** "Thu 9 Oct" / "jeu. 9 oct." */
export const shortDate = (l: Lang, d: Date) => `${weekdayShort(l, d)} ${d.getDate()} ${monthShort(l, d)}`;
/** "9 Oct" / "9 oct." */
export const dayMonth = (l: Lang, d: Date) => `${d.getDate()} ${monthShort(l, d)}`;
/** "6 Oct 2026" / "6 oct. 2026" */
export const fullDate = (l: Lang, d: Date) => `${dayMonth(l, d)} ${d.getFullYear()}`;
/** "10:00" in both languages. */
export const timeOfDay = (d: Date) =>
  `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
/** "Thu 9 Oct, 10:00" */
export const dateTime = (l: Lang, d: Date) => `${shortDate(l, d)}, ${timeOfDay(d)}`;
/** "6 Oct, 08:12" */
export const dayMonthTime = (l: Lang, d: Date) => `${dayMonth(l, d)}, ${timeOfDay(d)}`;
/** "TUESDAY 6 OCTOBER" / "MARDI 6 OCTOBRE" */
export const longDayHeader = (l: Lang, d: Date) =>
  `${part(l, d, { weekday: 'long' })} ${d.getDate()} ${part(l, d, { month: 'long' })}`.toUpperCase();
/** "March 2026" / "mars 2026" */
export const monthYear = (l: Lang, d: Date) => `${part(l, d, { month: 'long' })} ${d.getFullYear()}`;
/** "OCT" for calendar badges. */
export const monthBadge = (l: Lang, d: Date) => monthShort(l, d).replace('.', '').toUpperCase();
/** "2.4" / "2,4" */
export const decimal = (l: Lang, v: number) =>
  new Intl.NumberFormat(loc(l), { minimumFractionDigits: 1, maximumFractionDigits: 1 }).format(v);
/** "3" for whole numbers, otherwise "2.5" / "2,5". */
export const decimalTrim = (l: Lang, v: number) => (Number.isInteger(v) ? String(v) : decimal(l, v));

export const initials = (name: string) =>
  name.trim().split(/\s+/).slice(0, 2).map((p) => p[0] ?? '').join('').toUpperCase();

export const isSameDay = (a: Date, b: Date) =>
  a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();

/** Replaces {date} in demo strings such as "Fitted on {date}". */
export const withDate = (text: string, date: string | undefined) => (date ? text.replace('{date}', date) : text);

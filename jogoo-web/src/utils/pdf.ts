// Demo PDF exports, ported from lib/utils/pdf_exports.dart.
// Every PDF here is generated from sample app data and says so on the page.
import { jsPDF } from 'jspdf';
import type { Equipment, FarmDocument, Lang, LogEntry } from '../data/models';
import { translate } from '../i18n/i18n';
import { showToast } from '../components/overlays';
import { shareOrDownload } from './actions';
import { isNative, shareFileNative } from './native';

// ---------------------------------------------------------------------------
// Text safety: the built-in Helvetica covers WinAnsi (Latin-1), so French
// accents work, but typographic marks and emoji must be swapped out.

const SWAPS: Record<string, string> = {
  '×': 'x', '’': "'", '‘': "'", '“': '"', '”': '"',
  '–': '-', '—': '-', '·': '-', '•': '-', '…': '...',
  '\u00a0': ' ', '\u202f': ' ', '\u2009': ' ',
};

/** Makes a string safe for jsPDF's standard fonts. */
export function pdfSafe(text: string): string {
  return text
    .replace(/[×’‘“”–—·•…\u00a0\u202f\u2009]/g, (c) => SWAPS[c] ?? c)
    .replace(/[^\x20-\x7e\n\u00a1-\u00ff]/gu, '');
}

// ---------------------------------------------------------------------------
// Layout helpers (points, A4). Flutter's pw.Page uses a 2 cm margin.

const PAGE_W = 595.28;
const PAGE_H = 841.89;
const MARGIN = 56.7;
const INK: [number, number, number] = [14, 35, 56];
const GREY700: [number, number, number] = [97, 97, 97];
const GREY300: [number, number, number] = [224, 224, 224];
const GREEN: [number, number, number] = [76, 175, 80];

function newDoc(title: string) {
  const doc = new jsPDF({ unit: 'pt', format: 'a4' });
  doc.setProperties({ title: pdfSafe(title), creator: 'JOGOO (demo)', subject: 'Demonstration document' });
  doc.setTextColor(...INK);
  return doc;
}

/** Writes wrapped text with its top at y and returns the y below it. */
function write(
  doc: jsPDF, text: string, x: number, y: number, width: number,
  opts: { size?: number; bold?: boolean; color?: [number, number, number] } = {},
): number {
  const size = opts.size ?? 12;
  doc.setFont('helvetica', opts.bold ? 'bold' : 'normal');
  doc.setFontSize(size);
  doc.setTextColor(...(opts.color ?? INK));
  const lines = doc.splitTextToSize(pdfSafe(text), width) as string[];
  const lh = size * 1.25;
  lines.forEach((line, i) => doc.text(line, x, y + i * lh, { baseline: 'top' }));
  return y + lines.length * lh;
}

function textHeight(doc: jsPDF, text: string, width: number, size: number, bold = false) {
  doc.setFont('helvetica', bold ? 'bold' : 'normal');
  doc.setFontSize(size);
  return (doc.splitTextToSize(pdfSafe(text), width) as string[]).length * size * 1.25;
}

// ---------------------------------------------------------------------------
// Builders

export function buildFarmDocumentPdf(o: {
  title: string; equipmentName: string; serialLabel: string; copyLabel: string; demoNotice: string;
}): jsPDF {
  const doc = newDoc(o.title);
  const x = MARGIN + 28;
  const w = PAGE_W - 2 * x;
  let y = MARGIN + 28;
  y = write(doc, 'JOGOO', x, y, w, { size: 12, bold: true });
  y += 24;
  y = write(doc, o.title, x, y, w, { size: 22, bold: true });
  y += 8;
  y = write(doc, o.equipmentName, x, y, w, { size: 14 });
  y = write(doc, o.serialLabel, x, y, w);
  y += 24;
  doc.setDrawColor(...GREY300);
  doc.setLineWidth(1);
  doc.line(x, y, x + w, y);
  y += 16;
  write(doc, o.demoNotice, x, y, w, { size: 12 });
  // Spacer: the demo label sits at the bottom of the page.
  const bottom = PAGE_H - MARGIN - 28;
  write(doc, o.copyLabel, x, bottom - 10 * 1.25, w, { size: 10, bold: true, color: GREY700 });
  return doc;
}

export function buildMaintenanceLogPdf(o: {
  lang: Lang; equipment: Equipment; entries: LogEntry[]; demoNotice: string;
  loggedByLabel: string; waitingLabel: string; syncedLabel: string; reportTitle: string;
}): jsPDF {
  const { lang, equipment } = o;
  const doc = newDoc(o.reportTitle);
  const x = MARGIN;
  const w = PAGE_W - 2 * MARGIN;
  const maxY = PAGE_H - MARGIN;
  let y = MARGIN;
  const ensure = (h: number) => {
    if (y + h > maxY) { doc.addPage(); y = MARGIN; }
  };
  const dateFmt = new Intl.DateTimeFormat(lang === 'fr' ? 'fr-FR' : 'en-US', { year: 'numeric', month: 'short', day: 'numeric' });

  // pw.Header(level: 0)
  y = write(doc, o.reportTitle, x, y, w, { size: 20, bold: true });
  y += 4;
  doc.setDrawColor(...GREY300);
  doc.setLineWidth(1);
  doc.line(x, y, x + w, y);
  y += 16;
  y = write(doc, lang === 'fr'
    ? `${equipment.name.fr} · Série : ${equipment.serial}`
    : `${equipment.name.en} · Serial: ${equipment.serial}`, x, y, w);
  y += 18;

  if (o.entries.length === 0) {
    y = write(doc, lang === 'fr' ? 'Aucune saisie.' : 'No entries.', x, y, w);
  } else {
    for (const entry of o.entries) {
      const title = lang === 'fr' ? entry.title.fr : entry.title.en;
      const inner = w - 12 - 3 - 12;
      const lines = [dateFmt.format(entry.date), `${o.loggedByLabel} ${entry.loggedBy}`, entry.synced ? o.syncedLabel : o.waitingLabel];
      const h = 12 + textHeight(doc, title, inner, 12, true) + 4 + lines.reduce((n, l) => n + textHeight(doc, l, inner, 12), 0) + 12;
      ensure(h + 12);
      const top = y;
      let ty = top + 12;
      ty = write(doc, title, x + 15, ty, inner, { size: 12, bold: true });
      ty += 4;
      for (const l of lines) ty = write(doc, l, x + 15, ty, inner);
      const bottom = ty + 12;
      doc.setFillColor(...GREEN);
      doc.rect(x, top, 3, bottom - top, 'F');
      doc.setDrawColor(...GREY300);
      doc.line(x, bottom, x + w, bottom);
      y = bottom + 12;
    }
  }
  y += 12;
  ensure(1 + 8 + textHeight(doc, o.demoNotice, w, 10));
  doc.setDrawColor(...GREY300);
  doc.line(x, y, x + w, y);
  y += 8;
  write(doc, o.demoNotice, x, y, w, { size: 10 });
  return doc;
}

// ---------------------------------------------------------------------------
// Actions used by the screens

function farmDocumentPdf(lang: Lang, document: FarmDocument, equipment: Equipment): Blob {
  const pick = (b: { en: string; fr: string }) => (lang === 'fr' ? b.fr : b.en);
  return buildFarmDocumentPdf({
    title: pick(document.title),
    equipmentName: pick(equipment.name),
    serialLabel: translate(lang, 'serialNumber', { serial: equipment.serial }),
    copyLabel: translate(lang, 'demoCopy'),
    demoNotice: translate(lang, 'demoDocumentNotice'),
  }).output('blob');
}

function failed(lang: Lang, error: unknown) {
  console.warn('Could not create demo PDF', error);
  showToast(translate(lang, 'pdfExportFailed'));
}

function saveBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 10_000);
}

/** In the Android app: save to the app cache and open the share sheet (open in a PDF viewer, save, send). */
function nativeShare(lang: Lang, blob: Blob, filename: string, title: string) {
  shareFileNative(blob, filename, { title }).catch((e) => failed(lang, e));
}

/** Opens the demo PDF in a new tab (the browser's PDF viewer); downloads it if pop-ups are blocked. */
export function previewFarmDocument(lang: Lang, document: FarmDocument, equipment: Equipment, target?: Window | null) {
  try {
    const blob = farmDocumentPdf(lang, document, equipment);
    if (isNative()) {
      nativeShare(lang, blob, `jogoo-${document.id}.pdf`, lang === 'fr' ? document.title.fr : document.title.en);
      return;
    }
    const url = URL.createObjectURL(blob);
    let win = target ?? null;
    if (win) win.location.href = url;
    else win = window.open(url, '_blank');
    if (!win) saveBlob(blob, `jogoo-${document.id}.pdf`);
    else win.opener = null;
    setTimeout(() => URL.revokeObjectURL(url), 60_000);
  } catch (e) {
    failed(lang, e);
  }
}

/** Saves the demo PDF as a file. */
export function downloadFarmDocument(lang: Lang, document: FarmDocument, equipment: Equipment) {
  try {
    const blob = farmDocumentPdf(lang, document, equipment);
    if (isNative()) {
      nativeShare(lang, blob, `jogoo-${document.id}.pdf`, lang === 'fr' ? document.title.fr : document.title.en);
      return;
    }
    saveBlob(blob, `jogoo-${document.id}.pdf`);
  } catch (e) {
    failed(lang, e);
  }
}

/** Builds the maintenance log PDF and shares it (or downloads it where sharing files isn't supported). */
export async function shareMaintenanceLog(lang: Lang, equipment: Equipment, entries: LogEntry[]) {
  try {
    const title = translate(lang, 'logReportTitle');
    const blob = buildMaintenanceLogPdf({
      lang, equipment, entries,
      demoNotice: translate(lang, 'demoDocumentNotice'),
      loggedByLabel: translate(lang, 'loggedByLabel'),
      waitingLabel: translate(lang, 'waitingToSync'),
      syncedLabel: translate(lang, 'synced'),
      reportTitle: title,
    }).output('blob');
    const file = new File([blob], `jogoo-maintenance-${equipment.id}.pdf`, { type: 'application/pdf' });
    await shareOrDownload({ title, file });
  } catch (e) {
    failed(lang, e);
  }
}

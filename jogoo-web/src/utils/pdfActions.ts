// Lazy wrappers around utils/pdf.ts: jsPDF (~400 kB) is only downloaded the
// first time someone previews, downloads or shares a PDF.
import type { Equipment, FarmDocument, Lang, LogEntry } from '../data/models';

const load = () => import('./pdf');

export function previewFarmDocument(lang: Lang, doc: FarmDocument, equipment: Equipment) {
  // Open the tab synchronously (inside the click) so pop-up blockers allow it.
  const win = window.open('', '_blank');
  void load().then((m) => m.previewFarmDocument(lang, doc, equipment, win));
}

export function downloadFarmDocument(lang: Lang, doc: FarmDocument, equipment: Equipment) {
  void load().then((m) => m.downloadFarmDocument(lang, doc, equipment));
}

export function shareMaintenanceLog(lang: Lang, equipment: Equipment, entries: LogEntry[]) {
  return load().then((m) => m.shareMaintenanceLog(lang, equipment, entries));
}

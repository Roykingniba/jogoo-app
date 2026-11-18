// Calls, WhatsApp and "coming soon", ported from lib/utils/actions.dart.
import { DemoData } from '../data/demoData';
import { translate } from '../i18n/i18n';
import { useStore } from '../data/store';
import { showToast } from '../components/overlays';
import { isNative, openExternalNative, shareFileNative, shareTextNative } from './native';

/** Opens the phone dialler (on desktops, the system's calling app if any). */
export function callNumber(number: string) {
  if (isNative()) { void openExternalNative(`tel:${number}`).catch(() => {}); return; }
  window.location.href = `tel:${number}`;
}
export const callJogoo = () => callNumber(DemoData.jogooPhone);

/** Opens a WhatsApp chat with the JOGOO team. */
export function openWhatsApp(text?: string) {
  const q = text ? `?text=${encodeURIComponent(text)}` : '';
  // In the Android app, hand the link to the system: WhatsApp opens it if installed, else the browser.
  if (isNative()) { void openExternalNative(`https://wa.me/${DemoData.whatsAppNumber}${q}`).catch(() => {}); return; }
  window.open(`https://wa.me/${DemoData.whatsAppNumber}${q}`, '_blank', 'noopener');
}

/** For features planned in the design but not built in this version. */
export function showComingSoon() {
  const lang = useStore.getState().lang;
  showToast(translate(lang, 'comingSoonTitle'), translate(lang, 'comingSoonBody'));
}

/** Shares text (and optionally a file) with the native share sheet, or downloads/copies as a fallback. */
export async function shareOrDownload(opts: { title: string; text?: string; file?: File }) {
  if (isNative()) {
    // Android WebView has no Web Share for files and can't download blobs.
    if (opts.file) await shareFileNative(opts.file, opts.file.name, { title: opts.title, text: opts.text });
    else if (opts.text) await shareTextNative(opts.title, opts.text);
    return;
  }
  const nav = navigator as Navigator & { canShare?: (d: ShareData) => boolean };
  try {
    if (opts.file && nav.canShare?.({ files: [opts.file] })) {
      await nav.share({ title: opts.title, text: opts.text, files: [opts.file] });
      return;
    }
    if (!opts.file && nav.share) {
      await nav.share({ title: opts.title, text: opts.text });
      return;
    }
  } catch (e) {
    if ((e as DOMException)?.name === 'AbortError') return;
  }
  if (opts.file) {
    const url = URL.createObjectURL(opts.file);
    const a = document.createElement('a');
    a.href = url; a.download = opts.file.name; a.click();
    setTimeout(() => URL.revokeObjectURL(url), 5000);
  } else if (opts.text) {
    await navigator.clipboard?.writeText(opts.text).catch(() => {});
  }
}

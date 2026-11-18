// Helpers for the Android app (Capacitor). On the web every function here is
// either a no-op or never called: check isNative() first.
import { Capacitor } from '@capacitor/core';

/** True inside the Android app, false in a browser or the installed PWA. */
export const isNative = () => Capacitor.isNativePlatform();

function blobToBase64(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(reader.error ?? new Error('read failed'));
    reader.onload = () => {
      const s = String(reader.result);
      resolve(s.slice(s.indexOf(',') + 1));
    };
    reader.readAsDataURL(blob);
  });
}

/**
 * Android WebView can't download blobs or open blob: URLs, so the app writes
 * the file to its cache folder and opens the system share sheet, from which
 * the person can open it in a PDF viewer, save it to Files/Drive or send it.
 */
export async function shareFileNative(blob: Blob, filename: string, opts: { title?: string; text?: string } = {}) {
  const [{ Filesystem, Directory }, { Share }] = await Promise.all([
    import('@capacitor/filesystem'),
    import('@capacitor/share'),
  ]);
  const path = filename.replace(/[^\w.-]+/g, '_');
  const { uri } = await Filesystem.writeFile({
    path, data: await blobToBase64(blob), directory: Directory.Cache, recursive: true,
  });
  try {
    await Share.share({ title: opts.title, text: opts.text, files: [uri], dialogTitle: opts.title });
  } catch (e) {
    // Closing the share sheet without picking an app is not an error.
    if (!/cancel/i.test(String((e as Error)?.message ?? e))) throw e;
  }
}

/** Shares plain text with the system share sheet. */
export async function shareTextNative(title: string, text: string) {
  const { Share } = await import('@capacitor/share');
  try {
    await Share.share({ title, text, dialogTitle: title });
  } catch (e) {
    if (!/cancel/i.test(String((e as Error)?.message ?? e))) throw e;
  }
}

/** Hands a URL (tel:, https://wa.me/..., mailto:, any website) to Android. */
export async function openExternalNative(url: string) {
  const { AppLauncher } = await import('@capacitor/app-launcher');
  await AppLauncher.openUrl({ url });
}

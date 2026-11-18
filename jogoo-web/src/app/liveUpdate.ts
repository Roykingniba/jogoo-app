// Live updates for the Android app. Every push to GitHub's main branch builds
// the web app and publishes it to UPDATES_URL (see DEPLOY.md); the app picks
// it up by itself, so people don't reinstall the APK for screen or text changes.
//
//  1. On start the app tells the updater it loaded fine. A bundle that crashes
//     before that is rolled back to the previous one automatically.
//  2. It reads latest.json. If that build is newer than the one running and
//     works with this APK (minNative), it downloads the zip in the background,
//     checks its SHA-256, and switches to it the next time the app is closed
//     or sent to the background, so nobody loses what they are typing.
//
// Changes to native parts (new permissions, plugins, icon) still need a new APK;
// minNative in latest.json keeps older APKs on the bundle they can run.
import { CapacitorUpdater } from '@capgo/capacitor-updater';
import { App as CapApp } from '@capacitor/app';

const UPDATES_URL = 'https://jogoo.africa/meha-updates';
/** Set by the build (YYYYMMDDHHmm); 0 in local builds. */
const BUILT_IN = Number(import.meta.env.VITE_BUILD ?? 0);
const CHECK_EVERY_MS = 30 * 60 * 1000;

interface Latest {
  build: number;
  version: string;
  url: string;
  checksum: string;
  /** Lowest Android versionCode this bundle runs on. */
  minNative: number;
}

let checking = false;
let lastCheck = 0;

async function runningBuild(): Promise<number> {
  const { bundle } = await CapacitorUpdater.current();
  // Downloaded bundles are named after their build number; "builtin" is the APK's own.
  const n = Number(bundle.version);
  return bundle.id === 'builtin' || !Number.isFinite(n) ? BUILT_IN : n;
}

async function nativeCode(): Promise<number> {
  try { return Number((await CapApp.getInfo()).build) || 0; } catch { return 0; }
}

async function check() {
  if (checking || Date.now() - lastCheck < 60_000) return;
  checking = true;
  lastCheck = Date.now();
  try {
    const res = await fetch(`${UPDATES_URL}/latest.json?t=${Date.now()}`, { cache: 'no-store' });
    if (!res.ok) return;
    const latest = (await res.json()) as Latest;
    if (!latest?.build || !latest.url || !/^[0-9a-f]{64}$/.test(latest.checksum ?? '')) return;
    if (latest.build <= (await runningBuild())) return;
    if ((latest.minNative ?? 0) > (await nativeCode())) return;
    // Already downloaded earlier? Just make sure it is queued. One that failed
    // and was rolled back is not tried again; the next build will be.
    const { bundles } = await CapacitorUpdater.list();
    const same = bundles.find((b) => b.version === String(latest.build));
    if (same?.status === 'error') return;
    const ready = same && (same.status === 'success' || same.status === 'pending') ? same : undefined;
    const url = new URL(latest.url, `${UPDATES_URL}/`).href;
    if (!url.startsWith(`${UPDATES_URL}/`)) return; // only ever from our own server
    const bundle = ready ?? await CapacitorUpdater.download({ url, version: String(latest.build), checksum: latest.checksum });
    await CapacitorUpdater.next({ id: bundle.id });
  } catch {
    // Offline or a bad download: try again later; the current bundle keeps running.
  } finally {
    checking = false;
  }
}

export function setUpLiveUpdates() {
  void CapacitorUpdater.notifyAppReady().catch(() => {});
  void check();
  void CapApp.addListener('resume', () => {
    if (Date.now() - lastCheck > CHECK_EVERY_MS) void check();
  });
}

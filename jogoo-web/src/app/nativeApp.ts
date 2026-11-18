// Android app (Capacitor) setup: status bar, hardware back button and links
// that must leave the app. Loaded from main.tsx only when running natively.
import { App as CapApp } from '@capacitor/app';
import { StatusBar, Style } from '@capacitor/status-bar';
import { openExternalNative } from '../utils/native';
import { setUpLiveUpdates } from './liveUpdate';

const NAVY = '#004a87';

function setUpStatusBar() {
  // Light icons on navy. Below Android 15 the bar itself is navy and the page
  // starts under it. From Android 15 the app is always edge-to-edge: the page
  // already pads by env(safe-area-inset-top), and this strip paints that gap
  // navy so the top of scrolling content never shows behind the icons.
  void StatusBar.setStyle({ style: Style.Dark }).catch(() => {});
  void StatusBar.setOverlaysWebView({ overlay: false }).catch(() => {});
  void StatusBar.setBackgroundColor({ color: NAVY }).catch(() => {});
  const style = document.createElement('style');
  style.textContent = `
    html.native-app body::before {
      content: ''; position: fixed; z-index: 2147483000; inset: 0 0 auto 0;
      height: env(safe-area-inset-top, 0px); background: ${NAVY}; pointer-events: none;
    }`;
  document.head.appendChild(style);
  document.documentElement.classList.add('native-app');
}

const isHome = () => {
  const h = window.location.hash.replace(/^#/, '').split('?')[0];
  return h === '' || h === '/';
};

function setUpBackButton() {
  void CapApp.addListener('backButton', ({ canGoBack }) => {
    // 1. Close an open sheet/dialog (they close on Escape).
    if (document.querySelector('[role="dialog"][aria-modal="true"]')) {
      document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }));
      return;
    }
    // 2. On Home (or the sign-in screen, which has no route) leave the app.
    if (isHome()) { void CapApp.exitApp(); return; }
    // 3. Otherwise go back in the hash router's history, or to Home.
    if (canGoBack && window.history.length > 1) window.history.back();
    else window.location.hash = '#/';
  });
}

/** Links to other apps or websites (tel:, wa.me, mailto:, https://...) open outside the WebView. */
function setUpExternalLinks() {
  document.addEventListener('click', (e) => {
    if (e.defaultPrevented || e.button !== 0) return;
    const a = (e.target as Element | null)?.closest?.('a[href]') as HTMLAnchorElement | null;
    if (!a || a.hasAttribute('download')) return;
    const href = a.getAttribute('href') ?? '';
    if (href.startsWith('#') || href.startsWith('blob:') || href.startsWith('data:')) return;
    let url: URL;
    try { url = new URL(a.href, window.location.href); } catch { return; }
    if (url.origin === window.location.origin) return;
    e.preventDefault();
    void openExternalNative(url.href).catch(() => {});
  });
}

export function setUpNativeApp() {
  setUpStatusBar();
  setUpBackButton();
  setUpExternalLinks();
  setUpLiveUpdates();
}

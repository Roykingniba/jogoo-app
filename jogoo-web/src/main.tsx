import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { Capacitor } from '@capacitor/core';
import './styles/global.css';
import { App } from './app/App';
import { startServiceWorker } from './app/update';

if (Capacitor.isNativePlatform()) {
  // Android app: the files are bundled in the APK (and updated by live updates,
  // see app/liveUpdate.ts), so no service worker. Status bar, back button and
  // external links are set up natively.
  void import('./app/nativeApp').then((m) => m.setUpNativeApp());
} else {
  // Service worker: caches the app shell so the app opens offline after the
  // first visit. New versions wait for the person to tap "Reload".
  startServiceWorker();
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);

import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { registerSW } from 'virtual:pwa-register';
import { Capacitor } from '@capacitor/core';
import './styles/global.css';
import { App } from './app/App';

if (Capacitor.isNativePlatform()) {
  // Android app: the files are bundled in the APK, so no service worker.
  // Status bar, back button and external links are set up natively.
  void import('./app/nativeApp').then((m) => m.setUpNativeApp());
} else {
  // Service worker: caches the app shell, fonts and images so the app opens
  // offline after the first visit, and updates itself in the background.
  registerSW({ immediate: true });
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);

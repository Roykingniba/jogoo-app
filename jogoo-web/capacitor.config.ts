import type { CapacitorConfig } from '@capacitor/cli';

// Android app wrapper (see ANDROID.md). The web build in dist/ is bundled
// into the APK and served from https://localhost inside the WebView.
const config: CapacitorConfig = {
  appId: 'com.jogoo.meha',
  appName: 'Jogoo',
  webDir: 'dist',
  server: {
    androidScheme: 'https',
  },
  android: {
    backgroundColor: '#f3f0e8',
  },
  plugins: {
    // Live updates: the app checks UPDATES_URL/latest.json and downloads new
    // web bundles itself (see src/app/liveUpdate.ts and DEPLOY.md). Nothing is
    // sent to Capgo's servers: no update, channel or stats endpoints.
    CapacitorUpdater: {
      autoUpdate: false,
      updateUrl: '',
      channelUrl: '',
      statsUrl: '',
      appReadyTimeout: 15000,
      autoDeleteFailed: true,
      autoDeletePrevious: true,
      resetWhenUpdate: true,
    },
    StatusBar: {
      overlaysWebView: false,
      style: 'DARK',
      backgroundColor: '#004a87',
    },
  },
};

export default config;

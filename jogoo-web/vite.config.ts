import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';

// BASE_PATH lets the same build run under a sub-folder, e.g. GitHub Pages
// (BASE_PATH=/jogoo-app/ npm run build). Defaults to the site root.
const base = process.env.BASE_PATH ?? '/';

export default defineConfig({
  base,
  plugins: [
    react(),
    VitePWA({
      // 'prompt': a new version waits for the person to tap Reload (src/app/update.ts),
      // so an update never wipes a form, the cart or the email-code step.
      registerType: 'prompt',
      includeAssets: ['favicon.png', 'apple-touch-icon.png', 'fonts/*.woff2', 'images/*'],
      manifest: {
        id: base,
        name: 'Jogoo · JOGOO Agriculture',
        short_name: 'Jogoo',
        description: 'Your farm, equipment, shop, guides and JOGOO service in one app. English and French.',
        lang: 'en',
        start_url: base,
        scope: base,
        display: 'standalone',
        orientation: 'any',
        background_color: '#f3f0e8',
        theme_color: '#004a87',
        categories: ['business', 'productivity', 'education'],
        icons: [
          { src: 'pwa-192.png', sizes: '192x192', type: 'image/png' },
          { src: 'pwa-512.png', sizes: '512x512', type: 'image/png' },
          { src: 'pwa-maskable-512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
        ],
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,png,jpg,svg,woff2}'],
        // Don't make phones download these on the first visit: jsPDF's unused
        // HTML helpers, and jsPDF itself (only needed when exporting a PDF;
        // cached at runtime the first time it's used).
        globIgnores: ['**/html2canvas*', '**/purify*', '**/index.es-*', '**/assets/pdf-*', '**/pwa-512*', '**/pwa-maskable*'],
        runtimeCaching: [
          {
            urlPattern: ({ url, sameOrigin }) => sameOrigin && /\/assets\/pdf-.*\.js$/.test(url.pathname),
            handler: 'CacheFirst',
            options: { cacheName: 'jogoo-pdf', expiration: { maxEntries: 4 } },
          },
        ],
        navigateFallback: 'index.html',
        // The PHP API and installer must always hit the server.
        navigateFallbackDenylist: [/\/api\//],
        cleanupOutdatedCaches: true,
      },
    }),
  ],
  build: {
    target: 'es2020',
    chunkSizeWarningLimit: 700,
  },
});

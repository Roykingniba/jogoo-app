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
      registerType: 'autoUpdate',
      includeAssets: ['favicon.png', 'apple-touch-icon.png', 'fonts/*.ttf', 'images/*'],
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
        globPatterns: ['**/*.{js,css,html,png,jpg,svg,ttf,woff2}'],
        // jsPDF's optional HTML-rendering helpers are never used; don't make
        // phones download them up front.
        globIgnores: ['**/html2canvas*', '**/purify*', '**/index.es-*'],
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

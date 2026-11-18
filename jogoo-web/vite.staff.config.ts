// Separate build for the JOGOO Staff app → dist-staff/ (not part of the
// client app, its service worker or the Android APK).
//   npm run build:staff
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  root: 'staff-site',
  base: './',
  publicDir: '../public',
  envDir: '..',
  plugins: [react()],
  build: { outDir: '../dist-staff', emptyOutDir: true, target: 'es2020' },
});

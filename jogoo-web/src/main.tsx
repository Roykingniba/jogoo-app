import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './styles/global.css';
import { App } from './app/App';
import { startServiceWorker } from './app/update';

// Service worker: caches the app shell so the app opens offline after the
// first visit. New versions wait for the person to tap "Reload".
startServiceWorker();

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);

// Service worker updates: ask before reloading, so a new version never wipes
// a form, the cart or the email-code step in the middle of use.
import { create } from 'zustand';
import { registerSW } from 'virtual:pwa-register';

export const useUpdate = create<{ ready: boolean; apply: () => void }>(() => ({ ready: false, apply: () => {} }));

export function startServiceWorker() {
  const updateSW = registerSW({
    immediate: true,
    onNeedRefresh() {
      useUpdate.setState({ ready: true, apply: () => void updateSW(true) });
    },
  });
}

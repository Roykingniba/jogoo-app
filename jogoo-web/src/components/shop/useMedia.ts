import { useSyncExternalStore } from 'react';

/** True while the media query matches, e.g. useMedia('(min-width: 1080px)'). */
export function useMedia(query: string): boolean {
  return useSyncExternalStore(
    (cb) => {
      const mq = window.matchMedia(query);
      mq.addEventListener('change', cb);
      return () => mq.removeEventListener('change', cb);
    },
    () => window.matchMedia(query).matches,
    () => false,
  );
}

/** Desktop breakpoint used by the shell (sidebar layout). */
export const useDesktop = () => useMedia('(min-width: 1080px)');

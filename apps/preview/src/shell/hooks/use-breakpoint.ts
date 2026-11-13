import { useMemo, useSyncExternalStore } from 'react';

/** Whether the viewport is narrower than `width` pixels, kept current as it resizes. */
export function useBreakpoint(width: number): boolean {
  const { subscribe, getSnapshot } = useMemo(() => {
    const query = window.matchMedia(`(width < ${width}px)`);
    return {
      getSnapshot: () => query.matches,
      subscribe(listener: () => void) {
        query.addEventListener('change', listener);
        return () => query.removeEventListener('change', listener);
      },
    };
  }, [width]);

  return useSyncExternalStore(subscribe, getSnapshot);
}

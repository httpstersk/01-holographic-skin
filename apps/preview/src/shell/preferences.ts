import { useSyncExternalStore } from 'react';

export const PREFERENCE_QUERIES = [
  ['reduced motion', '(prefers-reduced-motion: reduce)'],
  ['reduced transparency', '(prefers-reduced-transparency: reduce)'],
  ['more contrast', '(prefers-contrast: more)'],
  ['forced colors', '(forced-colors: active)'],
  ['hover', '(hover: hover)'],
  ['coarse pointer', '(pointer: coarse)'],
  ['dark scheme', '(prefers-color-scheme: dark)'],
] as const;

export type PreferenceName = (typeof PREFERENCE_QUERIES)[number][0];

export type Preferences = Readonly<Record<PreferenceName, boolean>>;

const queries = PREFERENCE_QUERIES.map(([name, query]) => [name, matchMedia(query)] as const);
let snapshot: Preferences | undefined;

function getSnapshot(): Preferences {
  if (!snapshot || queries.some(([name, query]) => snapshot?.[name] !== query.matches)) {
    snapshot = Object.fromEntries(queries.map(([name, query]) => [name, query.matches])) as Preferences;
  }
  return snapshot;
}

function subscribe(listener: () => void) {
  for (const [, query] of queries) query.addEventListener('change', listener);
  return () => {
    for (const [, query] of queries) query.removeEventListener('change', listener);
  };
}

/** Keeps the browser's detected preferences current, including DevTools emulation. */
export function usePreferences(): Preferences {
  return useSyncExternalStore(subscribe, getSnapshot);
}

import { storageKey } from './config';

/** Storage can be blocked or full; every read falls back and every write is best effort. */
export function readStoredBoolean(key: string, fallback: boolean): boolean {
  try {
    const value = localStorage.getItem(`${storageKey}:${key}`);
    if (value === 'true') return true;
    if (value === 'false') return false;
  } catch {
    // Storage may be blocked.
  }
  return fallback;
}

export function writeStoredBoolean(key: string, value: boolean): void {
  try {
    localStorage.setItem(`${storageKey}:${key}`, String(value));
  } catch {
    // The value still applies for this visit.
  }
}

import { PARAMS_MESSAGE } from '../shell/messages';
import { applyDocumentParams, readParams, writeParams, type WorkbenchParams } from '../shell/params';
import { createUrlWriter } from '../shell/url';

const writeUrl = createUrlWriter();

// Read the frame's own URL first so it also works when opened in its own tab.
let params = readParams(location.hash.slice(1));
applyDocumentParams(params);

const listeners = new Set<() => void>();

window.addEventListener('message', (event: MessageEvent) => {
  if (event.source !== window.parent || event.origin !== location.origin) return;
  const { data } = event;
  if (data?.type !== PARAMS_MESSAGE || typeof data.query !== 'string') return;

  params = readParams(data.query);
  applyDocumentParams(params);
  // Keep the frame's URL current, so a reload reproduces the preview.
  writeUrl(`#${writeParams(params)}`);
  for (const listener of listeners) listener();
});

export function getParams(): WorkbenchParams {
  return params;
}

export function subscribeToParams(listener: () => void) {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

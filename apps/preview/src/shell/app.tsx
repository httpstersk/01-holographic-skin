import { SidebarProvider } from '@preview/shell/components/ui/sidebar';
import { useCallback, useId, useRef, useState } from 'react';

import { skin } from './config';
import { PARAMS_MESSAGE } from './messages';
import { Navbar } from './navbar';
import { OptionsPanel } from './options-panel';
import { readParams, writeParams, type WorkbenchParams } from './params';
import { usePreferences } from './preferences';
import { readStoredBoolean, writeStoredBoolean } from './storage';
import { createUrlWriter } from './url';

const writeUrl = createUrlWriter();
const initialParams = readParams(location.search);
const initialQuery = writeParams(initialParams);
// Keep the initial frame URL stable so later option changes never reload the player.
const frameUrl = `./preview.html#${initialQuery}`;

function applyScheme(scheme: WorkbenchParams['scheme']) {
  if (scheme === 'auto') delete document.documentElement.dataset.colorScheme;
  else document.documentElement.dataset.colorScheme = scheme;
}

applyScheme(initialParams.scheme);
writeUrl(`?${initialQuery}`);

/**
 * A slimmed-down Video.js sandbox for one skin: the options panel sets how the preview looks, and the preview frame
 * renders the skin on its own page so the shell's styles never reach it.
 */
export function App() {
  const optionsId = useId();
  const frame = useRef<HTMLIFrameElement>(null);
  const [params, setParams] = useState(initialParams);
  // The iframe can load before React commits the latest input events.
  const latestParams = useRef(initialParams);
  const [optionsOpen, setOptionsOpen] = useState(() => readStoredBoolean('options-open', true));
  const preferences = usePreferences();
  const query = writeParams(params);
  const updateOptionsOpen = useCallback((open: boolean) => {
    writeStoredBoolean('options-open', open);
    setOptionsOpen(open);
  }, []);

  function sendParams(nextQuery: string) {
    frame.current?.contentWindow?.postMessage({ type: PARAMS_MESSAGE, query: nextQuery }, location.origin);
  }

  function update(value: Partial<WorkbenchParams>) {
    const next = { ...latestParams.current, ...value };
    const nextQuery = writeParams(next);
    latestParams.current = next;
    setParams(next);
    applyScheme(next.scheme);
    writeUrl(`?${nextQuery}`);
    sendParams(nextQuery);
  }

  return (
    <SidebarProvider
      open={optionsOpen}
      onOpenChange={updateOptionsOpen}
      className="bg-background text-foreground h-screen min-h-0 flex-col overflow-hidden"
    >
      <Navbar previewUrl={`./preview.html#${query}`} optionsId={optionsId} />
      <div className="flex min-h-0 flex-1">
        <main className="flex min-h-0 min-w-0 flex-1 flex-col">
          <iframe
            ref={frame}
            src={frameUrl}
            onLoad={() => sendParams(writeParams(latestParams.current))}
            className="min-h-0 w-full flex-1 border-0"
            title={`${skin.name} preview`}
          />
        </main>
        <OptionsPanel id={optionsId} params={params} onParamsChange={update} preferences={preferences} />
      </div>
    </SidebarProvider>
  );
}

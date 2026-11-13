import { I18nProvider } from '@videojs/react/i18n';
import { type CSSProperties, StrictMode, useSyncExternalStore } from 'react';
import { createRoot } from 'react-dom/client';

import '@/skin.css';
import './preview.css';
import { playbackProps, playerDirection, playerStyles } from '../shell/params';
import { getParams, subscribeToParams } from './frame';
import { Player } from './player';

function Preview() {
  const params = useSyncExternalStore(subscribeToParams, getParams);

  return (
    // The provider loads Video.js's built-in translations for the selected language.
    <I18nProvider locale={params.locale}>
      <div className="preview-player" style={playerStyles(params) as CSSProperties}>
        <Player dir={playerDirection(params)} media={playbackProps(params)} />
      </div>
    </I18nProvider>
  );
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <Preview />
  </StrictMode>
);

/** @jsxImportSource react */

import { Controls } from '@videojs/react';

import { SeekButton } from './shared/seek-button';
import { SettingsMenu } from './shared/settings-menu';
import type { ThumbnailSlot } from './shared/time-slider';
import { VideoControlsContent } from './shared/video-controls';

export function VideoControls({ renderThumbnail }: ThumbnailSlot = {}) {
  return (
    <Controls.Root>
      <VideoControlsContent
        center
        menu={<SettingsMenu />}
        renderThumbnail={renderThumbnail}
        seekBackward={
          <SeekButton
            className={'m-0! hidden size-10! pointer-fine:grid'}
            iconClassName={'size-4.5'}
            seconds={-10}
            tooltip={false}
          />
        }
        seekForward={
          <SeekButton
            className={'m-0! hidden size-10! pointer-fine:grid'}
            iconClassName={'size-4.5'}
            seconds={10}
            tooltip={false}
          />
        }
      />
    </Controls.Root>
  );
}

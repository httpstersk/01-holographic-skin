/** @jsxImportSource react */

import { Controls, Tooltip } from '@videojs/react';

import { cn } from '@/lib/resolve-class-name';

import { HoloFoil } from './holo/foil-layer';
import { CaptionsToggle } from './shared/captions-button';
import { PlayButton } from './shared/play-button';
import { FullscreenButton, ScreenControls } from './shared/screen-controls';
import { SettingsMenu } from './shared/settings-menu';
import { TimeElapsed, TimeTotal } from './shared/time-display';
import { type ThumbnailSlot, TimeSlider } from './shared/time-slider';
import { Tone } from './shared/tone';
import { VideoBufferingIndicator } from './shared/video-feedback';
import { VolumePopover } from './shared/volume-popover';

/** Idle controls ignore the pointer, so the picture stays clickable. */
const LIVE = 'group-not-data-visible/controls:pointer-events-none pointer-events-auto';

/**
 * A lit foil bar with black ink along the bottom, and the cast, AirPlay, and picture-in-picture plates above it. Hover
 * flips a control to black with the foil showing through its ink (see `skin.css`).
 */
export function VideoControls({ renderThumbnail }: ThumbnailSlot = {}) {
  return (
    <Controls.Root>
      {/* No scrim over the picture: every control carries its own opaque plate. */}
      <VideoBufferingIndicator />
      <Controls.Content
        data-scaled=""
        className={cn(
          // Isolated, so the foil layer multiplies into the controls and never into the picture.
          'group/controls pointer-events-none absolute inset-0 z-30 isolate',
          // The controls fade as one surface. Idle hides them; keyboard focus inside them does not.
          'transition-opacity duration-media-controls ease-out [&:not([data-visible]):not(:has(:focus-visible))]:opacity-0'
        )}
      >
        <Tooltip.Provider>
          <Controls.Group className={cn(LIVE, 'absolute end-3 top-3 flex items-center gap-1.5')}>
            <ScreenControls className={'size-9! rounded-full!'} />
          </Controls.Group>

          <Tone tone="ghost">
            <div
              data-holo=""
              data-aurora=""
              className={cn(
                LIVE,
                'absolute inset-x-3 bottom-3 flex h-13 items-center gap-1 rounded-[20px] px-2 shadow-(--media-shadow-surface)',
                'bg-media-foreground text-media-background media-md:inset-x-4 media-md:bottom-4',
                'forced-colors:rounded-none forced-colors:bg-[Canvas] forced-colors:text-[CanvasText]'
              )}
            >
              <PlayButton
                className={'m-0! size-10! rounded-full! bg-media-background! text-media-foreground!'}
                iconClassName={'size-5!'}
              />
              <TimeElapsed className={'ms-1.5 hidden min-w-11 justify-end media-xs:flex'} />
              <TimeSlider
                renderThumbnail={renderThumbnail}
                className={'mx-2 [--trk-bg:#15151b] [--hit:1.75rem] [--thumb:1rem] [--trk-hover:0.625rem] [--trk:0.5rem]'}
              />
              <TimeTotal className={'me-1.5 hidden min-w-11 media-sm:flex'} />
              <VolumePopover buttonClassName={'hidden size-9! rounded-full! media-md:grid'} iconClassName={'size-5!'} />
              <CaptionsToggle className={'hidden size-9! rounded-full! media-sm:grid'} />
              <SettingsMenu buttonClassName={'size-9! rounded-full!'} />
              <FullscreenButton className={'size-9! rounded-full!'} iconClassName={'size-5!'} />
            </div>
          </Tone>
        </Tooltip.Provider>
        <HoloFoil />
      </Controls.Content>
    </Controls.Root>
  );
}

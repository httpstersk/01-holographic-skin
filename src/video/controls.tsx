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

/** Bar buttons sit edge to edge; on touch the bar and its buttons grow to 44px instead of reaching into a neighbor. */
const BAR_BUTTON = 'size-9! rounded-full! pointer-coarse:size-11! pointer-coarse:before:hidden';

/**
 * A slim foil pill in the Mux logo's finish, with black ink on it, and the cast, AirPlay, and picture-in-picture plates
 * above it. The pill is opaque, so it needs no shadow or border to stand off the picture. Hover flips a control to a
 * black disc with the foil showing through its icon.
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
            <ScreenControls className={'size-9! rounded-full! pointer-coarse:size-11!'} />
          </Controls.Group>

          <Tone tone="ghost">
            <div
              data-holo=""
              className={cn(
                LIVE,
                'absolute inset-x-3 bottom-3 flex h-11 items-center rounded-full p-1 pointer-coarse:h-13',
                'bg-media-foreground text-media-background media-md:inset-x-4 media-md:bottom-4',
                'forced-colors:rounded-none forced-colors:bg-[Canvas] forced-colors:text-[CanvasText]'
              )}
            >
              <PlayButton className={cn(BAR_BUTTON, 'bg-media-background! text-media-foreground!')} />
              <TimeElapsed className={'ms-2 hidden min-w-11 justify-end media-xs:flex'} />
              <TimeSlider
                renderThumbnail={renderThumbnail}
                className={cn(
                  'mx-3 [--hit:calc(var(--spacing)*9)] [--thumb:calc(var(--spacing)*3.5)]',
                  '[--trk:calc(var(--spacing)*1.5)] [--trk-hover:calc(var(--spacing)*2)]',
                  '[--buffer:calc(var(--spacing)*1)] [--rail:calc(var(--spacing)*0.5)]'
                )}
              />
              <TimeTotal className={'me-2 hidden min-w-11 media-sm:flex'} />
              <VolumePopover buttonClassName={cn(BAR_BUTTON, 'hidden media-md:grid')} />
              <CaptionsToggle className={cn(BAR_BUTTON, 'hidden media-sm:grid')} />
              <SettingsMenu buttonClassName={BAR_BUTTON} />
              <FullscreenButton className={BAR_BUTTON} />
            </div>
          </Tone>
        </Tooltip.Provider>
        <HoloFoil />
      </Controls.Content>
    </Controls.Root>
  );
}

/** @jsxImportSource react */

import { Time, Controls, BufferingIndicator, Tooltip } from '@videojs/react';
import type { ReactNode } from 'react';

import { cn } from '@/lib/resolve-class-name';

import { HoloFoil } from '../holo/foil-layer';
import { LiveButton } from './live-button';
import { AudioPlayButton, PlayButton } from './play-button';
import { FullscreenButton } from './screen-controls';
import { SeekButton } from './seek-button';
import { TimeSlider, type ThumbnailSlot } from './time-slider';
import { Title } from './title';
import { VolumePopover } from './volume-popover';

export interface ControlsSlots extends ThumbnailSlot {
  /** The captions toggle, supplied by the video presets because the audio presets have no text track feature. */
  captions?: ReactNode;
  /** The playback-rate control, supplied by the on-demand audio preset. */
  rate?: ReactNode;
  /** The skip-back control, supplied by the presets that have a timeline. */
  seekBackward?: ReactNode;
  /** The skip-forward control, supplied by the presets that have a timeline. */
  seekForward?: ReactNode;
}

export function ControlsContent({
  audio = false,
  captions,
  center = false,
  live = false,
  menu,
  rate,
  renderThumbnail,
  seekBackward,
  seekForward,
  top,
}: ControlsSlots & { audio?: boolean; center?: boolean; live?: boolean; menu?: ReactNode; top?: ReactNode } = {}) {
  return (
    <Controls.Content
      className={cn(
        // Isolated, so the foil layer multiplies into the controls and never into the picture.
        'group/controls pointer-events-none absolute inset-0 z-30 isolate',
        // The controls fade as one surface. Idle hides them; keyboard focus inside them does not.
        'transition-opacity duration-media-controls ease-out [&:not([data-visible]):not(:has(:focus-visible))]:opacity-0',
        audio && 'relative! inset-auto!'
      )}
    >
      <Tooltip.Provider>
        {/* Top-Right Floating Pebble Trio (AirPlay / Cast / PiP) */}
        {top && (
          <Controls.Group
            className={cn(
              'group-not-data-visible/controls:pointer-events-none pointer-events-auto absolute right-3 top-3 flex items-center rtl:flex-row-reverse gap-1.5',
              'forced-colors:rounded-none forced-colors:bg-[Canvas]'
            )}
          >
            {top}
          </Controls.Group>
        )}

        {/* Center Bouncy Squircle Bubble Triad */}
        {center && (
          <BufferingIndicator className={'group/center-buffering contents'}>
            <Controls.Group
              className={cn(
                'group-not-data-visible/controls:pointer-events-none pointer-events-auto absolute left-1/2 top-1/2 hidden -translate-x-1/2 -translate-y-1/2 items-center rtl:flex-row-reverse gap-3 media-360:flex',
                'forced-colors:bg-transparent!',
                'group-data-visible/center-buffering:hidden!'
              )}
            >
              {seekBackward}
              <PlayButton
                className={cn(
                  'm-0! size-17! rounded-[24px]! border-2 border-media-foreground! bg-media-foreground! text-media-background! shadow-[0_12px_28px_rgb(0_0_0/0.6)]',
                  'motion-safe:hover:scale-110 motion-safe:active:scale-92',
                  'forced-colors:bg-[ButtonFace]! forced-colors:text-[ButtonText]!',
                  'forced-colors:hover:bg-[Highlight]! forced-colors:focus-visible:bg-[Highlight]! forced-colors:aria-expanded:bg-[Highlight]!'
                )}
                iconClassName={'size-7.5!'}
                tooltip={false}
              />
              {seekForward}
            </Controls.Group>
          </BufferingIndicator>
        )}

        {/* Bottom Asymmetric Bento Cluster */}
        <div
          data-holo=""
          className={cn(
            'group-not-data-visible/controls:pointer-events-none pointer-events-auto absolute inset-x-2.5 bottom-2.5 flex items-end gap-2 rounded-[26px] border border-solid border-media-edge bg-media-background p-2 shadow-(--media-shadow-surface)',
            'media-sm:inset-x-4 media-sm:bottom-3.5 media-sm:gap-2.5 media-sm:p-2.5',
            'forced-colors:rounded-none forced-colors:bg-[Canvas]',
            audio && 'static! p-3',
            !audio && 'forced-colors:inset-x-0 forced-colors:bottom-0 forced-colors:rounded-none!'
          )}
        >
          {/* Left Bookend: Giant Squircle-Bubble Play Button */}
          {audio ? (
            <AudioPlayButton />
          ) : (
            <PlayButton
              className={
                'size-13.5! shrink-0 rounded-[20px]! border-2 border-media-foreground! bg-media-foreground! text-media-background!'
              }
              iconClassName={'size-6.5!'}
            />
          )}

          {/* Middle Bento Column: Upper Micro-Pebble Shelf + Lower Chubby Capsule Scrubber */}
          <div className={'flex min-w-0 flex-1 flex-col gap-1.5'}>
            <div className={'flex items-center justify-between gap-1.5'}>
              <div className={'flex min-w-0 items-center gap-1.5'}>
                <Title />
                {!live && (
                  <>
                    <SeekButton
                      seconds={-10}
                      tooltip={false}
                      className={'m-0! hidden size-8.5! rounded-full pointer-fine:grid'}
                      iconClassName={'size-4!'}
                      labelClassName={'text-[7px] bottom-[-2px]'}
                    />
                    <SeekButton
                      seconds={10}
                      tooltip={false}
                      className={'m-0! hidden size-8.5! rounded-full pointer-fine:grid'}
                      iconClassName={'size-4!'}
                      labelClassName={'text-[7px] bottom-[-2px]'}
                    />
                  </>
                )}
                {live && <LiveButton />}
              </div>

              {!live && (
                <Time.Group
                  data-holo=""
                  className={
                    'flex h-8 shrink-0 items-center rtl:flex-row-reverse gap-1 rounded-full border border-media-edge/70 bg-[#101015] px-3 text-media-xs leading-none font-medium tracking-normal tabular-nums'
                  }
                >
                  <Time.Value
                    className={cn(
                      'cursor-pointer rounded-none media-xs:hidden outline-none focus-visible:outline-2 focus-visible:outline-solid focus-visible:outline-offset-2 focus-visible:outline-media-ring',
                      'data-disabled:cursor-not-allowed data-disabled:opacity-40 forced-colors:data-disabled:text-[GrayText] forced-colors:data-disabled:opacity-100'
                    )}
                    type="current"
                    toggle
                  />
                  <Time.Value className={'hidden media-xs:inline data-unavailable:opacity-50'} type="current" />
                  <Time.Separator className={'hidden opacity-55 media-xs:inline data-unavailable:opacity-50'} />
                  <Time.Value
                    className={'hidden opacity-65 media-xs:inline data-unavailable:opacity-50'}
                    type="duration"
                  />
                </Time.Group>
              )}
            </div>

            {!live && <TimeSlider audio={audio} renderThumbnail={renderThumbnail} />}
          </div>

          {/* Right Bookend Bento Cluster: Varied Pebble Sizes */}
          <Controls.Group className={'flex shrink-0 items-center rtl:flex-row-reverse gap-1.5'}>
            {!audio && (
              <VolumePopover
                buttonClassName={'size-11! rounded-[16px]!'}
                iconClassName={'size-5!'}
              />
            )}
            {captions}
            {rate}
            {menu ?? (audio && <VolumePopover />)}
            {!audio && (
              <FullscreenButton
                className={'size-12.5! rounded-[18px]! border-media-foreground/80'}
                iconClassName={'size-5.5!'}
              />
            )}
          </Controls.Group>
        </div>
      </Tooltip.Provider>
      <HoloFoil />
    </Controls.Content>
  );
}

/** @jsxImportSource react */

import { Time, Controls, BufferingIndicator, Tooltip } from '@videojs/react';
import type { ReactNode } from 'react';

import { cn } from '@/lib/resolve-class-name';

import { HoloFoil } from '../holo/foil-layer';
import { LiveButton } from './live-button';
import { AudioPlayButton, PlayButton } from './play-button';
import { TimeSlider } from './time-slider';
import { type ThumbnailSlot } from './time-slider';
import { VolumePopover } from './volume-popover';

export function ControlsRow({
  audio = false,
  captions,
  live = false,
  menu,
  rate,
  seekBackward,
  seekForward,
}: ControlsSlots & { audio?: boolean; live?: boolean; menu?: ReactNode } = {}) {
  return (
    <Controls.Group className={'flex items-center rtl:flex-row-reverse justify-between gap-2 pointer-coarse:gap-3'}>
      <Controls.Group className={cn('flex items-center rtl:flex-row-reverse gap-2 pointer-coarse:gap-3', 'min-w-0')}>
        {audio ? <AudioPlayButton /> : <PlayButton />}
        {seekBackward}
        {seekForward}
        {live && <LiveButton />}
        {!audio && <VolumePopover />}
        {!live && (
          <Time.Group
            className={
              'flex h-8 shrink-0 items-center rtl:flex-row-reverse gap-1 px-1 text-media leading-none tracking-normal tabular-nums'
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
            <Time.Separator className={'hidden opacity-70 media-xs:inline data-unavailable:opacity-50'} />
            <Time.Value className={'hidden opacity-70 media-xs:inline data-unavailable:opacity-50'} type="duration" />
          </Time.Group>
        )}
      </Controls.Group>

      <Controls.Group className={'flex items-center rtl:flex-row-reverse gap-2 pointer-coarse:gap-3'}>
        {captions}
        {rate}
        {menu ?? (audio && <VolumePopover />)}
      </Controls.Group>
    </Controls.Group>
  );
}

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
        {top && (
          <Controls.Group
            className={cn(
              'group-not-data-visible/controls:pointer-events-none pointer-events-auto absolute inset-x-0 top-0 p-2 media-xs:p-3 flex items-center rtl:flex-row-reverse justify-end gap-2 pointer-coarse:gap-3',
              'forced-colors:rounded-none forced-colors:bg-[Canvas]',
              'forced-colors:inset-x-0 forced-colors:top-0 forced-colors:justify-end forced-colors:rounded-none!',
              'forced-colors:inset-e-0'
            )}
          >
            {top}
          </Controls.Group>
        )}
        {center && (
          <BufferingIndicator className={'group/center-buffering contents'}>
            <Controls.Group
              className={cn(
                'group-not-data-visible/controls:pointer-events-none pointer-events-auto absolute left-1/2 top-1/2 hidden transform-[translate(-50%,-50%)] items-center rtl:flex-row-reverse gap-3 media-360:flex',
                'forced-colors:bg-transparent!',
                'group-data-visible/center-buffering:hidden!'
              )}
            >
              {seekBackward}
              <PlayButton
                className={cn(
                  // The one solid foil surface: a coin with the glyph cut out of it.
                  'm-0! size-14.5! border-media-foreground! bg-media-foreground! text-media-background!',
                  'motion-safe:hover:scale-[1.05] motion-safe:active:scale-[0.96]',
                  'forced-colors:bg-[ButtonFace]! forced-colors:text-[ButtonText]!',
                  'forced-colors:hover:bg-[Highlight]! forced-colors:focus-visible:bg-[Highlight]! forced-colors:aria-expanded:bg-[Highlight]!'
                )}
                iconClassName={'size-7!'}
                tooltip={false}
              />
              {seekForward}
            </Controls.Group>
          </BufferingIndicator>
        )}
        {/* The dock: one black card, inset from the frame, holding the track and the row beneath it. */}
        <div
          data-holo=""
          className={cn(
            'group-not-data-visible/controls:pointer-events-none pointer-events-auto absolute inset-x-2 bottom-2 flex flex-col gap-2 p-2',
            'media-xs:inset-x-3 media-xs:bottom-3 media-xs:px-3 media-xs:pt-3 media-xs:pb-2.5',
            'rounded-media-controls border border-solid border-media-edge bg-media-background shadow-(--media-shadow-surface)',
            'forced-colors:rounded-none forced-colors:bg-[Canvas]',
            audio && 'static! p-3',
            !audio && 'forced-colors:inset-x-0 forced-colors:bottom-0 forced-colors:rounded-none!'
          )}
        >
          {!live && <TimeSlider audio={audio} renderThumbnail={renderThumbnail} />}
          <ControlsRow
            audio={audio}
            captions={captions}
            live={live}
            menu={menu}
            rate={rate}
            seekBackward={center ? undefined : seekBackward}
            seekForward={center ? undefined : seekForward}
          />
        </div>
      </Tooltip.Provider>
      <HoloFoil />
    </Controls.Content>
  );
}

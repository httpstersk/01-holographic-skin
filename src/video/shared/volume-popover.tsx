/** @jsxImportSource react */

import { VolumePopover as VolumePopoverPrimitive, VolumeSlider } from '@videojs/react';
import type { ClassValue } from 'cn';

import { cn } from '@/lib/resolve-class-name';

import { MuteButton, type MuteButtonProps } from './mute-button';
import { ButtonTooltip } from './tooltip';

export function VolumePopover({
  buttonClassName,
  iconClassName,
}: {
  buttonClassName?: MuteButtonProps['className'];
  iconClassName?: ClassValue;
} = {}) {
  return (
    <VolumePopoverPrimitive.Root openOnHover delay={160} closeDelay={100} side="top">
      <ButtonTooltip delay={0} disabled sticky>
        <VolumePopoverPrimitive.Trigger
          render={<MuteButton className={buttonClassName} iconClassName={iconClassName} />}
        />
      </ButtonTooltip>
      <VolumePopoverPrimitive.Popup
        className={cn(
          'm-0 overflow-visible border-0 text-inherit',
          'media-transitioning:opacity-0 media-transitioning:blur-media-hidden-popup media-transitioning:scale-media-hidden-popup',
          'data-starting-style:transform-[translate(var(--media-popup-translate-x-distance,0),var(--media-popup-translate-y-distance,0))]',
          'data-ending-style:transform-none',
          'data-[side=top]:origin-bottom data-[side=bottom]:origin-top data-[side=left]:origin-right data-[side=right]:origin-left',
          'data-[side=top]:[--media-popup-translate-y-distance:var(--media-popup-translate-distance)]',
          'data-[side=bottom]:[--media-popup-translate-y-distance:calc(var(--media-popup-translate-distance)*-1)]',
          'data-[side=left]:[--media-popup-translate-x-distance:var(--media-popup-translate-distance)]',
          'data-[side=right]:[--media-popup-translate-x-distance:calc(var(--media-popup-translate-distance)*-1)]',
          'before:pointer-events-auto before:absolute',
          'data-[side=top]:before:inset-x-0 data-[side=top]:before:top-full data-[side=top]:before:h-3',
          'z-20 h-28 w-8 rounded-media-control foil-edge-media px-3.5 py-3.5 text-media-popover-foreground transition-media-popup',
          '[--media-popup-side-offset:calc(var(--media-spacing)*3)] [--media-popover-side-offset:calc(var(--media-spacing)*3)]',
          'media-high-contrast:outline forced-colors:outline'
        )}
      >
        <VolumeSlider.Root
          className={
            "[--media-accent:var(--media-accent-color,var(--media-popover-foreground))] relative flex size-full cursor-pointer touch-none items-center justify-center data-disabled:cursor-not-allowed data-disabled:opacity-40 before:absolute before:-inset-3 before:content-['']"
          }
          orientation="vertical"
          thumbAlignment="edge"
        >
          <VolumeSlider.Track
            className={cn(
              'relative h-full w-1.5 overflow-hidden rounded-media-pill bg-(--media-holo-buffer) forced-colors:forced-color-adjust-none',
              'forced-colors:bg-[Canvas] forced-colors:border forced-colors:border-solid forced-colors:border-[CanvasText]'
            )}
          >
            <VolumeSlider.Fill
              className={
                'absolute bottom-0 left-0 h-[var(--media-slider-fill,0%)] w-full rounded-none bg-media-accent forced-colors:bg-[Highlight] forced-colors:forced-color-adjust-none'
              }
            />
          </VolumeSlider.Track>
          <VolumeSlider.Thumb
            className={cn(
              'absolute bottom-[var(--media-slider-fill,0%)] left-1/2 h-2 w-4 transform-[translate(-50%,50%)] rounded-media-pill bg-media-popover-foreground shadow-media-thumb',
              'outline-none focus-visible:outline-2 focus-visible:outline-solid focus-visible:outline-offset-2 focus-visible:outline-media-ring',
              'forced-colors:bg-[Highlight] forced-colors:forced-color-adjust-none',
              'forced-colors:border forced-colors:border-solid forced-colors:border-[CanvasText]'
            )}
          />
        </VolumeSlider.Root>
      </VolumePopoverPrimitive.Popup>
    </VolumePopoverPrimitive.Root>
  );
}

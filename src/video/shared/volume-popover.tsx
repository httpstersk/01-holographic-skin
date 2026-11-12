/** @jsxImportSource react */

import { selectVolume } from '@videojs/core/dom';
import { labelText } from '@videojs/core/i18n/text/volume';
import { Popover, usePlayer, VolumeSlider } from '@videojs/react';
import { useTranslator } from '@videojs/react/i18n';
import { useRef, useState } from 'react';

import { Button } from './button';
import { SwitchesIcon } from './icons';
import { ButtonTooltip } from './tooltip';

/** Volume level and mute are separate actions. On devices with system-only volume, the mute button remains. */
export function VolumePopover({ buttonClassName }: { buttonClassName?: string }) {
  const canSetVolume = usePlayer((state) => selectVolume(state)?.volumeAvailability === 'available');
  const t = useTranslator();
  const label = t(labelText.key, { default: labelText.text });
  const trigger = useRef<HTMLButtonElement>(null);
  const [open, setOpen] = useState(false);

  if (!canSetVolume) return null;

  return (
    <div onBlur={(event) => {
      if (event.relatedTarget && !event.currentTarget.contains(event.relatedTarget)) setOpen(false);
    }}>
      <Popover.Root
        open={open}
        side="top"
        onOpenChange={(nextOpen, { reason }) => {
          setOpen(nextOpen);
          if (reason === 'escape') trigger.current?.focus({ preventScroll: true });
        }}
      >
        <ButtonTooltip disabled={open} label={label}>
          <Popover.Trigger ref={trigger} aria-label={label} render={<Button className={buttonClassName} />}>
            <SwitchesIcon className="size-4.5" />
          </Popover.Trigger>
        </ButtonTooltip>
        <Popover.Popup
          aria-label={label}
          className="pointer-events-auto z-20 m-0 w-40 max-w-(--media-popover-available-width) rounded-media-popup card-media px-3 text-media-popover-foreground shadow-media-hairline transition-opacity duration-media-fast media-transitioning:opacity-0 motion-reduce:transition-none forced-colors:outline"
        >
          <VolumeSlider.Root
            className="relative flex h-[max(44px,--spacing(9))] w-full cursor-pointer touch-none items-center data-disabled:cursor-not-allowed data-disabled:opacity-40"
            thumbAlignment="edge"
          >
            <VolumeSlider.Track className="relative h-1.5 w-full overflow-hidden rounded-media-pill bg-(--media-holo-track) forced-colors:border-[CanvasText] forced-colors:bg-[Canvas] forced-colors:border forced-colors:forced-color-adjust-none">
              <VolumeSlider.Fill className="absolute inset-y-0 left-0 w-(--media-slider-fill) bg-(--media-accent-color,var(--media-popover-foreground)) forced-colors:bg-[Highlight] forced-colors:forced-color-adjust-none" />
            </VolumeSlider.Track>
            <VolumeSlider.Thumb className="absolute left-(--media-slider-fill) size-3.5 -translate-x-1/2 rounded-full bg-media-popover-foreground outline-none focus-visible:focus-holo forced-colors:bg-[Highlight] forced-colors:forced-color-adjust-none" />
          </VolumeSlider.Root>
        </Popover.Popup>
      </Popover.Root>
    </div>
  );
}

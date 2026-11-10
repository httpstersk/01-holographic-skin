/** @jsxImportSource react */

import { Tooltip } from '@videojs/react';
import type { ClassValue } from 'cn';
import type { ReactElement, ReactNode } from 'react';

import { cn } from '@/lib/resolve-class-name';

export function ButtonTooltip({
  children,
  delay,
  disabled,
  label,
  popupClassName,
  sticky,
}: {
  children: ReactElement;
  delay?: number;
  disabled?: boolean;
  label?: ReactNode;
  popupClassName?: ClassValue;
  sticky?: boolean;
}) {
  return (
    <Tooltip.Root delay={delay} disabled={disabled} side="top" sticky={sticky}>
      <Tooltip.Trigger render={children} />
      <Tooltip.Popup
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
          'data-[side=top]:before:inset-x-0 data-[side=top]:before:top-full',
          'data-[side=bottom]:before:inset-x-0 data-[side=bottom]:before:bottom-full',
          'data-[side=left]:before:inset-y-0 data-[side=left]:before:left-full',
          'data-[side=right]:before:inset-y-0 data-[side=right]:before:right-full',
          'data-[side=top]:before:h-(--media-popup-side-offset) data-[side=bottom]:before:h-(--media-popup-side-offset)',
          'data-[side=left]:before:w-(--media-popup-side-offset) data-[side=right]:before:w-(--media-popup-side-offset)',
          'pointer-events-none z-20 whitespace-nowrap rounded-media-control foil-edge-media px-2.5 py-1 text-media-popover-foreground transition-media-popup',
          '[--media-popup-side-offset:var(--media-tooltip-side-offset)] [--media-tooltip-side-offset:calc(var(--media-spacing)*4)]',
          'data-open:flex data-open:items-center data-open:gap-1',
          'media-high-contrast:outline forced-colors:outline',
          popupClassName
        )}
      >
        {label ?? <Tooltip.Label />}
        {!label && (
          <Tooltip.Shortcut
            className={
              'min-w-[1.5em] rounded-[3px] bg-media-muted px-[0.3em] py-[0.1em] text-center text-media-sm [font-family:inherit] leading-tight'
            }
          />
        )}
      </Tooltip.Popup>
    </Tooltip.Root>
  );
}

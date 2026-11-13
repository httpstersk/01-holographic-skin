/** @jsxImportSource react */

import { Tooltip } from '@videojs/react';
import type { ClassValue } from 'cn';
import type { ReactElement, ReactNode } from 'react';

import { cn } from '@/lib/resolve-class-name';
import { popupClass } from '@/video/shared/popup-styles';

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
          popupClass,
          'pointer-events-none z-20 whitespace-nowrap rounded-media-control card-media px-2.5 py-1 text-media-popover-foreground transition-media-popup',
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

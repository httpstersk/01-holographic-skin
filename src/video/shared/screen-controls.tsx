/** @jsxImportSource react */

import {
  CastButton as CastButtonPrimitive,
  PiPButton as PiPButtonPrimitive,
  FullscreenButton as FullscreenButtonPrimitive,
} from '@videojs/react';
import {
  CastEnterIcon as CastEnterIconPrimitive,
  CastExitIcon as CastExitIconPrimitive,
  PipEnterIcon as PipEnterIconPrimitive,
  PipExitIcon as PipExitIconPrimitive,
  FullscreenEnterIcon as FullscreenEnterIconPrimitive,
  FullscreenExitIcon as FullscreenExitIconPrimitive,
} from '@videojs/react/icons/scaffold';
import type { ClassValue } from 'cn';

import { cn, resolveClassName } from '@/lib/resolve-class-name';

import { AirPlayButton } from './airplay-button';
import { Button } from './button';
import { ButtonTooltip } from './tooltip';

export function CastButton({ className }: { className?: ClassValue } = {}) {
  return (
    <ButtonTooltip popupClassName={'[--media-tooltip-side-offset:calc(var(--media-spacing)*3)]!'}>
      <CastButtonPrimitive
        render={<Button />}
        className={(state) => cn('group/cast', resolveClassName(className, state))}
      >
        <CastEnterIconPrimitive
          className={cn('col-start-1 row-start-1 size-4.5', 'group-data-[cast-state=connected]/cast:hidden')}
        />
        <CastExitIconPrimitive
          className={cn('col-start-1 row-start-1 size-4.5', 'hidden group-data-[cast-state=connected]/cast:block')}
        />
      </CastButtonPrimitive>
    </ButtonTooltip>
  );
}

export function PiPButton({ className }: { className?: ClassValue } = {}) {
  return (
    <ButtonTooltip popupClassName={'[--media-tooltip-side-offset:calc(var(--media-spacing)*3)]!'}>
      <PiPButtonPrimitive
        render={<Button />}
        className={(state) => cn('group/pip', resolveClassName(className, state))}
      >
        <PipEnterIconPrimitive className={cn('col-start-1 row-start-1 size-4.5', 'group-data-pip/pip:hidden')} />
        <PipExitIconPrimitive className={cn('col-start-1 row-start-1 size-4.5', 'hidden group-data-pip/pip:block')} />
      </PiPButtonPrimitive>
    </ButtonTooltip>
  );
}

export function FullscreenButton({
  className,
  iconClassName,
}: {
  className?: ClassValue;
  iconClassName?: ClassValue;
} = {}) {
  return (
    <ButtonTooltip popupClassName={'[--media-tooltip-side-offset:calc(var(--media-spacing)*3)]!'}>
      <FullscreenButtonPrimitive
        render={<Button />}
        className={(state) => cn('group/fullscreen', resolveClassName(className, state))}
      >
        <FullscreenEnterIconPrimitive
          className={cn(
            'col-start-1 row-start-1 size-4.5',
            'hidden group-not-data-fullscreen/fullscreen:block',
            iconClassName
          )}
        />
        <FullscreenExitIconPrimitive
          className={cn(
            'col-start-1 row-start-1 size-4.5',
            'hidden group-data-fullscreen/fullscreen:block',
            iconClassName
          )}
        />
      </FullscreenButtonPrimitive>
    </ButtonTooltip>
  );
}

export function ScreenControls({ className = 'size-9! rounded-[13px]!' }: { className?: ClassValue } = {}) {
  return (
    <>
      <AirPlayButton
        className={className}
        popupClassName={'[--media-tooltip-side-offset:calc(var(--media-spacing)*3)]!'}
      />
      <CastButton className={className} />
      <PiPButton className={className} />
    </>
  );
}

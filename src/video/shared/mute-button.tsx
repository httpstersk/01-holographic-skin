/** @jsxImportSource react */

import { MuteButton as MuteButtonPrimitive } from '@videojs/react';
import {
  VolumeOffIcon as VolumeOffIconPrimitive,
  VolumeHighIcon as VolumeHighIconPrimitive,
} from '@/video/shared/icons';
import type { ClassValue } from 'cn';

import { cn, resolveClassName } from '@/lib/resolve-class-name';

import { Button } from '@/video/shared/button';

/** Extends the player mute control with styling for its glyphs. */
export type MuteButtonProps = MuteButtonPrimitive.Props & { iconClassName?: ClassValue };

/** Shows the current volume state on the player mute control. */
export function MuteButton({ className, iconClassName, ...props }: MuteButtonProps = {}) {
  return (
    <MuteButtonPrimitive
      className={(state) => cn('group/mute', resolveClassName(className, state))}
      render={<Button />}
      {...props}
    >
      <VolumeOffIconPrimitive
        className={cn('col-start-1 row-start-1 size-4.5', 'hidden group-data-muted/mute:block', iconClassName)}
      />
      <VolumeHighIconPrimitive
        className={cn('col-start-1 row-start-1 size-4.5', 'hidden group-not-data-muted/mute:block', iconClassName)}
      />
    </MuteButtonPrimitive>
  );
}

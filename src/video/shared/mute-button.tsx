/** @jsxImportSource react */

import { MuteButton as MuteButtonPrimitive } from '@videojs/react';
import {
  VolumeOffIcon as VolumeOffIconPrimitive,
  VolumeHighIcon as VolumeHighIconPrimitive,
} from '@videojs/react/icons/scaffold';
import type { ClassValue } from 'cn';

import { cn, resolveClassName } from '@/lib/resolve-class-name';

import { Button } from './button';

export type MuteButtonProps = MuteButtonPrimitive.Props & { iconClassName?: ClassValue };

export function MuteButton({ className, iconClassName, ...props }: MuteButtonProps = {}) {
  return (
    <MuteButtonPrimitive
      render={<Button />}
      className={(state) => cn('group/mute', resolveClassName(className, state))}
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

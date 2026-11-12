/** @jsxImportSource react */

import { PlayButton as PlayButtonPrimitive } from '@videojs/react';
import {
  RestartIcon as RestartIconPrimitive,
  PlayIcon as PlayIconPrimitive,
  PauseIcon as PauseIconPrimitive,
} from '@/video/shared/icons';
import type { ClassValue } from 'cn';

import { cn, resolveClassName } from '@/lib/resolve-class-name';

import { Button } from '@/video/shared/button';
import { ButtonTooltip } from '@/video/shared/tooltip';
import { BufferingIndicator } from '@/video/shared/video-feedback';

/** Renders the compact play control for audio layouts. */
export function AudioPlayButton() {
  return (
    <div className={'relative inline-flex'}>
      <PlayButton />
      <BufferingIndicator className={'z-20 bg-media-background'} />
    </div>
  );
}

/** Shows the playback action for the player's paused, playing, or ended state. */
export function PlayButton({
  className,
  iconClassName,
  tooltip = true,
  ...props
}: PlayButtonPrimitive.Props & { iconClassName?: ClassValue; tooltip?: boolean } = {}) {
  return (
    <ButtonTooltip disabled={!tooltip}>
      <PlayButtonPrimitive
        className={(state) => cn('group/play', resolveClassName(className, state))}
        render={<Button />}
        {...props}
      >
        <RestartIconPrimitive
          className={cn('col-start-1 row-start-1 hidden size-4.5', 'group-data-ended/play:block', iconClassName)}
        />
        <PlayIconPrimitive
          className={cn(
            'col-start-1 row-start-1 hidden size-4.5',
            'group-not-data-ended/play:group-data-paused/play:block',
            'group-not-data-ended/play:group-not-data-started/play:block',
            iconClassName
          )}
        />
        <PauseIconPrimitive
          className={cn(
            'col-start-1 row-start-1 hidden size-4.5',
            'group-data-started/play:group-not-data-paused/play:group-not-data-ended/play:block',
            iconClassName
          )}
        />
      </PlayButtonPrimitive>
    </ButtonTooltip>
  );
}

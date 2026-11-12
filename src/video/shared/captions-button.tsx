/** @jsxImportSource react */

import { CaptionsButton as CaptionsButtonPrimitive } from '@videojs/react';
import {
  CaptionsOffIcon as CaptionsOffIconPrimitive,
  CaptionsOnIcon as CaptionsOnIconPrimitive,
} from '@/video/shared/icons';

import { cn, resolveClassName } from '@/lib/resolve-class-name';

import { Button } from '@/video/shared/button';
import { ButtonTooltip } from '@/video/shared/tooltip';

/** Keeps the Video.js captions button API while the skin supplies its contents. */
export type CaptionsButtonProps = Omit<CaptionsButtonPrimitive.Props, 'children'>;

/** Renders the captions toggle with a glyph for each captions state. */
export function CaptionsButton({ className, ...props }: CaptionsButtonProps = {}) {
  return (
    <CaptionsButtonPrimitive
      className={(state) => cn('group/captions', resolveClassName(className, state))}
      render={<Button />}
      {...props}
    >
      <CaptionsOffIconPrimitive
        className={cn('col-start-1 row-start-1 size-4.5', 'group-data-active/captions:hidden')}
      />
      <CaptionsOnIconPrimitive
        className={cn('col-start-1 row-start-1 size-4.5', 'hidden group-data-active/captions:block')}
      />
    </CaptionsButtonPrimitive>
  );
}

/** Adds the player tooltip to the captions control. */
export function CaptionsToggle({ className }: { className?: CaptionsButtonProps['className'] } = {}) {
  return (
    <ButtonTooltip>
      <CaptionsButton className={className} />
    </ButtonTooltip>
  );
}

/** @jsxImportSource react */

import { Poster as PosterPrimitive } from '@videojs/react';
import { BufferingIndicator as BufferingIndicatorPrimitive, Controls } from '@videojs/react';
import { SpinnerIcon as SpinnerIconPrimitive } from '@/video/shared/icons';
import type { ClassValue } from 'cn';

import { cn, resolveClassName } from '@/lib/resolve-class-name';

/** Shows buffering feedback when Video.js reports a stalled playback state. */
export function BufferingIndicator({ className }: { className?: ClassValue } = {}) {
  return (
    <BufferingIndicatorPrimitive
      className={(state) =>
        cn(
          'pointer-events-none absolute inset-0 grid place-items-center not-data-visible:hidden not-data-visible:[--media-spinner-animation:none] motion-reduce:[--media-spinner-animation:none]',
          resolveClassName(className, state)
        )
      }
    >
      <span className={'grid size-14.5 place-items-center rounded-media-pill card-media'}>
        <SpinnerIconPrimitive className={'size-7'} />
      </span>
    </BufferingIndicatorPrimitive>
  );
}

/** Displays the video poster through the skin's optional image renderer. */
export function Poster({ renderImage }: { renderImage?: PosterPrimitive.ImageProps['render'] } = {}) {
  return (
    <PosterPrimitive.Root className={'absolute inset-0 size-full not-data-visible:hidden'}>
      <PosterPrimitive.Image className={'size-full object-media'} render={renderImage} />
    </PosterPrimitive.Root>
  );
}

/** Positions buffering feedback over the video surface. */
export function VideoBufferingIndicator() {
  return (
    <Controls.Group className={'group/buffering-controls contents'}>
      <BufferingIndicator
        className={'z-40 forced-colors:bg-transparent!'}
      />
    </Controls.Group>
  );
}

/** @jsxImportSource react */

import { Title as TitlePrimitive } from '@videojs/react';

import { cn } from '@/lib/resolve-class-name';

export function Title() {
  return (
    <TitlePrimitive
      data-holo=""
      className={cn(
        'pointer-events-none me-auto h-8 min-w-0 truncate rounded-media-control border border-solid border-media-edge bg-media-background px-3 leading-[calc(var(--media-spacing)*8-2px)] text-media-foreground',
        'media-high-contrast:bg-media-background forced-colors:bg-transparent! forced-colors:text-[CanvasText] forced-colors:z-40',
        'not-data-visible:hidden'
      )}
    />
  );
}

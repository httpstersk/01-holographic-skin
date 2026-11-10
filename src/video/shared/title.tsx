/** @jsxImportSource react */

import { Title as TitlePrimitive } from '@videojs/react';
import type { ClassValue } from 'cn';

import { cn } from '@/lib/resolve-class-name';

export function Title({ className }: { className?: ClassValue } = {}) {
  return (
    <TitlePrimitive
      data-holo=""
      className={cn(
        'pointer-events-none h-8 min-w-0 truncate rounded-full border border-solid border-media-edge/80 bg-[#101015] px-3 text-media-xs leading-[calc(var(--media-spacing)*8-2px)] text-media-foreground',
        'media-high-contrast:bg-media-background forced-colors:bg-transparent! forced-colors:text-[CanvasText] forced-colors:z-40',
        'not-data-visible:hidden',
        className
      )}
    />
  );
}

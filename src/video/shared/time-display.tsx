/** @jsxImportSource react */

import { Time } from '@videojs/react';

import { cn } from '@/lib/resolve-class-name';

const GROUP = 'flex shrink-0 items-center rtl:flex-row-reverse leading-none font-medium tracking-normal tabular-nums';

/** Both times are solid ink; the elapsed time is heavier. Faded text would drop under 4.5:1 on the darker bands of the foil. */
export function TimeElapsed({ className }: { className?: string } = {}) {
  return (
    <Time.Group className={cn(GROUP, 'font-semibold', className)}>
      <Time.Value type="current" className={'data-unavailable:opacity-50'} />
    </Time.Group>
  );
}

export function TimeTotal({ className }: { className?: string } = {}) {
  return (
    <Time.Group className={cn(GROUP, className)}>
      <Time.Value type="duration" className={'data-unavailable:opacity-50'} />
    </Time.Group>
  );
}

/** @jsxImportSource react */

import { Slider as SliderPrimitive } from '@videojs/react';
import { TimeSlider as TimeSliderPrimitive } from '@videojs/react';

import { cn } from '@/lib/resolve-class-name';

export function TimeSlider({ audio = false, renderThumbnail }: ThumbnailSlot & { audio?: boolean } = {}) {
  return (
    <div className={'w-full'}>
      <TimeSliderPrimitive.Root
        data-holo=""
        className={cn(
          'group/slider relative flex h-5 min-w-12 flex-1 cursor-pointer touch-none items-center',
          // The strip is 20px; on touch its hit area is 44px and stops at the row below.
          "pointer-coarse:before:absolute pointer-coarse:before:inset-x-0 pointer-coarse:before:-top-4 pointer-coarse:before:-bottom-2 pointer-coarse:before:content-['']",
          'data-disabled:cursor-not-allowed data-disabled:opacity-40 forced-colors:data-disabled:text-[GrayText] forced-colors:data-disabled:opacity-100'
        )}
        thumbAlignment="edge"
      >
        <TimeSliderPrimitive.Chapters
          className={'relative flex size-full items-center'}
          renderChapter={(props) => (
            <div
              className={cn(
                'absolute inset-0 flex items-center clip-media-chapter-x',
                '[--media-chapter-inset-start:0.5] [--media-chapter-inset-end:0.5]',
                'first-of-type:[--media-chapter-inset-start:0] last-of-type:[--media-chapter-inset-end:0]'
              )}
              {...props}
            >
              <TimeSliderPrimitive.Track
                className={cn(
                  'absolute inset-x-0 isolate h-2.5 rounded-none forced-colors:h-1.5',
                  // The track is a stamped barcode: 2px bars, 2px gaps. Played bars are full foil, the rest are dim.
                  '[mask-image:repeating-linear-gradient(90deg,#000_0_2px,transparent_2px_4px)] media-high-contrast:[mask-image:none] forced-colors:[mask-image:none]',
                  'before:absolute before:inset-y-0 before:rounded-none before:bg-(--media-holo-track) before:clip-media-chapter-track-x',
                  'forced-colors:before:bg-[Canvas] forced-colors:before:opacity-100! forced-colors:before:forced-color-adjust-none',
                  'forced-colors:before:border forced-colors:before:border-solid forced-colors:before:border-[CanvasText]',
                  audio && 'before:bg-media-muted! forced-colors:before:bg-[Canvas]!'
                )}
              >
                <TimeSliderPrimitive.Buffer
                  className={cn(
                    'absolute inset-y-0 rounded-none bg-(--media-holo-buffer) clip-media-x-[--media-slider-buffer]',
                    'forced-colors:opacity-100! forced-colors:forced-color-adjust-none',
                    'forced-colors:bg-[repeating-linear-gradient(135deg,CanvasText_0px,CanvasText_1px,Canvas_1px,Canvas_3px)]',
                    audio && 'bg-[#b3b3b3]!'
                  )}
                />
                <TimeSliderPrimitive.Fill
                  className={cn(
                    'absolute inset-y-0 rounded-none bg-media-accent clip-media-x-[--media-slider-fill] forced-colors:forced-color-adjust-none',
                    'group-data-dragging/slider:clip-media-x-[--media-slider-pointer]',
                    'forced-colors:bg-[Canvas] forced-colors:bg-[linear-gradient(Highlight,Highlight)]'
                  )}
                />
              </TimeSliderPrimitive.Track>
            </div>
          )}
        ></TimeSliderPrimitive.Chapters>
        <TimeSliderPrimitive.Thumb
          className={cn(
            // A taller bar than the code it reads, cut out of the card so it shows at rest, not only on hover.
            'absolute left-[var(--media-slider-fill,0%)] h-4 w-1.5 transform-[translateX(-50%)] rounded-media-pill bg-media-foreground shadow-media-thumb',
            'transition-[height,width] duration-media-fast ease-out group-data-dragging/slider:h-5 group-data-dragging/slider:w-2',
            'group-data-dragging/slider:left-(--media-slider-pointer)',
            'outline-none focus-visible:outline-2 focus-visible:outline-solid focus-visible:outline-offset-2 focus-visible:outline-media-ring focus-visible:shadow-[0_0_0_6px_var(--media-ring-contrast)]',
            'forced-colors:bg-[Highlight] forced-colors:forced-color-adjust-none',
            'forced-colors:border forced-colors:border-solid forced-colors:border-[CanvasText]'
          )}
        />

        <TimeSliderPrimitive.Preview
          className={cn(
            'pointer-events-none bottom-[calc(100%+var(--media-spacing)*5)] grid max-w-39 origin-bottom justify-items-center gap-1',
            'opacity-0 group-data-disabled/slider:hidden',
            'group-data-pointing/slider:opacity-100',
            'group-data-dragging/slider:opacity-100'
          )}
        >
          <SliderPrimitive.Thumbnail.Root
            className={
              'block max-w-39 overflow-hidden rounded-media-menu-item border border-solid border-media-edge bg-media-background'
            }
          >
            <SliderPrimitive.Thumbnail.Image render={renderThumbnail} className={'block'} />
          </SliderPrimitive.Thumbnail.Root>
          <div
            className={cn(
              'flex max-w-full min-w-0 justify-center rounded-media-control foil-edge-media px-2.5 py-1',
              audio && 'w-auto! px-1.5! py-0.5 text-media-foreground media-high-contrast:outline forced-colors:outline'
            )}
          >
            <div className={'flex max-w-full min-w-0 items-center gap-2'}>
              <TimeSliderPrimitive.Value className={'shrink-0 tabular-nums'} type="pointer" />
              <TimeSliderPrimitive.ChapterTitle className={'min-w-0 truncate opacity-70 empty:hidden'} />
            </div>
          </div>
        </TimeSliderPrimitive.Preview>
      </TimeSliderPrimitive.Root>
    </div>
  );
}

export interface ThumbnailSlot {
  /** Draws the storyboard frame in the slider preview in place of the one the skin renders. */
  renderThumbnail?: SliderPrimitive.Thumbnail.ImageProps['render'];
}

/** @jsxImportSource react */

import {
  Slider as SliderPrimitive,
  TimeSlider as TimeSliderPrimitive,
} from "@videojs/react";

import { cn } from "@/lib/resolve-class-name";

/**
 * Drawn in the ink of the surface it sits on. Progress reads by weight, not by color: a faint hairline rail runs the
 * whole duration, the buffered part is a little stronger, and the played part is solid ink at the full track height and
 * ends in the thumb. A brand accent, when set, colors the played part.
 *
 * Sizes come from `--trk` (track height), `--trk-hover`, `--buffer` and `--rail` (their heights within the track),
 * `--thumb`, and `--hit` (the row the pointer can grab), set by the layout.
 */
export function TimeSlider({
  className,
  renderThumbnail,
}: ThumbnailSlot & { className?: string } = {}) {
  return (
    <div className={"w-full min-w-0 flex-1"}>
      <TimeSliderPrimitive.Root
        className={cn(
          "group/slider relative flex h-(--hit,1.5rem) min-w-12 flex-1 cursor-pointer touch-none items-center",
          "pointer-coarse:before:absolute pointer-coarse:before:inset-x-0 pointer-coarse:before:-top-3 pointer-coarse:before:-bottom-2 pointer-coarse:before:content-['']",
          "data-disabled:cursor-not-allowed data-disabled:opacity-40 forced-colors:data-disabled:text-[GrayText] forced-colors:data-disabled:opacity-100",
          className,
        )}
        thumbAlignment="edge"
      >
        <TimeSliderPrimitive.Chapters
          className={"relative flex size-full items-center"}
          renderChapter={(props) => (
            <div
              className={cn(
                "absolute inset-0 flex items-center clip-media-chapter-x",
                "[--media-chapter-inset-start:0.5] [--media-chapter-inset-end:0.5]",
                "first-of-type:[--media-chapter-inset-start:0] last-of-type:[--media-chapter-inset-end:0]",
              )}
              {...props}
            >
              <TimeSliderPrimitive.Track
                className={cn(
                  "absolute inset-x-0 isolate h-(--trk,1rem) overflow-hidden rounded-(--trk-r,9999px) transition-[height] duration-150 ease-out forced-colors:h-1.5",
                  "group-hover/slider:h-(--trk-hover,1.25rem) group-data-dragging/slider:h-(--trk-hover,1.25rem)",
                  "before:absolute before:top-1/2 before:h-(--rail,100%) before:-translate-y-1/2 before:rounded-[inherit] before:bg-current before:opacity-25 before:clip-media-chapter-track-x",
                  "forced-colors:before:h-full forced-colors:before:bg-[Canvas] forced-colors:before:opacity-100! forced-colors:before:forced-color-adjust-none",
                  "forced-colors:before:border forced-colors:before:border-solid forced-colors:before:border-[CanvasText]",
                )}
              >
                <TimeSliderPrimitive.Buffer
                  className={cn(
                    "absolute top-1/2 h-(--buffer,100%) -translate-y-1/2 rounded-inherit bg-current opacity-35 clip-media-x-[--media-slider-buffer]",
                    "forced-colors:h-full forced-colors:opacity-100! forced-colors:forced-color-adjust-none",
                    "forced-colors:bg-[repeating-linear-gradient(135deg,CanvasText_0px,CanvasText_1px,Canvas_1px,Canvas_3px)]",
                  )}
                />
                <TimeSliderPrimitive.Fill
                  className={cn(
                    "absolute inset-y-0 rounded-inherit bg-(--media-accent-color,currentColor) clip-media-x-[--media-slider-fill] forced-colors:forced-color-adjust-none",
                    "group-data-dragging/slider:clip-media-x-[--media-slider-pointer]",
                    "forced-colors:bg-[Canvas] forced-colors:bg-[linear-gradient(Highlight,Highlight)]",
                  )}
                />
              </TimeSliderPrimitive.Track>
            </div>
          )}
        />
        <TimeSliderPrimitive.Thumb
          className={cn(
            "absolute left-[var(--media-slider-fill,0%)] size-(--thumb,1.25rem) transform-[translateX(-50%)] rounded-full bg-current",
            "transition-[transform,scale,height,width] duration-150 ease-out group-hover/slider:scale-115 group-data-dragging/slider:scale-125",
            "group-data-dragging/slider:left-(--media-slider-pointer)",
            "outline-none focus-visible:outline-2 focus-visible:outline-solid focus-visible:outline-offset-2 focus-visible:outline-current",
            "forced-colors:bg-[Highlight] forced-colors:forced-color-adjust-none",
            "forced-colors:border forced-colors:border-solid forced-colors:border-[CanvasText]",
          )}
        />

        <TimeSliderPrimitive.Preview
          className={cn(
            "pointer-events-none bottom-[calc(100%+var(--media-spacing)*4)] grid max-w-39 origin-bottom justify-items-center gap-1",
            "opacity-0 transition-opacity duration-150 group-data-disabled/slider:hidden",
            "group-data-pointing/slider:opacity-100",
            "group-data-dragging/slider:opacity-100",
          )}
        >
          <SliderPrimitive.Thumbnail.Root
            className={
              "block max-w-39 overflow-hidden rounded-media-menu-item bg-media-background"
            }
          >
            <SliderPrimitive.Thumbnail.Image
              render={renderThumbnail}
              className={"block"}
            />
          </SliderPrimitive.Thumbnail.Root>
          <div
            className={cn(
              // Its own ink: the slider's text color is dark, for the foil bar it sits on.
              "flex max-w-full min-w-0 justify-center rounded-media-control card-media px-2.5 py-1 text-media-popover-foreground",
            )}
          >
            <div className={"flex max-w-full min-w-0 items-center gap-2"}>
              <TimeSliderPrimitive.Value
                className={"shrink-0 tabular-nums"}
                type="pointer"
              />
              <TimeSliderPrimitive.ChapterTitle
                className={"min-w-0 truncate opacity-70 empty:hidden"}
              />
            </div>
          </div>
        </TimeSliderPrimitive.Preview>
      </TimeSliderPrimitive.Root>
    </div>
  );
}

export interface ThumbnailSlot {
  /** Draws the storyboard frame in the slider preview in place of the one the skin renders. */
  renderThumbnail?: SliderPrimitive.Thumbnail.ImageProps["render"];
}

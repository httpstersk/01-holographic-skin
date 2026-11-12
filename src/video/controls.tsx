/** @jsxImportSource react */

import { Controls, SeekButton, Tooltip } from "@videojs/react";

import { cn } from "@/lib/resolve-class-name";

import { HoloFoil } from "./holo/foil-layer";
import { Button } from "./shared/button";
import { CaptionsToggle } from "./shared/captions-button";
import { SeekBackIcon, SeekForwardIcon } from "./shared/icons";
import { PlayButton } from "./shared/play-button";
import { FullscreenButton, ScreenControls } from "./shared/screen-controls";
import { SettingsMenu } from "./shared/settings-menu";
import { TimeElapsed, TimeTotal } from "./shared/time-display";
import { type ThumbnailSlot, TimeSlider } from "./shared/time-slider";
import { Tone } from "./shared/tone";
import { VolumePopover } from "./shared/volume-popover";
import { VideoBufferingIndicator } from "./shared/video-feedback";

/** Idle controls ignore the pointer, so the picture stays clickable. */
const LIVE =
  "group-not-data-visible/controls:pointer-events-none pointer-events-auto";

/** Utility buttons sit edge to edge; on touch they grow to 44px. */
const UTILITY =
  "size-9! rounded-full! pointer-coarse:size-11! pointer-coarse:before:hidden";
const SEEK = cn(LIVE, "size-11! rounded-full! pointer-coarse:size-12!");
const PLAY = cn(
  LIVE,
  "size-16! rounded-full! pointer-coarse:size-18! bg-media-foreground! text-media-background!",
);
const SCRUBBER_BAR =
  "absolute inset-x-0 bottom-0 flex h-9 items-center bg-media-foreground px-3 text-media-background pointer-coarse:h-11 forced-colors:bg-[Canvas] forced-colors:text-[CanvasText]";

/** Track 1 unit tall, its rail and buffer thinner inside it, and a small thumb. */
const SLIDER =
  "mx-3 [--hit:calc(var(--spacing)*9)] [--trk:var(--spacing)] [--trk-hover:calc(var(--spacing)*1.5)] [--buffer:calc(var(--spacing)*0.75)] [--rail:calc(var(--spacing)*0.5)] [--thumb:calc(var(--spacing)*3)]";

function SeekTen({ direction }: { direction: -1 | 1 }) {
  const Icon = direction < 0 ? SeekBackIcon : SeekForwardIcon;
  return (
    <SeekButton seconds={direction * 10} render={<Button />} className={SEEK}>
      <Icon className="col-start-1 row-start-1 size-6" />
      <span
        aria-hidden="true"
        className="col-start-1 row-start-1 mt-px text-[0.5em] leading-none font-bold"
      >
        10
      </span>
    </SeekButton>
  );
}

/**
 * Foil controls in the Mux logo's finish, with black ink on them. A big play disc sits in the middle between 10 second
 * seeks, the scrubber runs along the bottom edge, and the utilities sit just above it. Every plate is opaque, so none
 * needs a shadow or border to stand off the picture. Source order follows visual order.
 */
export function VideoControls({ renderThumbnail }: ThumbnailSlot = {}) {
  return (
    <Controls.Root>
      {/* No scrim over the picture: every control carries its own opaque plate. */}
      <VideoBufferingIndicator />
      <Controls.Content
        data-scaled=""
        className={cn(
          // Isolated, so the foil layer multiplies into the controls and never into the picture.
          "group/controls pointer-events-none absolute inset-0 z-30 isolate",
          // The controls fade as one surface. Idle hides them; keyboard focus inside them does not.
          "transition-opacity duration-media-controls ease-out [&:not([data-visible]):not(:has(:focus-visible))]:opacity-0",
        )}
      >
        <Tooltip.Provider>
          <ScreenControls />
          <div className="pointer-events-none absolute inset-0 grid place-items-center">
            <div className="flex items-center gap-4 media-md:gap-6">
              <SeekTen direction={-1} />
              <PlayButton iconClassName="size-8!" className={PLAY} />
              <SeekTen direction={1} />
            </div>
          </div>
          <div
            className={cn(
              LIVE,
              "absolute end-3 bottom-11 flex items-center gap-1.5 media-md:end-4 media-md:bottom-12",
            )}
          >
            <VolumePopover
              buttonClassName={cn(UTILITY, "hidden media-md:grid")}
            />
            <CaptionsToggle className={cn(UTILITY, "hidden media-sm:grid")} />
            <SettingsMenu buttonClassName={UTILITY} />
            <FullscreenButton className={UTILITY} />
          </div>
          <Tone tone="ghost">
            <div data-holo="" className={cn(LIVE, SCRUBBER_BAR)}>
              <TimeElapsed className="min-w-11 justify-end" />
              <TimeSlider
                renderThumbnail={renderThumbnail}
                className={SLIDER}
              />
              <TimeTotal className="min-w-11" />
            </div>
          </Tone>
        </Tooltip.Provider>
        <HoloFoil />
      </Controls.Content>
    </Controls.Root>
  );
}

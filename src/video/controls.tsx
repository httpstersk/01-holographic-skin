/** @jsxImportSource react */

import { Controls, SeekButton, Tooltip } from "@videojs/react";

import { cn } from "@/lib/resolve-class-name";

import { HoloFoil } from "@/video/holo/foil-layer";
import { Button } from "@/video/shared/button";
import { CaptionsToggle } from "@/video/shared/captions-button";
import { SeekBackIcon, SeekForwardIcon } from "@/video/shared/icons";
import { MuteButton } from "@/video/shared/mute-button";
import { PlayButton } from "@/video/shared/play-button";
import { FullscreenButton, ScreenControls } from "@/video/shared/screen-controls";
import { SettingsMenu } from "@/video/shared/settings-menu";
import { TimeElapsed, TimeTotal } from "@/video/shared/time-display";
import { type ThumbnailSlot, TimeSlider } from "@/video/shared/time-slider";
import { Tone } from "@/video/shared/tone";
import { ButtonTooltip } from "@/video/shared/tooltip";
import { VolumePopover } from "@/video/shared/volume-popover";
import { VideoBufferingIndicator } from "@/video/shared/video-feedback";

const UTILITY = "size-(--holo-utility-size)! rounded-full!";
const SEEK = "size-[max(44px,--spacing(11))]! rounded-full!";
const PLAY =
  "size-(--holo-play-size)! rounded-full! bg-media-foreground! text-media-background!";
const SCRUBBER_BAR =
  "absolute inset-x-0 bottom-0 flex h-(--holo-scrubber-height) items-center bg-media-foreground px-3 text-media-background forced-colors:bg-[Canvas] forced-colors:text-[CanvasText]";

/** Track 1 unit tall, its rail and buffer thinner inside it, and a small thumb. */
const SLIDER =
  "mx-2 media-sm:mx-3 [--hit:var(--holo-scrubber-height)] [--trk:var(--spacing)] [--trk-hover:calc(var(--spacing)*1.5)] [--buffer:calc(var(--spacing)*0.75)] [--rail:max(2px,calc(var(--spacing)*0.5))] [--thumb:calc(var(--spacing)*3)]";

/** Renders the same seek control for either direction with a signed time offset. */
function SeekTen({ direction }: { direction: -1 | 1 }) {
  const Icon = direction < 0 ? SeekBackIcon : SeekForwardIcon;
  return (
    <SeekButton
      className={SEEK}
      data-holo-interactive=""
      data-holo-jump=""
      render={<Button />}
      seconds={direction * 10}
    >
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
        className={cn(
          // Isolated, so the foil layer multiplies into the controls and never into the picture.
          "pointer-events-none absolute inset-0 z-30 isolate",
          "transition-opacity duration-media-controls ease-out has-[:focus-visible]:duration-0 motion-reduce:transition-none",
        )}
        data-holo-controls=""
        data-scaled=""
      >
        <Tooltip.Provider>
          <ScreenControls />
          <div className="absolute grid -translate-y-1/2 place-items-center" data-holo-playback="">
            <div className="flex items-center gap-3 media-md:gap-6">
              <SeekTen direction={-1} />
              <PlayButton className={PLAY} data-holo-interactive="" iconClassName="size-8!" />
              <SeekTen direction={1} />
            </div>
          </div>
          <div
            className="absolute flex items-center"
            data-holo-interactive=""
            data-holo-utilities=""
          >
            <ButtonTooltip>
              <MuteButton className={UTILITY} />
            </ButtonTooltip>
            <VolumePopover buttonClassName={UTILITY} />
            <CaptionsToggle className={cn(UTILITY, "hidden media-sm:grid")} />
            <SettingsMenu buttonClassName={UTILITY} />
            <FullscreenButton className={UTILITY} />
          </div>
          <Tone tone="ghost">
            <div className={SCRUBBER_BAR} data-holo="" data-holo-interactive="">
              <TimeElapsed className="min-w-[5ch] justify-end" />
              <TimeSlider
                className={SLIDER}
                renderThumbnail={renderThumbnail}
              />
              <TimeTotal className="min-w-[5ch]" />
            </div>
          </Tone>
        </Tooltip.Provider>
        <HoloFoil />
      </Controls.Content>
    </Controls.Root>
  );
}

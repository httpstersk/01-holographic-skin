/** @jsxImportSource react */

import { Controls, SeekButton, Tooltip } from "@videojs/react";

import { cn } from "@/lib/resolve-class-name";

import { HoloFoil } from "./holo/foil-layer";
import { Button } from "./shared/button";
import { CaptionsToggle } from "./shared/captions-button";
import { SeekBackIcon, SeekForwardIcon } from "./shared/icons";
import { MuteButton } from "./shared/mute-button";
import { PlayButton } from "./shared/play-button";
import { FullscreenButton, ScreenControls } from "./shared/screen-controls";
import { SettingsMenu } from "./shared/settings-menu";
import { TimeElapsed, TimeTotal } from "./shared/time-display";
import { type ThumbnailSlot, TimeSlider } from "./shared/time-slider";
import { Tone } from "./shared/tone";
import { ButtonTooltip } from "./shared/tooltip";
import { VolumePopover } from "./shared/volume-popover";
import { VideoBufferingIndicator } from "./shared/video-feedback";

const UTILITY = "size-(--holo-utility-size)! rounded-full!";
const SEEK = "size-[max(44px,--spacing(11))]! rounded-full!";
const PLAY =
  "size-(--holo-play-size)! rounded-full! bg-media-foreground! text-media-background!";
const SCRUBBER_BAR =
  "absolute inset-x-0 bottom-0 flex h-(--holo-scrubber-height) items-center bg-media-foreground px-3 text-media-background forced-colors:bg-[Canvas] forced-colors:text-[CanvasText]";

/** Track 1 unit tall, its rail and buffer thinner inside it, and a small thumb. */
const SLIDER =
  "mx-2 media-sm:mx-3 [--hit:var(--holo-scrubber-height)] [--trk:var(--spacing)] [--trk-hover:calc(var(--spacing)*1.5)] [--buffer:calc(var(--spacing)*0.75)] [--rail:max(2px,calc(var(--spacing)*0.5))] [--thumb:calc(var(--spacing)*3)]";

function SeekTen({ direction }: { direction: -1 | 1 }) {
  const Icon = direction < 0 ? SeekBackIcon : SeekForwardIcon;
  return (
    <SeekButton
      data-holo-jump=""
      data-holo-interactive=""
      seconds={direction * 10}
      render={<Button />}
      className={SEEK}
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
        data-scaled=""
        data-holo-controls=""
        className={cn(
          // Isolated, so the foil layer multiplies into the controls and never into the picture.
          "pointer-events-none absolute inset-0 z-30 isolate",
          "transition-opacity duration-media-controls ease-out has-[:focus-visible]:duration-0 motion-reduce:transition-none",
        )}
      >
        <Tooltip.Provider>
          <ScreenControls />
          <div data-holo-playback="" className="absolute grid -translate-y-1/2 place-items-center">
            <div className="flex items-center gap-3 media-md:gap-6">
              <SeekTen direction={-1} />
              <PlayButton data-holo-interactive="" iconClassName="size-8!" className={PLAY} />
              <SeekTen direction={1} />
            </div>
          </div>
          <div
            data-holo-interactive=""
            data-holo-utilities=""
            className="absolute flex items-center"
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
            <div data-holo="" data-holo-interactive="" className={SCRUBBER_BAR}>
              <TimeElapsed className="min-w-[5ch] justify-end" />
              <TimeSlider
                renderThumbnail={renderThumbnail}
                className={SLIDER}
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

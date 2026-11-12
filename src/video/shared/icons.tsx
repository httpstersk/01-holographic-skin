/** @jsxImportSource react */

import type { Icon, IconProps, IconWeight } from "@phosphor-icons/react";
import { Airplay } from "@phosphor-icons/react/dist/csr/Airplay";
import { ArrowCounterClockwise } from "@phosphor-icons/react/dist/csr/ArrowCounterClockwise";
import { ArrowsInSimple } from "@phosphor-icons/react/dist/csr/ArrowsInSimple";
import { ArrowsOutSimple } from "@phosphor-icons/react/dist/csr/ArrowsOutSimple";
import { CaretRight } from "@phosphor-icons/react/dist/csr/CaretRight";
import { Check } from "@phosphor-icons/react/dist/csr/Check";
import { CircleNotch } from "@phosphor-icons/react/dist/csr/CircleNotch";
import { ClockClockwise } from "@phosphor-icons/react/dist/csr/ClockClockwise";
import { ClockCounterClockwise } from "@phosphor-icons/react/dist/csr/ClockCounterClockwise";
import { ClosedCaptioning } from "@phosphor-icons/react/dist/csr/ClosedCaptioning";
import { Gauge } from "@phosphor-icons/react/dist/csr/Gauge";
import { GearSix } from "@phosphor-icons/react/dist/csr/GearSix";
import { Pause } from "@phosphor-icons/react/dist/csr/Pause";
import { PictureInPicture } from "@phosphor-icons/react/dist/csr/PictureInPicture";
import { Play } from "@phosphor-icons/react/dist/csr/Play";
import { Screencast } from "@phosphor-icons/react/dist/csr/Screencast";
import { SlidersHorizontal } from "@phosphor-icons/react/dist/csr/SlidersHorizontal";
import { SpeakerHigh } from "@phosphor-icons/react/dist/csr/SpeakerHigh";
import { SpeakerLow } from "@phosphor-icons/react/dist/csr/SpeakerLow";
import { SpeakerX } from "@phosphor-icons/react/dist/csr/SpeakerX";
import { Translate } from "@phosphor-icons/react/dist/csr/Translate";

/** Phosphor icons for every control, filled. An icon that shows an active state keeps its own weight so it still reads as on. */
function icon(Glyph: Icon, weight: IconWeight = "fill") {
  return function SkinIcon(props: IconProps) {
    return <Glyph aria-hidden="true" weight={weight} {...props} />;
  };
}

export const PlayIcon = icon(Play);
export const PauseIcon = icon(Pause);
export const RestartIcon = icon(ArrowCounterClockwise);
export const VolumeHighIcon = icon(SpeakerHigh);
export const VolumeLowIcon = icon(SpeakerLow);
export const VolumeOffIcon = icon(SpeakerX);
export const CaptionsOffIcon = icon(ClosedCaptioning);
export const CaptionsOnIcon = icon(ClosedCaptioning);
export const GearIcon = icon(GearSix);
export const FullscreenEnterIcon = icon(ArrowsOutSimple);
export const FullscreenExitIcon = icon(ArrowsInSimple);
export const PipEnterIcon = icon(PictureInPicture);
export const PipExitIcon = icon(PictureInPicture);
export const CastEnterIcon = icon(Screencast);
export const CastExitIcon = icon(Screencast);
export const AirPlayEnterIcon = icon(Airplay);
export const AirPlayExitIcon = icon(Airplay);
export const ChevronIcon = icon(CaretRight);
export const CheckIcon = icon(Check);
export const SwitchesIcon = icon(SlidersHorizontal);
export const SpeechIcon = icon(Translate);
export const SpeedIcon = icon(Gauge);
export const SeekBackIcon = icon(ClockCounterClockwise);
export const SeekForwardIcon = icon(ClockClockwise);

export function SpinnerIcon({ className, ...props }: IconProps) {
  return (
    <CircleNotch
      aria-hidden="true"
      weight="bold"
      className={`animate-spin motion-reduce:animate-none ${className ?? ""}`}
      {...props}
    />
  );
}

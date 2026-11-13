/** @jsxImportSource react */

import {
  Controls,
  CastButton as CastButtonPrimitive,
  PiPButton as PiPButtonPrimitive,
  FullscreenButton as FullscreenButtonPrimitive,
} from "@videojs/react";
import {
  CastIcon,
  FullscreenEnterIcon,
  FullscreenExitIcon,
  PipIcon,
} from "@/video/shared/icons";
import type { ClassValue } from "cn";

import { cn, resolveClassName } from "@/lib/resolve-class-name";

import { AirPlayButton } from "@/video/shared/airplay-button";
import { Button, HoverLabel } from "@/video/shared/button";
import { ButtonTooltip } from "@/video/shared/tooltip";

const screenTooltipOffset = "[--media-tooltip-side-offset:calc(var(--media-spacing)*3)]!";

/** Shows the current casting state on the Video.js cast control. */
export function CastButton({
  className,
  label,
}: { className?: ClassValue; label?: string } = {}) {
  return (
    <ButtonTooltip popupClassName={screenTooltipOffset}>
      <CastButtonPrimitive
        className={(state) => cn(resolveClassName(className, state))}
        render={<Button />}
      >
        <CastIcon className="col-start-1 row-start-1 size-4.5" />
        {label ? <HoverLabel>{label}</HoverLabel> : null}
      </CastButtonPrimitive>
    </ButtonTooltip>
  );
}

/** Shows the fullscreen entry or exit action for the current player state. */
export function FullscreenButton({
  className,
  iconClassName,
}: {
  className?: ClassValue;
  iconClassName?: ClassValue;
} = {}) {
  return (
    <ButtonTooltip popupClassName={screenTooltipOffset}>
      <FullscreenButtonPrimitive
        className={(state) =>
          cn("group/fullscreen", resolveClassName(className, state))
        }
        render={<Button />}
      >
        <FullscreenEnterIcon
          className={cn(
            "col-start-1 row-start-1 size-4.5",
            "hidden group-not-data-fullscreen/fullscreen:block",
            iconClassName,
          )}
        />
        <FullscreenExitIcon
          className={cn(
            "col-start-1 row-start-1 size-4.5",
            "hidden group-data-fullscreen/fullscreen:block",
            iconClassName,
          )}
        />
      </FullscreenButtonPrimitive>
    </ButtonTooltip>
  );
}

/** Shows the picture-in-picture action for the current player state. */
export function PiPButton({
  className,
  label,
}: { className?: ClassValue; label?: string } = {}) {
  return (
    <ButtonTooltip popupClassName={screenTooltipOffset}>
      <PiPButtonPrimitive
        className={(state) => cn(resolveClassName(className, state))}
        render={<Button />}
      >
        <PipIcon className="col-start-1 row-start-1 size-4.5" />
        {label ? <HoverLabel>{label}</HoverLabel> : null}
      </PiPButtonPrimitive>
    </ButtonTooltip>
  );
}
/** Each button opens out its name on hover or focus. */
const SCREEN_BUTTON =
  "h-(--holo-utility-size)! w-auto! min-w-(--holo-utility-size) rounded-full! px-2.5!";

/** AirPlay, Cast, and picture-in-picture, top right. A button the browser can't use hides, and the group follows. */
export function ScreenControls() {
  return (
    <Controls.Group className="ms-auto shrink-0 items-center gap-1.5" data-holo-interactive="" data-holo-screen="">
      <AirPlayButton
        className={SCREEN_BUTTON}
        label="AirPlay"
        popupClassName={screenTooltipOffset}
      />
      <CastButton className={SCREEN_BUTTON} label="Cast" />
      <PiPButton className={SCREEN_BUTTON} label="Picture in picture" />
    </Controls.Group>
  );
}

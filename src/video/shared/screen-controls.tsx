/** @jsxImportSource react */

import {
  Controls,
  CastButton as CastButtonPrimitive,
  PiPButton as PiPButtonPrimitive,
  FullscreenButton as FullscreenButtonPrimitive,
} from "@videojs/react";
import {
  CastEnterIcon as CastEnterIconPrimitive,
  CastExitIcon as CastExitIconPrimitive,
  PipEnterIcon as PipEnterIconPrimitive,
  PipExitIcon as PipExitIconPrimitive,
  FullscreenEnterIcon as FullscreenEnterIconPrimitive,
  FullscreenExitIcon as FullscreenExitIconPrimitive,
} from "./icons";
import type { ClassValue } from "cn";

import { cn, resolveClassName } from "@/lib/resolve-class-name";

import { AirPlayButton } from "./airplay-button";
import { Button, HoverLabel } from "./button";
import { ButtonTooltip } from "./tooltip";

export function CastButton({
  className,
  label,
}: { className?: ClassValue; label?: string } = {}) {
  return (
    <ButtonTooltip
      popupClassName={
        "[--media-tooltip-side-offset:calc(var(--media-spacing)*3)]!"
      }
    >
      <CastButtonPrimitive
        render={<Button />}
        className={(state) =>
          cn("group/cast", resolveClassName(className, state))
        }
      >
        <CastEnterIconPrimitive
          className={cn(
            "col-start-1 row-start-1 size-4.5",
            "group-data-[cast-state=connected]/cast:hidden",
          )}
        />
        <CastExitIconPrimitive
          className={cn(
            "col-start-1 row-start-1 size-4.5",
            "hidden group-data-[cast-state=connected]/cast:block",
          )}
        />
        {label ? <HoverLabel>{label}</HoverLabel> : null}
      </CastButtonPrimitive>
    </ButtonTooltip>
  );
}

export function PiPButton({
  className,
  label,
}: { className?: ClassValue; label?: string } = {}) {
  return (
    <ButtonTooltip
      popupClassName={
        "[--media-tooltip-side-offset:calc(var(--media-spacing)*3)]!"
      }
    >
      <PiPButtonPrimitive
        render={<Button />}
        className={(state) =>
          cn("group/pip", resolveClassName(className, state))
        }
      >
        <PipEnterIconPrimitive
          className={cn(
            "col-start-1 row-start-1 size-4.5",
            "group-data-pip/pip:hidden",
          )}
        />
        <PipExitIconPrimitive
          className={cn(
            "col-start-1 row-start-1 size-4.5",
            "hidden group-data-pip/pip:block",
          )}
        />
        {label ? <HoverLabel>{label}</HoverLabel> : null}
      </PiPButtonPrimitive>
    </ButtonTooltip>
  );
}

export function FullscreenButton({
  className,
  iconClassName,
}: {
  className?: ClassValue;
  iconClassName?: ClassValue;
} = {}) {
  return (
    <ButtonTooltip
      popupClassName={
        "[--media-tooltip-side-offset:calc(var(--media-spacing)*3)]!"
      }
    >
      <FullscreenButtonPrimitive
        render={<Button />}
        className={(state) =>
          cn("group/fullscreen", resolveClassName(className, state))
        }
      >
        <FullscreenEnterIconPrimitive
          className={cn(
            "col-start-1 row-start-1 size-4.5",
            "hidden group-not-data-fullscreen/fullscreen:block",
            iconClassName,
          )}
        />
        <FullscreenExitIconPrimitive
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

/** Each button opens out its name on hover or focus. */
const SCREEN_BUTTON =
  "h-(--holo-utility-size)! w-auto! min-w-(--holo-utility-size) rounded-full! px-2.5!";

/** AirPlay, Cast, and picture-in-picture, top right. A button the browser can't use hides, and the group follows. */
export function ScreenControls() {
  return (
    <Controls.Group data-holo-screen="" data-holo-interactive="" className="absolute end-3 top-3 items-center gap-1.5">
      <AirPlayButton
        className={SCREEN_BUTTON}
        popupClassName={
          "[--media-tooltip-side-offset:calc(var(--media-spacing)*3)]!"
        }
        label="AirPlay"
      />
      <CastButton className={SCREEN_BUTTON} label="Cast" />
      <PiPButton className={SCREEN_BUTTON} label="Picture in picture" />
    </Controls.Group>
  );
}

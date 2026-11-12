/** @jsxImportSource react */

import { AirPlayButton as AirPlayButtonPrimitive } from "@videojs/react";
import {
  AirPlayEnterIcon as AirPlayEnterIconPrimitive,
  AirPlayExitIcon as AirPlayExitIconPrimitive,
} from "@/video/shared/icons";
import type { ClassValue } from "cn";

import { cn, resolveClassName } from "@/lib/resolve-class-name";

import { Button, HoverLabel } from "@/video/shared/button";
import { ButtonTooltip } from "@/video/shared/tooltip";

/** Composes the native AirPlay control with the skin's button and tooltip. */
export function AirPlayButton({
  className,
  label,
  popupClassName,
}: {
  className?: ClassValue;
  label?: string;
  popupClassName?: ClassValue;
} = {}) {
  return (
    <ButtonTooltip popupClassName={popupClassName}>
      <AirPlayButtonPrimitive
        className={(state) =>
          cn("group/airplay", resolveClassName(className, state))
        }
        render={<Button />}
      >
        <AirPlayEnterIconPrimitive
          className={cn(
            "col-start-1 row-start-1 size-4.5",
            "group-data-[airplay-state=connected]/airplay:hidden",
          )}
        />
        <AirPlayExitIconPrimitive
          className={cn(
            "col-start-1 row-start-1 size-4.5",
            "hidden group-data-[airplay-state=connected]/airplay:block",
          )}
        />
        {label ? <HoverLabel>{label}</HoverLabel> : null}
      </AirPlayButtonPrimitive>
    </ButtonTooltip>
  );
}

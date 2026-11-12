/** @jsxImportSource react */

import { AirPlayButton as AirPlayButtonPrimitive } from "@videojs/react";
import {
  AirPlayEnterIcon as AirPlayEnterIconPrimitive,
  AirPlayExitIcon as AirPlayExitIconPrimitive,
} from "./icons";
import type { ClassValue } from "cn";

import { cn, resolveClassName } from "@/lib/resolve-class-name";

import { Button, HoverLabel } from "./button";
import { ButtonTooltip } from "./tooltip";

export function AirPlayButton({
  className,
  popupClassName,
  label,
}: {
  className?: ClassValue;
  popupClassName?: ClassValue;
  label?: string;
} = {}) {
  return (
    <ButtonTooltip popupClassName={popupClassName}>
      <AirPlayButtonPrimitive
        render={<Button />}
        className={(state) =>
          cn("group/airplay", resolveClassName(className, state))
        }
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

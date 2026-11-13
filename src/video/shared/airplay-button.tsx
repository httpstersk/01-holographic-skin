/** @jsxImportSource react */

import { AirPlayButton as AirPlayButtonPrimitive } from "@videojs/react";
import { AirPlayIcon } from "@/video/shared/icons";
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
        className={(state) => cn(resolveClassName(className, state))}
        render={<Button />}
      >
        <AirPlayIcon className="col-start-1 row-start-1 size-4.5" />
        {label ? <HoverLabel>{label}</HoverLabel> : null}
      </AirPlayButtonPrimitive>
    </ButtonTooltip>
  );
}

/** @jsxImportSource react */

import { selectVolume } from "@videojs/core/dom";
import { useContainer, usePlayer } from "@videojs/react";
import { useEffect, useRef } from "react";

import { playPop, unlockPopSound } from "@/video/shared/pop-sound";

/** Every control button and settings menu row. Popups render inside the player, so one listener covers them all. */
const TARGET = "button, [role^='menuitem']";

function isDisabled(element: Element) {
  return (
    element.hasAttribute("disabled") ||
    element.getAttribute("aria-disabled") === "true" ||
    element.hasAttribute("data-hidden")
  );
}

/** Plays a bubble pop when a mouse pointer enters a control. Silent while muted. */
export function HoverSound() {
  const container = useContainer();
  const volume = usePlayer(selectVolume);
  const silent = useRef(false);
  silent.current = !volume || volume.muted || volume.volume === 0;

  useEffect(() => {
    if (!container) return;
    const events = new AbortController();
    const options = { signal: events.signal };

    container.addEventListener("pointerdown", unlockPopSound, options);
    container.addEventListener("keydown", unlockPopSound, options);
    container.addEventListener(
      "pointerover",
      (event) => {
        if (event.pointerType !== "mouse" || silent.current) return;
        const target = event.target instanceof Element ? event.target.closest(TARGET) : null;
        if (!target || !container.contains(target) || isDisabled(target)) return;
        // Moving between a button's own icon and label is still the same hover.
        if (event.relatedTarget instanceof Node && target.contains(event.relatedTarget)) return;
        playPop();
      },
      options,
    );

    return () => events.abort();
  }, [container]);

  return null;
}

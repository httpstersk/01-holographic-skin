/** @jsxImportSource react */

import { selectVolume } from "@videojs/core/dom";
import { usePlayer } from "@videojs/react";
import { useCallback } from "react";

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

/** Binds one hover sound listener to the player and reads volume when it is needed. */
export function useHoverSound() {
  const player = usePlayer();

  return useCallback((container: HTMLDivElement | null) => {
    if (!container) return;
    const events = new AbortController();
    const options = { signal: events.signal };

    container.addEventListener("pointerdown", unlockPopSound, options);
    container.addEventListener("keydown", unlockPopSound, options);
    container.addEventListener(
      "pointerover",
      (event) => {
        if (event.pointerType !== "mouse") return;
        const target = event.target instanceof Element ? event.target.closest(TARGET) : null;
        if (!target || !container.contains(target) || isDisabled(target)) return;
        // Moving between a button's own icon and label is still the same hover.
        if (event.relatedTarget instanceof Node && target.contains(event.relatedTarget)) return;
        const volume = selectVolume(player.state);
        if (volume && !volume.muted && volume.volume > 0) playPop();
      },
      options,
    );

    return () => events.abort();
  }, [player]);
}

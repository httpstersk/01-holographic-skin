/** @jsxImportSource react */

import { selectPlayback } from "@videojs/core/dom";
import { usePlayer } from "@videojs/react";
import {
  Component,
  lazy,
  Suspense,
  useState,
  useSyncExternalStore,
  type ReactNode,
} from "react";

// Three.js loads after the controls are on screen; the skin is complete without it.
const FoilCanvas = lazy(() => import("./foil"));
const AmbientHoloCanvas = lazy(() => import("./ambient-canvas"));

import { foilFinish, foilMotion } from "../look";

const OFF =
  "(prefers-contrast: more), (prefers-reduced-transparency: reduce), (forced-colors: active)";
const STILL = "(prefers-reduced-motion: reduce)";

type Mode = "off" | "still" | "live";

function subscribe(onChange: () => void) {
  const queries = [matchMedia(OFF), matchMedia(STILL)];
  for (const query of queries) query.addEventListener("change", onChange);
  return () => {
    for (const query of queries) query.removeEventListener("change", onChange);
  };
}

function getMode(): Mode {
  if (matchMedia(OFF).matches) return "off";
  return matchMedia(STILL).matches ? "still" : "live";
}

/** A lost or missing WebGL context leaves the plain foil-white controls in place. */
class FoilBoundary extends Component<
  { children: ReactNode },
  { failed: boolean }
> {
  state = { failed: false };

  static getDerivedStateFromError() {
    return { failed: true };
  }

  render() {
    return this.state.failed ? null : this.props.children;
  }
}

/**
 * The light on the foil. It lies over the controls it is rendered beside and multiplies into them, so it must be the
 * last child of an isolated container. Every element marked `data-holo` inside that container is a plate with a light
 * of its own. It takes no pointer input and is hidden from assistive technology.
 */
export function HoloFoil() {
  const [layer, setLayer] = useState<HTMLDivElement | null>(null);
  const mode = useSyncExternalStore<Mode>(subscribe, getMode, () => "off");
  const host = layer?.parentElement;

  return (
    <div
      ref={setLayer}
      aria-hidden="true"
      className={
        "pointer-events-none absolute inset-0 z-20 mix-blend-multiply media-high-contrast:hidden forced-colors:hidden"
      }
    >
      {host && mode !== "off" && (
        <FoilBoundary>
          <Suspense fallback={null}>
            <FoilCanvas
              host={host}
              still={mode === "still"}
              finish={foilFinish}
              motion={foilMotion}
            />
          </Suspense>
        </FoilBoundary>
      )}
    </div>
  );
}

/**
 * Full-video physical holographic lighting layer.
 * Covers the entire video surface and smoothly activates only when the video is idle (paused or ended).
 */
export function AmbientHoloStage() {
  const [layer, setLayer] = useState<HTMLDivElement | null>(null);
  const mode = useSyncExternalStore<Mode>(subscribe, getMode, () => "off");
  const playback = usePlayer(selectPlayback);

  const isIdle = playback ? Boolean(playback.paused || playback.ended) : true;
  const host = layer?.parentElement;

  return (
    <div
      ref={setLayer}
      aria-hidden="true"
      data-idle={isIdle ? "" : undefined}
      className={
        "pointer-events-none absolute inset-0 z-10 mix-blend-screen media-high-contrast:hidden forced-colors:hidden"
      }
    >
      {host && mode !== "off" && (
        <FoilBoundary>
          <Suspense fallback={null}>
            <AmbientHoloCanvas
              host={host}
              still={mode === "still"}
              idle={isIdle}
              motion={foilMotion}
            />
          </Suspense>
        </FoilBoundary>
      )}
    </div>
  );
}

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

import { foilFinish, foilMotion } from "@/video/look";

// The skin renders its controls before loading Three.js for the decorative layers.
const AmbientHoloCanvas = lazy(() => import("@/video/holo/ambient-canvas"));
const FoilControlsCanvas = lazy(() => import("@/video/holo/foil"));

const motionQuery = "(prefers-reduced-motion: reduce)";
const plainFoilQuery =
  "(prefers-contrast: more), (prefers-reduced-transparency: reduce), (forced-colors: active)";

/** Rendering mode derived from system accessibility preferences. */
type Mode = "off" | "still" | "live";

/** The layer's canvas renders against the parent element's layout. */
interface LayerTarget {
  host: HTMLElement;
  still: boolean;
}

/** A lost or missing WebGL context leaves the plain foil-white controls in place. */
class FoilBoundary extends Component<{ children: ReactNode }, { failed: boolean }> {
  state = { failed: false };

  static getDerivedStateFromError() {
    return { failed: true };
  }

  render() {
    return this.state.failed ? null : this.props.children;
  }
}

/** Adds full-video lighting that fades in when playback pauses or ends. */
export function AmbientHoloStage() {
  const playback = usePlayer(selectPlayback);
  const idle = playback?.paused || playback?.ended || !playback;

  return (
    <FoilLayer.Root
      className="z-10 mix-blend-screen"
      idle={idle}
      render={({ host, still }) => (
        <AmbientHoloCanvas host={host} idle={idle} motion={foilMotion} still={still} />
      )}
    />
  );
}

/** Starts the lazy canvas only when its host exists and preferences allow it. */
function Canvas({
  host,
  mode,
  render,
}: {
  host: HTMLElement | null | undefined;
  mode: Mode;
  render: (target: LayerTarget) => ReactNode;
}) {
  if (!host || mode === "off") return null;

  return (
    <FoilBoundary>
      <Suspense fallback={null}>{render({ host, still: mode === "still" })}</Suspense>
    </FoilBoundary>
  );
}

/** Reads motion and contrast preferences when React requests a snapshot. */
function getMode(): Mode {
  if (matchMedia(plainFoilQuery).matches) return "off";
  return matchMedia(motionQuery).matches ? "still" : "live";
}

/** Keeps decorative WebGL off during server rendering and hydration. */
function getServerMode(): Mode {
  return "off";
}

/** Lights each control marked `data-holo` within the isolated controls container. */
export function HoloFoil() {
  return (
    <FoilLayer.Root
      className="z-20 mix-blend-multiply"
      render={({ host, still }) => (
        <FoilControlsCanvas finish={foilFinish} host={host} motion={foilMotion} still={still} />
      )}
    />
  );
}

/** Anchors decorative foil to the layer's parent and keeps it out of the accessibility tree. */
function Root({
  className,
  idle = false,
  render,
}: {
  className: string;
  idle?: boolean;
  render: (target: LayerTarget) => ReactNode;
}) {
  const [layer, setLayer] = useState<HTMLDivElement | null>(null);
  const mode = useSyncExternalStore(subscribe, getMode, getServerMode);

  return (
    <div
      aria-hidden="true"
      className={`pointer-events-none absolute inset-0 media-high-contrast:hidden forced-colors:hidden ${className}`}
      data-idle={idle ? "" : undefined}
      ref={setLayer}
    >
      <FoilLayer.Canvas host={layer?.parentElement} mode={mode} render={render} />
    </div>
  );
}

/** Subscribes React to system preference changes for as long as the foil is mounted. */
function subscribe(onChange: () => void) {
  const queries = [matchMedia(plainFoilQuery), matchMedia(motionQuery)];
  for (const query of queries) query.addEventListener("change", onChange);
  return () => {
    for (const query of queries) query.removeEventListener("change", onChange);
  };
}

const FoilLayer = { Canvas, Root };

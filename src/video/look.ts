import type { CSSProperties } from "react";

import {
  defaultFoilMotion,
  type FoilFinish,
  type FoilMotion,
} from "@/video/holo/shaders/foil";

/** The foil's finish on the player's controls. The website's foil artwork keeps its own. */
export const foilFinish: FoilFinish = {
  angle: -0.54,
  thickness: 120,
  grooves: 20,
  tint: [1.15, 1.1, 0.95],
  chroma: 0.85,
};

/** The light drifts down and to the right, ripples from the pointer, and follows it with a spring. */
export const foilMotion: FoilMotion = {
  ...defaultFoilMotion,
  flow: 0.6,
  drift: 0.15,
  ripple: 1,
  follow: 10,
};

/** Hover and press feel of the controls: a springy lift and scale. */
export const feel = {
  "--feel-duration": "260ms",
  "--feel-ease": "cubic-bezier(0.34, 1.56, 0.64, 1)",
  "--feel-lift": "2px",
  "--feel-scale": 1.1,
  "--feel-ghost-scale": 1.0625,
} as CSSProperties;

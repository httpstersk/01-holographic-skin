/** @jsxImportSource react */

import { createContext, useContext, type ReactNode } from 'react';

/**
 * How a button is drawn.
 * - `plate`: its own bordered black plate with its own light. Sits on the picture.
 * - `ghost`: no plate. Sits inside a surface that already carries the foil, and takes its light.
 */
export type ButtonTone = 'plate' | 'ghost';

const ToneContext = createContext<ButtonTone>('plate');

export const useTone = () => useContext(ToneContext);

export function Tone({ tone, children }: { tone: ButtonTone; children: ReactNode }) {
  return <ToneContext.Provider value={tone}>{children}</ToneContext.Provider>;
}

/** @jsxImportSource react */

import { Canvas } from '@react-three/fiber';
import type { ReactNode } from 'react';

export function FoilCanvas({ children }: { children: ReactNode }) {
  return (
    <Canvas
      frameloop="demand"
      dpr={[1, 2]}
      gl={{ alpha: true, premultipliedAlpha: true, antialias: false, depth: false, stencil: false }}
      resize={{ scroll: false, debounce: 0 }}
      style={{ pointerEvents: 'none' }}
    >
      {children}
    </Canvas>
  );
}

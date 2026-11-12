/** @jsxImportSource react */

import { useFrame } from '@react-three/fiber';
import { useRef } from 'react';

import { FoilCanvas } from './foil-canvas';
import { etchedFoilFinish } from './shaders/foil';
import { foilMaterialProps, useFoilMaterial } from './use-foil-material';

const ambientShader = { FOIL_AMBIENT: 1 };

interface AmbientProps {
  host: HTMLElement;
  still: boolean;
  idle: boolean;
}

function AmbientFoil({ host, still, idle }: AmbientProps) {
  const { attach, uniforms, advance } = useFoilMaterial(host, still, etchedFoilFinish);
  const opacity = useRef(idle ? 1 : 0);

  useFrame(({ size, viewport, invalidate }, delta) => {
    const target = idle ? 1 : 0;
    const current = advance(size.width, size.height, delta, viewport.dpr);
    if (!current) {
      opacity.current = target;
      return;
    }

    if (still || Math.abs(target - opacity.current) < 0.003) {
      opacity.current = target;
    } else {
      const rate = idle ? 4.5 : 6.5;
      opacity.current += (target - opacity.current) * (1 - Math.exp(-rate * Math.min(delta, 0.05)));
    }
    current.opacity.value = opacity.current;
    if (!still && (idle || opacity.current > 0)) invalidate();
  });

  return (
    <mesh frustumCulled={false}>
      <planeGeometry args={[2, 2]} />
      {/* Updating the target requests a frame even when the glow is at rest. */}
      <rawShaderMaterial
        ref={attach}
        {...foilMaterialProps}
        defines={ambientShader}
        uniforms={uniforms}
        uniforms-opacity-value={idle ? 1 : 0}
      />
    </mesh>
  );
}

export default function AmbientHoloCanvas(props: AmbientProps) {
  return (
    <FoilCanvas>
      <AmbientFoil {...props} />
    </FoilCanvas>
  );
}

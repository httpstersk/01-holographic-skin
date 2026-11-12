/** @jsxImportSource react */

import { useFrame } from '@react-three/fiber';
import { useRef } from 'react';

import { FoilCanvas } from '@/video/holo/foil-canvas';
import { etchedFoilFinish, type FoilMotion } from '@/video/holo/shaders/foil';
import { foilMaterialProps, useFoilMaterial } from '@/video/holo/use-foil-material';

const ambientShader = { FOIL_AMBIENT: 1 };

/** Playback and motion inputs for the ambient light. */
interface AmbientProps {
  host: HTMLElement;
  idle: boolean;
  motion: FoilMotion;
  still: boolean;
}

/** Fades the ambient material as playback changes without updating React on each frame. */
function AmbientFoil({ host, idle, motion, still }: AmbientProps) {
  const { attach, uniforms, advance } = useFoilMaterial(host, still, etchedFoilFinish, motion);
  const opacity = useRef(idle ? 1 : 0);

  useFrame(({ invalidate, size, viewport }, delta) => {
    const target = idle ? 1 : 0;
    const frame = advance(size.width, size.height, delta, viewport.dpr);
    if (!frame) {
      opacity.current = target;
      return;
    }

    if (still || Math.abs(target - opacity.current) < 0.003) {
      opacity.current = target;
    } else {
      const rate = idle ? 4.5 : 6.5;
      opacity.current += (target - opacity.current) * (1 - Math.exp(-rate * Math.min(delta, 0.05)));
    }
    frame.uniforms.opacity.value = opacity.current;
    if (opacity.current !== target || (idle && frame.animating)) invalidate();
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

/** Mounts the ambient shader inside the demand-driven canvas. */
export default function AmbientHoloCanvas(props: AmbientProps) {
  return (
    <FoilCanvas>
      <AmbientFoil {...props} />
    </FoilCanvas>
  );
}

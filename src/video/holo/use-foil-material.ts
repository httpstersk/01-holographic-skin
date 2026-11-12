import { useThree } from '@react-three/fiber';
import { useCallback, useRef, useState } from 'react';
import { NoBlending, type RawShaderMaterial, Vector2, Vector4 } from 'three';

import { type FoilFinish, foilFinishUniforms, foilFragmentShader, foilVertexShader } from './shaders/foil';

export const foilMaterialProps = {
  vertexShader: foilVertexShader,
  fragmentShader: foilFragmentShader,
  // The shader already premultiplies its output for the DOM layer to composite.
  blending: NoBlending,
  depthTest: false,
  depthWrite: false,
  transparent: true,
  toneMapped: false,
};

const center = { x: 0.5, y: 0.5 };
type LightPoint = typeof center;

function createUniforms(finish: FoilFinish) {
  const { grating, metal, etched } = foilFinishUniforms(finish);
  return {
    resolution: { value: new Vector2(1, 1) },
    lightPosition: { value: new Vector2(center.x, center.y) },
    time: { value: 0 },
    relief: { value: 4.5 },
    pixelSize: { value: 1 },
    grating: { value: new Vector4(...grating) },
    metal: { value: new Vector4(...metal) },
    etched: { value: etched },
    opacity: { value: 0 },
  };
}

export function useFoilMaterial(host: HTMLElement, still: boolean, finish: FoilFinish) {
  const invalidate = useThree((state) => state.invalidate);
  const material = useRef<RawShaderMaterial | null>(null);
  const light = useRef({ inView: false, pointer: null as LightPoint | null, focus: null as LightPoint | null });
  const [uniforms] = useState(() => createUniforms(finish));

  const attach = useCallback(
    (instance: RawShaderMaterial | null) => {
      if (!instance) return;
      material.current = instance;
      const state = light.current;
      const root = host.closest<HTMLElement>('.media-skin') ?? host;
      const intersection = new IntersectionObserver(([entry]) => {
        state.inView = entry?.isIntersecting ?? false;
        if (state.inView) invalidate();
      });
      intersection.observe(root);

      const events = new AbortController();
      const options = { passive: true, signal: events.signal };

      function positionAt(x: number, y: number): LightPoint | null {
        const rect = root.getBoundingClientRect();
        if (!rect.width || !rect.height) return null;
        const clamp = (value: number) => Math.max(0, Math.min(1, value));
        return { x: clamp((x - rect.left) / rect.width), y: clamp((y - rect.top) / rect.height) };
      }

      if (!still) {
        const move = (event: PointerEvent) => {
          state.pointer = positionAt(event.clientX, event.clientY);
        };
        const leave = () => {
          state.pointer = null;
        };
        const focus = (event: FocusEvent) => {
          const target = event.target;
          if (target instanceof HTMLElement && target.matches(':focus-visible')) {
            const rect = target.getBoundingClientRect();
            state.focus = positionAt(rect.left + rect.width / 2, rect.top + rect.height / 2);
            invalidate();
          }
        };
        const blur = () => {
          state.focus = null;
          invalidate();
        };

        root.addEventListener('pointermove', move, options);
        root.addEventListener('pointerdown', move, options);
        root.addEventListener('pointerleave', leave, options);
        root.addEventListener('pointercancel', leave, options);
        root.addEventListener('focusin', focus, options);
        root.addEventListener('focusout', blur, options);
      }

      return () => {
        material.current = null;
        state.inView = false;
        state.pointer = state.focus = null;
        events.abort();
        intersection.disconnect();
      };
    },
    [host, invalidate, still]
  );

  function advance(width: number, height: number, delta: number, pixelRatio: number) {
    if (!material.current || !light.current.inView || width < 1 || height < 1) return;

    // Fiber merges the props into the material's live uniform records.
    const current = material.current.uniforms as typeof uniforms;
    const target = still ? center : light.current.focus ?? light.current.pointer ?? center;
    const dt = Math.min(delta, 0.05);
    const follow = still ? 1 : 1 - Math.exp(-8 * dt);
    const position = current.lightPosition.value;
    position.x += (target.x - position.x) * follow;
    position.y += (target.y - position.y) * follow;
    current.resolution.value.set(width, height);
    current.pixelSize.value = 1 / Math.max(pixelRatio, 0.5);
    current.time.value = still ? 0 : current.time.value + dt;
    return current;
  }

  return { attach, uniforms, advance };
}

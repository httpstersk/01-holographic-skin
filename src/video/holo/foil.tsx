/** @jsxImportSource react */

import { useFrame, useThree } from '@react-three/fiber';
import { useCallback, useRef, useState } from 'react';
import { DynamicDrawUsage, type InstancedBufferAttribute, type InstancedBufferGeometry } from 'three';

import { FoilCanvas } from '@/video/holo/foil-canvas';
import type { FoilFinish, FoilMotion } from '@/video/holo/shaders/foil';
import { foilMaterialProps, useFoilMaterial } from '@/video/holo/use-foil-material';

const MAX_PLATES = 64;
const positions = new Float32Array([-1, -1, 0, 1, -1, 0, -1, 1, 0, 1, 1, 0]);
const indices = new Uint16Array([0, 1, 2, 2, 1, 3]);
const plateShader = { FOIL_PLATES: 1 };

/** Writes the visible controls' bounds into the instanced mesh attributes. */
function measurePlates(
  host: HTMLElement,
  plates: HTMLElement[],
  rects: InstancedBufferAttribute,
  shapes: InstancedBufferAttribute
) {
  const origin = host.getBoundingClientRect();
  let count = 0;
  for (const plate of plates) {
    const { left, top, width, height } = plate.getBoundingClientRect();
    if (width < 1 || height < 1) continue;
    rects.setXYZW(count, left - origin.left, top - origin.top, width, height);
    const radius = Number.parseFloat(getComputedStyle(plate).borderTopLeftRadius) || 0;
    shapes.setXY(count, radius, plate.dataset.holo === 'flat' ? 0 : 1);
    count++;
  }
  rects.needsUpdate = true;
  shapes.needsUpdate = true;
  return count;
}

/** Optical and motion settings shared by all control plates. */
interface FoilLook {
  finish: FoilFinish;
  motion: FoilMotion;
}

/** Updates one mesh for every visible foil plate in the controls. */
function FoilPlates({ finish, host, motion, still }: { host: HTMLElement; still: boolean } & FoilLook) {
  const invalidate = useThree((state) => state.invalidate);
  const { advance, attach, parameters, lookUniforms } = useFoilMaterial(host, still, finish, motion);
  const geometry = useRef<InstancedBufferGeometry | null>(null);
  const rects = useRef<InstancedBufferAttribute | null>(null);
  const shapes = useRef<InstancedBufferAttribute | null>(null);
  const plates = useRef<HTMLElement[]>([]);
  const layoutDirty = useRef(true);
  const [rectData] = useState(() => new Float32Array(MAX_PLATES * 4));
  const [shapeData] = useState(() => new Float32Array(MAX_PLATES * 2));

  const attachGeometry = useCallback(
    (instance: InstancedBufferGeometry | null) => {
      if (!instance) return;
      geometry.current = instance;

      function markDirty() {
        layoutDirty.current = true;
        invalidate();
      }
      const resizes = new ResizeObserver(markDirty);
      function collectPlates() {
        resizes.disconnect();
        resizes.observe(host);
        plates.current = Array.from(host.querySelectorAll<HTMLElement>('[data-holo]')).slice(0, MAX_PLATES);
        for (const plate of plates.current) resizes.observe(plate);
        markDirty();
      }

      const mutations = new MutationObserver((records) => {
        if (records.some((record) => record.type === 'childList' || record.attributeName === 'data-holo')) {
          collectPlates();
        } else {
          markDirty();
        }
      });
      mutations.observe(host, {
        childList: true,
        subtree: true,
        attributes: true,
        attributeFilter: ['data-holo', 'data-hidden', 'data-visible', 'dir'],
      });
      mutations.observe(host.ownerDocument.documentElement, { attributes: true, attributeFilter: ['dir'] });
      collectPlates();

      return () => {
        geometry.current = null;
        resizes.disconnect();
        mutations.disconnect();
      };
    },
    [host, invalidate]
  );

  useFrame(({ size, viewport }, delta) => {
    const ready = advance(size.width, size.height, delta, viewport.dpr);
    if (!ready || !geometry.current || !rects.current || !shapes.current) return;

    if (layoutDirty.current) {
      geometry.current.instanceCount = measurePlates(host, plates.current, rects.current, shapes.current);
      layoutDirty.current = false;
    }

    const controlsVisible = host.hasAttribute('data-visible') || host.querySelector(':focus-visible');
    if (ready.animating && controlsVisible && geometry.current.instanceCount > 0) invalidate();
  });

  return (
    <mesh frustumCulled={false}>
      <instancedBufferGeometry instanceCount={0} ref={attachGeometry}>
        <bufferAttribute args={[indices, 1]} attach="index" />
        <bufferAttribute args={[positions, 3]} attach="attributes-position" />
        <instancedBufferAttribute
          args={[rectData, 4]}
          attach="attributes-plateRect"
          ref={rects}
          usage={DynamicDrawUsage}
        />
        <instancedBufferAttribute
          args={[shapeData, 2]}
          attach="attributes-plateShape"
          ref={shapes}
          usage={DynamicDrawUsage}
        />
      </instancedBufferGeometry>
      <rawShaderMaterial
        args={[parameters]}
        ref={attach}
        {...foilMaterialProps}
        defines={plateShader}
        uniforms={lookUniforms}
      />
    </mesh>
  );
}

/** Mounts the instanced plate renderer inside the decorative canvas. */
export default function FoilControlsCanvas({ finish, host, motion, still }: { host: HTMLElement; still: boolean } & FoilLook) {
  return (
    <FoilCanvas>
      <FoilPlates finish={finish} host={host} motion={motion} still={still} />
    </FoilCanvas>
  );
}

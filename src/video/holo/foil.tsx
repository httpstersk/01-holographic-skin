/** @jsxImportSource react */

import { useFrame, useThree } from '@react-three/fiber';
import { useCallback, useRef, useState } from 'react';
import { DynamicDrawUsage, type InstancedBufferAttribute, type InstancedBufferGeometry } from 'three';

import { FoilCanvas } from './foil-canvas';
import { muxFoilFinish } from './shaders/foil';
import { foilMaterialProps, useFoilMaterial } from './use-foil-material';

const MAX_PLATES = 64;
const positions = new Float32Array([-1, -1, 0, 1, -1, 0, -1, 1, 0, 1, 1, 0]);
const indices = new Uint16Array([0, 1, 2, 2, 1, 3]);
const plateShader = { FOIL_PLATES: 1 };

function measurePlates(
  host: HTMLElement,
  plates: HTMLElement[],
  rects: InstancedBufferAttribute,
  radii: InstancedBufferAttribute
) {
  const origin = host.getBoundingClientRect();
  let count = 0;
  for (const plate of plates) {
    const { left, top, width, height } = plate.getBoundingClientRect();
    if (width < 1 || height < 1) continue;
    rects.setXYZW(count, left - origin.left, top - origin.top, width, height);
    radii.setX(count, Number.parseFloat(getComputedStyle(plate).borderTopLeftRadius) || 0);
    count++;
  }
  rects.needsUpdate = true;
  radii.needsUpdate = true;
  return count;
}

function FoilPlates({ host, still }: { host: HTMLElement; still: boolean }) {
  const invalidate = useThree((state) => state.invalidate);
  const { attach, uniforms, advance } = useFoilMaterial(host, still, muxFoilFinish);
  const geometry = useRef<InstancedBufferGeometry | null>(null);
  const rects = useRef<InstancedBufferAttribute | null>(null);
  const radii = useRef<InstancedBufferAttribute | null>(null);
  const plates = useRef<HTMLElement[]>([]);
  const layoutDirty = useRef(true);
  const [rectData] = useState(() => new Float32Array(MAX_PLATES * 4));
  const [radiusData] = useState(() => new Float32Array(MAX_PLATES));

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

  useFrame(({ size }, delta) => {
    if (!advance(size.width, size.height, delta) || !geometry.current || !rects.current || !radii.current) return;

    if (layoutDirty.current) {
      geometry.current.instanceCount = measurePlates(host, plates.current, rects.current, radii.current);
      layoutDirty.current = false;
    }

    const controlsVisible = host.hasAttribute('data-visible') || host.querySelector(':focus-visible');
    if (!still && controlsVisible && geometry.current.instanceCount > 0) invalidate();
  });

  return (
    <mesh frustumCulled={false}>
      <instancedBufferGeometry ref={attachGeometry} instanceCount={0}>
        <bufferAttribute attach="index" args={[indices, 1]} />
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
        <instancedBufferAttribute
          ref={rects}
          attach="attributes-plateRect"
          args={[rectData, 4]}
          usage={DynamicDrawUsage}
        />
        <instancedBufferAttribute
          ref={radii}
          attach="attributes-plateRadius"
          args={[radiusData, 1]}
          usage={DynamicDrawUsage}
        />
      </instancedBufferGeometry>
      <rawShaderMaterial ref={attach} {...foilMaterialProps} defines={plateShader} uniforms={uniforms} />
    </mesh>
  );
}

export default function FoilControlsCanvas({ host, still }: { host: HTMLElement; still: boolean }) {
  return (
    <FoilCanvas>
      <FoilPlates host={host} still={still} />
    </FoilCanvas>
  );
}

/** @jsxImportSource react */

import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { useEffect, useMemo, useRef } from 'react';
import {
  DoubleSide,
  DynamicDrawUsage,
  InstancedBufferAttribute,
  InstancedBufferGeometry,
  NoBlending,
  PlaneGeometry,
  ShaderMaterial,
  Vector2,
} from 'three';

/** Most plates the layer lights at once. The video preset shows about twenty. */
const MAX_PLATES = 48;

const vertexShader = /* glsl */ `
  attribute vec4 aRect;   // x, y, width, height in CSS px from the layer's top-left
  attribute vec4 aLight;  // light x, light y, intensity, seed
  attribute float aRadius;

  uniform vec2 uRes;

  varying vec2 vPx;
  varying vec2 vLocal;
  varying vec2 vHalf;
  varying vec4 vLight;
  varying float vRadius;

  void main() {
    vec2 uv = position.xy + 0.5;
    vec2 px = aRect.xy + vec2(uv.x, 1.0 - uv.y) * aRect.zw;

    vPx = px;
    vHalf = aRect.zw * 0.5;
    vLocal = px - (aRect.xy + vHalf);
    vLight = aLight;
    vRadius = aRadius;

    vec2 clip = px / uRes * 2.0 - 1.0;
    gl_Position = vec4(clip.x, -clip.y, 0.0, 1.0);
  }
`;

/*
 * The layer is multiplied into the controls beneath it, so this writes the colour of the light the foil returns:
 * white ink takes it whole, the black card returns none. Each plate carries its own light, which is what lets the
 * reflection cross the controls one after another.
 */
const fragmentShader = /* glsl */ `
  precision highp float;

  uniform vec2 uRes;

  varying vec2 vPx;
  varying vec2 vLocal;
  varying vec2 vHalf;
  varying vec4 vLight;
  varying float vRadius;

  float sdRoundBox(vec2 p, vec2 b, float r) {
    vec2 q = abs(p) - b + r;
    return length(max(q, 0.0)) + min(max(q.x, q.y), 0.0) - r;
  }

  vec3 spectrum(float t) {
    return 0.5 + 0.5 * cos(6.28318 * (t + vec3(0.0, 0.33, 0.67)));
  }

  float hash(vec2 p) {
    return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453);
  }

  void main() {
    float radius = min(vRadius, min(vHalf.x, vHalf.y));
    float alpha = 1.0 - smoothstep(-0.75, 0.25, sdRoundBox(vLocal, vHalf, radius));
    if (alpha <= 0.0) discard;

    float intensity = vLight.z;
    float seed = vLight.w;
    vec2 toLight = vPx - vLight.xy;
    float reach = clamp(0.5 * length(uRes), 260.0, 900.0);
    float near = exp(-dot(toLight, toLight) / (reach * reach));

    // Diffraction: hue follows the angle to the light, tilted a little differently on every plate.
    float tiltAngle = seed * 6.28318;
    vec2 tilt = vec2(cos(tiltAngle), sin(tiltAngle));
    float phase = dot(toLight, vec2(0.0042, 0.0027)) + dot(toLight, tilt) * 0.0016 + seed * 0.61;
    // The emboss bends the film slightly.
    phase += 0.035 * sin(vPx.x * 0.09 + vPx.y * 0.05 + seed * 10.0);
    vec3 holo = mix(spectrum(phase), vec3(1.0), 0.16);

    // A hot band where the foil faces the light squarely. It runs beside the pointer, not under it, so the control
    // being pointed at keeps its colour.
    float streakAngle = 0.9 + (seed - 0.5) * 0.8;
    float band = dot(toLight, vec2(cos(streakAngle), sin(streakAngle))) - 90.0;
    float streak = exp(-band * band / 3200.0) * near;

    // Grain in the film.
    float sparkle = smoothstep(0.93, 1.0, hash(floor(vPx))) * near;

    // Unlit foil is flat silver with a faint sheen, never dark.
    vec3 silver = vec3(0.74, 0.76, 0.80) + 0.04 * sin(vPx.y * 0.02 + seed * 6.0);

    float energy = clamp(intensity * (0.25 + 0.75 * near) * 1.1, 0.0, 1.0);
    vec3 color = mix(silver, holo, energy);
    color += (streak * 0.6 + sparkle * 0.45) * intensity;

    // Keep deep blues and violets readable on the card.
    float luma = dot(color, vec3(0.2126, 0.7152, 0.0722));
    color += max(0.0, 0.5 - luma);
    color = clamp(color, 0.0, 1.0);

    gl_FragColor = vec4(color * alpha, alpha);
  }
`;

interface Plate {
  el: HTMLElement;
  seed: number;
  /** How quickly this plate's light catches up, per second. */
  rate: number;
  radius: number;
  lightX: number;
  lightY: number;
  intensity: number;
  placed: boolean;
}

function readRadius(el: HTMLElement) {
  return Number.parseFloat(getComputedStyle(el).borderTopLeftRadius) || 0;
}

function Foil({ host, still }: { host: HTMLElement; still: boolean }) {
  const invalidate = useThree((state) => state.invalidate);
  const size = useThree((state) => state.size);

  const plates = useRef<Plate[]>([]);
  const known = useRef(new WeakMap<HTMLElement, Plate>());
  const count = useRef(0);
  const pointer = useRef({ x: 0, y: 0, hover: false, focus: false });

  const { geometry, material, rects, lights, radii } = useMemo(() => {
    const plane = new PlaneGeometry(1, 1);
    const geometry = new InstancedBufferGeometry();
    geometry.index = plane.index;
    geometry.setAttribute('position', plane.getAttribute('position'));

    const rects = new InstancedBufferAttribute(new Float32Array(MAX_PLATES * 4), 4).setUsage(DynamicDrawUsage);
    const lights = new InstancedBufferAttribute(new Float32Array(MAX_PLATES * 4), 4).setUsage(DynamicDrawUsage);
    const radii = new InstancedBufferAttribute(new Float32Array(MAX_PLATES), 1).setUsage(DynamicDrawUsage);
    geometry.setAttribute('aRect', rects);
    geometry.setAttribute('aLight', lights);
    geometry.setAttribute('aRadius', radii);
    geometry.instanceCount = 0;

    const material = new ShaderMaterial({
      vertexShader,
      fragmentShader,
      uniforms: { uRes: { value: new Vector2(1, 1) } },
      blending: NoBlending,
      depthTest: false,
      depthWrite: false,
      side: DoubleSide,
      transparent: true,
    });

    return { geometry, material, rects, lights, radii };
  }, []);

  useEffect(
    () => () => {
      geometry.dispose();
      material.dispose();
    },
    [geometry, material]
  );

  // Track which elements are plates, and wake the loop when their layout or the controls' visibility changes.
  useEffect(() => {
    const resizes = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const plate = known.current.get(entry.target as HTMLElement);
        if (plate) plate.radius = readRadius(plate.el);
      }
      invalidate();
    });

    const collect = () => {
      resizes.disconnect();
      resizes.observe(host);
      plates.current = Array.from(host.querySelectorAll<HTMLElement>('[data-holo]'))
        .slice(0, MAX_PLATES)
        .map((el) => {
          let plate = known.current.get(el);
          if (!plate) {
            const seed = (count.current++ * 0.618034 + 0.13) % 1;
            plate = {
              el,
              seed,
              rate: 4 + 9 * ((seed * 7.31) % 1),
              radius: 0,
              lightX: 0,
              lightY: 0,
              intensity: 0,
              placed: false,
            };
            known.current.set(el, plate);
          }
          plate.radius = readRadius(el);
          resizes.observe(el);
          return plate;
        });
      invalidate();
    };

    const mutations = new MutationObserver((records) => {
      if (records.some((record) => record.type === 'childList')) collect();
      else invalidate();
    });
    mutations.observe(host, { childList: true, subtree: true, attributes: true, attributeFilter: ['data-visible'] });
    collect();

    return () => {
      resizes.disconnect();
      mutations.disconnect();
    };
  }, [host, invalidate]);

  // The light is the pointer, or the focused control for someone on a keyboard.
  useEffect(() => {
    if (still) return;

    const root = host.closest<HTMLElement>('.media-skin') ?? host;
    const state = pointer.current;

    const onMove = (event: PointerEvent) => {
      state.x = event.clientX;
      state.y = event.clientY;
      state.hover = true;
      invalidate();
    };
    const onLeave = () => {
      state.hover = false;
      invalidate();
    };
    const onFocusIn = (event: FocusEvent) => {
      const target = event.target as HTMLElement;
      if (!target.matches?.(':focus-visible')) return;
      const rect = target.getBoundingClientRect();
      state.x = rect.left + rect.width / 2;
      state.y = rect.top + rect.height / 2;
      state.focus = true;
      invalidate();
    };
    const onFocusOut = () => {
      state.focus = false;
      invalidate();
    };

    root.addEventListener('pointermove', onMove, { passive: true });
    root.addEventListener('pointerdown', onMove, { passive: true });
    root.addEventListener('pointerleave', onLeave);
    root.addEventListener('pointercancel', onLeave);
    root.addEventListener('focusin', onFocusIn);
    root.addEventListener('focusout', onFocusOut);

    return () => {
      root.removeEventListener('pointermove', onMove);
      root.removeEventListener('pointerdown', onMove);
      root.removeEventListener('pointerleave', onLeave);
      root.removeEventListener('pointercancel', onLeave);
      root.removeEventListener('focusin', onFocusIn);
      root.removeEventListener('focusout', onFocusOut);
    };
  }, [host, invalidate, still]);

  useFrame((_, delta) => {
    const dt = Math.min(delta, 0.05);
    const origin = host.getBoundingClientRect();
    const state = pointer.current;
    const lit = still || state.hover || state.focus;
    // With motion reduced the light is fixed, upper left of the frame, and nothing follows the pointer.
    const targetX = still ? origin.width * 0.3 : state.x - origin.left;
    const targetY = still ? origin.height * 0.35 : state.y - origin.top;

    let n = 0;
    let moving = false;

    for (const plate of plates.current) {
      const rect = plate.el.getBoundingClientRect();
      if (rect.width < 1 || rect.height < 1) continue;

      const x = rect.left - origin.left;
      const y = rect.top - origin.top;

      if (still) {
        plate.lightX = targetX;
        plate.lightY = targetY;
        plate.intensity = 0.7;
      } else {
        const centerX = x + rect.width / 2;
        const centerY = y + rect.height / 2;

        if (!plate.placed) {
          plate.lightX = lit ? targetX : centerX - 120;
          plate.lightY = lit ? targetY : centerY - 80;
          plate.placed = true;
        }

        if (lit) {
          // Plates farther from the pointer answer later, so the reflection travels instead of snapping.
          const distance = Math.hypot(targetX - centerX, targetY - centerY);
          const follow = 1 - Math.exp((-plate.rate / (1 + distance / 500)) * dt);
          plate.lightX += (targetX - plate.lightX) * follow;
          plate.lightY += (targetY - plate.lightY) * follow;
          if (Math.abs(targetX - plate.lightX) + Math.abs(targetY - plate.lightY) > 0.3) moving = true;
        }

        const targetIntensity = lit ? 1 : 0;
        plate.intensity += (targetIntensity - plate.intensity) * (1 - Math.exp(-(lit ? plate.rate : 1.6) * dt));
        if (Math.abs(targetIntensity - plate.intensity) > 0.004) moving = true;
      }

      rects.setXYZW(n, x, y, rect.width, rect.height);
      lights.setXYZW(n, plate.lightX, plate.lightY, plate.intensity, plate.seed);
      radii.setX(n, plate.radius);
      n++;
    }

    geometry.instanceCount = n;
    rects.needsUpdate = true;
    lights.needsUpdate = true;
    radii.needsUpdate = true;
    (material.uniforms.uRes!.value as Vector2).set(size.width, size.height);

    // Draw only while a light is still travelling.
    if (moving) invalidate();
  });

  return <mesh geometry={geometry} material={material} frustumCulled={false} />;
}

export default function FoilCanvas({ host, still }: { host: HTMLElement; still: boolean }) {
  return (
    <Canvas
      frameloop="demand"
      dpr={[1, 2]}
      gl={{ alpha: true, antialias: false, depth: false, stencil: false, powerPreference: 'high-performance' }}
      resize={{ scroll: false, debounce: 0 }}
      style={{ pointerEvents: 'none' }}
    >
      <Foil host={host} still={still} />
    </Canvas>
  );
}

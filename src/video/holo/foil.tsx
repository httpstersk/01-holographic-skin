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

/** How fast the light drifts and the film's phase shifts, against a speed of 1. */
const FLOW = 1.6;

/** Most plates the layer lights at once. */
const MAX_PLATES = 64;

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
 * Sleek, dot-free physical thin-film interference shader for [data-holo] control plates.
 * Because this layer uses `mix-blend-multiply` over white ink and borders, rich chromatic saturation
 * (keeping channels below 1.0 except at crisp specular crests) produces a lush, liquid-smooth
 * metallic prism look without washing out to flat white.
 */
const fragmentShader = /* glsl */ `
  precision highp float;

  uniform vec2 uRes;
  uniform float uTime;

  varying vec2 vPx;
  varying vec2 vLocal;
  varying vec2 vHalf;
  varying vec4 vLight;
  varying float vRadius;

  const float BENTO_TONE = 3.0;
  const float VIVID = 1.55;
  const float GLEAM = 1.9;
  const float BANDS = 1.4;

  float sdRoundBox(vec2 p, vec2 b, float r) {
    vec2 q = abs(p) - b + r;
    return length(max(q, 0.0)) + min(max(q.x, q.y), 0.0) - r;
  }

  // Rich, continuous thin-film spectral interference (zero grain or pixel dots)
  vec3 thinFilmSpectrum(float t, float toneId) {
    vec3 shift = vec3(0.0, 0.33, 0.67) + toneId * vec3(0.17, 0.29, 0.41);
    vec3 c1 = 0.52 + 0.46 * cos(6.2831853 * (t + shift));
    vec3 c2 = 0.52 + 0.46 * cos(6.2831853 * (t * 1.5 - shift.yzx + 0.15));
    return mix(c1, c2, 0.28);
  }

  void main() {
    float radius = min(vRadius, min(vHalf.x, vHalf.y));
    float d = sdRoundBox(vLocal, vHalf, radius);
    float aa = max(fwidth(d), 0.75);
    float alpha = 1.0 - smoothstep(-aa * 0.5, aa * 0.5, d);
    if (alpha <= 0.0) discard;

    float intensity = vLight.z;
    float seed = vLight.w;
    vec2 toLight = vPx - vLight.xy;
    float reach = clamp(0.75 * length(uRes), 420.0, 1200.0);
    float near = exp(-dot(toLight, toLight) / (reach * reach));

    // Smooth surface normal from rounded-box SDF for physical bevel refraction
    vec2 norm2D = vLocal / max(vHalf, vec2(1.0));
    float rimFactor = 1.0 - smoothstep(0.0, 14.0, -d);

    // Continuous anisotropic diffraction phase (zero pixel noise)
    float tiltAngle = seed * 6.2831853 + BENTO_TONE * 0.65;
    vec2 tilt = vec2(cos(tiltAngle), sin(tiltAngle));
    float phase = (dot(toLight, vec2(0.0036, 0.0024))
                + dot(toLight, tilt) * 0.0018
                + dot(norm2D, vec2(0.28, -0.22))
                + rimFactor * 0.24) * BANDS
                + seed * 0.61
                + uTime * 0.08;

    // Smooth liquid undulation across control surfaces
    phase += 0.05 * sin(vPx.x * 0.024 - vPx.y * 0.018 + uTime * 0.4 + seed * 6.28);

    vec3 holo = thinFilmSpectrum(phase, BENTO_TONE);

    // Silky anisotropic specular band that shifts phase and adds a pearlescent gleam
    float streakAngle = 0.85 + (seed - 0.5) * 0.6 + BENTO_TONE * 0.18;
    vec2 streakDir = vec2(cos(streakAngle), sin(streakAngle));
    float band = dot(toLight, streakDir) - 55.0;
    float specular = exp(-band * band / 5400.0) * near;

    // Pearlescent highlight shifts toward a secondary harmonic rather than bleaching to flat white
    vec3 pearlGleam = thinFilmSpectrum(phase + 0.25, BENTO_TONE + 1.0) * 0.35 + vec3(0.65);
    holo = mix(holo, pearlGleam, clamp(specular * 0.55 * GLEAM, 0.0, 1.0));

    // Subtle metallic silver-chrome base when unlit
    vec3 chrome = vec3(0.72, 0.76, 0.84) + 0.05 * cos(vPx.y * 0.02 + seed * 5.0);

    float energy = clamp(intensity * (0.65 + 0.35 * near), 0.0, 1.0);
    vec3 color = mix(chrome, holo, energy);
    color = mix(vec3(dot(color, vec3(0.2126, 0.7152, 0.0722))), color, VIVID);

    // Ensure deep blues/violets stay luminous on dark cards without washing out saturation
    float luma = dot(color, vec3(0.2126, 0.7152, 0.0722));
    color += max(0.0, 0.44 - luma) * 0.75;
    color = clamp(color, 0.0, 0.98);

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
  const clockRef = useRef(0);

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
      uniforms: {
        uRes: { value: new Vector2(1, 1) },
        uTime: { value: 0 },
      },
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
              rate: 5 + 9 * ((seed * 7.31) % 1),
              radius: 0,
              lightX: 0,
              lightY: 0,
              intensity: 0.92,
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
    mutations.observe(host, {
      childList: true,
      subtree: true,
      attributes: true,
      attributeFilter: ['data-visible'],
    });
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
    clockRef.current += dt * FLOW;
    const origin = host.getBoundingClientRect();
    const state = pointer.current;
    const lit = still || state.hover || state.focus;

    // Gentle ambient orbit when the pointer is outside so controls still have a sleek physical sheen at rest
    const ambientX = origin.width * (0.48 + 0.25 * Math.cos(clockRef.current * 0.5 + 1.8));
    const ambientY = origin.height * (0.52 + 0.22 * Math.sin(clockRef.current * 0.38 + 1.2));

    const targetX = still ? origin.width * 0.35 : lit ? state.x - origin.left : ambientX;
    const targetY = still ? origin.height * 0.38 : lit ? state.y - origin.top : ambientY;

    let n = 0;

    for (const plate of plates.current) {
      const rect = plate.el.getBoundingClientRect();
      if (rect.width < 1 || rect.height < 1) continue;

      const x = rect.left - origin.left;
      const y = rect.top - origin.top;

      if (still) {
        plate.lightX = targetX;
        plate.lightY = targetY;
        plate.intensity = 0.9;
      } else {
        const centerX = x + rect.width / 2;
        const centerY = y + rect.height / 2;

        if (!plate.placed) {
          plate.lightX = targetX;
          plate.lightY = targetY;
          plate.placed = true;
        }

        const distance = Math.hypot(targetX - centerX, targetY - centerY);
        const follow = 1 - Math.exp((-plate.rate / (1 + distance / 520)) * dt);
        plate.lightX += (targetX - plate.lightX) * follow;
        plate.lightY += (targetY - plate.lightY) * follow;

        const targetIntensity = lit ? 1 : 0.9;
        plate.intensity += (targetIntensity - plate.intensity) * (1 - Math.exp(-(lit ? plate.rate : 2.5) * dt));
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
    material.uniforms.uTime!.value = clockRef.current;

    const controlsVisible = host.hasAttribute('data-visible');
    if (!still && controlsVisible) invalidate();
  });

  return <mesh geometry={geometry} material={material} frustumCulled={false} />;
}

export default function FoilCanvas({ host, still }: { host: HTMLElement; still: boolean }) {
  return (
    <Canvas
      frameloop="demand"
      dpr={[1, 2]}
      gl={{ alpha: true, antialias: true, depth: false, stencil: false, powerPreference: 'high-performance' }}
      resize={{ scroll: false, debounce: 0 }}
      style={{ pointerEvents: 'none' }}
    >
      <Foil host={host} still={still} />
    </Canvas>
  );
}

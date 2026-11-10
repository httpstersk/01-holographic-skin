/** @jsxImportSource react */

import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { useEffect, useMemo, useRef } from 'react';
import { DoubleSide, PlaneGeometry, ShaderMaterial, Vector2 } from 'three';

const vertexShader = /* glsl */ `
  varying vec2 vUv;

  void main() {
    vUv = uv;
    gl_Position = vec4(position.xy * 2.0, 0.0, 1.0);
  }
`;

/*
 * Full-video physical holographic lighting shader.
 * Covers the entire video frame when idle (paused / ended), creating a sleek,
 * dot-free physical glass-and-foil optical surface with thin-film interference,
 * sweeping anamorphic light sheets across the whole video, and beveled edge caustics.
 */
const fragmentShader = /* glsl */ `
  precision highp float;

  uniform vec2 uRes;
  uniform vec2 uPointer;     // Normalized pointer in [0, 1], spring-damped
  uniform float uTime;
  uniform float uIdle;       // 0.0 (playing) -> 1.0 (idle)
  uniform float uHover;      // 0.0 (pointer outside) -> 1.0 (pointer inside)

  varying vec2 vUv;

  const float BENTO_TONE = 3.0;

  float sdRoundBox(vec2 p, vec2 b, float r) {
    vec2 q = abs(p) - b + r;
    return length(max(q, 0.0)) + min(max(q.x, q.y), 0.0) - r;
  }

  // Smooth, continuous thin-film interference spectrum (zero pixel noise)
  vec3 physicalSpectrum(float phase, float toneId) {
    vec3 shift = vec3(0.0, 0.33, 0.67) + toneId * vec3(0.16, 0.28, 0.42);
    vec3 c1 = 0.5 + 0.5 * cos(6.2831853 * (phase + shift));
    vec3 c2 = 0.5 + 0.5 * cos(6.2831853 * (phase * 1.38 - shift.zxy + 0.18));
    return mix(c1, c2, 0.3);
  }

  void main() {
    if (uIdle <= 0.002) discard;

    float aspect = uRes.x / max(uRes.y, 1.0);
    vec2 uv = vec2(vUv.x, 1.0 - vUv.y); // Top-left origin to match DOM coordinates
    vec2 centered = (uv - 0.5) * vec2(aspect, 1.0);
    vec2 lightPos = (uPointer - 0.5) * vec2(aspect, 1.0);

    vec2 toLight = centered - lightPos;
    float dist = length(toLight);

    // 1. Continuous 3D optical surface wave field across the entire video (zero pixel dots)
    float waveA = sin(centered.x * 2.6 - centered.y * 2.1 + uTime * 0.36 + BENTO_TONE * 0.9);
    float waveB = cos(centered.x * 1.9 + centered.y * 3.1 - uTime * 0.28 + dist * 1.8);
    float surfaceCurvature = (waveA * 0.55 + waveB * 0.45) * 0.11;

    // 2. Full-Frame Primary & Secondary Anamorphic Light Sheets
    float sheetAngle = 0.64 + BENTO_TONE * 0.18 + 0.1 * sin(uTime * 0.22);
    vec2 sheetDir = vec2(cos(sheetAngle), sin(sheetAngle));
    vec2 orthoDir = vec2(-sheetDir.y, sheetDir.x);

    float alongPrimary = dot(centered - lightPos * 0.65, sheetDir) + surfaceCurvature;
    float acrossPrimary = dot(centered - lightPos * 0.35, orthoDir);

    // Wide diagonal physical reflection sheet spanning the whole video + crisp specular crest
    float fullFrameSheet = exp(-(alongPrimary * alongPrimary) / 0.48) * exp(-(acrossPrimary * acrossPrimary) / 3.2);
    float specularCrest = exp(-(alongPrimary * alongPrimary) / 0.055) * exp(-(acrossPrimary * acrossPrimary) / 1.8);

    // Counter-diagonal secondary prism wave so the entire video surface feels physically lit
    float secondaryCoord = dot(centered + lightPos * 0.4, vec2(sheetDir.x, -sheetDir.y)) - surfaceCurvature * 1.2 + 0.22;
    float secondarySheet = exp(-(secondaryCoord * secondaryCoord) / 0.32);

    // Soft 3D point-light dome falloff over the entire video
    float domeLight = exp(-dist * dist / 1.35);

    // 3. Physical Bevel & Frame Edge Fresnel Caustics
    vec2 px = uv * uRes;
    vec2 halfRes = uRes * 0.5;
    float edgeSdf = -sdRoundBox(px - halfRes, halfRes, 12.0);
    float innerBevel = exp(-edgeSdf / 56.0);
    float rimLine = exp(-edgeSdf / 8.0);

    // 4. Thin-Film Optical Phase Calculation across the full frame
    float opticalPhase = alongPrimary * 1.15
                       + acrossPrimary * 0.42
                       + dist * 0.52
                       + surfaceCurvature * 2.1
                       + innerBevel * 0.32
                       - uTime * 0.08
                       + BENTO_TONE * 0.21;

    vec3 iridPrimary = physicalSpectrum(opticalPhase, BENTO_TONE);
    vec3 iridSecondary = physicalSpectrum(opticalPhase + 0.38, BENTO_TONE + 0.5);
    vec3 crystalWhite = vec3(0.94, 0.97, 1.0);

    vec3 surfaceColor = mix(iridPrimary, iridSecondary, secondarySheet * 0.45);
    surfaceColor = mix(surfaceColor, crystalWhite, specularCrest * 0.35);
    vec3 rimColor = mix(iridPrimary, crystalWhite, 0.22);

    // Balanced full-frame physical lighting: subtle enough to preserve video contrast, epic in reach
    float hoverBoost = mix(0.92, 1.18, uHover);
    float bodyLuminance = (
      fullFrameSheet * 0.16 +
      specularCrest * 0.15 +
      secondarySheet * 0.09 +
      domeLight * 0.08
    ) * hoverBoost;

    float edgeLuminance = (innerBevel * 0.16 + rimLine * 0.25) * (0.65 + 0.35 * domeLight);

    float totalAlpha = clamp((bodyLuminance + edgeLuminance) * uIdle, 0.0, 0.55);
    vec3 finalColor = surfaceColor * (bodyLuminance * uIdle) + rimColor * (edgeLuminance * uIdle);

    gl_FragColor = vec4(finalColor, totalAlpha);
  }
`;

function AmbientHoloPlane({
  host,
  still,
  idle,
}: {
  host: HTMLElement;
  still: boolean;
  idle: boolean;
}) {
  const invalidate = useThree((state) => state.invalidate);
  const size = useThree((state) => state.size);

  const pointer = useRef({
    targetX: 0.54,
    targetY: 0.46,
    currX: 0.54,
    currY: 0.46,
    velX: 0,
    velY: 0,
    hover: false,
    hoverSmooth: 0,
  });
  const idleSmooth = useRef(idle ? 1 : 0);
  const timeRef = useRef(0);

  const { geometry, material } = useMemo(() => {
    const geometry = new PlaneGeometry(1, 1);
    const material = new ShaderMaterial({
      vertexShader,
      fragmentShader,
      uniforms: {
        uRes: { value: new Vector2(1, 1) },
        uPointer: { value: new Vector2(0.54, 0.46) },
        uTime: { value: 0 },
        uIdle: { value: idle ? 1 : 0 },
        uHover: { value: 0 },
      },
      depthTest: false,
      depthWrite: false,
      side: DoubleSide,
      transparent: true,
    });
    return { geometry, material };
  }, []);

  useEffect(
    () => () => {
      geometry.dispose();
      material.dispose();
    },
    [geometry, material]
  );

  useEffect(() => {
    invalidate();
  }, [idle, invalidate]);

  useEffect(() => {
    if (still) return;

    const root = host.closest<HTMLElement>('.media-skin') ?? host;
    const state = pointer.current;

    const onMove = (event: PointerEvent) => {
      const rect = root.getBoundingClientRect();
      if (rect.width < 1 || rect.height < 1) return;
      state.targetX = Math.min(1, Math.max(0, (event.clientX - rect.left) / rect.width));
      state.targetY = Math.min(1, Math.max(0, (event.clientY - rect.top) / rect.height));
      state.hover = true;
      invalidate();
    };

    const onLeave = () => {
      state.hover = false;
      invalidate();
    };

    root.addEventListener('pointermove', onMove, { passive: true });
    root.addEventListener('pointerdown', onMove, { passive: true });
    root.addEventListener('pointerleave', onLeave);
    root.addEventListener('pointercancel', onLeave);

    return () => {
      root.removeEventListener('pointermove', onMove);
      root.removeEventListener('pointerdown', onMove);
      root.removeEventListener('pointerleave', onLeave);
      root.removeEventListener('pointercancel', onLeave);
    };
  }, [host, invalidate, still]);

  useFrame((_, delta) => {
    const dt = Math.min(delta, 0.05);
    const targetIdle = idle ? 1 : 0;
    const prevIdle = idleSmooth.current;
    idleSmooth.current += (targetIdle - prevIdle) * (1 - Math.exp(-(idle ? 4.5 : 6.5) * dt));

    const state = pointer.current;
    const targetHover = state.hover ? 1 : 0;
    state.hoverSmooth += (targetHover - state.hoverSmooth) * (1 - Math.exp(-5.0 * dt));

    if (!still) {
      timeRef.current += dt;
    }

    // Autonomous slow figure-8 orbital drift across the video when pointer is not hovering
    const driftX = 0.5 + 0.24 * Math.cos(timeRef.current * 0.42 + 1.95);
    const driftY = 0.48 + 0.2 * Math.sin(timeRef.current * 0.62 + 1.35);

    const goalX = still ? 0.45 : state.hover ? state.targetX : driftX;
    const goalY = still ? 0.42 : state.hover ? state.targetY : driftY;

    // Spring-damped physical light motion
    const stiffness = state.hover ? 42 : 14;
    const damping = state.hover ? 9.5 : 6.0;
    const ax = (goalX - state.currX) * stiffness - state.velX * damping;
    const ay = (goalY - state.currY) * stiffness - state.velY * damping;
    state.velX += ax * dt;
    state.velY += ay * dt;
    state.currX += state.velX * dt;
    state.currY += state.velY * dt;

    (material.uniforms.uRes!.value as Vector2).set(size.width, size.height);
    (material.uniforms.uPointer!.value as Vector2).set(state.currX, state.currY);
    material.uniforms.uTime!.value = timeRef.current;
    material.uniforms.uIdle!.value = idleSmooth.current;
    material.uniforms.uHover!.value = state.hoverSmooth;

    const isTransitioning = Math.abs(targetIdle - idleSmooth.current) > 0.003;
    const isVisibleAndLive = idleSmooth.current > 0.005 && !still;
    if (isTransitioning || isVisibleAndLive) {
      invalidate();
    }
  });

  return <mesh geometry={geometry} material={material} frustumCulled={false} />;
}

export default function AmbientHoloCanvas({
  host,
  still,
  idle,
}: {
  host: HTMLElement;
  still: boolean;
  idle: boolean;
}) {
  return (
    <Canvas
      frameloop="demand"
      dpr={[1, 2]}
      gl={{ alpha: true, antialias: true, depth: false, stencil: false, powerPreference: 'high-performance' }}
      resize={{ scroll: false, debounce: 0 }}
      style={{ pointerEvents: 'none' }}
    >
      <AmbientHoloPlane host={host} still={still} idle={idle} />
    </Canvas>
  );
}

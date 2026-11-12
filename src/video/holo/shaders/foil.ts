export interface FoilFinish {
  angle: number;
  thickness: number;
  grooves: number;
  tint: readonly [number, number, number];
  chroma: number;
  etched?: boolean;
}

export const etchedFoilFinish = {
  angle: -0.54,
  thickness: 158,
  grooves: 24,
  tint: [1.12, 1.06, 0.9],
  chroma: 0.9,
  etched: true,
} satisfies FoilFinish;

/** The liquid-chrome film on the Mux mark and on the control bar. */
export const muxFoilFinish = {
  angle: -0.54,
  thickness: 75,
  grooves: 29,
  tint: [1.19, 1.06, 0.81],
  chroma: 0.59,
} satisfies FoilFinish;

export function foilFinishUniforms(finish: FoilFinish) {
  return {
    grating: [Math.cos(finish.angle), Math.sin(finish.angle), finish.grooves, finish.thickness] as const,
    metal: [...finish.tint, finish.chroma] as const,
    etched: finish.etched ?? false,
  };
}

/** Gaussian sigma, in CSS pixels, of the height map that a renderer supplies for mask-driven foil. */
export const foilMaskBlur = 2.8;

// GLSL ES 1.00 works in the site's WebGL context and in Three.js RawShaderMaterial.
export const foilVertexShader = /* glsl */ `
precision highp float;
attribute vec3 position;
varying vec2 vUv;

#ifdef FOIL_PLATES
attribute vec4 plateRect;
attribute float plateRadius;
uniform vec2 resolution;
varying vec2 vLocal;
varying vec2 vHalfSize;
varying float vRadius;
#endif

void main() {
  #ifdef FOIL_PLATES
    vec2 localUv = vec2(position.x, -position.y) * 0.5 + 0.5;
    vec2 point = (plateRect.xy + localUv * plateRect.zw) / resolution;
    vUv = vec2(point.x, 1.0 - point.y);
    vLocal = (localUv - 0.5) * plateRect.zw;
    vHalfSize = plateRect.zw * 0.5;
    vRadius = plateRadius;
    gl_Position = vec4(vUv * 2.0 - 1.0, 0.0, 1.0);
  #else
    vUv = position.xy * 0.5 + 0.5;
    gl_Position = vec4(position.xy, 0.0, 1.0);
  #endif
}
`;

export const foilFragmentShader = /* glsl */ `
precision highp float;
varying vec2 vUv;
uniform vec2 resolution;
uniform vec2 lightPosition;
uniform float time;
uniform float relief;
// CSS pixels covered by one device pixel.
uniform float pixelSize;
uniform vec4 grating;
uniform vec4 metal;
uniform bool etched;

#if defined(FOIL_PLATES)
varying vec2 vLocal;
varying vec2 vHalfSize;
varying float vRadius;
#elif defined(FOIL_AMBIENT)
uniform float opacity;
#else
// Red and green pack the blurred height as 16 bits, and blue is the sharp outline.
uniform sampler2D mask;
#endif

// The bevel is a short rounded ramp. Its slope is capped well below vertical, and the
// film and highlight below are averaged over the slope that one device pixel spans.
const float BEVEL = 7.0;
const float RIM = 0.36;
const float FOOTPRINT = 2.0;
const float MASK_SIGMA = ${foilMaskBlur.toFixed(2)};
const float FILM_INDEX = 1.45;

#if defined(FOIL_PLATES) || defined(FOIL_AMBIENT)
float roundedDistance(vec2 point, vec2 halfSize, float radius) {
  vec2 corner = abs(point) - halfSize + radius;
  return length(max(corner, 0.0)) + min(max(corner.x, corner.y), 0.0) - radius;
}

// Returns the inward slope, the bevel weight, and the slope change per CSS pixel.
vec4 roundedRelief(vec2 point, vec2 halfSize, float radius, float distance) {
  float width = min(BEVEL, max(min(halfSize.x, halfSize.y) - 0.5, 1.0));
  float depth = clamp(-distance / width, 0.0, 1.0);
  if (depth >= 1.0) return vec4(0.0);

  vec2 delta = vec2(0.5, 0.0);
  vec2 gradient = vec2(
    roundedDistance(point + delta.xy, halfSize, radius) - roundedDistance(point - delta.xy, halfSize, radius),
    roundedDistance(point + delta.yx, halfSize, radius) - roundedDistance(point - delta.yx, halfSize, radius)
  );
  vec2 inward = -gradient / max(length(gradient), 0.0001);
  float falloff = 1.0 - depth;
  return vec4(inward * RIM * falloff * falloff, smoothstep(0.0, 1.0, falloff * 1.5), RIM * 2.0 * falloff / width);
}
#endif

#if !defined(FOIL_PLATES) && !defined(FOIL_AMBIENT)
float unpackHeight(vec4 texel) {
  return (texel.r * 255.0 + texel.g) / 255.0;
}
#endif

// The renderers supply different shapes. This returns coverage and writes the slope, bevel weight, and slope change.
float sampleSurface(vec2 point, vec2 aspect, out vec4 shape) {
  shape = vec4(0.0);
  #if defined(FOIL_PLATES)
    float radius = min(vRadius, min(vHalfSize.x, vHalfSize.y));
    float distance = roundedDistance(vLocal, vHalfSize, radius);
    shape = roundedRelief(vLocal, vHalfSize, radius, distance);
    return smoothstep(0.0, 1.0, -distance);
  #elif defined(FOIL_AMBIENT)
    if (opacity <= 0.002) return 0.0;

    vec2 halfSize = resolution * 0.5;
    vec2 local = (point - 0.5) * resolution;
    float radius = min(12.0, min(halfSize.x, halfSize.y));
    float distance = roundedDistance(local, halfSize, radius);
    float rim = exp(min(distance, 0.0) / 22.0);
    vec2 toLight = (point - lightPosition) * aspect;
    float band = dot(toLight, grating.xy);
    float sweep = exp(-band * band / 0.14 - dot(toLight, toLight) * 0.7);
    shape = roundedRelief(local, halfSize, radius, distance);
    return opacity * smoothstep(0.0, 1.0, -distance) * (0.055 + 0.17 * sweep + 0.18 * rim);
  #else
    vec4 center = texture2D(mask, point);
    if (center.b < 0.01) return 0.0;

    vec2 texel = 1.0 / resolution;
    float height = unpackHeight(center);
    float left = unpackHeight(texture2D(mask, point - vec2(texel.x, 0.0)));
    float right = unpackHeight(texture2D(mask, point + vec2(texel.x, 0.0)));
    float above = unpackHeight(texture2D(mask, point - vec2(0.0, texel.y)));
    float below = unpackHeight(texture2D(mask, point + vec2(0.0, texel.y)));

    vec2 gradient = vec2(right - left, below - above) * 0.5 / pixelSize;
    float laplacian = (left + right + above + below - 4.0 * height) / (pixelSize * pixelSize);
    float falloff = 1.0 - clamp(2.0 * height - 1.0, 0.0, 1.0);
    // A blurred straight edge peaks at 0.3989 / sigma, and this gain makes that peak equal RIM.
    float gain = RIM * MASK_SIGMA / 0.3989;
    shape = vec4(
      gradient * gain * falloff,
      smoothstep(0.0, 1.0, falloff * 1.5),
      gain * (2.0 * dot(gradient, gradient) + falloff * abs(laplacian))
    );
    return center.b;
  #endif
}

float hash(vec2 point) {
  return fract(sin(dot(point, vec2(127.1, 311.7))) * 43758.5453);
}

float noise(vec2 point) {
  vec2 cell = floor(point);
  vec2 fraction = fract(point);
  vec2 weight = fraction * fraction * (3.0 - 2.0 * fraction);
  return mix(
    mix(hash(cell), hash(cell + vec2(1.0, 0.0)), weight.x),
    mix(hash(cell + vec2(0.0, 1.0)), hash(cell + vec2(1.0, 1.0)), weight.x),
    weight.y
  );
}

vec3 sinc(vec3 x) {
  vec3 shifted = x + 0.0001;
  return sin(shifted) / shifted;
}

// Light bends into the film, so the path length follows the refracted angle.
float opticalPath(vec2 surfaceNormal, vec3 viewDirection, float baseThickness, float surfaceWeight) {
  vec3 normal = normalize(vec3(surfaceNormal, 1.0));
  float cosine = clamp(dot(normal, viewDirection), 0.0, 1.0);
  float filmCosine = sqrt(max(1.0 - (1.0 - cosine * cosine) / (FILM_INDEX * FILM_INDEX), 0.0));
  float thickness = baseThickness + 140.0 * surfaceWeight * dot(normal.xy, vec2(1.0));
  return 2.0 * FILM_INDEX * thickness * filmCosine;
}

// The squared cosine fringe, averaged over a path range of the given spread.
vec3 filmColor(float pathDifference, float spread) {
  vec3 wavelengths = vec3(650.0, 532.0, 450.0);
  vec3 phase = 6.28318 * pathDifference / wavelengths;
  vec3 width = 6.28318 * spread / wavelengths;
  return 0.375 + 0.5 * cos(phase) * sinc(width * 0.5) + 0.125 * cos(2.0 * phase) * sinc(width);
}

void main() {
  vec2 point = vec2(vUv.x, 1.0 - vUv.y);
  vec2 aspect = vec2(resolution.x / resolution.y, 1.0);
  vec4 shape;
  float alpha = sampleSurface(point, aspect, shape);
  if (alpha < 0.01) {
    gl_FragColor = vec4(0.0);
    return;
  }

  float edge = shape.z;
  float surfaceWeight = 1.0 - edge * 0.85;

  #ifdef FOIL_AMBIENT
    // Keep fine grain on the foil itself and give the full-video glow a smooth finish.
    vec2 grain = vec2(0.5);
  #else
    vec2 grain = vec2(noise(point * resolution * 0.35), noise(point * resolution * 0.3 + 7.0));
  #endif
  float mottling = noise(point * 3.0 + time * 0.05) * 0.6 + noise(point * 7.0) * 0.4;
  vec2 tilt = vec2(-shape.x, shape.y) * relief;
  vec2 surfaceNormal = tilt + (grain - 0.5) * 0.025 * surfaceWeight;
  vec3 normal = normalize(vec3(surfaceNormal, 1.0));

  vec2 light = lightPosition + vec2(sin(time * 0.4), cos(time * 0.33)) * 0.15;
  vec3 lightDirection = normalize(vec3((light - point) * aspect * 0.9, 0.9));
  vec3 viewDirection = normalize(vec3((point - 0.5) * aspect * 0.25 + (light - 0.5) * 0.6, 1.0));
  float cosine = clamp(dot(normal, viewDirection), 0.0, 1.0);
  float ruling = dot(point * aspect, grating.xy);
  float groove = sin(ruling * 26.0 + 2.0 * sin(point.y * 7.0) - time * 0.18);
  float baseThickness = 300.0 + 170.0 * dot(point, vec2(0.7, 0.3))
    + 180.0 * (light.x - 0.5) + 90.0 * mottling + 40.0 * sin(time * 0.25)
    + grating.w + grating.z * groove;

  // How far the slope turns across one device pixel, which the film and highlight average over.
  float tiltChange = shape.w * relief * pixelSize * FOOTPRINT;
  vec2 offset = tilt / max(length(tilt), 0.0001) * (tiltChange * 0.5);
  float pathDifference = opticalPath(surfaceNormal, viewDirection, baseThickness, surfaceWeight);
  float pathSpread = abs(
    opticalPath(surfaceNormal + offset, viewDirection, baseThickness, surfaceWeight)
      - opticalPath(surfaceNormal - offset, viewDirection, baseThickness, surfaceWeight)
  );

  vec3 color = filmColor(pathDifference, pathSpread);
  color = mix(vec3(dot(color, vec3(0.333))), color, 1.25);
  color = clamp(mix(color, vec3(0.9, 0.95, 1.0), 0.12), 0.0, 1.0);

  vec3 halfway = normalize(lightDirection + viewDirection);
  float normalTurn = tiltChange / (1.0 + dot(tilt, tilt));
  float lobe = 2.0 / 62.0 + 0.5 * normalTurn * normalTurn;
  float power = max(2.0 / lobe - 2.0, 4.0);
  float specular = pow(max(dot(normal, halfway), 0.0), power) * (power + 2.0) / 62.0;
  float diffuse = max(dot(normal, lightDirection), 0.0);
  #ifdef FOIL_AMBIENT
    float sparkle = 0.0;
  #else
    float sparkle = step(0.985, hash(floor(point * resolution * 0.5) + floor(time * 6.0))) * diffuse;
  #endif

  vec3 outputColor;
  if (etched) {
    // A single sweep of light runs across all six etched glyphs.
    float field = dot(point - 0.5, grating.xy) * 3.25 + 0.22 * sin(point.y * 4.6 + 1.0);
    float shift = dot(lightPosition - 0.5, vec2(0.52, -0.38)) + sin(time * 0.3) * 0.12;
    float phase = field + shift + grating.w / 290.0;
    vec3 spectrum = 0.53 + 0.47 * cos(6.28318 * (phase + vec3(0.0, -0.333, -0.667)));
    float shade = smoothstep(0.16, 0.85, abs(sin(field * 4.8 + 0.8)));
    spectrum = mix(vec3(0.28, 0.32, 0.23), spectrum, 0.46 + shade * 0.54);
    vec3 reflected = mix(spectrum, color, 0.23) * (0.69 + diffuse * 0.31);
    float sheen = pow(0.5 + 0.5 * cos(6.28318 * (phase * 0.77 - 0.24)), 9.0);
    outputColor = mix(reflected, vec3(0.98, 0.95, 0.86), 0.12 + sheen * 0.44 + specular * 0.15);
    outputColor += (grain.x - 0.5) * 0.055 + sparkle * 0.065 * surfaceWeight + edge * 0.11;
  } else {
    float fresnel = pow(1.0 - cosine, 3.0);
    outputColor = color * (0.25 + 0.95 * diffuse)
      + vec3(specular * 0.9) + sparkle * 0.24 * surfaceWeight;
    outputColor *= 1.0 - fresnel * 0.6 * surfaceWeight;
    float luminance = dot(outputColor, vec3(0.299, 0.587, 0.114));
    float shadowLift = 1.0 - smoothstep(0.1, 0.45, luminance);
    outputColor = mix(outputColor, mix(color, vec3(1.0), 0.45), shadowLift * 0.8);
  }

  float brightness = dot(outputColor, vec3(0.299, 0.587, 0.114));
  outputColor = mix(vec3(brightness), outputColor, metal.w);
  float brushing = 1.0 - min(grating.z / 900.0, 0.08) * (0.5 + 0.5 * cos(ruling * 480.0));
  outputColor *= metal.rgb * brushing;

  #ifdef FOIL_PLATES
    // The control plates carry dark text and icons, so lift the darkest parts of the spectrum.
    outputColor = clamp(outputColor, 0.0, 1.0);
    float luma = dot(outputColor, vec3(0.2126, 0.7152, 0.0722));
    outputColor = mix(outputColor, vec3(1.0), max(0.0, 0.53 - luma) / max(0.001, 1.0 - luma));
  #endif

  gl_FragColor = vec4(outputColor * alpha, alpha);
}
`;

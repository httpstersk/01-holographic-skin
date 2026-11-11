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

export function foilFinishUniforms(finish: FoilFinish) {
  return {
    grating: [Math.cos(finish.angle), Math.sin(finish.angle), finish.grooves, finish.thickness] as const,
    metal: [...finish.tint, finish.chroma] as const,
    etched: finish.etched ?? false,
  };
}

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
// Red is the blurred relief height, green is the original outline.
uniform sampler2D mask;
#endif

#if defined(FOIL_PLATES) || defined(FOIL_AMBIENT)
float roundedDistance(vec2 point, vec2 halfSize, float radius) {
  vec2 corner = abs(point) - halfSize + radius;
  return length(max(corner, 0.0)) + min(max(corner.x, corner.y), 0.0) - radius;
}

float reliefHeight(float distance) {
  return smoothstep(-1.2, 2.8, -distance);
}

vec3 roundedRelief(vec2 point, vec2 halfSize, float radius, float distance) {
  if (distance < -4.3) return vec3(0.0);
  vec2 dx = vec2(1.5, 0.0);
  vec2 dy = vec2(0.0, 1.5);
  float slopeX = reliefHeight(roundedDistance(point + dx, halfSize, radius))
    - reliefHeight(roundedDistance(point - dx, halfSize, radius));
  float slopeY = reliefHeight(roundedDistance(point + dy, halfSize, radius))
    - reliefHeight(roundedDistance(point - dy, halfSize, radius));
  float edge = clamp((1.0 - reliefHeight(distance)) * 2.5, 0.0, 1.0);
  return vec3(slopeX, slopeY, edge);
}
#endif

// The renderers supply different shapes. Each returns slope, edge weight, and coverage in that order.
vec4 sampleSurface(vec2 point, vec2 aspect) {
  #if defined(FOIL_PLATES)
    float radius = min(vRadius, min(vHalfSize.x, vHalfSize.y));
    float distance = roundedDistance(vLocal, vHalfSize, radius);
    float alpha = smoothstep(0.0, 1.0, -distance);
    return vec4(roundedRelief(vLocal, vHalfSize, radius, distance), alpha);
  #elif defined(FOIL_AMBIENT)
    if (opacity <= 0.002) return vec4(0.0);

    vec2 halfSize = resolution * 0.5;
    vec2 local = (point - 0.5) * resolution;
    float radius = min(12.0, min(halfSize.x, halfSize.y));
    float distance = roundedDistance(local, halfSize, radius);
    float rim = exp(min(distance, 0.0) / 22.0);
    vec2 toLight = (point - lightPosition) * aspect;
    float band = dot(toLight, grating.xy);
    float sweep = exp(-band * band / 0.14 - dot(toLight, toLight) * 0.7);
    float alpha = opacity * smoothstep(0.0, 1.0, -distance) * (0.055 + 0.17 * sweep + 0.18 * rim);
    return vec4(roundedRelief(local, halfSize, radius, distance), alpha);
  #else
    vec2 pixel = 1.5 / resolution;
    vec2 sampleValue = texture2D(mask, point).rg;
    float alpha = smoothstep(0.3, 0.7, sampleValue.g);
    if (alpha < 0.01) return vec4(0.0);

    vec2 dx = vec2(pixel.x, 0.0);
    vec2 dy = vec2(0.0, pixel.y);
    float slopeX = texture2D(mask, point + dx).r - texture2D(mask, point - dx).r;
    float slopeY = texture2D(mask, point + dy).r - texture2D(mask, point - dy).r;
    float edge = clamp((sampleValue.g - sampleValue.r) * 2.5, 0.0, 1.0);
    return vec4(slopeX, slopeY, edge, alpha);
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

vec3 filmColor(float thickness, float cosine) {
  float pathDifference = 2.0 * 1.45 * thickness * cosine;
  vec3 wavelengths = vec3(650.0, 532.0, 450.0);
  vec3 color = 0.5 + 0.5 * cos(6.28318 * pathDifference / wavelengths);
  return color * color;
}

void main() {
  vec2 point = vec2(vUv.x, 1.0 - vUv.y);
  vec2 aspect = vec2(resolution.x / resolution.y, 1.0);
  vec4 surface = sampleSurface(point, aspect);
  float alpha = surface.a;
  if (alpha < 0.01) {
    gl_FragColor = vec4(0.0);
    return;
  }

  float edge = surface.z;
  float surfaceWeight = 1.0 - edge * 0.85;

  #ifdef FOIL_AMBIENT
    // Keep fine grain on the foil itself and give the full-video glow a smooth finish.
    vec2 grain = vec2(0.5);
  #else
    vec2 grain = vec2(noise(point * resolution * 0.35), noise(point * resolution * 0.3 + 7.0));
  #endif
  float mottling = noise(point * 3.0 + time * 0.05) * 0.6 + noise(point * 7.0) * 0.4;
  vec2 surfaceNormal = vec2(-surface.x, surface.y) * relief + (grain - 0.5) * 0.025 * surfaceWeight;
  vec3 normal = normalize(vec3(surfaceNormal, 1.0));

  vec2 light = lightPosition + vec2(sin(time * 0.4), cos(time * 0.33)) * 0.15;
  vec3 lightDirection = normalize(vec3((light - point) * aspect * 0.9, 0.9));
  vec3 viewDirection = normalize(vec3((point - 0.5) * aspect * 0.25 + (light - 0.5) * 0.6, 1.0));
  float cosine = clamp(dot(normal, viewDirection), 0.0, 1.0);
  float ruling = dot(point * aspect, grating.xy);
  float groove = sin(ruling * 26.0 + 2.0 * sin(point.y * 7.0) - time * 0.18);
  float thickness = 300.0 + 170.0 * dot(point, vec2(0.7, 0.3))
    + 140.0 * surfaceWeight * dot(normal.xy, vec2(1.0))
    + 180.0 * (light.x - 0.5) + 90.0 * mottling + 40.0 * sin(time * 0.25)
    + grating.w + grating.z * groove;

  vec3 color = filmColor(thickness, cosine);
  color = mix(vec3(dot(color, vec3(0.333))), color, 1.25);
  color = clamp(mix(color, vec3(0.9, 0.95, 1.0), 0.12), 0.0, 1.0);

  vec3 halfway = normalize(lightDirection + viewDirection);
  float specular = pow(max(dot(normal, halfway), 0.0), 60.0);
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
    outputColor += (grain.x - 0.5) * 0.055 + sparkle * 0.065 + edge * 0.11;
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

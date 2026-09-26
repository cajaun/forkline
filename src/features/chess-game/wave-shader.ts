import { Skia } from '@shopify/react-native-skia';

const WAVE_SKSL = `
uniform shader image;
uniform float2 u_res;
uniform float2 u_origin;
uniform float u_progress;
uniform float u_maxRadius;
uniform float u_band;
uniform float u_amplitude;
uniform float u_chroma;
uniform float u_glowStrength;
uniform float u_wobble;
uniform float u_maxBlur;
uniform float u_breath;
uniform float u_tint;
uniform float3 u_glow;
uniform float3 u_deep;
uniform float3 u_spark;

float hash(float2 p) {
  return fract(sin(dot(p, float2(127.1, 311.7))) * 43758.5453);
}

half3 spectrum(float t) {
  return half3(0.5 + 0.5 * cos(6.2831853 * (t + float3(0.0, 0.33, 0.67))));
}

half3 blurSample(float2 p, float r) {
  if (r < 0.75) return image.eval(p).rgb;
  half3 acc = half3(0.0);
  float j = hash(p) * 6.2831853;
  for (float i = 0.0; i < 32.0; i += 1.0) {
    float t = (i + 0.5) / 32.0;
    float rad = sqrt(t) * r;
    float a = i * 2.39996323 + j;
    acc += image.eval(p + float2(cos(a), sin(a)) * rad).rgb;
  }
  return acc / 32.0;
}

half4 main(float2 position) {
  float2 toOrigin = position - u_origin;
  float dist = length(toOrigin);
  float2 dir = dist > 0.0001 ? toOrigin / dist : float2(0.0);
  float ang = atan(toOrigin.y, toOrigin.x);
  float wob =
    1.0 + u_wobble * (sin(ang * 3.0) * 0.6 + sin(ang * 2.0 + 1.7) * 0.4);
  float w = u_band;
  float released = smoothstep(0.0, 0.12, u_progress);
  float fT = clamp((u_progress - 0.02) / 0.5, 0.0, 1.0);
  float fe = 1.0 - pow(1.0 - fT, 2.2);
  float front = u_maxRadius * fe * wob;
  float x = dist - front;
  float lens = exp(-(x * x) / (2.0 * w * w));
  float shell = lens * released;
  float grad = -(x / (w * w)) * lens;
  float bend = grad * w * u_amplitude * released;
  float2 off = dir * bend;
  float2 ca = dir * (abs(bend) * u_chroma);
  float dropR = u_maxRadius * smoothstep(0.06, 0.6, u_progress) * 1.35;
  float passed = smoothstep(dropR, dropR - u_res.x * 0.9, dist);
  float blurR = passed * (u_maxBlur + 2.5 * u_breath);
  float2 center = u_res * 0.5;
  float recede = 1.0 + 0.045 * smoothstep(0.2, 1.0, u_progress) * passed;
  float2 sp = center + (position - center) * recede + off;
  float greyFront = front - dist - w * 2.4;
  float greyEdge = exp(-(greyFront * greyFront) / (2.0 * (w * 3.0) * (w * 3.0)));
  float waveFade = 1.0 - smoothstep(0.45, 0.62, u_progress);
  float2 ca2 = dir * (greyEdge * w * u_chroma * 0.5);
  float2 caT = (ca + ca2) * waveFade;
  float chromaMix = max(shell, greyEdge) * waveFade;
  half3 g = blurSample(sp, blurR);
  half r = image.eval(sp + caT).r;
  half b = image.eval(sp - caT).b;
  half3 col = half3(mix(g.r, r, chromaMix), g.g, mix(g.b, b, chromaMix));
  float3 N = normalize(float3(-dir * (grad * w * 0.9), 1.0));
  float3 L3 = normalize(float3(-0.5, -0.78, 0.6));
  float3 H = normalize(L3 + float3(0.0, 0.0, 1.0));
  float diff = dot(N, L3);
  float spec = pow(max(dot(N, H), 0.0), 60.0);
  col += half3(0.82, 0.88, 1.0) * (clamp(diff, 0.0, 1.0) * shell * 0.32);
  col *= 1.0 - clamp(-diff, 0.0, 1.0) * shell * 0.4;
  col += half3(1.0, 1.0, 1.0) * (spec * shell * 2.4);
  float rim = exp(-(x * x) / (2.0 * (w * 0.45) * (w * 0.45))) * released;
  col += half3(0.85, 0.9, 1.0) * (rim * 0.18);
  float hueT = 0.42 + 0.24 * sin(ang * 2.0 + dist * 0.008 + u_progress * 2.5);
  col += spectrum(hueT) * (shell * u_glowStrength * waveFade);
  col += spectrum(hueT) * (greyEdge * u_glowStrength * 0.4 * waveFade);
  col += half3(0.78, 0.84, 1.0) * (greyEdge * 0.11 * waveFade);
  float md = max(u_res.x, u_res.y);
  float kd = dist / md;
  float glow = exp(-kd * kd * 6.5) * (0.85 + 0.15 * u_breath);
  half3 grey = half3(0.038, 0.046, 0.075);
  half3 backdrop = mix(grey, half3(u_glow), clamp(glow * 0.06, 0.0, 1.0));
  col = mix(col, backdrop, passed * u_tint);
  col += (hash(position * 0.7) - 0.5) * 0.03 * passed;
  float diag = (position.x * 0.5 + position.y) / (u_res.y * 1.3);
  float sheen = exp(-pow((diag - 0.32) * 2.4, 2.0));
  col += half3(0.55, 0.63, 0.85) * (sheen * 0.03 * passed);
  col += (hash(floor(position)) - 0.5) * 0.015;
  float2 uvc = position / u_res - 0.5;
  float vig = 1.0 - smoothstep(0.5, 1.05, length(uvc) * 1.25);
  col *= mix(1.0, 0.72 + 0.28 * vig, passed);
  float vy = position.y / u_res.y;
  float bottomDark = smoothstep(0.3, 0.62, vy) * 0.8;
  col *= 1.0 - bottomDark * passed;
  return half4(col, 1.0);
}
`;

export const WAVE = Skia.RuntimeEffect.Make(WAVE_SKSL)!;
export const GLOW: [number, number, number] = [0.8, 0.85, 0.95];
export const DEEP: [number, number, number] = [0.022, 0.026, 0.036];
export const SPARK: [number, number, number] = [0.78, 0.85, 1.0];
export const WAVE_MS = 3000;
export const EXIT_MS = 360;

import * as THREE from "three";

/**
 * Custom shaders on the page work directly in sRGB and write their result
 * untouched, so a hex here lands on screen as the same hex the CSS uses.
 */
export const srgb = (hex: string) => {
  const n = parseInt(hex.replace("#", ""), 16);
  return new THREE.Vector3(((n >> 16) & 255) / 255, ((n >> 8) & 255) / 255, (n & 255) / 255);
};

/** Ordered (Bayer) dithering, shared by every 1-bit surface on the page. */
export const bayerGLSL = /* glsl */ `
  float bayer2(vec2 a) { a = floor(a); return fract(dot(a, vec2(0.5, a.y * 0.75))); }
  float bayer4(vec2 a) { return bayer2(0.5 * a) * 0.25 + bayer2(a); }
  float bayer8(vec2 a) { return bayer4(0.5 * a) * 0.25 + bayer2(a); }
`;

export const statueVertex = /* glsl */ `
  varying vec3 vNormal;
  varying vec3 vWorld;
  varying vec3 vViewDir;
  void main() {
    vec4 wp = modelMatrix * vec4(position, 1.0);
    vWorld = wp.xyz;
    vNormal = normalize(mat3(modelMatrix) * normal);
    vViewDir = normalize(cameraPosition - wp.xyz);
    gl_Position = projectionMatrix * viewMatrix * wp;
  }
`;

export const statueFragment = /* glsl */ `
  uniform vec3 uLight;
  uniform float uDot;
  uniform float uReveal;
  uniform float uScan;
  uniform float uMinY;
  uniform float uMaxY;
  uniform vec3 uInk;
  uniform vec3 uAcid;
  uniform vec3 uPaper;
  varying vec3 vNormal;
  varying vec3 vWorld;
  varying vec3 vViewDir;
  ${bayerGLSL}
  void main() {
    float h = (vWorld.y - uMinY) / (uMaxY - uMinY);
    if (h > uReveal) discard;

    vec3 n = normalize(vNormal);
    if (!gl_FrontFacing) n = -n;
    float key = max(dot(n, normalize(uLight)), 0.0);
    float fill = max(dot(n, normalize(vec3(-0.7, 0.1, 0.5))), 0.0) * 0.16;
    float rim = pow(1.0 - max(dot(n, normalize(vViewDir)), 0.0), 2.4);
    float lum = key * 0.92 + fill + rim * 0.6;
    lum = pow(lum, 1.15);

    vec2 cell = floor(gl_FragCoord.xy / uDot);
    float on = step(bayer8(cell), lum);
    vec3 col = mix(uInk, uAcid, on);

    // a paper scan line that sweeps the figure once per bar
    float scan = 1.0 - smoothstep(0.0, 0.006, abs(h - uScan));
    col = mix(col, uPaper, scan * step(0.35, lum + 0.3));

    // the materialising edge
    float edge = 1.0 - smoothstep(0.0, 0.035, uReveal - h);
    col = mix(col, uPaper, edge * step(bayer8(cell), 0.8));

    gl_FragColor = vec4(col, 1.0);
  }
`;

/** Every dither material on the page, so one component can keep their dot size in sync with the DPR. */
export const ditherMaterials = new Set<THREE.ShaderMaterial>();

/**
 * A lit, 1-bit material: Lambert + rim light, thresholded through a Bayer
 * matrix in screen space. Instanced meshes may pass a per-instance "on" colour.
 */
export function ditherMaterial({
  on = "#39ff14",
  off = "#0a0a0a",
  ambient = 0.08,
  side = THREE.FrontSide,
}: { on?: string; off?: string; ambient?: number; side?: THREE.Side } = {}) {
  const m = new THREE.ShaderMaterial({
    side,
    uniforms: {
      uOn: { value: srgb(on) },
      uOff: { value: srgb(off) },
      uDot: { value: 3 },
      uAmbient: { value: ambient },
      uLight: { value: new THREE.Vector3(0.55, 1, 0.75) },
    },
    vertexShader: /* glsl */ `
      varying vec3 vNormal;
      varying vec3 vViewDir;
      varying vec3 vOn;
      uniform vec3 uOn;
      void main() {
        mat4 m = modelMatrix;
        #ifdef USE_INSTANCING
          m = m * instanceMatrix;
        #endif
        vec4 wp = m * vec4(position, 1.0);
        vNormal = normalize(mat3(m) * normal);
        vViewDir = normalize(cameraPosition - wp.xyz);
        #ifdef USE_INSTANCING_COLOR
          vOn = instanceColor;
        #else
          vOn = uOn;
        #endif
        gl_Position = projectionMatrix * viewMatrix * wp;
      }
    `,
    fragmentShader: /* glsl */ `
      uniform vec3 uOff;
      uniform float uDot;
      uniform float uAmbient;
      uniform vec3 uLight;
      varying vec3 vNormal;
      varying vec3 vViewDir;
      varying vec3 vOn;
      ${bayerGLSL}
      void main() {
        vec3 n = normalize(vNormal);
        if (!gl_FrontFacing) n = -n;
        float key = max(dot(n, normalize(uLight)), 0.0);
        float rim = pow(1.0 - max(dot(n, normalize(vViewDir)), 0.0), 2.0);
        float lum = uAmbient + key * 0.82 + rim * 0.35;
        float on = step(bayer8(floor(gl_FragCoord.xy / uDot)), lum);
        gl_FragColor = vec4(mix(uOff, vOn, on), 1.0);
      }
    `,
  });
  ditherMaterials.add(m);
  return m;
}

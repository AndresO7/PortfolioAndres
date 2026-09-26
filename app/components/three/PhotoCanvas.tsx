"use client";

import { Suspense, useEffect, useMemo, useRef, type RefObject } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { useTexture } from "@react-three/drei";
import * as THREE from "three";

const vertex = /* glsl */ `
  varying vec2 vUv;
  void main() { vUv = uv; gl_Position = vec4(position.xy, 0.0, 1.0); }
`;

/**
 * Halftone of the portrait: 45° dots in acid on ink, sized by brightness.
 * Under the pointer a lens shows the original red-lit photo with an RGB split.
 */
const fragment = /* glsl */ `
  uniform sampler2D uTex;
  uniform vec2 uRes;
  uniform vec2 uMouse;
  uniform float uHover;
  uniform float uCell;
  uniform float uReveal;
  uniform float uTime;
  varying vec2 vUv;

  float luma(vec3 c) { return max(c.r, max(c.g, c.b)); }

  void main() {
    vec2 px = vUv * uRes;
    float a = 0.785398;
    mat2 rot = mat2(cos(a), -sin(a), sin(a), cos(a));
    mat2 unrot = mat2(cos(a), sin(a), -sin(a), cos(a));
    vec2 rp = rot * px;
    vec2 cellId = floor(rp / uCell);
    vec2 cellCenter = (cellId + 0.5) * uCell;
    vec2 sampleUv = (unrot * cellCenter) / uRes;
    float l = smoothstep(0.035, 0.5, luma(texture2D(uTex, clamp(sampleUv, 0.0, 1.0)).rgb));
    float r = pow(l, 0.8) * uCell * 0.64;
    float d = length(rp - cellCenter);
    float dotMask = 1.0 - smoothstep(r - 0.8, r + 0.8, d);

    vec3 ink = vec3(0.039);
    vec3 acid = vec3(0.224, 1.0, 0.078);
    vec3 col = mix(ink, acid, dotMask);

    // lens
    vec2 aspect = vec2(uRes.x / uRes.y, 1.0);
    float md = length((vUv - uMouse) * aspect);
    float lens = (1.0 - smoothstep(0.2, 0.205, md)) * uHover;
    vec2 off = vec2(0.006, 0.0) * (1.0 + sin(uTime * 3.0) * 0.3);
    vec3 photo = vec3(
      texture2D(uTex, vUv + off).r,
      texture2D(uTex, vUv).g,
      texture2D(uTex, vUv - off).b
    );
    photo *= 0.85 + 0.15 * step(0.5, fract(px.y / 3.0));
    photo = pow(photo, vec3(0.8)) * 1.35;
    col = mix(col, photo, lens);
    float ring = (smoothstep(0.195, 0.2, md) - smoothstep(0.205, 0.21, md)) * uHover;
    col = mix(col, vec3(0.937, 0.922, 0.89), ring);

    // reveal: a hard wipe from the top
    float shown = step(1.0 - vUv.y, uReveal);
    gl_FragColor = vec4(mix(ink, col, shown), 1.0);
  }
`;

function Halftone({ reveal }: { reveal: RefObject<number> }) {
  const texture = useTexture("/me.png");
  const size = useThree((s) => s.size);
  const dpr = useThree((s) => s.viewport.dpr);
  const gl = useThree((s) => s.gl);
  const hover = useRef(0);
  const mouse = useRef(new THREE.Vector2(0.5, 0.5));
  const inside = useRef(false);

  useEffect(() => {
    // sample the raw sRGB bytes: the shader works in display space
    texture.colorSpace = THREE.NoColorSpace;
    texture.minFilter = THREE.LinearFilter;
    texture.generateMipmaps = false;
    texture.needsUpdate = true;
  }, [texture]);

  useEffect(() => {
    const el = gl.domElement;
    const move = (e: PointerEvent) => {
      const r = el.getBoundingClientRect();
      mouse.current.set((e.clientX - r.left) / r.width, 1 - (e.clientY - r.top) / r.height);
      inside.current = true;
    };
    const leave = () => (inside.current = false);
    el.addEventListener("pointermove", move);
    el.addEventListener("pointerleave", leave);
    return () => {
      el.removeEventListener("pointermove", move);
      el.removeEventListener("pointerleave", leave);
    };
  }, [gl]);

  const material = useMemo(
    () =>
      new THREE.ShaderMaterial({
        vertexShader: vertex,
        fragmentShader: fragment,
        depthTest: false,
        uniforms: {
          uTex: { value: texture },
          uRes: { value: new THREE.Vector2(1, 1) },
          uMouse: { value: new THREE.Vector2(0.5, 0.5) },
          uHover: { value: 0 },
          uCell: { value: 12 },
          uReveal: { value: 0 },
          uTime: { value: 0 },
        },
      }),
    [texture],
  );

  useFrame((_, delta) => {
    const u = material.uniforms;
    const r = reveal.current ?? 0;
    u.uRes.value.set(size.width * dpr, size.height * dpr);
    hover.current = THREE.MathUtils.damp(hover.current, inside.current ? 1 : 0, 8, delta);
    u.uHover.value = hover.current;
    u.uMouse.value.lerp(mouse.current, 1 - Math.pow(0.0005, delta));
    // dots start coarse and resolve as the portrait scrolls into place
    u.uCell.value = THREE.MathUtils.lerp(46, 7.5, Math.min(1, r * 1.25)) * dpr;
    u.uReveal.value = Math.min(1, r * 2.2);
    u.uTime.value = performance.now() / 1000;
  });

  return (
    <mesh material={material} frustumCulled={false}>
      <planeGeometry args={[2, 2]} />
    </mesh>
  );
}

export default function PhotoCanvas({ reveal, active }: { reveal: RefObject<number>; active: boolean }) {
  return (
    <Canvas
      dpr={[1, 2]}
      frameloop={active ? "always" : "never"}
      gl={{ antialias: false, alpha: false, powerPreference: "high-performance" }}
      onCreated={({ gl }) => gl.setClearColor("#0a0a0a")}
      style={{ width: "100%", height: "100%" }}
    >
      {/* keep the texture load inside the canvas, or it suspends (and remounts) the DOM around it */}
      <Suspense fallback={null}>
        <Halftone reveal={reveal} />
      </Suspense>
    </Canvas>
  );
}

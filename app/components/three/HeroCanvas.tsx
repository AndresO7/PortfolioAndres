"use client";

import { Suspense, useEffect, useMemo, useRef, type RefObject } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { useGLTF } from "@react-three/drei";
import * as THREE from "three";
import { srgb, statueFragment, statueVertex } from "./shaders";
import { BEAT_MS, easeOutExpo, reel, signal, when } from "../../lib/reel";

const INK = srgb("#0a0a0a");
const ACID = srgb("#39ff14");
const PAPER = srgb("#efebe3");
const STATUE_HEIGHT = 3.1;

useGLTF.preload("/statue.glb");

function Statue({ progress }: { progress: RefObject<number> }) {
  const { scene } = useGLTF("/statue.glb");
  const group = useRef<THREE.Group>(null);
  const started = useRef(0);
  const invalidate = useThree((s) => s.invalidate);

  const { geometry, offset, scale } = useMemo(() => {
    let mesh: THREE.Mesh | null = null;
    scene.traverse((o) => {
      if (!mesh && (o as THREE.Mesh).isMesh) mesh = o as THREE.Mesh;
    });
    const src = mesh as unknown as THREE.Mesh;
    src.updateWorldMatrix(true, false);
    const geo = (src.geometry as THREE.BufferGeometry).clone();
    geo.applyMatrix4(src.matrixWorld);
    geo.computeBoundingBox();
    const box = geo.boundingBox!;
    const size = box.getSize(new THREE.Vector3());
    const center = box.getCenter(new THREE.Vector3());
    const s = STATUE_HEIGHT / size.y;
    return {
      geometry: geo,
      scale: s,
      offset: new THREE.Vector3(-center.x * s, -center.y * s - 0.08, -center.z * s),
    };
  }, [scene]);

  const material = useMemo(
    () =>
      new THREE.ShaderMaterial({
        vertexShader: statueVertex,
        fragmentShader: statueFragment,
        side: THREE.DoubleSide,
        uniforms: {
          uLight: { value: new THREE.Vector3(0.6, 0.8, 0.9) },
          uDot: { value: 3 },
          uReveal: { value: -0.05 },
          uScan: { value: -1 },
          uMinY: { value: -STATUE_HEIGHT / 2 - 0.08 },
          uMaxY: { value: STATUE_HEIGHT / 2 - 0.08 },
          uInk: { value: INK },
          uAcid: { value: ACID },
          uPaper: { value: PAPER },
        },
      }),
    [],
  );

  useEffect(() => {
    // Tell the slate we have pixels, then wait for it to clap.
    const id = requestAnimationFrame(() => requestAnimationFrame(() => signal("hero")));
    const off = when("start", () => {
      started.current = performance.now();
      invalidate();
    });
    return () => {
      cancelAnimationFrame(id);
      off();
    };
  }, [invalidate]);

  const light = useRef(new THREE.Vector3(0.6, 0.8, 0.9));

  useFrame((state, delta) => {
    const g = group.current;
    if (!g) return;
    const p = progress.current ?? 0;
    const now = performance.now();

    const intro = started.current ? Math.min(1, (now - started.current) / 2600) : 0;
    material.uniforms.uReveal.value = -0.05 + easeOutExpo(intro) * 1.15;
    material.uniforms.uScan.value = ((now / (BEAT_MS * 4)) % 1) * 1.3 - 0.15;
    material.uniforms.uDot.value = (2.5 + p * 7) * state.viewport.dpr;

    light.current.set(0.35 + reel.mouseX * 1.4, 0.7 + reel.mouseY * 0.9, 0.95);
    material.uniforms.uLight.value.lerp(light.current, 1 - Math.pow(0.001, delta));

    const targetY = -0.35 + reel.mouseX * 0.35 + p * Math.PI * 1.25 + (1 - easeOutExpo(intro)) * -1.2;
    g.rotation.y = THREE.MathUtils.damp(g.rotation.y, targetY, 4, delta);
    g.rotation.x = THREE.MathUtils.damp(g.rotation.x, -reel.mouseY * 0.06, 4, delta);
    g.position.y = Math.sin(now / 1400) * 0.03 - p * 0.25;
  });

  return (
    <group ref={group}>
      <mesh geometry={geometry} material={material} position={offset} scale={scale} />
    </group>
  );
}

/** Text wrapped around an open cylinder: front faces in one colour, the far side mirrored and dim. */
function TextRing({
  text,
  radius,
  height,
  y,
  tilt,
  speed,
  front,
  back,
  progress,
}: {
  text: string;
  radius: number;
  height: number;
  y: number;
  tilt: [number, number];
  speed: number;
  front: string;
  back: string;
  progress: RefObject<number>;
}) {
  const group = useRef<THREE.Group>(null);
  const started = useRef(0);

  const texture = useMemo(() => {
    const canvas = document.createElement("canvas");
    const h = 128;
    const w = Math.min(4096, Math.round((h * (2 * Math.PI * radius)) / height / 4) * 4);
    canvas.width = w;
    canvas.height = h;
    const tex = new THREE.CanvasTexture(canvas);
    tex.wrapS = THREE.RepeatWrapping;
    tex.anisotropy = 8;
    tex.colorSpace = THREE.SRGBColorSpace;
    const draw = () => {
      const ctx = canvas.getContext("2d")!;
      ctx.clearRect(0, 0, w, h);
      ctx.fillStyle = "#ffffff";
      ctx.font = `700 ${Math.round(h * 0.62)}px "JetBrains Mono Variable", ui-monospace, monospace`;
      ctx.textBaseline = "middle";
      const unit = ctx.measureText(text).width;
      const count = Math.max(1, Math.floor(w / unit));
      const step = w / count;
      for (let i = 0; i < count; i++) ctx.fillText(text, i * step, h * 0.54);
      tex.needsUpdate = true;
    };
    draw();
    document.fonts?.load(`700 64px "JetBrains Mono Variable"`).then(draw).catch(() => {});
    return tex;
  }, [text, radius, height]);

  const [frontMat, backMat] = useMemo(() => {
    const common = { map: texture, transparent: true, depthWrite: false, toneMapped: false };
    return [
      new THREE.MeshBasicMaterial({ ...common, side: THREE.FrontSide, color: front }),
      new THREE.MeshBasicMaterial({ ...common, side: THREE.BackSide, color: back, opacity: 0.55 }),
    ];
  }, [texture, front, back]);

  useEffect(() => when("start", () => (started.current = performance.now())), []);

  useFrame((_, delta) => {
    const g = group.current;
    if (!g) return;
    const p = progress.current ?? 0;
    const intro = started.current ? easeOutExpo(Math.min(1, (performance.now() - started.current - 900) / 1800)) : 0;
    texture.offset.x += delta * speed * (1 + Math.abs(reel.velocity) * 0.08);
    g.scale.setScalar(Math.max(0.0001, intro) * (1 + p * 0.6));
    g.rotation.x = tilt[0] + reel.mouseY * 0.05;
    g.rotation.z = tilt[1] - p * 0.4 * Math.sign(tilt[1] || 1);
    g.position.y = y + p * (y > 0 ? 0.6 : -0.6);
  });

  return (
    <group ref={group} position={[0, y, 0]}>
      <mesh material={backMat} renderOrder={1}>
        <cylinderGeometry args={[radius, radius, height, 160, 1, true]} />
      </mesh>
      <mesh material={frontMat} renderOrder={2}>
        <cylinderGeometry args={[radius, radius, height, 160, 1, true]} />
      </mesh>
    </group>
  );
}

function Rig({ progress }: { progress: RefObject<number> }) {
  const camera = useThree((s) => s.camera);
  const size = useThree((s) => s.size);
  useFrame((_, delta) => {
    const p = progress.current ?? 0;
    const narrow = size.width < size.height;
    const baseZ = narrow ? 9.6 : 7.2;
    camera.position.z = THREE.MathUtils.damp(camera.position.z, baseZ - p * 2.4, 5, delta);
    camera.position.x = THREE.MathUtils.damp(camera.position.x, reel.mouseX * 0.18, 3, delta);
    camera.position.y = THREE.MathUtils.damp(camera.position.y, 0.1 + reel.mouseY * 0.1 + p * 0.5, 3, delta);
    camera.lookAt(0, 0.05 + p * 0.45, 0);
  });
  return null;
}

export default function HeroCanvas({ progress, active }: { progress: RefObject<number>; active: boolean }) {
  return (
    <Canvas
      dpr={[1, 2]}
      frameloop={active ? "always" : "never"}
      gl={{ antialias: false, alpha: true, powerPreference: "high-performance" }}
      camera={{ fov: 30, position: [0, 0.1, 7.2], near: 0.1, far: 50 }}
    >
      <Rig progress={progress} />
      <Suspense fallback={null}>
        <Statue progress={progress} />
      </Suspense>
      <TextRing
        text="SOFTWARE ENGINEER — AI SYSTEMS — CLOUD ARCHITECTURE — QUITO, EC — "
        radius={1.55}
        height={0.2}
        y={0.55}
        tilt={[0.2, -0.08]}
        speed={0.018}
        front="#efebe3"
        back="#39ff14"
        progress={progress}
      />
      <TextRing
        text="SYSTEMS, NOT DEMOS + REEL 2026 + 128 BPM + "
        radius={1.9}
        height={0.16}
        y={-0.75}
        tilt={[-0.12, 0.1]}
        speed={-0.012}
        front="#39ff14"
        back="#efebe3"
        progress={progress}
      />
    </Canvas>
  );
}

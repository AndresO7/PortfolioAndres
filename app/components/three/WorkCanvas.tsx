"use client";

import { Suspense, useEffect, useMemo, useRef, type ReactNode, type RefObject } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { Billboard, Text } from "@react-three/drei";
import * as THREE from "three";
import { ditherMaterial, ditherMaterials, srgb } from "./shaders";
import { clamp, easeInOutCubic, easeOutExpo, range, reel } from "../../lib/reel";

type NumRef = RefObject<number>;

const COUNT = 6;
const PAPER = "#efebe3";
const ACID = "#39ff14";
const SIGNAL = "#ff3b1f";
const FONT = "/fonts/jetbrains-mono-700.woff";

const V = (x = 0, y = 0, z = 0) => new THREE.Vector3(x, y, z);

/** mulberry32: small, fast, and the same numbers every time for the same seed */
function rng(seed: number) {
  return () => {
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const lineMat = (color: string, opacity = 1) =>
  new THREE.LineBasicMaterial({ color, transparent: opacity < 1, opacity, toneMapped: false });
const basicMat = (color: string) => new THREE.MeshBasicMaterial({ color, toneMapped: false });

/**
 * One artifact's slot in the pinned scroll: it grows in, lives for its
 * sixth of the section (exposing a 0 → 1 local time), and spins out.
 */
function Slot({ index, progress, children }: { index: number; progress: NumRef; children: (local: NumRef) => ReactNode }) {
  const group = useRef<THREE.Group>(null);
  const local = useRef(0);
  useFrame((_, delta) => {
    const g = group.current;
    if (!g) return;
    const x = (progress.current ?? 0) * COUNT - index;
    local.current = clamp(x);
    let d = Math.abs(x - 0.5);
    if (index === 0 && x < 0.5) d = 0;
    if (index === COUNT - 1 && x > 0.5) d = 0;
    const e = easeInOutCubic(1 - range(d, 0.34, 0.5));
    g.visible = e > 0.002;
    g.scale.setScalar(Math.max(0.001, e));
    const spin = (1 - e) * (x < 0.5 ? -1.6 : 1.6);
    g.rotation.y = THREE.MathUtils.damp(g.rotation.y, spin + reel.mouseX * 0.3, 10, delta);
    g.rotation.x = THREE.MathUtils.damp(g.rotation.x, -reel.mouseY * 0.08, 6, delta);
  });
  return <group ref={group}>{children(local)}</group>;
}

/* ———————————————————— 01 · Quipu: knotted cords ———————————————————— */

function Quipu({ local }: { local: NumRef }) {
  const cordGroups = useRef<(THREE.Group | null)[]>([]);
  const knotMeshes = useRef<(THREE.InstancedMesh | null)[]>([]);

  const data = useMemo(() => {
    const r = rng(9);
    const primaryCurve = new THREE.CatmullRomCurve3([V(-1.9, 1.2, 0), V(-0.7, 1.32, 0.12), V(0.6, 1.28, -0.1), V(1.9, 1.16, 0)]);
    const primary = new THREE.TubeGeometry(primaryCurve, 120, 0.034, 8, false);
    // nine cords, one per contract; knots encode real numbers from the record, in base ten
    const values = [57, 24, 9, 4, 363, 6, 12, 18, 300];
    const cords = values.map((v, i) => {
      const top = primaryCurve.getPointAt((i + 0.5) / values.length);
      const len = 2.0 + r() * 0.55;
      const pts = [
        V(0, 0, 0),
        V((r() - 0.5) * 0.12, -len * 0.33, (r() - 0.5) * 0.3),
        V((r() - 0.5) * 0.22, -len * 0.66, (r() - 0.5) * 0.4),
        V((r() - 0.5) * 0.28, -len, (r() - 0.5) * 0.4),
      ];
      const curve = new THREE.CatmullRomCurve3(pts);
      const geo = new THREE.TubeGeometry(curve, 64, 0.015, 6, false);
      const knots: { u: number; p: THREE.Vector3; q: THREE.Quaternion }[] = [];
      String(v)
        .padStart(3, "0")
        .split("")
        .map(Number)
        .forEach((digit, place) => {
          const base = [0.2, 0.46, 0.72][place];
          for (let k = 0; k < digit; k++) {
            const u = Math.min(0.97, base + k * 0.024);
            const q = new THREE.Quaternion().setFromUnitVectors(V(0, 1, 0), curve.getTangentAt(u));
            knots.push({ u, p: curve.getPointAt(u), q });
          }
        });
      return { top, geo, knots, phase: r() * Math.PI * 2 };
    });
    return { primary, cords };
  }, []);

  const cordMat = useMemo(() => basicMat(PAPER), []);
  const primaryMat = useMemo(() => basicMat(ACID), []);
  const knotMat = useMemo(() => ditherMaterial({ on: ACID, ambient: 0.35 }), []);
  const knotGeo = useMemo(() => new THREE.SphereGeometry(0.04, 12, 8).scale(1, 1.7, 1), []);
  const m = useMemo(() => new THREE.Matrix4(), []);
  const s = useMemo(() => V(), []);

  useFrame(() => {
    const t = local.current ?? 0;
    const now = performance.now() / 1000;
    const primaryReveal = easeOutExpo(range(t, 0, 0.25));
    data.primary.setDrawRange(0, Math.floor((data.primary.index?.count ?? 0) * primaryReveal));
    data.cords.forEach((c, i) => {
      const reveal = easeOutExpo(range(t, 0.08 + i * 0.035, 0.45 + i * 0.035));
      c.geo.setDrawRange(0, Math.floor((c.geo.index?.count ?? 0) * reveal));
      const g = cordGroups.current[i];
      if (g) {
        g.rotation.z = Math.sin(now * 0.9 + c.phase) * 0.045;
        g.rotation.x = Math.cos(now * 0.7 + c.phase) * 0.05;
      }
      const im = knotMeshes.current[i];
      if (im) {
        c.knots.forEach((k, j) => {
          const on = reveal >= k.u ? 1 : 0;
          s.setScalar(on);
          m.compose(k.p, k.q, s);
          im.setMatrixAt(j, m);
        });
        im.instanceMatrix.needsUpdate = true;
      }
    });
  });

  return (
    <group position={[0, -0.2, 0]}>
      <mesh geometry={data.primary} material={primaryMat} />
      {data.cords.map((c, i) => (
        <group
          key={i}
          position={c.top}
          ref={(g) => {
            cordGroups.current[i] = g;
          }}
        >
          <mesh geometry={c.geo} material={cordMat} />
          <instancedMesh
            ref={(im) => {
              knotMeshes.current[i] = im;
            }}
            args={[knotGeo, knotMat, c.knots.length]}
            frustumCulled={false}
          />
        </group>
      ))}
    </group>
  );
}

/* ———————————————————— 02 · NOCLIP: a seeded maze that builds itself ———————————————————— */

function Maze({ local }: { local: NumRef }) {
  const mesh = useRef<THREE.InstancedMesh>(null);
  const cam = useRef<THREE.Group>(null);
  const N = 8;
  const WALL = 0.05;
  const ROOM = 0.25;
  const H = 0.3;

  const { walls, path, size } = useMemo(() => {
    const r = rng(1337);
    const G = 2 * N + 1;
    const grid = Array.from({ length: G }, () => new Array(G).fill(1));
    const stack: [number, number][] = [[0, 0]];
    const seen = new Set(["0,0"]);
    grid[1][1] = 0;
    while (stack.length) {
      const [cx, cy] = stack[stack.length - 1];
      const options = (
        [
          [1, 0],
          [-1, 0],
          [0, 1],
          [0, -1],
        ] as const
      )
        .map(([dx, dy]) => [cx + dx, cy + dy] as const)
        .filter(([x, y]) => x >= 0 && y >= 0 && x < N && y < N && !seen.has(`${x},${y}`));
      if (!options.length) {
        stack.pop();
        continue;
      }
      const [nx, ny] = options[Math.floor(r() * options.length)];
      grid[cy + ny + 1][cx + nx + 1] = 0;
      grid[2 * ny + 1][2 * nx + 1] = 0;
      seen.add(`${nx},${ny}`);
      stack.push([nx, ny]);
    }

    // even grid lines are thin walls, odd ones are rooms: lay the grid out on those widths
    const widths = Array.from({ length: G }, (_, i) => (i % 2 === 0 ? WALL : ROOM));
    const starts: number[] = [];
    widths.reduce((acc, w) => {
      starts.push(acc);
      return acc + w;
    }, 0);
    const total = starts[G - 1] + widths[G - 1];
    const centre = (i: number) => starts[i] + widths[i] / 2 - total / 2;

    // shortest route from one corner to the other, for the camcorder to walk
    const prev = new Map<string, string>();
    const q: [number, number][] = [[1, 1]];
    const visited = new Set(["1,1"]);
    while (q.length) {
      const [x, y] = q.shift()!;
      if (x === G - 2 && y === G - 2) break;
      for (const [dx, dy] of [
        [1, 0],
        [-1, 0],
        [0, 1],
        [0, -1],
      ]) {
        const nx = x + dx;
        const ny = y + dy;
        const key = `${nx},${ny}`;
        if (grid[ny]?.[nx] === 0 && !visited.has(key)) {
          visited.add(key);
          prev.set(key, `${x},${y}`);
          q.push([nx, ny]);
        }
      }
    }
    const route: THREE.Vector3[] = [];
    let cur: string | undefined = `${G - 2},${G - 2}`;
    while (cur) {
      const [x, y] = cur.split(",").map(Number);
      route.unshift(V(centre(x), 0, centre(y)));
      cur = prev.get(cur);
    }

    const w: { x: number; z: number; sx: number; sz: number; d: number }[] = [];
    grid.forEach((row, y) =>
      row.forEach((cell, x) => {
        if (!cell) return;
        const px = centre(x);
        const pz = centre(y);
        w.push({ x: px, z: pz, sx: widths[x], sz: widths[y], d: Math.hypot(px, pz) / (total * 0.71) });
      }),
    );
    return { walls: w, path: new THREE.CatmullRomCurve3(route, false, "catmullrom", 0.1), size: total };
  }, []);

  const geo = useMemo(() => new THREE.BoxGeometry(1, H, 1).translate(0, H / 2, 0), []);
  const mat = useMemo(() => ditherMaterial({ on: ACID, ambient: 0.06 }), []);
  const outline = useMemo(() => {
    const h = size / 2 + 0.12;
    return new THREE.BufferGeometry().setFromPoints([V(-h, 0, -h), V(h, 0, -h), V(h, 0, -h), V(h, 0, h), V(h, 0, h), V(-h, 0, h), V(-h, 0, h), V(-h, 0, -h)]);
  }, [size]);
  const camBody = useMemo(() => basicMat(PAPER), []);
  const camDot = useMemo(() => basicMat(SIGNAL), []);
  const frustum = useMemo(() => new THREE.EdgesGeometry(new THREE.ConeGeometry(0.16, 0.34, 4, 1, true).rotateX(-Math.PI / 2).translate(0, 0, 0.2)), []);
  const m = useMemo(() => new THREE.Matrix4(), []);
  const q = useMemo(() => new THREE.Quaternion(), []);
  const p = useMemo(() => V(), []);
  const sc = useMemo(() => V(1, 1, 1), []);

  useFrame(() => {
    const t = local.current ?? 0;
    const im = mesh.current;
    if (im) {
      walls.forEach((w, i) => {
        const rise = easeOutExpo(range(t * 1.7 - w.d * 0.8, 0, 0.35));
        p.set(w.x, 0, w.z);
        sc.set(w.sx, Math.max(0.001, rise), w.sz);
        m.compose(p, q, sc);
        im.setMatrixAt(i, m);
      });
      im.instanceMatrix.needsUpdate = true;
    }
    if (cam.current) {
      const u = (performance.now() / 16000) % 1;
      const pos = path.getPointAt(u);
      const ahead = path.getPointAt(Math.min(1, u + 0.01));
      cam.current.position.set(pos.x, 0.12, pos.z);
      cam.current.lookAt(ahead.x, 0.12, ahead.z);
      cam.current.visible = t > 0.35;
    }
  });

  return (
    <group rotation={[0.42, 0.55, 0]} position={[0, -0.45, 0]}>
      <lineSegments geometry={outline} material={lineMat(PAPER, 0.5)} />
      <instancedMesh ref={mesh} args={[geo, mat, walls.length]} frustumCulled={false} />
      <group ref={cam}>
        <mesh material={camBody}>
          <boxGeometry args={[0.07, 0.07, 0.11]} />
        </mesh>
        <mesh position={[0, 0.06, 0]} material={camDot}>
          <sphereGeometry args={[0.022, 10, 8]} />
        </mesh>
        <lineSegments geometry={frustum} material={lineMat(PAPER, 0.8)} />
      </group>
    </group>
  );
}

/* ———————————————————— 03 · Sovran: a house that assembles ———————————————————— */

function House({ local }: { local: NumRef }) {
  const extension = useRef<THREE.Group>(null);
  const roof = useRef<THREE.Group>(null);
  const dormer = useRef<THREE.Group>(null);
  const spin = useRef<THREE.Group>(null);

  const parts = useMemo(() => {
    const shape = new THREE.Shape();
    shape.moveTo(-1.02, 0);
    shape.lineTo(0, 0.78);
    shape.lineTo(1.02, 0);
    shape.lineTo(-1.02, 0);
    const roofGeo = new THREE.ExtrudeGeometry(shape, { depth: 1.5, bevelEnabled: false }).translate(0, 0, -0.75);
    return {
      main: new THREE.BoxGeometry(1.9, 1.2, 1.4),
      roof: roofGeo,
      ext: new THREE.BoxGeometry(1.3, 0.78, 1.05),
      dormer: new THREE.BoxGeometry(0.62, 0.42, 0.55),
      window: new THREE.BoxGeometry(0.3, 0.38, 0.02),
    };
  }, []);

  const solid = useMemo(() => ditherMaterial({ on: PAPER, ambient: 0.05 }), []);
  const accent = useMemo(() => ditherMaterial({ on: ACID, ambient: 0.1 }), []);
  const edge = useMemo(() => lineMat(ACID), []);
  const edgePaper = useMemo(() => lineMat(PAPER, 0.9), []);
  const hole = useMemo(() => basicMat("#0a0a0a"), []);

  useFrame((_, delta) => {
    const t = local.current ?? 0;
    const a = easeOutExpo(range(t, 0.05, 0.45));
    const b = easeOutExpo(range(t, 0.15, 0.55));
    const c = easeOutExpo(range(t, 0.25, 0.65));
    if (extension.current) extension.current.position.set(0.25 - (1 - a) * 2.4, -0.81, -1.22 - (1 - a) * 0.8);
    if (roof.current) roof.current.position.y = 0.0 + (1 - b) * 1.6;
    if (dormer.current) dormer.current.position.set(0.35, 0.36 + (1 - c) * 2.2, -0.2);
    if (spin.current) spin.current.rotation.y += delta * 0.18;
  });

  return (
    <group ref={spin} position={[0, -0.25, 0]}>
      <group position={[0, -0.6, 0]}>
        <mesh geometry={parts.main} material={solid} />
        <lineSegments material={edge}>
          <edgesGeometry args={[parts.main]} />
        </lineSegments>
        {[-0.5, 0, 0.5].map((x) => (
          <mesh key={x} geometry={parts.window} material={hole} position={[x, 0.1, 0.711]} />
        ))}
        <mesh geometry={parts.window} material={hole} position={[0.62, -0.38, 0.711]} scale={[1.2, 1.1, 1]} />
      </group>
      <group ref={roof}>
        <mesh geometry={parts.roof} material={solid} />
        <lineSegments material={edge}>
          <edgesGeometry args={[parts.roof]} />
        </lineSegments>
      </group>
      <group ref={dormer}>
        <mesh geometry={parts.dormer} material={accent} />
        <lineSegments material={edgePaper}>
          <edgesGeometry args={[parts.dormer]} />
        </lineSegments>
      </group>
      <group ref={extension}>
        <mesh geometry={parts.ext} material={accent} />
        <lineSegments material={edgePaper}>
          <edgesGeometry args={[parts.ext]} />
        </lineSegments>
      </group>
    </group>
  );
}

/* ———————————————————— 04 · Quasar: apply, fail, observe, repair ———————————————————— */

function Grid({ local }: { local: NumRef }) {
  const mesh = useRef<THREE.InstancedMesh>(null);
  const status = useRef<THREE.Mesh>(null);
  const N = 6;
  const S = 0.36;
  const GAP = 0.12;
  const FAIL = 21;
  const geo = useMemo(() => new THREE.BoxGeometry(S, S, S), []);
  const mat = useMemo(() => ditherMaterial({ ambient: 0.1 }), []);
  const m = useMemo(() => new THREE.Matrix4(), []);
  const q = useMemo(() => new THREE.Quaternion(), []);
  const p = useMemo(() => V(), []);
  const sc = useMemo(() => V(), []);
  const acid = useMemo(() => {
    const v = srgb(ACID);
    return new THREE.Color(v.x, v.y, v.z);
  }, []);
  const red = useMemo(() => {
    const v = srgb(SIGNAL);
    return new THREE.Color(v.x, v.y, v.z);
  }, []);
  const paper = useMemo(() => {
    const v = srgb(PAPER);
    return new THREE.Color(v.x, v.y, v.z);
  }, []);

  useEffect(() => {
    const im = mesh.current;
    if (!im) return;
    for (let i = 0; i < N * N; i++) im.setColorAt(i, acid);
    if (im.instanceColor) im.instanceColor.needsUpdate = true;
    // the program was compiled before the colour attribute existed
    mat.needsUpdate = true;
  }, [acid, mat]);

  useFrame(() => {
    const t = local.current ?? 0;
    const now = performance.now() / 1000;
    const im = mesh.current;
    if (!im) return;
    const failing = t > 0.42 && t < 0.68;
    const fixed = t >= 0.68;
    for (let i = 0; i < N * N; i++) {
      const x = i % N;
      const z = Math.floor(i / N);
      const order = (x + z) / (2 * N - 2);
      const appear = easeOutExpo(range(t * 1.5 - order * 0.55, 0, 0.18));
      const off = (N - 1) / 2;
      const wave = fixed ? Math.max(0, Math.sin((t - 0.68) * 14 - order * 6)) * 0.22 * (1 - range(t, 0.85, 1)) : 0;
      let jitterX = 0;
      if (i === FAIL && failing) jitterX = Math.sin(now * 60) * 0.03;
      p.set((x - off) * (S + GAP) + jitterX, -0.7 + appear * 0.5 + wave + Math.sin(now * 1.5 + order * 5) * 0.015, (z - off) * (S + GAP));
      sc.setScalar(Math.max(0.001, appear));
      if (i === FAIL && t > 0.3) sc.y *= failing ? 1.35 : 1;
      m.compose(p, q, sc);
      im.setMatrixAt(i, m);
      if (i === FAIL) im.setColorAt(i, failing ? red : fixed ? paper : acid);
    }
    im.instanceMatrix.needsUpdate = true;
    if (im.instanceColor) im.instanceColor.needsUpdate = true;
    if (status.current) {
      status.current.visible = failing && Math.floor(now * 4) % 2 === 0;
    }
  });

  return (
    <group rotation={[0, Math.PI / 4, 0]}>
      <instancedMesh ref={mesh} args={[geo, mat, N * N]} frustumCulled={false} />
      <mesh ref={status} position={[0, 0.9, 0]} material={basicMat(SIGNAL)}>
        <boxGeometry args={[0.08, 0.08, 0.08]} />
      </mesh>
    </group>
  );
}

/* ———————————————————— 05 · FunCode: the sketch lifts into an interface ———————————————————— */

function Layers({ local }: { local: NumRef }) {
  const slabs = useRef<(THREE.Group | null)[]>([]);
  const spin = useRef<THREE.Group>(null);
  const blocks = useMemo(
    () => [
      { w: 3.0, d: 0.42, x: 0, z: -1.05, layer: 1 },
      { w: 0.72, d: 1.62, x: -1.14, z: 0.23, layer: 2 },
      { w: 0.62, d: 0.74, x: -0.3, z: -0.15, layer: 3 },
      { w: 0.62, d: 0.74, x: 0.44, z: -0.15, layer: 3 },
      { w: 0.62, d: 0.74, x: 1.18, z: -0.15, layer: 3 },
      { w: 2.1, d: 0.46, x: 0.44, z: 0.72, layer: 2 },
      { w: 0.66, d: 0.2, x: 1.12, z: 0.72, layer: 4 },
    ],
    [],
  );
  const sketch = useMemo(() => {
    const pts: THREE.Vector3[] = [];
    const rect = (x: number, z: number, w: number, d: number) => {
      const a = V(x - w / 2, 0, z - d / 2);
      const b = V(x + w / 2, 0, z - d / 2);
      const c = V(x + w / 2, 0, z + d / 2);
      const e = V(x - w / 2, 0, z + d / 2);
      pts.push(a, b, b, c, c, e, e, a);
    };
    rect(0, 0, 3.2, 2.5);
    blocks.forEach((b) => rect(b.x, b.z, b.w, b.d));
    // a few scribbled text lines
    for (let i = 0; i < 4; i++) pts.push(V(-0.6, 0, 0.62 + i * 0.07 - 0.1), V(-0.6 + 0.9 - i * 0.18, 0, 0.62 + i * 0.07 - 0.1));
    return new THREE.BufferGeometry().setFromPoints(pts);
  }, [blocks]);
  const mat = useMemo(() => ditherMaterial({ on: ACID, ambient: 0.12 }), []);
  const top = useMemo(() => ditherMaterial({ on: PAPER, ambient: 0.12 }), []);
  const slab = useMemo(() => new THREE.BoxGeometry(1, 0.08, 1), []);

  useFrame((_, delta) => {
    const t = local.current ?? 0;
    blocks.forEach((b, i) => {
      const g = slabs.current[i];
      if (!g) return;
      const k = easeOutExpo(range(t, 0.1 + i * 0.06, 0.5 + i * 0.06));
      g.position.y = k * b.layer * 0.26;
      g.scale.set(b.w, Math.max(0.001, k), b.d);
    });
    if (spin.current) spin.current.rotation.y += delta * 0.12;
  });

  return (
    <group rotation={[0.35, 0, 0]} position={[0, -0.55, 0]}>
      <group ref={spin}>
        <lineSegments geometry={sketch} material={lineMat(PAPER, 0.85)} />
        {blocks.map((b, i) => (
          <group
            key={i}
            position={[b.x, 0, b.z]}
            ref={(g) => {
              slabs.current[i] = g;
            }}
          >
            <mesh geometry={slab} material={b.layer === 4 ? top : mat} />
          </group>
        ))}
      </group>
    </group>
  );
}

/* ———————————————————— 06 · Lending: one gateway, six domains ———————————————————— */

const SERVICES = ["users :8001", "loans :8002", "payments :8003", "notify :8004", "books :8005", "inventory :8006"];

function Network({ local }: { local: NumRef }) {
  const nodes = useRef<(THREE.Group | null)[]>([]);
  const packets = useRef<THREE.InstancedMesh>(null);
  const spin = useRef<THREE.Group>(null);
  const R = 1.85;
  const positions = useMemo(() => SERVICES.map((_, i) => V(Math.cos((i / 6) * Math.PI * 2) * R, 0, Math.sin((i / 6) * Math.PI * 2) * R)), []);
  const client = useMemo(() => V(0, 1.45, 0), []);
  const lines = useMemo(() => {
    const pts: THREE.Vector3[] = [];
    positions.forEach((p) => pts.push(V(0, 0, 0), p));
    pts.push(V(0, 0, 0), client);
    return new THREE.BufferGeometry().setFromPoints(pts);
  }, [positions, client]);
  const gatewayMat = useMemo(() => ditherMaterial({ on: ACID, ambient: 0.1 }), []);
  const nodeMat = useMemo(() => ditherMaterial({ on: PAPER, ambient: 0.08 }), []);
  const packetGeo = useMemo(() => new THREE.BoxGeometry(0.06, 0.06, 0.06), []);
  const packetMat = useMemo(() => basicMat(ACID), []);
  const m = useMemo(() => new THREE.Matrix4(), []);
  const p = useMemo(() => V(), []);
  const one = useMemo(() => V(1, 1, 1), []);
  const q = useMemo(() => new THREE.Quaternion(), []);
  const PACKETS = 14;

  useFrame((_, delta) => {
    const t = local.current ?? 0;
    const now = performance.now() / 1000;
    nodes.current.forEach((g, i) => {
      if (!g) return;
      const k = easeOutExpo(range(t, 0.05 + i * 0.05, 0.35 + i * 0.05));
      g.scale.setScalar(Math.max(0.001, k));
    });
    const im = packets.current;
    if (im) {
      for (let i = 0; i < PACKETS; i++) {
        const target = i === PACKETS - 1 ? client : positions[i % 6];
        const u = (now * 0.45 + i * 0.37) % 1;
        const back = Math.floor(now * 0.45 + i * 0.37) % 2 === 1;
        p.copy(target).multiplyScalar(back ? 1 - u : u);
        one.setScalar(t > 0.3 ? 1 : 0.001);
        m.compose(p, q, one);
        im.setMatrixAt(i, m);
      }
      im.instanceMatrix.needsUpdate = true;
    }
    if (spin.current) spin.current.rotation.y += delta * 0.1;
  });

  return (
    <group rotation={[0.32, 0, 0]} position={[0, -0.45, 0]}>
    <group ref={spin}>
      <lineSegments geometry={lines} material={lineMat(PAPER, 0.45)} />
      <mesh material={gatewayMat}>
        <boxGeometry args={[0.5, 0.5, 0.5]} />
      </mesh>
      <Billboard position={[0, -0.5, 0]}>
        <Text font={FONT} fontSize={0.1} color={ACID} anchorX="center" letterSpacing={0.08}>
          API GATEWAY :80
        </Text>
      </Billboard>
      <group position={client}>
        <mesh material={nodeMat}>
          <octahedronGeometry args={[0.18]} />
        </mesh>
        <Billboard position={[0, 0.32, 0]}>
          <Text font={FONT} fontSize={0.09} color={PAPER} anchorX="center" letterSpacing={0.08}>
            CLIENT
          </Text>
        </Billboard>
      </group>
      {positions.map((pos, i) => (
        <group
          key={i}
          position={pos}
          ref={(g) => {
            nodes.current[i] = g;
          }}
        >
          <mesh material={nodeMat}>
            <boxGeometry args={[0.3, 0.3, 0.3]} />
          </mesh>
          <Billboard position={[0, 0.3, 0]}>
            <Text font={FONT} fontSize={0.085} color={PAPER} anchorX="center" letterSpacing={0.06}>
              {SERVICES[i].toUpperCase()}
            </Text>
          </Billboard>
        </group>
      ))}
      <instancedMesh ref={packets} args={[packetGeo, packetMat, PACKETS]} frustumCulled={false} />
    </group>
    </group>
  );
}

/* ———————————————————— stage ———————————————————— */

function Stage({ progress }: { progress: NumRef }) {
  const camera = useThree((s) => s.camera);
  const size = useThree((s) => s.size);
  const dpr = useThree((s) => s.viewport.dpr);
  useFrame((_, delta) => {
    const narrow = size.width / size.height < 0.9;
    const z = narrow ? 8.6 : 6.4;
    camera.position.x = THREE.MathUtils.damp(camera.position.x, reel.mouseX * 0.25, 3, delta);
    camera.position.y = THREE.MathUtils.damp(camera.position.y, 1.9 + reel.mouseY * 0.2, 3, delta);
    camera.position.z = THREE.MathUtils.damp(camera.position.z, z, 3, delta);
    camera.lookAt(0, -0.15, 0);
    ditherMaterials.forEach((m) => (m.uniforms.uDot.value = 2.5 * dpr));
  });

  const artifacts = [Quipu, Maze, House, Grid, Layers, Network];
  return (
    <>
      <gridHelper args={[12, 24, "#3a3a36", "#1c1c1a"]} position={[0, -1.46, 0]} />
      {artifacts.map((A, i) => (
        <Slot key={i} index={i} progress={progress}>
          {(local) => <A local={local} />}
        </Slot>
      ))}
    </>
  );
}

export default function WorkCanvas({ progress, active }: { progress: NumRef; active: boolean }) {
  return (
    <Canvas
      dpr={[1, 2]}
      frameloop={active ? "always" : "never"}
      gl={{ antialias: true, alpha: false, powerPreference: "high-performance" }}
      camera={{ fov: 34, position: [0, 1.9, 6.4], near: 0.1, far: 60 }}
      style={{ width: "100%", height: "100%" }}
      onCreated={({ gl }) => gl.setClearColor("#0a0a0a")}
    >
      <Suspense fallback={null}>
        <Stage progress={progress} />
      </Suspense>
    </Canvas>
  );
}

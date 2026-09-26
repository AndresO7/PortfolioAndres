import type Lenis from "lenis";

/**
 * Shared, mutable runtime state for the whole reel. Written by the scroll and
 * pointer listeners, read inside requestAnimationFrame / useFrame loops, so it
 * never goes through React state and never triggers a re-render.
 */
export const reel = {
  scrollY: 0,
  /** 0 → 1 over the whole document */
  progress: 0,
  /** Lenis velocity, px per frame, signed */
  velocity: 0,
  /** pointer, normalised to -1 → 1 with +y up */
  mouseX: 0,
  mouseY: 0,
  started: false,
  lenis: null as Lenis | null,
};

export const BPM = 128;
export const BEAT_MS = 60_000 / BPM;

/** 0 → 1 inside the current beat. Everything that pulses shares this clock. */
export const beatPhase = (now = performance.now()) => (now / BEAT_MS) % 1;

type Listener = () => void;
const flags = new Set<string>();
const waiters = new Map<string, Set<Listener>>();

/** Raise a one-shot flag ("hero", "start"…). Late subscribers still get called. */
export function signal(name: string) {
  if (flags.has(name)) return;
  flags.add(name);
  if (name === "start") reel.started = true;
  waiters.get(name)?.forEach((fn) => fn());
  waiters.delete(name);
}

export function when(name: string, fn: Listener): () => void {
  if (flags.has(name)) {
    fn();
    return () => {};
  }
  const set = waiters.get(name) ?? new Set<Listener>();
  set.add(fn);
  waiters.set(name, set);
  return () => set.delete(fn);
}

export const prefersReducedMotion = () =>
  typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

export function scrollToSection(id: string) {
  const el = document.getElementById(id);
  if (!el) return;
  if (reel.lenis) reel.lenis.scrollTo(el, { duration: 1.6 });
  else el.scrollIntoView({ behavior: "smooth" });
}

export const clamp = (v: number, a = 0, b = 1) => Math.min(b, Math.max(a, v));
export const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
/** progress of v through [a, b], clamped */
export const range = (v: number, a: number, b: number) => clamp((v - a) / (b - a));
export const easeOutExpo = (t: number) => (t >= 1 ? 1 : 1 - Math.pow(2, -10 * t));
export const easeInOutCubic = (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);

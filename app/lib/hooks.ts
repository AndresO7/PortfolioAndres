"use client";

import { useEffect, useRef, useState, type RefObject } from "react";
import { ScrollTrigger } from "./gsap";

/** True while the element is within `margin` of the viewport. Used to pause WebGL off-screen. */
export function useInView<T extends Element>(ref: RefObject<T | null>, margin = "200px") {
  const [inView, setInView] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(([entry]) => setInView(entry.isIntersecting), { rootMargin: margin });
    io.observe(el);
    return () => io.disconnect();
  }, [ref, margin]);
  return inView;
}

/**
 * Scroll progress (0 → 1) of a tall section while its sticky frame is pinned,
 * kept in a ref so 3D loops and rAF handlers can read it without re-rendering.
 */
export function usePinProgress<T extends HTMLElement>(ref: RefObject<T | null>, onUpdate?: (p: number) => void) {
  const progress = useRef(0);
  const cb = useRef(onUpdate);
  useEffect(() => {
    cb.current = onUpdate;
  });
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const st = ScrollTrigger.create({
      trigger: el,
      start: "top top",
      end: "bottom bottom",
      onUpdate: (self) => {
        progress.current = self.progress;
        cb.current?.(self.progress);
      },
      onRefresh: (self) => {
        progress.current = self.progress;
        cb.current?.(self.progress);
      },
    });
    return () => st.kill();
  }, [ref]);
  return progress;
}

/**
 * Scale a single line of type so it spans its parent's full width. Pass a
 * `measure` element (a hidden twin in its resting state) when the visible
 * line is animated and can't be measured directly.
 */
export function useFitText<T extends HTMLElement>(
  ref: RefObject<T | null>,
  ratio = 1,
  measure?: RefObject<HTMLElement | null>,
  maxFontSize?: () => number,
  /** the text itself: a new value (e.g. a new language) forces a refit */
  text?: string,
) {
  const max = useRef(maxFontSize);
  useEffect(() => {
    max.current = maxFontSize;
  });
  useEffect(() => {
    const el = ref.current;
    const parent = el?.parentElement;
    if (!el || !parent) return;
    let lastKey = "";
    const fit = (force = false) => {
      const cs = getComputedStyle(parent);
      const inner = parent.clientWidth - parseFloat(cs.paddingLeft) - parseFloat(cs.paddingRight);
      const target = inner * ratio;
      const key = `${target}x${window.innerHeight}`;
      if (!force && key === lastKey) return;
      lastKey = key;
      el.style.fontSize = "100px";
      const w = (measure?.current ?? el).scrollWidth;
      if (!w) return;
      const size = Math.min((100 * target) / w, max.current?.() ?? Infinity);
      el.style.fontSize = `${size}px`;
    };
    fit(true);
    const ro = new ResizeObserver(() => fit());
    ro.observe(parent);
    const onResize = () => fit();
    window.addEventListener("resize", onResize);
    document.fonts?.ready.then(() => fit(true));
    return () => {
      ro.disconnect();
      window.removeEventListener("resize", onResize);
    };
  }, [ref, ratio, measure, text]);
}

"use client";

import { useEffect } from "react";
import Lenis from "lenis";
import { gsap, ScrollTrigger } from "../lib/gsap";
import { prefersReducedMotion, reel, when } from "../lib/reel";

/** Lenis drives the scroll, GSAP's ticker drives Lenis, ScrollTrigger listens to both. */
export function SmoothScroll() {
  useEffect(() => {
    if ("scrollRestoration" in history) history.scrollRestoration = "manual";
    window.scrollTo(0, 0);

    const reduce = prefersReducedMotion();
    const lenis = new Lenis({
      lerp: reduce ? 1 : 0.085,
      smoothWheel: !reduce,
      touchMultiplier: 1.3,
    });
    reel.lenis = lenis;

    lenis.on("scroll", (l: Lenis) => {
      reel.scrollY = l.scroll;
      reel.progress = l.limit > 0 ? l.scroll / l.limit : 0;
      reel.velocity = l.velocity;
      ScrollTrigger.update();
    });

    const raf = (time: number) => {
      lenis.raf(time * 1000);
      if (!lenis.isScrolling) reel.velocity *= 0.86;
    };
    gsap.ticker.add(raf);
    gsap.ticker.lagSmoothing(0);

    lenis.stop();
    const offStart = when("start", () => {
      lenis.start();
      ScrollTrigger.refresh();
    });
    document.fonts?.ready.then(() => ScrollTrigger.refresh());

    const onMove = (e: PointerEvent) => {
      reel.mouseX = (e.clientX / window.innerWidth) * 2 - 1;
      reel.mouseY = -((e.clientY / window.innerHeight) * 2 - 1);
    };
    window.addEventListener("pointermove", onMove, { passive: true });

    return () => {
      offStart();
      gsap.ticker.remove(raf);
      window.removeEventListener("pointermove", onMove);
      lenis.destroy();
      reel.lenis = null;
    };
  }, []);

  return null;
}

"use client";

import { useEffect } from "react";
import { reel } from "../lib/reel";
import { sound } from "../lib/sound";

/** Wires page-wide sounds: hover ticks, clicks, and scroll speed into the drone. */
export function SoundFx() {
  useEffect(() => {
    sound.boot();
    let current: Element | null = null;
    const onOver = (e: PointerEvent) => {
      const target = (e.target as Element | null)?.closest?.("a, button, [data-cursor]") ?? null;
      if (target && target !== current) sound.hover();
      current = target;
    };
    const onDown = (e: PointerEvent) => {
      if ((e.target as Element | null)?.closest?.("a, button")) sound.click();
    };
    let raf = 0;
    const loop = () => {
      sound.setVelocity(reel.velocity);
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    window.addEventListener("pointerover", onOver, { passive: true });
    window.addEventListener("pointerdown", onDown, { passive: true });
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("pointerover", onOver);
      window.removeEventListener("pointerdown", onDown);
    };
  }, []);
  return null;
}

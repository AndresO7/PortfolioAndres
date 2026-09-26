"use client";

import { useEffect } from "react";
import { sound } from "../lib/sound";

/** Wires page-wide sounds: hover ticks and clicks. */
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
    window.addEventListener("pointerover", onOver, { passive: true });
    window.addEventListener("pointerdown", onDown, { passive: true });
    return () => {
      window.removeEventListener("pointerover", onOver);
      window.removeEventListener("pointerdown", onDown);
    };
  }, []);
  return null;
}

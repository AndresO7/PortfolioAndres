"use client";

import { useEffect, useRef } from "react";

/** A difference-blended square that turns into a label over anything clickable. */
export function Cursor() {
  const root = useRef<HTMLDivElement>(null);
  const label = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    if (!window.matchMedia("(pointer: fine)").matches) return;
    const el = root.current;
    if (!el) return;
    document.documentElement.classList.add("has-cursor");

    let x = window.innerWidth / 2;
    let y = window.innerHeight / 2;
    let tx = x;
    let ty = y;
    let raf = 0;
    let shown = false;

    const onMove = (e: PointerEvent) => {
      tx = e.clientX;
      ty = e.clientY;
      if (!shown) {
        shown = true;
        x = tx;
        y = ty;
        el.style.opacity = "1";
      }
      const target = (e.target as Element | null)?.closest?.("a, button, [data-cursor]");
      const text = target ? target.getAttribute("data-cursor") ?? "Open" : "";
      if (label.current && label.current.textContent !== text) label.current.textContent = text;
      el.dataset.active = target ? "1" : "0";
    };
    const onLeave = () => {
      shown = false;
      el.style.opacity = "0";
    };
    const loop = () => {
      x += (tx - x) * 0.24;
      y += (ty - y) * 0.24;
      el.style.transform = `translate3d(${x}px, ${y}px, 0)`;
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    window.addEventListener("pointermove", onMove, { passive: true });
    document.addEventListener("pointerleave", onLeave);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("pointermove", onMove);
      document.removeEventListener("pointerleave", onLeave);
      document.documentElement.classList.remove("has-cursor");
    };
  }, []);

  return (
    <div ref={root} className="cursor pointer-events-none fixed left-0 top-0 z-[120] opacity-0 mix-blend-difference" data-active="0" aria-hidden>
      <div className="cursor-box">
        <span ref={label} className="cursor-label" />
      </div>
      <style>{`
        .cursor-box {
          position: absolute; left: 0; top: 0;
          width: 12px; height: 12px;
          transform: translate(-50%, -50%);
          background: #efebe3;
          display: flex; align-items: center; justify-content: center;
          transition: width .35s cubic-bezier(.2,.9,.1,1), height .35s cubic-bezier(.2,.9,.1,1);
          overflow: hidden;
        }
        .cursor[data-active="1"] .cursor-box { width: 92px; height: 30px; }
        .cursor-label {
          font-family: var(--font-mono); font-size: 10px; font-weight: 700;
          letter-spacing: .14em; text-transform: uppercase; white-space: nowrap;
          color: #0a0a0a; opacity: 0; transition: opacity .2s;
        }
        .cursor[data-active="1"] .cursor-label { opacity: 1; transition-delay: .12s; }
      `}</style>
    </div>
  );
}

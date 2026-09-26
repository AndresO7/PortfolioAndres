"use client";

import { useEffect, useRef, useState } from "react";
import { gsap } from "../lib/gsap";
import { signal, when } from "../lib/reel";

const statusLines = [
  "Mounting statue.glb — 87,547 tris",
  "Compiling dither shader",
  "Setting type — Archivo 62% ↔ 125%",
  "Syncing clock — 128 BPM",
  "Rolling",
];

/**
 * Scene 00: a film slate. Counts to 100 while the statue and fonts load,
 * claps, and wipes up to start the reel.
 */
export function Loader() {
  const root = useRef<HTMLDivElement>(null);
  const counter = useRef<HTMLSpanElement>(null);
  const bar = useRef<HTMLDivElement>(null);
  const clapper = useRef<HTMLDivElement>(null);
  const status = useRef<HTMLSpanElement>(null);
  const date = useRef<HTMLSpanElement>(null);
  const [done, setDone] = useState(false);

  useEffect(() => {
    const d = new Date();
    if (date.current) {
      date.current.textContent = `${d.getFullYear()}.${String(d.getMonth() + 1).padStart(2, "0")}.${String(d.getDate()).padStart(2, "0")}`;
    }

    let heroReady = false;
    let fontsReady = false;
    const offHero = when("hero", () => (heroReady = true));
    document.fonts?.ready.then(() => (fontsReady = true));
    const fallback = window.setTimeout(() => (heroReady = fontsReady = true), 9000);

    const t0 = performance.now();
    let display = 0;
    let raf = 0;
    let finishing = false;
    let tl: gsap.core.Timeline | null = null;

    const finish = () => {
      tl = gsap.timeline({ onComplete: () => setDone(true) });
      tl.to(clapper.current, { rotate: 0, duration: 0.22, ease: "power4.in" })
        .set(root.current, { backgroundColor: "#39ff14", color: "#0a0a0a" })
        .set(root.current, { backgroundColor: "#0a0a0a", color: "#efebe3" }, "+=0.07")
        .add(() => signal("start"), "+=0.12")
        .to(root.current, { clipPath: "inset(0% 0% 100% 0%)", duration: 1.05, ease: "expo.inOut" }, "<");
    };

    const loop = (now: number) => {
      const elapsed = now - t0;
      const timeCap = Math.min(1, elapsed / 1700);
      const assetCap = heroReady && fontsReady ? 1 : Math.min(0.9, 0.3 + elapsed / 6000);
      const target = Math.min(timeCap, assetCap) * 100;
      display += (target - display) * 0.1;
      if (target - display < 0.35) display = target;
      const n = Math.round(display);
      if (counter.current) counter.current.textContent = String(n).padStart(3, "0");
      if (bar.current) bar.current.style.transform = `scaleX(${display / 100})`;
      if (status.current) {
        const line = statusLines[Math.min(statusLines.length - 1, Math.floor((display / 100) * statusLines.length))];
        if (status.current.textContent !== line) status.current.textContent = line;
      }
      if (n >= 100 && !finishing) {
        finishing = true;
        finish();
        return;
      }
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);

    return () => {
      cancelAnimationFrame(raf);
      window.clearTimeout(fallback);
      offHero();
      tl?.kill();
    };
  }, []);

  if (done) return null;

  const cell = "border-paper/90 border-t-2 px-3 py-2 md:px-4 md:py-3";
  return (
    <div
      ref={root}
      className="fixed inset-0 z-[110] flex flex-col bg-ink text-paper"
      style={{ clipPath: "inset(0% 0% 0% 0%)" }}
      role="status"
      aria-label="Loading"
    >
      <div className="shell pt-[26px]">
        {/* clapper sticks */}
        <div className="relative h-[46px] md:h-[64px]">
          <div
            ref={clapper}
            className="absolute inset-x-0 top-0 h-[22px] origin-[0%_100%] md:h-[30px]"
            style={{
              transform: "rotate(-7deg)",
              background: "repeating-linear-gradient(-45deg, #efebe3 0 26px, #0a0a0a 26px 52px)",
              border: "2px solid #efebe3",
            }}
          />
          <div
            className="absolute inset-x-0 bottom-0 h-[22px] md:h-[30px]"
            style={{
              background: "repeating-linear-gradient(45deg, #efebe3 0 26px, #0a0a0a 26px 52px)",
              border: "2px solid #efebe3",
            }}
          />
        </div>

        {/* slate */}
        <div className="mono mt-3 grid grid-cols-3 border-2 border-paper/90 border-t-0 md:grid-cols-6">
          <div className={`${cell} col-span-3 md:col-span-4`}>
            <span className="block opacity-50">Prod.</span>
            <span className="block font-bold">Andres Ortiz — Systems reel</span>
          </div>
          <div className={`${cell} col-span-3 border-l-0 md:col-span-2 md:border-l-2`}>
            <span className="block opacity-50">Director</span>
            <span className="block font-bold">A. Ortiz</span>
          </div>
          {[
            ["Roll", "01"],
            ["Scene", "00"],
            ["Take", "26"],
            ["Camera", "A"],
            ["FPS", "60"],
            ["Date", "----.--.--"],
          ].map(([k, v], i) => (
            <div key={k} className={`${cell} ${i % 3 === 0 ? "" : "border-l-2"} ${i === 3 ? "md:border-l-2" : ""}`}>
              <span className="block opacity-50">{k}</span>
              <span ref={k === "Date" ? date : undefined} className="block font-bold tabular-nums">
                {v}
              </span>
            </div>
          ))}
        </div>
      </div>

      <div className="shell relative mt-auto flex items-end justify-between gap-6 pb-[26px]">
        <div className="mono mb-3 flex max-w-[46%] flex-col gap-1">
          <span className="opacity-50">Status</span>
          <span ref={status} className="font-bold">
            {statusLines[0]}
          </span>
        </div>
        <span
          ref={counter}
          className="display -mb-[0.1em] text-acid tabular-nums"
          style={{ fontSize: "min(38vw, 52vh)", lineHeight: 0.8 }}
        >
          000
        </span>
      </div>
      <div className="shell pb-[20px]">
        <div className="h-[2px] w-full bg-paper/20">
          <div ref={bar} className="h-full origin-left bg-acid" style={{ transform: "scaleX(0)" }} />
        </div>
      </div>
    </div>
  );
}

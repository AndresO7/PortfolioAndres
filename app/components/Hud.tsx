"use client";

import { useEffect, useRef, useState } from "react";
import { scenes } from "../lib/content";
import { BEAT_MS, reel, scrollToSection, when } from "../lib/reel";

const pad = (n: number, l = 2) => String(Math.floor(n)).padStart(l, "0");

/** One viewport of scroll = this many seconds of reel. */
const SECONDS_PER_SCREEN = 3.2;

/**
 * The viewfinder over the whole page: crop marks, a scroll-driven timecode,
 * a measured FPS counter, a 128 BPM beat and the current scene. Everything is
 * written straight to the DOM from one rAF loop.
 */
export function Hud() {
  /** tl, tr, bl, br — each corner takes the tone of whatever is under it */
  const corners = useRef<(HTMLDivElement | null)[]>([]);
  const timecode = useRef<HTMLSpanElement>(null);
  const fps = useRef<HTMLSpanElement>(null);
  const sceneNum = useRef<HTMLSpanElement>(null);
  const sceneLabel = useRef<HTMLSpanElement>(null);
  const bar = useRef<HTMLSpanElement>(null);
  const beats = useRef<HTMLSpanElement[]>([]);
  const progress = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);
  const [menu, setMenu] = useState(false);

  useEffect(() => when("start", () => setVisible(true)), []);

  useEffect(() => {
    let raf = 0;
    let frames = 0;
    let lastFpsAt = performance.now();
    let shownFps = 60;
    let lastScene = -1;
    let lastBeat = -1;
    let sections: HTMLElement[] = [];
    let sectionsAt = 0;
    let tick = 0;

    // The HUD ignores pointer events, so hit-testing sees straight through it to the page.
    const toneAt = (x: number, y: number) =>
      (document.elementFromPoint(x, y)?.closest("[data-tone]") as HTMLElement | null)?.dataset.tone ?? "dark";

    const loop = (now: number) => {
      frames++;
      if (now - lastFpsAt >= 500) {
        const measured = (frames * 1000) / (now - lastFpsAt);
        shownFps = Math.min(120, measured);
        frames = 0;
        lastFpsAt = now;
        if (fps.current) fps.current.textContent = `${pad(shownFps)} FPS`;
      }

      const t = (reel.scrollY / window.innerHeight) * SECONDS_PER_SCREEN;
      const f = (t % 1) * 60;
      if (timecode.current) {
        timecode.current.textContent = `${pad(t / 3600)}:${pad((t / 60) % 60)}:${pad(t % 60)}:${pad(f)}`;
      }
      if (progress.current) progress.current.style.transform = `scaleX(${reel.progress})`;

      const beat = Math.floor(now / BEAT_MS) % 4;
      if (beat !== lastBeat) {
        lastBeat = beat;
        beats.current.forEach((b, i) => (b.dataset.on = i === beat ? "1" : "0"));
      }

      if (now - sectionsAt > 1000) {
        sections = Array.from(document.querySelectorAll<HTMLElement>("[data-scene]"));
        sectionsAt = now;
      }
      const mid = window.innerHeight * 0.5;
      let current = 0;
      sections.forEach((s, i) => {
        if (s.getBoundingClientRect().top <= mid) current = i;
      });
      if (current !== lastScene && sections[current]) {
        lastScene = current;
        const idx = scenes.findIndex((s) => s.id === sections[current].dataset.scene);
        if (idx >= 0) {
          if (sceneNum.current) sceneNum.current.textContent = pad(idx + 1);
          if (sceneLabel.current) sceneLabel.current.textContent = `— ${scenes[idx].label}`;
        }
        if (bar.current) bar.current.textContent = `BAR ${pad(idx + 1)}/${pad(scenes.length)}`;
      }

      if (tick++ % 3 === 0) {
        const w = window.innerWidth;
        const h = window.innerHeight;
        // sample where the HUD text actually sits
        const points: [number, number][] = [
          [72, 40],
          [w - 72, 40],
          [72, h - 38],
          [w - 72, h - 38],
        ];
        corners.current.forEach((el, i) => {
          if (!el) return;
          const tone = toneAt(points[i][0], points[i][1]);
          if (el.dataset.tone !== tone) el.dataset.tone = tone;
        });
      }

      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, []);

  useEffect(() => {
    if (!reel.lenis) return;
    if (menu) reel.lenis.stop();
    else if (reel.started) reel.lenis.start();
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setMenu(false);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [menu]);

  const go = (id: string) => {
    setMenu(false);
    requestAnimationFrame(() => scrollToSection(id));
  };

  return (
    <>
      <div
        className={`hud pointer-events-none fixed inset-0 z-[80] transition-opacity duration-700 ${
          visible ? "opacity-100" : "opacity-0"
        }`}
        aria-hidden={!visible}
      >
        <div
          ref={(el) => {
            corners.current[0] = el;
          }}
          className="hud-c absolute left-0 top-0"
          data-tone="dark"
        >
          <span className="crop tl" style={{ top: 20, left: 20 }} />
          <div className="absolute left-[46px] top-[34px] flex items-center gap-6 whitespace-nowrap md:left-[64px] md:gap-10">
            <span className="mono font-bold">Andres Ortiz</span>
            <span className="mono hidden opacity-60 md:inline">Systems reel — 2026</span>
            <span className="mono hidden items-center gap-2 lg:inline-flex">
              <span className="rec-dot inline-block h-[7px] w-[7px] rounded-full bg-signal" />
              <span className="opacity-80">REC</span>
            </span>
          </div>
        </div>

        <div
          ref={(el) => {
            corners.current[1] = el;
          }}
          className="hud-c absolute right-0 top-0"
          data-tone="dark"
        >
          <span className="crop tr" style={{ top: 20, right: 20 }} />
          <button
            type="button"
            onClick={() => setMenu(true)}
            className="mono pointer-events-auto absolute right-[46px] top-[30px] flex items-center gap-3 whitespace-nowrap px-1 py-1 font-bold md:right-[64px]"
            data-cursor="Index"
            aria-label="Open scene index"
          >
            <span ref={sceneNum}>01</span>
            <span ref={sceneLabel} className="hidden sm:inline">
              — Title
            </span>
            <span className="inline-block border-[1.5px] border-current px-[5px] leading-[14px]">+</span>
          </button>
        </div>

        <div
          ref={(el) => {
            corners.current[2] = el;
          }}
          className="hud-c absolute bottom-0 left-0 right-0"
          data-tone="dark"
        >
          <span className="crop bl" style={{ bottom: 20, left: 20 }} />
          <div className="absolute bottom-[32px] left-[46px] flex items-center gap-8 whitespace-nowrap md:left-[64px] md:gap-14">
            <span ref={timecode} className="mono font-bold tabular-nums">
              00:00:00:00
            </span>
            <span ref={fps} className="mono hidden opacity-60 tabular-nums sm:inline">
              60 FPS
            </span>
          </div>
          <div className="absolute bottom-[12px] left-[20px] right-[20px] h-[2px] opacity-25" style={{ background: "currentColor" }} />
          <div
            ref={progress}
            className="absolute bottom-[12px] left-[20px] right-[20px] h-[2px] origin-left"
            style={{ background: "currentColor", transform: "scaleX(0)" }}
          />
        </div>

        <div
          ref={(el) => {
            corners.current[3] = el;
          }}
          className="hud-c absolute bottom-0 right-0"
          data-tone="dark"
        >
          <span className="crop br" style={{ bottom: 20, right: 20 }} />
          <div className="absolute bottom-[32px] right-[46px] flex items-center gap-6 whitespace-nowrap md:right-[64px] md:gap-10">
            <span className="mono hidden opacity-60 sm:inline">128 BPM</span>
            <span className="flex gap-[5px]">
              {[0, 1, 2, 3].map((i) => (
                <span
                  key={i}
                  ref={(el) => {
                    if (el) beats.current[i] = el;
                  }}
                  className="beat inline-block h-[10px] w-[10px] border-[1.5px] border-current"
                />
              ))}
            </span>
            <span ref={bar} className="mono font-bold">
              BAR 01/{pad(scenes.length)}
            </span>
          </div>
        </div>
      </div>

      <nav
        className={`fixed inset-0 z-[90] flex flex-col bg-acid text-ink transition-[clip-path] duration-700 ease-[cubic-bezier(.77,0,.18,1)] ${
          menu ? "[clip-path:inset(0_0_0_0)]" : "pointer-events-none [clip-path:inset(0_0_100%_0)]"
        }`}
        aria-hidden={!menu}
        aria-label="Scene index"
      >
        <div className="shell flex items-center justify-between pt-[30px]">
          <span className="mono font-bold">Scene index</span>
          <button type="button" className="mono font-bold" onClick={() => setMenu(false)} tabIndex={menu ? 0 : -1} data-cursor="Close">
            Close [esc]
          </button>
        </div>
        <ol className="shell mt-6 flex flex-1 flex-col justify-center pb-10">
          {scenes.map((s, i) => (
            <li key={s.id} className="border-t-2 border-ink last:border-b-2">
              <button
                type="button"
                tabIndex={menu ? 0 : -1}
                onClick={() => go(s.id)}
                className="group flex w-full items-baseline gap-6 py-[0.35vh] text-left transition-colors hover:bg-ink hover:text-acid"
                data-cursor="Cut to"
              >
                <span className="mono w-10 shrink-0 pl-2">{pad(i + 1)}</span>
                <span className="display text-[clamp(28px,6.2vh,76px)] leading-[0.95] transition-[font-stretch] duration-500 group-hover:[font-stretch:125%]">
                  {s.label}
                </span>
              </button>
            </li>
          ))}
        </ol>
      </nav>

      <style>{`
        .hud-c { color: var(--color-paper); transition: color .35s ease; }
        .hud-c[data-tone="light"] { color: var(--color-ink); }
        .beat[data-on="1"] { background: currentColor; }
      `}</style>
    </>
  );
}

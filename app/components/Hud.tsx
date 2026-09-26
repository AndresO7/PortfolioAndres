"use client";

import { useEffect, useRef, useState } from "react";
import { sceneIds, type Locale } from "../lib/content";
import { gsap, ScrollTrigger } from "../lib/gsap";
import { setLocale, useLocale, useT } from "../lib/i18n";
import { BEAT_MS, prefersReducedMotion, reel, scrollToSection, when } from "../lib/reel";
import { sound, useSoundEnabled } from "../lib/sound";

const pad = (n: number, l = 2) => String(Math.floor(n)).padStart(l, "0");

/** One viewport of scroll = this many seconds of reel. */
const SECONDS_PER_SCREEN = 3.2;

const LOCALES: Locale[] = ["en", "es"];
const NAMES: Record<Locale, string> = { en: "English", es: "Español" };

/** EN / ES as a two-cell switch; the live language is filled with the current colour. */
function LangToggle({ locale, onPick, label, tabIndex }: { locale: Locale; onPick: (l: Locale) => void; label: string; tabIndex?: number }) {
  return (
    <div role="group" aria-label={label} className="lang pointer-events-auto flex border-[1.5px] border-current">
      {LOCALES.map((l) => (
        <button
          key={l}
          type="button"
          lang={l}
          aria-pressed={l === locale}
          onClick={() => onPick(l)}
          tabIndex={tabIndex}
          className="lang-btn mono px-[6px] font-bold leading-[18px] transition-colors"
          data-cursor={NAMES[l]}
        >
          {l.toUpperCase()}
        </button>
      ))}
    </div>
  );
}

/**
 * The viewfinder over the whole page: crop marks, a scroll-driven timecode,
 * a measured FPS counter, a 128 BPM beat, the current scene and the language
 * switch. The per-frame parts are written straight to the DOM from one rAF loop.
 */
export function Hud() {
  const t = useT();
  const locale = useLocale();
  const soundOn = useSoundEnabled();
  /** tl, tr, bl, br — each corner takes the tone of whatever is under it */
  const corners = useRef<(HTMLDivElement | null)[]>([]);
  const timecode = useRef<HTMLSpanElement>(null);
  const fps = useRef<HTMLSpanElement>(null);
  const sceneNum = useRef<HTMLSpanElement>(null);
  const sceneLabel = useRef<HTMLSpanElement>(null);
  const bar = useRef<HTMLSpanElement>(null);
  const beats = useRef<HTMLSpanElement[]>([]);
  const progress = useRef<HTMLDivElement>(null);
  const wipe = useRef<HTMLDivElement>(null);
  const hudRoot = useRef<HTMLDivElement>(null);
  const labels = useRef(t);
  const relabel = useRef(true);
  const switching = useRef(false);
  const [visible, setVisible] = useState(false);
  const [menu, setMenu] = useState(false);

  useEffect(() => when("start", () => setVisible(true)), []);

  useEffect(() => {
    labels.current = t;
    relabel.current = true;
    document.documentElement.lang = locale;
  }, [t, locale]);

  useEffect(() => {
    let raf = 0;
    let frames = 0;
    let lastFpsAt = performance.now();
    let shownFps = 60;
    let lastScene = -1;
    let lastSceneId = "";
    let lastBeat = -1;
    let sections: HTMLElement[] = [];
    let sectionsAt = 0;
    let tick = 0;

    // Hit-test the page under a corner, skipping the HUD's own clickable controls.
    const toneAt = (x: number, y: number) => {
      const under = document.elementsFromPoint(x, y).find((el) => !hudRoot.current?.contains(el));
      return (under?.closest("[data-tone]") as HTMLElement | null)?.dataset.tone ?? "dark";
    };

    const loop = (now: number) => {
      frames++;
      if (now - lastFpsAt >= 500) {
        const measured = (frames * 1000) / (now - lastFpsAt);
        shownFps = Math.min(120, measured);
        frames = 0;
        lastFpsAt = now;
        if (fps.current) fps.current.textContent = `${pad(shownFps)} FPS`;
      }

      const time = (reel.scrollY / window.innerHeight) * SECONDS_PER_SCREEN;
      const f = (time % 1) * 60;
      if (timecode.current) {
        timecode.current.textContent = `${pad(time / 3600)}:${pad((time / 60) % 60)}:${pad(time % 60)}:${pad(f)}`;
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
      if ((current !== lastScene || relabel.current) && sections[current]) {
        lastScene = current;
        relabel.current = false;
        const id = sections[current].dataset.scene as (typeof sceneIds)[number];
        // "work" spans two sections; only a new scene id gets the camcorder beep
        if (lastSceneId && id !== lastSceneId) sound.scene();
        lastSceneId = id;
        const idx = sceneIds.indexOf(id);
        if (idx >= 0) {
          if (sceneNum.current) sceneNum.current.textContent = pad(idx + 1);
          if (sceneLabel.current) sceneLabel.current.textContent = `— ${labels.current.scenes[id]}`;
          if (bar.current) bar.current.textContent = `${labels.current.hud.bar} ${pad(idx + 1)}/${pad(sceneIds.length)}`;
        }
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

  const openedOnce = useRef(false);
  useEffect(() => {
    if (openedOnce.current) sound.whoosh(0.6);
    openedOnce.current = true;
  }, [menu]);

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

  /**
   * Cut to the other language behind an acid wipe. Copy changes length, so the
   * page is re-measured and scrolled back to the same point of the same scene.
   */
  const switchTo = (next: Locale) => {
    if (next === locale || switching.current) return;
    const anchor = Array.from(document.querySelectorAll<HTMLElement>("[data-scene]")).find(
      (s) => s.getBoundingClientRect().bottom > 0,
    );
    const into = anchor ? -anchor.getBoundingClientRect().top : 0;
    const swap = () => {
      setLocale(next);
      requestAnimationFrame(() =>
        requestAnimationFrame(() => {
          ScrollTrigger.refresh();
          if (!anchor) return;
          const y = anchor.getBoundingClientRect().top + window.scrollY + into;
          if (reel.lenis) reel.lenis.scrollTo(y, { immediate: true, force: true });
          else window.scrollTo(0, y);
        }),
      );
    };

    const el = wipe.current;
    if (!el || prefersReducedMotion()) {
      swap();
      return;
    }
    switching.current = true;
    sound.whoosh(1.1);
    el.querySelector("[data-wipe-code]")!.textContent = next.toUpperCase();
    el.querySelector("[data-wipe-name]")!.textContent = NAMES[next];
    gsap
      .timeline({ onComplete: () => (switching.current = false) })
      .set(el, { display: "flex", clipPath: "inset(0% 0% 100% 0%)" })
      .to(el, { clipPath: "inset(0% 0% 0% 0%)", duration: 0.38, ease: "expo.in" })
      .add(swap)
      .to(el, { clipPath: "inset(100% 0% 0% 0%)", duration: 0.6, ease: "expo.out", delay: 0.2 })
      .set(el, { display: "none" });
  };

  return (
    <>
      <div
        ref={hudRoot}
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
            <span className="mono hidden opacity-60 md:inline">{t.hud.reel}</span>
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
          <div className="absolute right-[46px] top-[30px] flex items-center gap-4 whitespace-nowrap md:right-[64px] md:gap-6">
            <LangToggle locale={locale} onPick={switchTo} label={t.lang.label} tabIndex={visible ? 0 : -1} />
            <button
              type="button"
              onClick={() => setMenu(true)}
              className="mono pointer-events-auto flex items-center gap-3 px-1 py-1 font-bold"
              data-cursor={t.hud.cursorIndex}
              aria-label={t.hud.openIndex}
              tabIndex={visible ? 0 : -1}
            >
              <span ref={sceneNum}>01</span>
              <span ref={sceneLabel} className="hidden sm:inline">
                — {t.scenes.title}
              </span>
              <span className="inline-block border-[1.5px] border-current px-[5px] leading-[14px]">+</span>
            </button>
          </div>
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
          <div className="absolute bottom-[32px] right-[46px] flex items-center gap-5 whitespace-nowrap md:right-[64px] md:gap-10">
            <button
              type="button"
              onClick={() => sound.toggle()}
              aria-pressed={soundOn}
              aria-label={t.sound.label}
              tabIndex={visible ? 0 : -1}
              className="mono pointer-events-auto flex items-center gap-2 font-bold"
              data-cursor={soundOn ? t.sound.on : t.sound.off}
            >
              <span className="eq flex h-[12px] items-end gap-[2px]" data-on={soundOn ? "1" : "0"} aria-hidden>
                {[0, 1, 2, 3].map((i) => (
                  <i key={i} className="block w-[2px] bg-current" style={{ animationDelay: `${i * -0.23}s` }} />
                ))}
              </span>
              <span className="hidden sm:inline">{soundOn ? t.sound.on : t.sound.off}</span>
            </button>
            <span className="mono hidden opacity-60 lg:inline">128 BPM</span>
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
              {t.hud.bar} 01/{pad(sceneIds.length)}
            </span>
          </div>
        </div>
      </div>

      <nav
        className={`fixed inset-0 z-[90] flex flex-col bg-acid text-ink transition-[clip-path] duration-700 ease-[cubic-bezier(.77,0,.18,1)] ${
          menu ? "[clip-path:inset(0_0_0_0)]" : "pointer-events-none [clip-path:inset(0_0_100%_0)]"
        }`}
        aria-hidden={!menu}
        aria-label={t.hud.index}
      >
        <div className="shell flex items-center justify-between gap-6 pt-[30px]">
          <span className="mono font-bold">{t.hud.index}</span>
          <div className="flex items-center gap-6">
            <div className="lang-menu">
              <LangToggle locale={locale} onPick={switchTo} label={t.lang.label} tabIndex={menu ? 0 : -1} />
            </div>
            <button
              type="button"
              className="mono font-bold"
              onClick={() => setMenu(false)}
              tabIndex={menu ? 0 : -1}
              data-cursor={t.hud.cursorClose}
            >
              {t.hud.close}
            </button>
          </div>
        </div>
        <ol className="shell mt-6 flex flex-1 flex-col justify-center pb-10">
          {sceneIds.map((id, i) => (
            <li key={id} className="border-t-2 border-ink last:border-b-2">
              <button
                type="button"
                tabIndex={menu ? 0 : -1}
                onClick={() => go(id)}
                className="group flex w-full items-baseline gap-6 py-[0.35vh] text-left transition-colors hover:bg-ink hover:text-acid"
                data-cursor={t.hud.cutTo}
              >
                <span className="mono w-10 shrink-0 pl-2">{pad(i + 1)}</span>
                <span className="display text-[clamp(28px,6.2vh,76px)] leading-[0.95] transition-[font-stretch] duration-500 group-hover:[font-stretch:125%]">
                  {t.scenes[id]}
                </span>
              </button>
            </li>
          ))}
        </ol>
      </nav>

      {/* the language cut */}
      <div
        ref={wipe}
        className="pointer-events-none fixed inset-0 z-[105] hidden flex-col items-center justify-center bg-acid text-ink"
        aria-hidden
      >
        <span data-wipe-code className="display" style={{ fontSize: "min(62vh, 60vw)", lineHeight: 0.8 }} />
        <span data-wipe-name className="mono mt-6 font-bold" />
      </div>

      <style>{`
        .hud-c { --hud-fg: var(--color-paper); --hud-inv: var(--color-ink); color: var(--hud-fg); transition: color .35s ease; }
        .hud-c[data-tone="light"] { --hud-fg: var(--color-ink); --hud-inv: var(--color-paper); }
        .lang-menu { --hud-fg: var(--color-ink); --hud-inv: var(--color-acid); }
        .beat[data-on="1"] { background: currentColor; }
        .eq i { height: 3px; transform-origin: bottom; transition: height .3s; }
        .eq[data-on="1"] i { height: 12px; animation: eq .47s ease-in-out infinite alternate; }
        @keyframes eq { from { transform: scaleY(.25); } to { transform: scaleY(1); } }
        @media (prefers-reduced-motion: reduce) { .eq[data-on="1"] i { animation: none; } }
        .lang-btn[aria-pressed="true"] { background: var(--hud-fg); color: var(--hud-inv); }
        .lang-btn[aria-pressed="false"]:hover { opacity: .6; }
      `}</style>
    </>
  );
}

"use client";

import { useEffect, useRef, useState } from "react";
import { useInView, usePinProgress } from "../../lib/hooks";
import { useT } from "../../lib/i18n";
import { reel } from "../../lib/reel";
import { sound } from "../../lib/sound";

/** one word per third of the scroll, in every language */
const PHASES = 3;
const ROWS = 7;
const CENTER = 3;

/**
 * Scene 02 — kinetic type. Seven rows of one word, outlined around a solid
 * centre line, sliding against each other. Scroll velocity drives skew and a
 * horizontal motion blur; each third of the scroll cuts to the next word.
 */
export function Manifesto() {
  const section = useRef<HTMLElement>(null);
  const frame = useRef<HTMLDivElement>(null);
  const rows = useRef<HTMLDivElement[]>([]);
  const blur = useRef<SVGFEGaussianBlurElement>(null);
  const counter = useRef<HTMLSpanElement>(null);
  const [phase, setPhase] = useState(0);
  const phaseRef = useRef(0);
  const lineRef = useRef("");
  const inView = useInView(section, "100px");
  const t = useT();

  const progress = usePinProgress(section, (p) => {
    const next = Math.min(PHASES - 1, Math.floor(p * PHASES * 0.999));
    if (next !== phaseRef.current) {
      phaseRef.current = next;
      setPhase(next);
      const f = frame.current;
      if (f) {
        f.dataset.flash = "1";
        sound.thump();
        window.setTimeout(() => (f.dataset.flash = "0"), 90);
      }
    }
  });

  useEffect(() => {
    if (!inView) return;
    let raf = 0;
    let smoothV = 0;
    const widths: number[] = [];
    let measuredFor = "";
    const t0 = performance.now();
    const loop = (now: number) => {
      // re-measure the loop width whenever the word (or the language) changes
      if (measuredFor !== lineRef.current) {
        rows.current.forEach((r, i) => (widths[i] = (r.firstElementChild as HTMLElement)?.offsetWidth ?? 1));
        measuredFor = lineRef.current;
      }
      const p = progress.current;
      smoothV += (reel.velocity - smoothV) * 0.15;
      const v = Math.max(-40, Math.min(40, smoothV));
      const time = (now - t0) / 1000;
      rows.current.forEach((r, i) => {
        const dir = i % 2 === 0 ? 1 : -1;
        const w = widths[i] || 1;
        const speed = 22 + Math.abs(i - CENTER) * 9;
        const raw = dir * (time * speed + p * window.innerWidth * (1.1 + Math.abs(i - CENTER) * 0.25)) + i * 137;
        const x = -(((raw % w) + w) % w);
        r.style.transform = `translate3d(${x}px,0,0) skewX(${-v * 0.28 * dir}deg)`;
      });
      const b = Math.min(14, Math.abs(v) * 0.45);
      blur.current?.setAttribute("stdDeviation", `${b.toFixed(1)} 0`);
      if (frame.current) frame.current.style.setProperty("--mblur", b > 0.6 ? "url(#manifesto-blur)" : "none");
      if (counter.current) counter.current.textContent = `${String(phaseRef.current + 1).padStart(2, "0")}/${String(PHASES).padStart(2, "0")}`;
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, [inView, progress]);

  const word = t.manifesto.words[phase];
  const repeat = Math.max(3, Math.ceil(14 / word.length));
  const line = Array.from({ length: repeat }, () => word).join(" ") + " ";
  useEffect(() => {
    lineRef.current = line;
  }, [line]);

  return (
    <section
      id="manifesto"
      ref={section}
      data-scene="manifesto"
      data-tone="light"
      className="relative h-[330vh] bg-acid text-ink"
      aria-label={t.manifesto.sr}
    >
      <svg className="absolute h-0 w-0" aria-hidden>
        <filter id="manifesto-blur" x="-10%" y="0" width="120%" height="100%">
          <feGaussianBlur ref={blur} in="SourceGraphic" stdDeviation="0 0" />
        </filter>
      </svg>

      <div ref={frame} className="manifesto-frame sticky top-0 flex h-[100svh] flex-col justify-center overflow-hidden" data-flash="0">
        <p className="sr-only">{t.manifesto.sr}</p>
        <div aria-hidden className="flex flex-col" style={{ filter: "var(--mblur)" }}>
          {Array.from({ length: ROWS }, (_, i) => {
            const d = Math.abs(i - CENTER);
            const cls = d === 0 ? "text-ink" : d === 1 ? "outline ghost" : "outline";
            return (
              <div
                key={i}
                ref={(el) => {
                  if (el) rows.current[i] = el;
                }}
                className={`display-wide flex whitespace-nowrap will-change-transform ${cls}`}
                style={{ fontSize: "min(calc(100svh / 7.6), 22vw)", lineHeight: 0.93, ["--stroke" as string]: "2px" }}
              >
                <span className="pr-[0.25em]">{line}</span>
                <span className="pr-[0.25em]">{line}</span>
                <span className="pr-[0.25em]">{line}</span>
              </div>
            );
          })}
        </div>

        <div className="shell pointer-events-none absolute inset-x-0 bottom-[104px] flex items-end justify-between gap-6 md:bottom-[110px]">
          <p className="mono max-w-[46ch] bg-acid py-1 font-bold">{t.manifesto.caption}</p>
          <span className="mono whitespace-nowrap bg-acid py-1 font-bold">
            {t.manifesto.word} <span ref={counter}>01/03</span>
          </span>
        </div>
      </div>

      <style>{`
        .manifesto-frame .ghost { -webkit-text-stroke: 2px #0a0a0a; color: rgba(10,10,10,.12); }
        .manifesto-frame[data-flash="1"] { background: #0a0a0a; color: #39ff14; }
        .manifesto-frame[data-flash="1"] .outline { -webkit-text-stroke-color: #39ff14; }
        .manifesto-frame[data-flash="1"] .text-ink { color: #39ff14; }
      `}</style>
    </section>
  );
}

"use client";

import { useEffect, useRef, useState } from "react";
import { recordValues as records } from "../../lib/content";
import { useT } from "../../lib/i18n";
import { useInView, usePinProgress } from "../../lib/hooks";
import { easeInOutCubic, range } from "../../lib/reel";
import { sound } from "../../lib/sound";

const COLS = 3;
/** strip order: blank, 0…9 */
const STRIP = [" ", "0", "1", "2", "3", "4", "5", "6", "7", "8", "9"];

const digitsOf = (n: number) => {
  const s = String(n).padStart(COLS, " ");
  return Array.from(s).map((c) => (c === " " ? 0 : Number(c) + 1));
};

/**
 * Scene 03 — the record. One real number per screen, set enormous in volt
 * blue on paper. The digits are odometer strips scrubbed by scroll, with a
 * vertical motion blur proportional to how fast they roll.
 */
export function Record() {
  const section = useRef<HTMLElement>(null);
  const strips = useRef<HTMLDivElement[]>([]);
  const cols = useRef<HTMLDivElement[]>([]);
  const unitRef = useRef<HTMLSpanElement>(null);
  const blur = useRef<SVGFEGaussianBlurElement>(null);
  const bar = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState(0);
  const activeRef = useRef(0);
  const inView = useInView(section, "100px");
  const t = useT();

  const progress = usePinProgress(section, (p) => {
    const i = Math.min(records.length - 1, Math.floor(p * records.length));
    if (i !== activeRef.current) {
      activeRef.current = i;
      setActive(i);
    }
  });

  useEffect(() => {
    if (!inView) return;
    let raf = 0;
    const last: number[] = new Array(COLS).fill(0);
    const loop = () => {
      const p = progress.current * records.length;
      const i = Math.min(records.length - 1, Math.floor(p));
      const local = p - i;
      // roll in during the first 35% of each fact, then hold
      const from = digitsOf(records[Math.max(0, i - 1)].value);
      const to = digitsOf(records[i].value);
      let speed = 0;
      for (let c = 0; c < COLS; c++) {
        // stagger the columns so they land one after another, right to left
        const tc = i === 0 ? 1 : easeInOutCubic(range(local, 0.04 * (COLS - 1 - c), 0.27 + 0.04 * (COLS - 1 - c)));
        const pos = from[c] + (to[c] - from[c]) * tc;
        speed = Math.max(speed, Math.abs(pos - last[c]));
        // a digit passing the window: one mechanical tick
        if (Math.floor(pos) !== Math.floor(last[c])) sound.tick();
        last[c] = pos;
        const strip = strips.current[c];
        // cells are taller than the window, so a neighbour's overshoot never peeks in
        if (strip) strip.style.transform = `translate3d(0, ${-pos * 0.9}em, 0)`;
        const blankness = pos < 1 ? 1 - pos : 0;
        const col = cols.current[c];
        if (col) col.style.width = `${(1 - Math.min(1, blankness)) * 0.5}em`;
      }
      blur.current?.setAttribute("stdDeviation", `0 ${Math.min(26, speed * 60).toFixed(1)}`);
      if (unitRef.current) {
        const u = records[i].unit;
        const show = u ? range(local, 0.2, 0.4) : 0;
        unitRef.current.style.transform = `scaleY(${i === 0 ? (u ? 1 : 0) : show})`;
      }
      if (bar.current) bar.current.style.transform = `scaleX(${progress.current})`;
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, [inView, progress]);

  const rec = records[active];
  const fact = t.record.facts[active];

  return (
    <section
      id="record"
      ref={section}
      data-scene="record"
      data-tone="light"
      className="relative bg-paper text-ink"
      style={{ height: `${records.length * 85 + 100}vh` }}
    >
      <svg className="absolute h-0 w-0" aria-hidden>
        <filter id="record-blur" x="0" y="-20%" width="100%" height="140%">
          <feGaussianBlur ref={blur} in="SourceGraphic" stdDeviation="0 0" />
        </filter>
      </svg>

      <div className="sticky top-0 flex h-[100svh] flex-col overflow-hidden">
        <div className="shell flex items-start justify-between gap-6 pt-[100px] md:pt-[104px]">
          <div className="mono flex max-w-[40ch] flex-col gap-1">
            <span className="font-bold">{t.record.title}</span>
            <span className="opacity-60">{t.record.sub}</span>
          </div>
          <div className="mono text-right">
            <span className="block font-bold tabular-nums">
              {t.record.fact} {String(active + 1).padStart(2, "0")}/{String(records.length).padStart(2, "0")}
            </span>
            <span className="block opacity-60">{rec.asOf}</span>
          </div>
        </div>

        <div className="shell relative flex flex-1 items-center">
          <div
            className="display flex items-end text-volt"
            style={{ fontSize: "min(64svh, 56vw)", filter: "url(#record-blur)" }}
            aria-hidden
          >
            {Array.from({ length: COLS }, (_, c) => (
              <div
                key={c}
                ref={(el) => {
                  if (el) cols.current[c] = el;
                }}
                className="relative h-[0.74em] overflow-hidden"
                style={{ width: "0.5em" }}
              >
                <div
                  ref={(el) => {
                    if (el) strips.current[c] = el;
                  }}
                  className="absolute inset-x-0 top-0 will-change-transform"
                >
                  {STRIP.map((d, k) => (
                    <div key={k} className="flex h-[0.9em] items-start justify-center tabular-nums leading-[0.74]">
                      {d}
                    </div>
                  ))}
                </div>
              </div>
            ))}
            <span ref={unitRef} className="letter ml-[0.04em] h-[0.74em] leading-[0.74]" style={{ transform: "scaleY(0)" }}>
              {rec.unit || "\u00a0"}
            </span>
          </div>
          <p className="sr-only">
            {rec.value}
            {rec.unit} {fact}
          </p>
          <ol className="absolute right-[var(--gutter)] top-1/2 hidden -translate-y-1/2 flex-col md:flex" aria-hidden>
            {records.map((r, i) => (
              <li
                key={i}
                className={`mono flex items-center justify-end gap-4 border-b-2 py-2 pl-10 transition-colors duration-300 first:border-t-2 ${
                  i === active ? "border-volt text-volt" : "border-ink/15 text-ink/40"
                }`}
              >
                <span className="display text-[34px] tracking-normal">
                  {r.unit === "B" ? "~" : ""}
                  {r.value}
                  {r.unit}
                </span>
                <span className="w-6 text-right">{String(i + 1).padStart(2, "0")}</span>
              </li>
            ))}
          </ol>
        </div>

        <div className="shell grid gap-4 pb-[104px] md:grid-cols-12 md:gap-8 md:pb-[112px]">
          <p key={fact} className="lede record-fact md:col-span-8" aria-live="polite">
            {rec.unit === "B" ? "~" : ""}
            {rec.value}
            {rec.unit === "B" ? t.record.bytes : rec.unit} — {fact}.
          </p>
          <div className="mono flex flex-col justify-end gap-1 md:col-span-4 md:text-right">
            <span className="opacity-60">{t.record.source}</span>
            <span className="font-bold">{rec.source}</span>
          </div>
        </div>
        <div className="absolute inset-x-0 bottom-[92px] h-[2px] bg-ink/15">
          <div ref={bar} className="h-full origin-left bg-volt" style={{ transform: "scaleX(0)" }} />
        </div>
      </div>

      <style>{`
        .record-fact { animation: record-in .7s cubic-bezier(.16,1,.3,1) both; }
        @keyframes record-in {
          from { clip-path: inset(0 0 100% 0); transform: translateY(24px); }
          to { clip-path: inset(0 0 0 0); transform: none; }
        }
      `}</style>
    </section>
  );
}

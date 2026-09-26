"use client";

import { useEffect, useRef } from "react";
import { useT } from "../../lib/i18n";
import { useInView, usePinProgress } from "../../lib/hooks";
import { clamp } from "../../lib/reel";
import { sound } from "../../lib/sound";

/**
 * Scene 09 — lineage, laid out like an edit timeline: panels slide past a
 * fixed red playhead, and each year fills in as it crosses it.
 */
export function Lineage() {
  const section = useRef<HTMLElement>(null);
  const track = useRef<HTMLDivElement>(null);
  const ruler = useRef<HTMLDivElement>(null);
  const panels = useRef<HTMLElement[]>([]);
  const inView = useInView(section, "100px");
  const progress = usePinProgress(section);
  const t = useT();
  const lineage = t.lineage.items;

  useEffect(() => {
    if (!inView) return;
    let raf = 0;
    const loop = () => {
      const t = track.current;
      if (t) {
        const max = t.scrollWidth - window.innerWidth;
        const x = -progress.current * max;
        t.style.transform = `translate3d(${x}px,0,0)`;
        if (ruler.current) ruler.current.style.transform = `translate3d(${x * 0.5}px,0,0)`;
        const mid = window.innerWidth / 2;
        panels.current.forEach((p) => {
          const r = p.getBoundingClientRect();
          // 0 when the panel's left edge reaches the playhead, 1 once its year has fully crossed it
          const f = clamp((mid - r.left) / (r.width * 0.55));
          p.style.setProperty("--fill", `${(f * 100).toFixed(2)}%`);
          const live = f > 0 && f < 1.4 && r.left < mid && r.right > mid ? "1" : "0";
          // a panel reaching the playhead is a cut
          if (live === "1" && p.dataset.live !== "1") sound.cut();
          p.dataset.live = live;
        });
      }
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, [inView, progress]);

  return (
    <section
      id="lineage"
      ref={section}
      data-scene="lineage"
      data-tone="dark"
      className="relative bg-ink text-paper"
      style={{ height: `${lineage.length * 70 + 100}vh` }}
    >
      <div className="sticky top-0 h-[100svh] overflow-hidden">
        <div className="shell absolute inset-x-0 top-[100px] flex items-start justify-between gap-6 md:top-[104px]">
          <div className="mono flex flex-col gap-1">
            <span className="font-bold text-acid">{t.lineage.title}</span>
            <span className="opacity-60">{t.lineage.sub}</span>
          </div>
          <span className="mono hidden font-bold md:block">{t.lineage.timeline}</span>
        </div>

        <div ref={track} className="absolute inset-y-0 left-0 flex items-center will-change-transform">
          <div className="w-[50vw] shrink-0" />
          {lineage.map((l, i) => (
            <article
              key={i}
              ref={(el) => {
                if (el) panels.current[i] = el;
              }}
              className="lineage-panel relative flex w-[86vw] shrink-0 flex-col justify-center border-l-2 border-paper/25 pl-6 pr-[6vw] md:w-[64vw] md:pl-10"
              data-live="0"
            >
              <span className="mono mb-4 opacity-60">
                {String(i + 1).padStart(2, "0")} / {String(lineage.length).padStart(2, "0")}
              </span>
              <span
                className="lineage-year display relative block leading-[0.78]"
                // four characters fill the panel; longer words ("LUEGO") scale down to fit
                style={{ fontSize: `calc(min(46svh, 34vw) * ${Math.min(1, 4 / l.year.length)})` }}
              >
                <span className="outline block" style={{ ["--stroke-color" as string]: "#39ff14", ["--stroke" as string]: "2px" }}>
                  {l.year}
                </span>
                <span className="lineage-fill absolute inset-0 block text-acid" aria-hidden>
                  {l.year}
                </span>
              </span>
              <h3 className="display mt-6 text-[clamp(34px,5.4vw,88px)] leading-[0.88]">{l.title}</h3>
              <p className="lede mt-5 max-w-[34ch] text-paper/75">{l.body}</p>
            </article>
          ))}
          <div className="w-[40vw] shrink-0" />
        </div>

        {/* edit-timeline ruler with a fixed playhead */}
        <div className="absolute inset-x-0 bottom-[100px] h-[34px] overflow-hidden border-y-2 border-paper/25" aria-hidden>
          <div
            ref={ruler}
            className="absolute inset-y-0 left-0 w-[400vw]"
            style={{
              backgroundImage:
                "repeating-linear-gradient(90deg, rgba(239,235,227,.55) 0 2px, transparent 2px 120px), repeating-linear-gradient(90deg, rgba(239,235,227,.25) 0 1px, transparent 1px 24px)",
              backgroundSize: "120px 100%, 24px 45%",
              backgroundRepeat: "repeat-x",
              backgroundPosition: "0 0, 0 100%",
            }}
          />
        </div>
        <div className="absolute bottom-[92px] left-1/2 top-[160px] w-[2px] -translate-x-1/2 bg-signal" aria-hidden>
          <span className="mono absolute -top-6 left-1/2 -translate-x-1/2 whitespace-nowrap bg-signal px-2 py-[2px] text-paper">
            {t.lineage.playhead}
          </span>
        </div>
      </div>

      <style>{`
        .lineage-fill { clip-path: inset(0 calc(100% - var(--fill, 0%)) 0 0); }
        .lineage-panel h3, .lineage-panel p { transition: opacity .5s, transform .6s cubic-bezier(.16,1,.3,1); opacity: .35; }
        .lineage-panel[data-live="1"] h3, .lineage-panel[data-live="1"] p { opacity: 1; }
      `}</style>
    </section>
  );
}

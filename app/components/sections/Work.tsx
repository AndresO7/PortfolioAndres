"use client";

import dynamic from "next/dynamic";
import { useEffect, useRef, useState } from "react";
import { alsoBuilt, projects } from "../../lib/content";
import { gsap } from "../../lib/gsap";
import { useInView, usePinProgress } from "../../lib/hooks";
import { prefersReducedMotion, reel, scrollToSection } from "../../lib/reel";
import { Letters } from "../Letters";

const WorkCanvas = dynamic(() => import("../three/WorkCanvas"), { ssr: false });

const pad = (n: number) => String(n).padStart(2, "0");

/**
 * Scene 05 — selected work. The section pins; each sixth of the scroll hands
 * the stage to one project: a procedural 3D figure on the left, the case on
 * the right.
 */
export function Work() {
  const section = useRef<HTMLElement>(null);
  const info = useRef<HTMLDivElement>(null);
  const bar = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState(0);
  const activeRef = useRef(0);
  const inView = useInView(section, "0px");

  const progress = usePinProgress(section, (p) => {
    const i = Math.min(projects.length - 1, Math.floor(p * projects.length));
    if (bar.current) bar.current.style.transform = `scaleY(${p})`;
    if (i !== activeRef.current) {
      activeRef.current = i;
      setActive(i);
    }
  });

  useEffect(() => {
    if (prefersReducedMotion() || !info.current) return;
    const ctx = gsap.context(() => {
      gsap.fromTo(
        ".work-name .letter",
        { scaleY: 0, fontStretch: "125%" },
        { scaleY: 1, fontStretch: "62%", duration: 0.9, ease: "expo.out", stagger: 0.04, clearProps: "fontStretch" },
      );
      gsap.fromTo(
        ".work-line",
        { yPercent: 100, opacity: 0 },
        { yPercent: 0, opacity: 1, duration: 0.8, ease: "expo.out", stagger: 0.05, delay: 0.1 },
      );
    }, info);
    return () => ctx.revert();
  }, [active]);

  const jump = (i: number) => {
    const el = section.current;
    if (!el) return;
    const top = el.getBoundingClientRect().top + window.scrollY;
    const span = el.offsetHeight - window.innerHeight;
    const y = top + span * ((i + 0.5) / projects.length);
    if (reel.lenis) reel.lenis.scrollTo(y, { duration: 1.2 });
    else window.scrollTo({ top: y });
  };

  const p = projects[active];

  return (
    <>
      <section
        id="work"
        ref={section}
        data-scene="work"
        data-tone="dark"
        className="relative bg-ink"
        style={{ height: `${projects.length * 95 + 100}vh` }}
      >
        <div className="sticky top-0 grid h-[100svh] grid-rows-[44svh_1fr] overflow-hidden md:grid-cols-2 md:grid-rows-1">
          {/* stage */}
          <div className="relative overflow-hidden bg-ink text-paper">
            <WorkCanvas progress={progress} active={inView} />
            <div className="pointer-events-none absolute left-[46px] top-[88px] md:left-[64px] md:top-[100px]">
              <span className="mono block text-acid">Fig. {pad(active + 1)}</span>
              <span className="mono block opacity-70">{p.figure}</span>
            </div>
            <ol className="absolute bottom-[100px] left-[46px] hidden flex-col gap-1 md:left-[64px] md:flex" aria-label="Projects">
              {projects.map((proj, i) => (
                <li key={proj.id}>
                  <button
                    type="button"
                    onClick={() => jump(i)}
                    className={`mono flex items-center gap-3 transition-opacity ${i === active ? "opacity-100" : "opacity-40 hover:opacity-80"}`}
                    data-cursor="Cut to"
                  >
                    <span className={`inline-block h-[2px] transition-all duration-500 ${i === active ? "w-8 bg-acid" : "w-3 bg-paper"}`} />
                    {pad(i + 1)} {proj.name}
                  </button>
                </li>
              ))}
            </ol>
            <div className="absolute bottom-[92px] right-0 top-[92px] hidden w-[2px] bg-paper/15 md:block">
              <div ref={bar} className="h-full origin-top bg-acid" style={{ transform: "scaleY(0)" }} />
            </div>
          </div>

          {/* case */}
          <div ref={info} data-tone="light" className="shell relative flex flex-col overflow-hidden bg-paper pb-[96px] pt-4 text-ink md:pb-[104px] md:pt-[100px]">
            <div className="mono flex items-center justify-between">
              <span className="font-bold">Selected work</span>
              <span className="font-bold tabular-nums">
                {pad(active + 1)}/{pad(projects.length)}
              </span>
            </div>

            <div key={p.id} className="flex min-h-0 flex-1 flex-col">
              <h3 className="work-name display mt-3 shrink-0 text-[clamp(64px,10.5vw,176px)] leading-[0.8] md:mt-6">
                <Letters text={p.name} />
              </h3>
              <div className="shrink-0 overflow-hidden">
                <p className="work-line lede mt-3 max-w-[26ch] md:mt-5">{p.tagline}</p>
              </div>
              <div className="shrink-0 overflow-hidden">
                <p className="work-line mono mt-3 flex flex-wrap gap-x-4 gap-y-1 opacity-70 md:mt-4">
                  <span>{p.year}</span>
                  <span>{p.context}</span>
                  <span className="hidden sm:inline">{p.state}</span>
                </p>
              </div>

              <div className="mt-auto grid shrink-0 gap-x-8 gap-y-4 pt-4 md:grid-cols-2 md:pt-5">
                <div className="hidden overflow-hidden sm:block">
                  <div className="work-line">
                    <span className="mono block font-bold">Problem</span>
                    <p className="mt-1 text-[14px] leading-snug md:text-[15px]">{p.problem}</p>
                  </div>
                </div>
                <div className="hidden overflow-hidden md:block">
                  <div className="work-line">
                    <span className="mono block font-bold">Architecture</span>
                    <p className="mt-1 text-[15px] leading-snug">{p.architecture}</p>
                  </div>
                </div>
                <div className="hidden overflow-hidden sm:block">
                  <div className="work-line">
                    <span className="mono block font-bold">Result</span>
                    <p className="mt-1 text-[14px] leading-snug md:text-[15px]">{p.result}</p>
                  </div>
                </div>
                <div className="overflow-hidden">
                  <div className="work-line border-l-4 border-volt pl-3">
                    <span className="mono block font-bold text-volt">Learned</span>
                    <p className="display mt-1 text-[clamp(22px,2.2vw,34px)] leading-[0.95]">{p.learning}</p>
                  </div>
                </div>
              </div>

              <div className="shrink-0 overflow-hidden">
                <div className="work-line mt-4 flex flex-wrap items-center gap-2 md:mt-5">
                  {p.stack.slice(0, 5).map((s) => (
                    <span key={s} className="chip">
                      {s}
                    </span>
                  ))}
                  {p.link && (
                    <a href={p.link.href} target="_blank" rel="noopener" className="chip bg-ink text-paper hover:bg-volt" data-cursor="Repo ↗">
                      Repository ↗
                    </a>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section id="also" data-scene="work" data-tone="light" className="relative bg-paper pb-[14vh] pt-[12vh] text-ink">
        <div className="shell">
          <div className="flex flex-wrap items-end justify-between gap-6 border-b-2 border-ink pb-4">
            <h3 className="display text-[clamp(48px,8vw,140px)]">Also built</h3>
            <button type="button" className="mono font-bold underline-offset-4 hover:underline" onClick={() => scrollToSection("work")}>
              ↑ Back to the stage
            </button>
          </div>
          <ul>
            {alsoBuilt.map((a, i) => (
              <li
                key={a.name}
                className="group grid grid-cols-[40px_1fr] items-baseline gap-x-4 gap-y-1 border-b-2 border-ink py-5 transition-colors duration-300 hover:bg-ink hover:text-paper md:grid-cols-[60px_1.1fr_1.4fr_1fr] md:px-2"
              >
                <span className="mono opacity-60">{pad(i + 1)}</span>
                <span className="display text-[clamp(30px,3.6vw,58px)] leading-[0.9] transition-[font-stretch] duration-500 group-hover:[font-stretch:110%]">
                  {a.name}
                </span>
                <span className="col-start-2 text-[15px] leading-snug md:col-start-auto md:text-[17px]">{a.note}</span>
                <span className="mono col-start-2 opacity-60 group-hover:text-acid group-hover:opacity-100 md:col-start-auto md:text-right">
                  {a.stack}
                </span>
              </li>
            ))}
          </ul>
        </div>
      </section>
    </>
  );
}

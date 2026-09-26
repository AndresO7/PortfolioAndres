"use client";

import { useEffect, useRef, useState } from "react";
import { archive, experiments } from "../../lib/content";
import { gsap } from "../../lib/gsap";
import { useFitText } from "../../lib/hooks";
import { prefersReducedMotion } from "../../lib/reel";

/** Scene 08 — the lab notebook: question, hypothesis, result, and what it changed. */
export function Lab() {
  const section = useRef<HTMLElement>(null);
  const title = useRef<HTMLDivElement>(null);
  const [open, setOpen] = useState<string | null>(experiments[0].id);
  useFitText(title);

  useEffect(() => {
    if (prefersReducedMotion()) return;
    const ctx = gsap.context(() => {
      gsap.from(".lab-title", {
        yPercent: 100,
        duration: 1.1,
        ease: "expo.out",
        scrollTrigger: { trigger: ".lab-title", start: "top 90%" },
      });
      gsap.utils.toArray<HTMLElement>(".lab-row").forEach((row) => {
        gsap.from(row, {
          clipPath: "inset(0 100% 0 0)",
          duration: 1,
          ease: "expo.inOut",
          scrollTrigger: { trigger: row, start: "top 88%" },
        });
      });
    }, section);
    return () => ctx.revert();
  }, []);

  return (
    <section id="lab" ref={section} data-scene="lab" data-tone="light" className="relative bg-paper pb-[14vh] pt-[16vh] text-ink">
      <div className="shell">
        <div className="mono mb-6 flex items-center gap-4">
          <span className="bg-ink px-2 py-[2px] font-bold text-paper">08</span>
          <span className="font-bold">Lab</span>
          <span className="opacity-60">— Do you investigate?</span>
        </div>
        <div className="overflow-hidden">
          <div ref={title} className="lab-title display inline-block whitespace-nowrap leading-[0.8]">
            Experiments
          </div>
        </div>

        <ul className="mt-[8vh] border-b-2 border-ink">
          {experiments.map((e) => {
            const isOpen = open === e.id;
            return (
              <li key={e.id} className="lab-row border-t-2 border-ink">
                <button
                  type="button"
                  aria-expanded={isOpen}
                  onClick={() => setOpen(isOpen ? null : e.id)}
                  className={`grid w-full grid-cols-[1fr_auto] items-center gap-x-6 gap-y-2 py-5 text-left transition-colors duration-300 md:grid-cols-[120px_1fr_140px_130px_150px] md:px-2 ${
                    isOpen ? "bg-ink text-paper" : "hover:bg-ink hover:text-paper"
                  }`}
                  data-cursor={isOpen ? "Close" : "Open"}
                >
                  <span className="mono font-bold">{e.id}</span>
                  <span className="display col-span-2 row-start-2 text-[clamp(28px,3.3vw,54px)] leading-[0.9] md:col-span-1 md:row-start-auto">
                    {e.title}
                  </span>
                  <span className="mono hidden opacity-70 md:inline">{e.project}</span>
                  <span className="mono hidden opacity-70 md:inline">{e.date}</span>
                  <span className="row-start-1 flex justify-end md:row-start-auto">
                    <span
                      className={`mono inline-block -rotate-3 border-2 px-2 py-[2px] font-bold ${
                        e.status === "open" ? "border-signal text-signal" : isOpen ? "border-acid text-acid" : "border-current"
                      }`}
                    >
                      {e.status}
                    </span>
                  </span>
                </button>
                <div className={`grid transition-[grid-template-rows] duration-500 ease-[cubic-bezier(.16,1,.3,1)] ${isOpen ? "grid-rows-[1fr]" : "grid-rows-[0fr]"}`}>
                  <div className="overflow-hidden">
                    <div className="grid gap-6 pb-8 pt-6 md:grid-cols-3 md:gap-10 md:px-2">
                      {(
                        [
                          ["Question", e.question],
                          ["Hypothesis", e.hypothesis],
                          ["Result", e.result],
                        ] as const
                      ).map(([k, v], i) => (
                        <div key={k} className={i === 2 ? "border-l-4 border-volt pl-4" : ""}>
                          <span className={`mono block font-bold ${i === 2 ? "text-volt" : ""}`}>{k}</span>
                          <p className={`mt-2 leading-snug ${i === 0 ? "lede" : "text-[16px] md:text-[17px]"}`}>{v}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </li>
            );
          })}
        </ul>

        <div className="mt-[10vh] grid gap-8 md:grid-cols-12">
          <div className="md:col-span-4">
            <span className="mono font-bold">Archive</span>
            <p className="mt-2 max-w-[30ch] text-[16px] leading-snug opacity-70">Earlier investigations, as the earlier portfolio records them.</p>
          </div>
          <ul className="md:col-span-8">
            {archive.map((a) => (
              <li key={a.title} className="grid grid-cols-[90px_1fr] items-baseline gap-4 border-t-2 border-ink py-4 md:grid-cols-[130px_1fr_220px]">
                <span className="display text-[clamp(34px,3.4vw,56px)] leading-[0.85] text-volt">{a.year}</span>
                <span className="text-[17px] leading-snug md:text-[19px]">{a.title}</span>
                <span className="mono col-start-2 opacity-60 md:col-start-auto md:text-right">{a.kind}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}

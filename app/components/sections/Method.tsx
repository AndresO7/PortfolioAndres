"use client";

import { useEffect, useRef } from "react";
import { gsap, ScrollTrigger } from "../../lib/gsap";
import { useFitText } from "../../lib/hooks";
import { useT } from "../../lib/i18n";
import { prefersReducedMotion } from "../../lib/reel";
import { Letters } from "../Letters";

/**
 * Scene 06 — method. The title's letters ride a width wave through the
 * variable font as you scroll; each step is quoted from the document it
 * produced, with the other language's wording kept beside it.
 */
export function Method() {
  const section = useRef<HTMLElement>(null);
  const title = useRef<HTMLDivElement>(null);
  const ghost = useRef<HTMLSpanElement>(null);
  const t = useT();
  const m = t.method;
  useFitText(title, 0.94, ghost, undefined, m.title);

  useEffect(() => {
    if (prefersReducedMotion()) return;
    const ctx = gsap.context(() => {
      const letters = title.current?.querySelectorAll<HTMLElement>(".letter") ?? [];
      ScrollTrigger.create({
        trigger: title.current,
        start: "top bottom",
        end: "bottom top",
        onUpdate: (self) => {
          letters.forEach((l, i) => {
            // neighbours move in opposite phase, so the word keeps roughly the same width
            const w = 0.5 + 0.5 * Math.sin(self.progress * Math.PI * 4 + i * Math.PI);
            l.style.fontStretch = `${62 + w * 63}%`;
          });
        },
      });

      gsap.utils.toArray<HTMLElement>(".method-row").forEach((row) => {
        const tl = gsap.timeline({ scrollTrigger: { trigger: row, start: "top 82%" } });
        tl.from(row.querySelector(".method-rule"), { scaleX: 0, duration: 1.1, ease: "expo.inOut" })
          .from(row.querySelectorAll(".method-q .letter"), { yPercent: 105, duration: 0.8, ease: "expo.out", stagger: 0.015 }, 0.25)
          .from(row.querySelectorAll(".method-in"), { y: 40, opacity: 0, duration: 0.9, ease: "expo.out", stagger: 0.08 }, 0.35)
          .from(row.querySelector(".method-quote"), { clipPath: "inset(0 0 0 100%)", duration: 1, ease: "expo.inOut" }, 0.45);
      });
    }, section);
    return () => ctx.revert();
  }, [t]);

  return (
    <section id="method" ref={section} data-scene="method" data-tone="volt" className="relative bg-volt pb-[14vh] pt-[16vh] text-paper">
      <div className="shell">
        <div className="mono mb-6 flex items-center gap-4">
          <span className="bg-paper px-2 py-[2px] font-bold text-volt">06</span>
          <span className="font-bold">{m.kicker}</span>
          <span className="opacity-70">{m.question}</span>
        </div>

        {/* the top padding leaves room for accents (MÉTODO) inside the clipping box */}
        <div className="overflow-hidden">
          <div ref={title} className="display relative whitespace-nowrap pt-[0.16em] leading-[0.8]">
            <Letters text={m.title} />
            <span ref={ghost} className="invisible absolute left-0 top-0 [font-stretch:94%]" aria-hidden>
              {m.title}
            </span>
          </div>
        </div>

        <p className="lede mt-8 max-w-[40ch]">{m.lede}</p>

        <ol className="mt-[10vh]">
          {m.steps.map((s, i) => (
            <li key={i} className="method-row relative grid gap-6 pb-14 pt-6 md:grid-cols-12 md:gap-8">
              <span className="method-rule absolute inset-x-0 top-0 h-[2px] origin-left bg-paper" />
              <span className="mono font-bold md:col-span-1">{String(i + 1).padStart(2, "0")}</span>
              <h3 className="method-q display overflow-hidden pb-[0.08em] pt-[0.16em] text-[clamp(44px,5.6vw,96px)] leading-[0.86] md:col-span-5">
                <Letters text={s.question} />
              </h3>
              <div className="min-w-0 md:col-span-6">
                <p className="method-in display text-[clamp(24px,2.3vw,38px)] leading-[0.95] text-acid">{s.principle}</p>
                <p className="method-in mt-4 max-w-[58ch] text-[16px] leading-relaxed text-paper/85 md:text-[17px]">{s.body}</p>
                <blockquote className="method-quote mt-6 border-2 border-ink bg-ink p-5 text-paper md:p-6">
                  <p className="lede">“{s.quote}”</p>
                  <p className="mono mt-3 normal-case italic tracking-normal opacity-60">{s.aside}</p>
                  {s.code && (
                    <code className="mono mt-4 block overflow-x-auto whitespace-pre border-t-2 border-paper/15 pt-3 normal-case tracking-normal text-acid">
                      $ {s.code}
                    </code>
                  )}
                  <cite className="mono mt-4 block not-italic opacity-50">{s.source}</cite>
                </blockquote>
              </div>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}

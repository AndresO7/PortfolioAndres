"use client";

import { useEffect, useRef } from "react";
import { packet, practices } from "../../lib/content";
import { gsap } from "../../lib/gsap";
import { prefersReducedMotion } from "../../lib/reel";

/** Scene 10 — the harness: how agents are put to work, and the packet each one receives. */
export function Harness() {
  const section = useRef<HTMLElement>(null);
  const pre = useRef<HTMLPreElement>(null);

  useEffect(() => {
    if (prefersReducedMotion()) return;
    const ctx = gsap.context(() => {
      // type the packet out, line by line, when it scrolls in
      const el = pre.current;
      if (el) {
        const lines = packet.split("\n");
        const state = { n: 0 };
        el.textContent = "";
        gsap.to(state, {
          n: lines.length,
          duration: 1.6,
          ease: "steps(" + lines.length + ")",
          scrollTrigger: { trigger: el, start: "top 80%" },
          onUpdate: () => {
            el.textContent = lines.slice(0, Math.round(state.n)).join("\n");
          },
        });
      }
      gsap.from(".harness-card", {
        y: 60,
        opacity: 0,
        duration: 0.9,
        ease: "expo.out",
        stagger: 0.07,
        scrollTrigger: { trigger: ".harness-grid", start: "top 80%" },
      });
    }, section);
    return () => ctx.revert();
  }, []);

  return (
    <section id="harness" ref={section} data-scene="harness" data-tone="light" className="relative bg-paper pb-[14vh] pt-[16vh] text-ink">
      <div className="shell">
        <div className="mono mb-6 flex items-center gap-4">
          <span className="bg-ink px-2 py-[2px] font-bold text-paper">10</span>
          <span className="font-bold">Harness</span>
          <span className="opacity-60">— How do you work with AI tools?</span>
        </div>
        <h2 className="display text-[clamp(52px,9vw,160px)] leading-[0.8]">
          Agents need
          <br />
          <span className="outline" style={{ ["--stroke-color" as string]: "#0a0a0a", ["--stroke" as string]: "2px" }}>
            a harness
          </span>
        </h2>

        <div className="mt-[8vh] grid gap-8 md:grid-cols-12">
          <figure className="md:col-span-5">
            <div className="relative border-2 border-ink bg-ink p-4 text-paper md:p-6">
              <span className="crop tl" style={{ top: 8, left: 8 }} />
              <span className="crop br" style={{ bottom: 8, right: 8 }} />
              <pre
                ref={pre}
                className="overflow-x-auto font-mono leading-[1.45] text-acid"
                style={{ fontSize: "min(11.5px, 2.25vw)" }}
                aria-label="Task packet diagram"
              >
                {packet}
              </pre>
            </div>
            <figcaption className="mono mt-3 opacity-70">Task packet — drawn the way RFCs draw packet headers</figcaption>
            <p className="mt-6 max-w-[44ch] text-[16px] leading-relaxed md:text-[17px]">
              NOCLIP was built by five parallel workstreams — level generation, the camcorder post pipeline, audio,
              entities and UI — each against its own dev harness. Verifier passes flagged: log soft-lock · seed links ·
              Lessee ambient · pacing · line of sight.
            </p>
          </figure>

          <ol className="harness-grid grid gap-[2px] border-2 border-ink bg-ink sm:grid-cols-2 md:col-span-7">
            {practices.map((p, i) => (
              <li key={p.title} className="harness-card group bg-paper p-5 transition-colors duration-300 hover:bg-acid md:p-6">
                <span className="mono block opacity-60">{String(i + 1).padStart(2, "0")}</span>
                <h3 className="display mt-8 text-[clamp(28px,2.6vw,42px)] leading-[0.9] transition-[font-stretch] duration-500 group-hover:[font-stretch:100%]">
                  {p.title}
                </h3>
                <p className="mt-3 text-[15px] leading-snug">{p.body}</p>
              </li>
            ))}
          </ol>
        </div>
      </div>
    </section>
  );
}

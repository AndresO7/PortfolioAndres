"use client";

import dynamic from "next/dynamic";
import { useEffect, useRef } from "react";
import { identity } from "../../lib/content";
import { gsap, ScrollTrigger } from "../../lib/gsap";
import { useInView } from "../../lib/hooks";
import { useT } from "../../lib/i18n";
import { prefersReducedMotion } from "../../lib/reel";

const PhotoCanvas = dynamic(() => import("../three/PhotoCanvas"), { ssr: false });

/** Split the statement into words; [brackets] in the copy mark the ones set in acid. */
function parseStatement(statement: string) {
  let on = false;
  return statement.split(" ").map((raw) => {
    let word = raw;
    if (word.startsWith("[")) {
      on = true;
      word = word.slice(1);
    }
    const highlight = on;
    if (word.includes("]")) {
      on = false;
      word = word.replace("]", "");
    }
    return { word, highlight };
  });
}

/** Scene 04 — the person: a halftone portrait and the statement, read word by word. */
export function Profile() {
  const section = useRef<HTMLElement>(null);
  const figure = useRef<HTMLElement>(null);
  const statement = useRef<HTMLParagraphElement>(null);
  const reveal = useRef(0);
  const inView = useInView(figure, "150px");
  const t = useT();
  const s = t.profileSection;

  useEffect(() => {
    const ctx = gsap.context(() => {
      ScrollTrigger.create({
        trigger: figure.current,
        start: "top 95%",
        end: "center 45%",
        onUpdate: (self) => (reveal.current = self.progress),
        onRefresh: (self) => (reveal.current = self.progress),
      });
      if (prefersReducedMotion()) return;
      const words = statement.current?.querySelectorAll(".word") ?? [];
      gsap.fromTo(
        words,
        { opacity: 0.1 },
        {
          opacity: 1,
          ease: "none",
          stagger: 0.1,
          scrollTrigger: { trigger: statement.current, start: "top 80%", end: "bottom 45%", scrub: true },
        },
      );
      gsap.from(".spec-row", {
        clipPath: "inset(0 100% 0 0)",
        duration: 0.9,
        ease: "expo.out",
        stagger: 0.07,
        scrollTrigger: { trigger: ".spec-table", start: "top 85%" },
      });
    }, section);
    return () => ctx.revert();
    // the statement is re-split per language, so its tweens are rebuilt too
  }, [t]);

  const words = parseStatement(t.profile.statement);

  return (
    <section
      id="profile"
      ref={section}
      data-scene="profile"
      data-tone="dark"
      className="relative bg-ink pb-[16vh] pt-[18vh] text-paper"
    >
      <div className="shell grid gap-12 md:grid-cols-12 md:gap-8">
        <div className="md:col-span-5">
          <div className="md:sticky md:top-[14vh]">
            <figure ref={figure} className="relative">
              <div className="relative aspect-[547/678] w-full overflow-hidden border-2 border-paper bg-ink" data-cursor={s.cursor}>
                <PhotoCanvas reveal={reveal} active={inView} />
                <span className="mono pointer-events-none absolute left-3 top-3 bg-ink px-2 py-[2px] text-acid">Fig. A</span>
                <span className="mono pointer-events-none absolute bottom-3 right-3 bg-ink px-2 py-[2px]">547 × 678</span>
              </div>
              <figcaption className="mono mt-3 flex justify-between gap-4 opacity-70">
                <span>{s.caption}</span>
                <span className="hidden text-right md:inline">{s.hover}</span>
              </figcaption>
            </figure>
          </div>
        </div>

        <div className="md:col-span-7 md:pl-[3vw]">
          <div className="mono mb-8 flex items-center gap-4">
            <span className="bg-acid px-2 py-[2px] font-bold text-ink">04</span>
            <span className="font-bold">{s.kicker}</span>
            <span className="opacity-50">{s.question}</span>
          </div>

          <p ref={statement} className="display text-[clamp(38px,5.3vw,92px)] leading-[0.9]">
            {words.map(({ word, highlight }, i) => (
              <span key={i} className={`word inline-block pr-[0.22em] ${highlight ? "text-acid" : ""}`}>
                {word}
              </span>
            ))}
          </p>

          <dl className="spec-table mono-lg mt-16 border-b-2 border-paper/25">
            {[
              [s.role, t.profile.role],
              [s.focus, t.profile.focus],
              [s.base, `${t.profile.base} — ${identity.timezone}`],
              [s.languages, t.profile.languages],
            ].map(([k, v]) => (
              <div key={k} className="spec-row grid grid-cols-[120px_1fr] gap-4 border-t-2 border-paper/25 py-4 md:grid-cols-[180px_1fr]">
                <dt className="opacity-50">{k}</dt>
                <dd className="font-bold">{v}</dd>
              </div>
            ))}
            <div className="spec-row grid grid-cols-[120px_1fr] gap-4 border-t-2 border-paper/25 py-4 md:grid-cols-[180px_1fr]">
              <dt className="opacity-50">GitHub</dt>
              <dd>
                <a href={identity.github} target="_blank" rel="me noopener" className="font-bold text-acid underline-offset-4 hover:underline">
                  @{identity.githubHandle} ↗
                </a>
              </dd>
            </div>
          </dl>

          <ul className="mt-10 grid gap-3 sm:grid-cols-3">
            {t.credentials.map((c, i) => (
              <li key={c.label} className="relative border-2 border-paper p-4 transition-colors duration-300 hover:bg-acid hover:text-ink">
                <span className="mono block opacity-60">
                  {String(i + 1).padStart(2, "0")} · {c.kind}
                </span>
                <span className="display mt-6 block text-[26px] leading-[0.95]">{c.label}</span>
                <span className="mono mt-3 block opacity-60">{c.note}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}

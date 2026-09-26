"use client";

import dynamic from "next/dynamic";
import { useEffect, useRef } from "react";
import { credentials, profile } from "../../lib/content";
import { gsap, ScrollTrigger } from "../../lib/gsap";
import { useInView } from "../../lib/hooks";
import { prefersReducedMotion } from "../../lib/reel";

const PhotoCanvas = dynamic(() => import("../three/PhotoCanvas"), { ssr: false });

const HIGHLIGHT = new Set(["software", "architecture,", "cloud", "infrastructure", "artificial", "intelligence"]);

/** Scene 04 — the person: a halftone portrait and the statement, read word by word. */
export function Profile() {
  const section = useRef<HTMLElement>(null);
  const figure = useRef<HTMLElement>(null);
  const statement = useRef<HTMLParagraphElement>(null);
  const reveal = useRef(0);
  const inView = useInView(figure, "150px");

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
  }, []);

  const words = profile.statement.split(" ");

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
              <div className="relative aspect-[547/678] w-full overflow-hidden border-2 border-paper bg-ink" data-cursor="Look">
                <PhotoCanvas reveal={reveal} active={inView} />
                <span className="mono pointer-events-none absolute left-3 top-3 bg-ink px-2 py-[2px] text-acid">Fig. A</span>
                <span className="mono pointer-events-none absolute bottom-3 right-3 bg-ink px-2 py-[2px]">547 × 678</span>
              </div>
              <figcaption className="mono mt-3 flex justify-between gap-4 opacity-70">
                <span>The engineer, under red light</span>
                <span className="hidden text-right md:inline">Hover — see through the halftone</span>
              </figcaption>
            </figure>
          </div>
        </div>

        <div className="md:col-span-7 md:pl-[3vw]">
          <div className="mono mb-8 flex items-center gap-4">
            <span className="bg-acid px-2 py-[2px] font-bold text-ink">04</span>
            <span className="font-bold">Profile</span>
            <span className="opacity-50">— Who is this?</span>
          </div>

          <p ref={statement} className="display text-[clamp(38px,5.3vw,92px)] leading-[0.9]">
            {words.map((w, i) => (
              <span key={i} className={`word inline-block pr-[0.22em] ${HIGHLIGHT.has(w) ? "text-acid" : ""}`}>
                {w}
              </span>
            ))}
          </p>

          <dl className="spec-table mono-lg mt-16 border-b-2 border-paper/25">
            {[
              ["Role", profile.role],
              ["Focus", profile.focus],
              ["Base", `${profile.base} — ${profile.timezone}`],
              ["Languages", profile.languages],
            ].map(([k, v]) => (
              <div key={k} className="spec-row grid grid-cols-[120px_1fr] gap-4 border-t-2 border-paper/25 py-4 md:grid-cols-[180px_1fr]">
                <dt className="opacity-50">{k}</dt>
                <dd className="font-bold">{v}</dd>
              </div>
            ))}
            <div className="spec-row grid grid-cols-[120px_1fr] gap-4 border-t-2 border-paper/25 py-4 md:grid-cols-[180px_1fr]">
              <dt className="opacity-50">GitHub</dt>
              <dd>
                <a href={profile.github} target="_blank" rel="me noopener" className="font-bold text-acid underline-offset-4 hover:underline">
                  @{profile.githubHandle} ↗
                </a>
              </dd>
            </div>
          </dl>

          <ul className="mt-10 grid gap-3 sm:grid-cols-3" aria-label="Credentials">
            {credentials.map((c, i) => (
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

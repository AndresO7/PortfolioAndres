"use client";

import { Fragment, useEffect, useRef, useState } from "react";
import { credentials, offers, profile } from "../../lib/content";
import { gsap } from "../../lib/gsap";
import { useFitText } from "../../lib/hooks";
import { prefersReducedMotion, scrollToSection } from "../../lib/reel";
import { Letters } from "../Letters";

const subject = encodeURIComponent("A system worth investigating");
const QUESTION = ["Have", "a system", "worth", "investigating?"];

const credits = [
  ["Directed & engineered by", profile.name],
  ["Role", profile.role],
  ["Based in", `${profile.base} · ${profile.timezone}`],
  ["Languages", profile.languages],
  ...credentials.map((c) => [c.kind, c.label] as const),
  ["Built with", "Next.js · Three.js · React Three Fiber · GSAP · Lenis"],
  ["Set in", "Archivo 62–125% · JetBrains Mono"],
  ["Shot at", "128 BPM · 60 FPS"],
] as const;

function CopyEmail() {
  const [copied, setCopied] = useState(false);
  return (
    <button
      type="button"
      className="chip h-[44px] gap-3 px-4 transition-colors hover:bg-ink hover:text-acid"
      onClick={() => {
        navigator.clipboard?.writeText(profile.email).then(() => {
          setCopied(true);
          window.setTimeout(() => setCopied(false), 1600);
        });
      }}
      data-cursor={copied ? "Copied" : "Copy"}
    >
      <span className="normal-case tracking-[0.04em]">{profile.email}</span>
      <span className="font-bold">{copied ? "Copied ✓" : "Copy"}</span>
    </button>
  );
}

/** Scene 11 — the handshake, then the end credits. */
export function Handshake() {
  const section = useRef<HTMLElement>(null);
  const fin = useRef<HTMLDivElement>(null);
  useFitText(fin);

  useEffect(() => {
    if (prefersReducedMotion()) return;
    const ctx = gsap.context(() => {
      gsap.from(".hs-q .letter", {
        yPercent: 110,
        duration: 1,
        ease: "expo.out",
        stagger: 0.018,
        scrollTrigger: { trigger: ".hs-q", start: "top 80%" },
      });
      gsap.from(".hs-offer", {
        y: 50,
        opacity: 0,
        duration: 0.9,
        ease: "expo.out",
        stagger: 0.08,
        scrollTrigger: { trigger: ".hs-offers", start: "top 85%" },
      });
      gsap.utils.toArray<HTMLElement>(".credit").forEach((row) => {
        gsap.from(row, { y: 30, opacity: 0, duration: 0.8, ease: "expo.out", scrollTrigger: { trigger: row, start: "top 92%" } });
      });
      gsap.fromTo(
        ".fin-fill",
        { clipPath: "inset(100% 0 0 0)" },
        { clipPath: "inset(0% 0 0 0)", ease: "none", scrollTrigger: { trigger: fin.current, start: "top 95%", end: "bottom 70%", scrub: true } },
      );
    }, section);
    return () => ctx.revert();
  }, []);

  return (
    <section id="handshake" ref={section} data-scene="handshake" className="relative">
      <div data-tone="light" className="hs-light relative bg-acid pb-[12vh] pt-[16vh] text-ink">
        <div className="shell">
          <div className="mono mb-6 flex items-center gap-4">
            <span className="bg-ink px-2 py-[2px] font-bold text-acid">11</span>
            <span className="font-bold">Handshake</span>
            <span className="opacity-70">— What could you do for your team?</span>
          </div>

          <h2 className="hs-q display text-[clamp(56px,11.5vw,210px)] leading-[0.8]">
            {QUESTION.map((w, i) => (
              <Fragment key={w}>
                <span className={`inline-block overflow-hidden pb-[0.04em] align-top ${i === 3 ? "text-paper [-webkit-text-stroke:2px_#0a0a0a]" : ""}`}>
                  <span className="inline-block transition-[font-stretch] duration-500 hover:[font-stretch:125%]">
                    <Letters text={w} />
                  </span>
                </span>
                {i < QUESTION.length - 1 ? " " : null}
              </Fragment>
            ))}
          </h2>

          <p className="lede mt-10 max-w-[44ch]">
            I’m looking for teams building AI systems that have to work in production — where architecture, cloud and AI
            can’t be pulled apart. Based in Quito ({profile.timezone}), working in Spanish or English.
          </p>

          <a
            href={`mailto:${profile.email}?subject=${subject}`}
            className="group relative mt-12 flex items-center justify-between gap-6 overflow-hidden border-2 border-ink bg-ink px-5 py-6 text-paper md:px-8 md:py-8"
            data-cursor="Write ↗"
          >
            <span className="absolute inset-0 origin-bottom scale-y-0 bg-paper transition-transform duration-500 ease-[cubic-bezier(.77,0,.18,1)] group-hover:scale-y-100" />
            <span className="display relative text-[clamp(34px,6vw,108px)] leading-[0.85] transition-[font-stretch,color] duration-500 group-hover:text-ink group-hover:[font-stretch:110%]">
              Start a conversation
            </span>
            <span className="display relative text-[clamp(34px,6vw,108px)] leading-[0.85] text-acid transition-transform duration-500 group-hover:translate-x-2 group-hover:-rotate-45 group-hover:text-volt">
              →
            </span>
          </a>

          <div className="mt-4 flex flex-wrap gap-3">
            <CopyEmail />
            <a href={profile.github} target="_blank" rel="me noopener" className="chip h-[44px] px-4 transition-colors hover:bg-ink hover:text-acid">
              GitHub · {profile.githubHandle} ↗
            </a>
          </div>

          <ol className="hs-offers mt-[10vh] grid gap-8 md:grid-cols-4 md:gap-6">
            {offers.map((o, i) => (
              <li key={o.title} className="hs-offer border-t-2 border-ink pt-4">
                <span className="mono block font-bold">{String(i + 1).padStart(2, "0")}</span>
                <h3 className="display mt-5 text-[clamp(26px,2.3vw,38px)] leading-[0.9]">{o.title}</h3>
                <p className="mt-3 text-[15px] leading-snug">{o.body}</p>
              </li>
            ))}
          </ol>
        </div>
      </div>

      <footer data-tone="dark" className="relative bg-ink pb-[120px] pt-[14vh] text-paper">
        <div className="shell">
          <p className="mono mb-10 text-center font-bold text-acid">End credits</p>
          <dl className="mx-auto max-w-[900px]">
            {credits.map(([k, v], i) => (
              <div key={i} className="credit grid grid-cols-2 items-baseline gap-6 py-2">
                <dt className="mono text-right opacity-55">{k}</dt>
                <dd className="display text-[clamp(22px,2.4vw,40px)] leading-[0.95]">{v}</dd>
              </div>
            ))}
          </dl>

          <div className="relative mt-[14vh] overflow-hidden">
            <div ref={fin} className="display relative inline-block whitespace-nowrap leading-[0.78]">
              <span className="outline block" style={{ ["--stroke-color" as string]: "#39ff14", ["--stroke" as string]: "2px" }}>
                Fin.
              </span>
              <span className="fin-fill absolute inset-0 block text-acid" aria-hidden>
                Fin.
              </span>
            </div>
          </div>

          <div className="mono mt-8 flex flex-wrap items-center justify-between gap-4 border-t-2 border-paper/25 pt-5">
            <span>© {new Date().getFullYear()} {profile.name}</span>
            <span className="opacity-60">End of reel — thanks for watching</span>
            <button type="button" className="font-bold hover:text-acid" onClick={() => scrollToSection("title")} data-cursor="Rewind">
              ↑ Rewind to 00:00
            </button>
          </div>
        </div>
      </footer>
    </section>
  );
}

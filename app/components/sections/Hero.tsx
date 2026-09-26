"use client";

import dynamic from "next/dynamic";
import { useEffect, useRef } from "react";
import { gsap } from "../../lib/gsap";
import { useFitText, useInView, usePinProgress } from "../../lib/hooks";
import { profile } from "../../lib/content";
import { prefersReducedMotion, reel, when } from "../../lib/reel";
import { Letters } from "../Letters";

const HeroCanvas = dynamic(() => import("../three/HeroCanvas"), { ssr: false });

/** Scene 01 — the name as a poster, with the statue standing in front of it. */
export function Hero() {
  const section = useRef<HTMLElement>(null);
  const rowA = useRef<HTMLDivElement>(null);
  const rowB = useRef<HTMLDivElement>(null);
  const ghostA = useRef<HTMLSpanElement>(null);
  const ghostB = useRef<HTMLSpanElement>(null);
  const meta = useRef<HTMLDivElement>(null);
  const progress = usePinProgress(section);
  const inView = useInView(section, "0px");

  // Both rows fill the width, but never so tall that they collide around the statue.
  const maxRow = () => (window.innerHeight - 200 - window.innerHeight * 0.14) / 1.6;
  useFitText(rowA, 1, ghostA, maxRow);
  useFitText(rowB, 1, ghostB, maxRow);

  // Intro: letters arrive flat and wide, then snap tall and condensed.
  useEffect(() => {
    const rows = [rowA.current, rowB.current];
    const letters = rows.map((r) => r?.querySelectorAll<HTMLElement>(".letter") ?? []);
    const metaLines = meta.current?.querySelectorAll(":scope > div > div") ?? [];
    if (prefersReducedMotion()) return;
    gsap.set([...letters[0], ...letters[1]], { scaleY: 0, fontStretch: "125%" });
    gsap.set(metaLines, { yPercent: 110 });
    return when("start", () => {
      const tl = gsap.timeline({ delay: 0.25 });
      tl.to(letters[0], { scaleY: 1, fontStretch: "62%", duration: 1.25, ease: "expo.out", stagger: 0.055 })
        .to(letters[1], { scaleY: 1, fontStretch: "62%", duration: 1.25, ease: "expo.out", stagger: 0.055 }, 0.18)
        .to(metaLines, { yPercent: 0, duration: 0.9, ease: "expo.out", stagger: 0.04 }, 0.7)
        .add(() => gsap.set([...letters[0], ...letters[1]], { clearProps: "fontStretch" }));
    });
  }, []);

  // Scroll: rows pull apart and widen, skewing with scroll velocity.
  useEffect(() => {
    if (!inView) return;
    let raf = 0;
    let skew = 0;
    const loop = () => {
      const p = progress.current;
      skew += (reel.velocity * -0.25 - skew) * 0.12;
      const s = Math.max(-12, Math.min(12, skew));
      const stretch = 62 + p * 63;
      if (rowA.current) {
        rowA.current.style.transform = `translate3d(${-p * 42}vw, ${-p * 6}vh, 0) skewX(${s}deg)`;
        rowA.current.style.fontStretch = `${stretch}%`;
      }
      if (rowB.current) {
        rowB.current.style.transform = `translate3d(${p * 42}vw, ${p * 6}vh, 0) skewX(${s}deg)`;
        rowB.current.style.fontStretch = `${stretch}%`;
      }
      if (meta.current) meta.current.style.opacity = String(1 - Math.min(1, p * 2.2));
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, [inView, progress]);

  return (
    <section id="title" ref={section} data-scene="title" data-tone="dark" className="relative h-[240vh] bg-ink">
      <div className="sticky top-0 h-[100svh] overflow-hidden">
        <h1 className="sr-only">
          {profile.name} — {profile.role}. {profile.focus}.
        </h1>

        <div className="shell absolute inset-x-0 top-[max(96px,11vh)]" aria-hidden>
          <div ref={rowA} className="display relative origin-left whitespace-nowrap text-paper will-change-transform">
            <Letters text={profile.first} />
            <span ref={ghostA} className="invisible absolute left-0 top-0 [font-stretch:62%]">
              {profile.first}
            </span>
          </div>
        </div>

        <div className="shell absolute inset-x-0 bottom-[max(100px,11vh)]" aria-hidden>
          <div ref={rowB} className="display relative origin-right whitespace-nowrap text-right text-paper will-change-transform">
            <Letters text={profile.last} />
            <span ref={ghostB} className="invisible absolute right-0 top-0 [font-stretch:62%]">
              {profile.last}
            </span>
          </div>
        </div>

        <div className="absolute inset-0">
          <HeroCanvas progress={progress} active={inView} />
        </div>

        <div
          ref={meta}
          className="mono pointer-events-none absolute inset-x-0 top-1/2 hidden -translate-y-1/2 items-start justify-between px-[46px] md:flex md:px-[64px]"
        >
          <div className="overflow-hidden">
            <div className="flex flex-col gap-1">
              <span className="font-bold text-acid">{profile.role}</span>
              <span className="max-w-[18ch] opacity-70 md:max-w-none">{profile.focus}</span>
            </div>
          </div>
          <div className="overflow-hidden text-right">
            <div className="flex flex-col gap-1">
              <span className="font-bold">{profile.base}</span>
              <span className="opacity-70">
                {profile.timezone} · ES / EN
              </span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

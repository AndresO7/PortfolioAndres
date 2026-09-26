"use client";

import { useEffect, useRef, useState } from "react";
import { contextSteps, contextTask, WINDOW } from "../../lib/content";
import { useInView, usePinProgress } from "../../lib/hooks";
import { easeOutExpo, range } from "../../lib/reel";

/** The bar track represents this many tokens, so the 200k window sits short of the edge. */
const TRACK = 225_000;

const cumulative = (key: "direct" | "firewall") => {
  const out: number[] = [];
  contextSteps.reduce((sum, s) => {
    out.push(sum);
    return sum + s[key];
  }, 0);
  return out;
};
const startsDirect = cumulative("direct");
const startsFirewall = cumulative("firewall");
const fmt = (n: number) => Math.round(n).toLocaleString("en-US");

/**
 * Scene 07 — context. One agent task run twice as you scroll: tools wired
 * straight into the harness, and the same task through Quipu's projected
 * surface. The first overflows its window; the second barely dents it.
 */
export function Context() {
  const section = useRef<HTMLElement>(null);
  const segD = useRef<HTMLDivElement[]>([]);
  const segF = useRef<HTMLDivElement[]>([]);
  const overflow = useRef<HTMLDivElement>(null);
  const countD = useRef<HTMLSpanElement>(null);
  const countF = useRef<HTMLSpanElement>(null);
  const alarm = useRef<HTMLSpanElement>(null);
  const [step, setStep] = useState(0);
  const stepRef = useRef(0);
  const inView = useInView(section, "100px");

  const progress = usePinProgress(section, (p) => {
    const s = Math.min(contextSteps.length - 1, Math.floor(p * contextSteps.length));
    if (s !== stepRef.current) {
      stepRef.current = s;
      setStep(s);
    }
  });

  useEffect(() => {
    if (!inView) return;
    let raf = 0;
    const loop = () => {
      const x = progress.current * contextSteps.length;
      let direct = 0;
      let firewall = 0;
      contextSteps.forEach((s, i) => {
        const f = easeOutExpo(range(x - i, 0.05, 0.6));
        direct += s.direct * f;
        firewall += s.firewall * f;
        const d = segD.current[i];
        const w = segF.current[i];
        if (d) {
          d.style.left = `${(startsDirect[i] / TRACK) * 100}%`;
          d.style.width = `${((s.direct * f) / TRACK) * 100}%`;
        }
        if (w) {
          w.style.left = `${(startsFirewall[i] / TRACK) * 100}%`;
          w.style.width = `${((s.firewall * f) / TRACK) * 100}%`;
        }
      });
      if (countD.current) countD.current.textContent = fmt(direct);
      if (countF.current) countF.current.textContent = fmt(firewall);
      const over = Math.max(0, direct - WINDOW);
      if (overflow.current) overflow.current.style.width = `${(over / TRACK) * 100}%`;
      if (alarm.current) alarm.current.dataset.on = over > 0 ? "1" : "0";
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, [inView, progress]);

  const windowAt = `${(WINDOW / TRACK) * 100}%`;
  const current = contextSteps[step];

  return (
    <section
      id="context"
      ref={section}
      data-scene="context"
      data-tone="dark"
      className="relative bg-ink text-paper"
      style={{ height: `${contextSteps.length * 45 + 100}vh` }}
    >
      <div className="shell sticky top-0 flex h-[100svh] flex-col pb-[104px] pt-[96px] md:pb-[112px] md:pt-[100px]">
        <div className="mono flex items-start justify-between gap-6">
          <div className="flex items-center gap-4">
            <span className="bg-acid px-2 py-[2px] font-bold text-ink">07</span>
            <span className="font-bold">Context</span>
            <span className="hidden opacity-60 sm:inline">— Do you understand AI beyond an API call?</span>
          </div>
          <span className="hidden font-bold md:inline">Window · {fmt(WINDOW)} tokens</span>
        </div>

        <h2 className="display mt-5 text-[clamp(44px,7.4vw,128px)] leading-[0.82]">
          Context is <span className="text-acid">the resource</span>
        </h2>
        <p className="lede mt-4 max-w-[46ch] text-paper/80">
          <span className="mono mr-3 align-middle text-acid">Task</span>“{contextTask}”
        </p>

        <div className="relative mt-auto">
          {[
            { key: "d", label: "Direct — 12 MCP servers, 96 tools, 6 skills", count: countD, segs: segD, tone: "direct" },
            { key: "f", label: "Through Quipu — the surface this identity may see", count: countF, segs: segF, tone: "firewall" },
          ].map((row) => (
            <div key={row.key} className="mb-6 last:mb-0">
              <div className="mb-2 flex items-end justify-between gap-4">
                <span className="mono max-w-[60%] opacity-80">{row.label}</span>
                <span className="display text-[clamp(30px,3.6vw,60px)] leading-[0.85] tabular-nums">
                  <span ref={row.count}>0</span>
                  <span className="mono ml-2 align-top opacity-60">tok</span>
                </span>
              </div>
              <div className="relative h-[clamp(34px,6vh,64px)] overflow-hidden border-2 border-paper/40">
                {contextSteps.map((s, i) => (
                  <div
                    key={i}
                    ref={(el) => {
                      if (el) row.segs.current[i] = el;
                    }}
                    className={`ctx-seg absolute inset-y-0 border-r-2 border-ink ${
                      row.tone === "direct" ? (i === 0 ? "ctx-hatch" : i === 3 || i === 5 ? "bg-signal" : "bg-paper") : i === 0 ? "ctx-hatch-acid" : "bg-acid"
                    }`}
                    style={{ width: 0 }}
                  />
                ))}
                {row.tone === "direct" && (
                  <div ref={overflow} className="ctx-over absolute inset-y-0" style={{ left: windowAt, width: 0 }} />
                )}
                <div className="absolute inset-y-0 z-10 w-[2px] bg-paper" style={{ left: windowAt }}>
                  <span className="mono absolute left-2 top-1/2 -translate-y-1/2 whitespace-nowrap text-[9px] opacity-80">200K</span>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-8 grid gap-4 md:grid-cols-12 md:gap-8">
          <ol className="mono flex flex-wrap gap-1 md:col-span-7" aria-label="Agent loop">
            {contextSteps.map((s, i) => (
              <li
                key={i}
                className={`border-[1.5px] px-2 py-1 transition-colors duration-300 ${
                  i === step ? "border-acid bg-acid text-ink" : i < step ? "border-paper/50 text-paper/70" : "border-paper/20 text-paper/35"
                }`}
              >
                {String(i + 1).padStart(2, "0")} {s.title}
              </li>
            ))}
          </ol>
          <div className="md:col-span-5">
            <span ref={alarm} className="ctx-alarm mono mb-2 inline-block bg-signal px-2 py-[2px] font-bold text-paper" data-on="0">
              Overflow — the harness compacts
            </span>
            <p key={step} className="ctx-note text-[15px] leading-snug text-paper/85 md:text-[16px]">
              {current.note}
            </p>
          </div>
        </div>
      </div>

      <style>{`
        .ctx-hatch { background: repeating-linear-gradient(-45deg, #efebe3 0 3px, transparent 3px 8px); }
        .ctx-hatch-acid { background: repeating-linear-gradient(-45deg, #39ff14 0 3px, transparent 3px 8px); }
        .ctx-over { background: repeating-linear-gradient(45deg, #ff3b1f 0 6px, #0a0a0a 6px 12px); z-index: 5; }
        .ctx-alarm { opacity: 0; transition: opacity .2s; }
        .ctx-alarm[data-on="1"] { opacity: 1; animation: blink .47s steps(1) infinite; }
        .ctx-note { animation: record-in .6s cubic-bezier(.16,1,.3,1) both; }
        @keyframes record-in { from { clip-path: inset(0 0 100% 0); transform: translateY(16px); } to { clip-path: inset(0 0 0 0); transform: none; } }
      `}</style>
    </section>
  );
}

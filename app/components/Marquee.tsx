"use client";

interface MarqueeProps {
  items: string[];
  direction?: "left" | "right";
}

export const Marquee = ({ items, direction = "left" }: MarqueeProps) => (
  <div className="relative flex overflow-x-hidden border-y border-[#39ff14]/20 py-24 bg-[#39ff14]/5 backdrop-blur-sm">
    <div
      className={`flex whitespace-nowrap ${
        direction === "left" ? "animate-marquee" : "animate-marquee-reverse"
      }`}
    >
      {[...items, ...items].map((item, i) => (
        <span
          key={i}
          className="mx-16 text-8xl md:text-[11vw] font-black uppercase tracking-tighter text-white transition-all duration-700 hover:text-[#39ff14] inline-block cursor-default"
        >
          {item}
        </span>
      ))}
    </div>
    <style dangerouslySetInnerHTML={{ __html: `
      @keyframes marquee { 0% { transform: translateX(0%); } 100% { transform: translateX(-50%); } }
      @keyframes marquee-reverse { 0% { transform: translateX(-50%); } 100% { transform: translateX(0%); } }
      .animate-marquee { animation: marquee 35s linear infinite; }
      .animate-marquee-reverse { animation: marquee-reverse 35s linear infinite; }
    `}} />
  </div>
);

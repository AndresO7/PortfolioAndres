"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";

interface ProfessionalLoaderProps {
  onComplete: () => void;
}

export const ProfessionalLoader = ({ onComplete }: ProfessionalLoaderProps) => {
  const [progress, setProgress] = useState(0);
  const [isUnlocked, setIsUnlocked] = useState(false);

  useEffect(() => {
    const timer = setInterval(() => {
      setProgress((p) => {
        if (p >= 100) {
          clearInterval(timer);
          setTimeout(() => setIsUnlocked(true), 500);
          setTimeout(onComplete, 1800);
          return 100;
        }
        return p + 1;
      });
    }, 25);
    return () => clearInterval(timer);
  }, [onComplete]);

  return (
    <div className="fixed inset-0 z-[100] flex overflow-hidden bg-black">
      {/* Panel Izquierdo de la Bóveda */}
      <motion.div
        initial={{ x: 0 }}
        animate={isUnlocked ? { x: "-100%" } : { x: 0 }}
        transition={{ duration: 1.4, ease: [0.87, 0, 0.13, 1] }}
        className="absolute inset-y-0 left-0 w-1/2 bg-[#080808] border-r border-white/5 z-[110] flex items-center justify-end overflow-hidden"
      >
        <motion.h2
          className="text-[20vw] font-black tracking-tighter text-white translate-x-1/2 select-none opacity-5 italic uppercase"
          animate={
            isUnlocked
              ? { opacity: 0, x: "-20%" }
              : { opacity: 0.05, x: "50%" }
          }
        >
          SYSTEM
        </motion.h2>
        <div className="absolute right-4 inset-y-0 flex flex-col justify-between py-20 opacity-20">
          {[...Array(10)].map((_, i) => (
            <div key={i} className="w-4 h-[1px] bg-red-600" />
          ))}
        </div>
      </motion.div>

      {/* Panel Derecho de la Bóveda */}
      <motion.div
        initial={{ x: 0 }}
        animate={isUnlocked ? { x: "100%" } : { x: 0 }}
        transition={{ duration: 1.4, ease: [0.87, 0, 0.13, 1] }}
        className="absolute inset-y-0 right-0 w-1/2 bg-[#080808] border-l border-white/5 z-[110] flex items-center justify-start overflow-hidden"
      >
        <motion.h2
          className="text-[20vw] font-black tracking-tighter text-white -translate-x-1/2 select-none opacity-5 italic uppercase"
          animate={
            isUnlocked
              ? { opacity: 0, x: "20%" }
              : { opacity: 0.05, x: "-50%" }
          }
        >
          ACCESS
        </motion.h2>
        <div className="absolute left-4 inset-y-0 flex flex-col justify-between py-20 opacity-20">
          {[...Array(10)].map((_, i) => (
            <div key={i} className="w-4 h-[1px] bg-red-600" />
          ))}
        </div>
      </motion.div>

      {/* Capa de Interfaz Central */}
      <div className="absolute inset-0 z-[120] flex flex-col items-center justify-center pointer-events-none">
        <motion.div
          animate={
            isUnlocked
              ? { opacity: 0, scale: 1.5, filter: "blur(40px)" }
              : { opacity: 1 }
          }
          transition={{ duration: 1, ease: "easeIn" }}
          className="flex flex-col items-center"
        >
          {/* Mecanismo de Bloqueo Circular */}
          <div className="relative w-64 h-64 flex items-center justify-center">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
              className="absolute inset-0 border-2 border-dashed border-red-900/30 rounded-full"
            />
            <svg className="w-full h-full -rotate-90 scale-110">
              <circle
                cx="128"
                cy="128"
                r="110"
                className="stroke-red-900/10 fill-none"
                strokeWidth="1"
              />
              <motion.circle
                cx="128"
                cy="128"
                r="110"
                className="stroke-red-600 fill-none"
                strokeWidth="2"
                strokeDasharray="691"
                initial={{ strokeDashoffset: 691 }}
                animate={{ strokeDashoffset: 691 - (691 * progress) / 100 }}
                style={{ filter: "drop-shadow(0 0 12px rgba(220, 38, 38, 0.4))" }}
              />
            </svg>
            <div className="absolute flex flex-col items-center">
              <motion.span className="text-6xl font-black font-mono leading-none tracking-tighter text-white">
                {progress}%
              </motion.span>
              <div className="h-[1px] w-12 bg-red-600 my-4 shadow-[0_0_10px_#dc2626]" />
              <span className="text-[10px] uppercase tracking-[0.5em] text-red-600 font-black">
                {progress < 100 ? "Authenticating" : "Verified"}
              </span>
            </div>
          </div>
          <div className="mt-20 space-y-4 text-center">
            <p className="text-[10px] uppercase tracking-[0.8em] text-white/20 font-bold">
              Initializing Architecture
            </p>
            <div className="flex gap-2 justify-center">
              {[...Array(4)].map((_, i) => (
                <motion.div
                  key={i}
                  animate={{
                    opacity: progress > (i + 1) * 25 ? 1 : 0.1,
                    backgroundColor:
                      progress > (i + 1) * 25 ? "#dc2626" : "#fff",
                    boxShadow:
                      progress > (i + 1) * 25 ? "0 0 15px #dc2626" : "none",
                  }}
                  className="w-12 h-[2px] transition-all duration-300"
                />
              ))}
            </div>
          </div>
        </motion.div>
      </div>
      <div className="absolute inset-0 bg-[#050505] z-[100]" />
    </div>
  );
};


"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";

interface ProfessionalLoaderProps {
  onComplete: () => void;
  modelProgress?: number;
}

export const ProfessionalLoader = ({ onComplete, modelProgress = 0 }: ProfessionalLoaderProps) => {
  const [displayProgress, setDisplayProgress] = useState(0);
  const [isUnlocked, setIsUnlocked] = useState(false);
  const [statusText, setStatusText] = useState("BOOT_SEQUENCE");
  const [currentLine, setCurrentLine] = useState(0);

  const terminalLines = [
    "> initializing_core_systems...",
    "> loading_3d_environment...",
    "> compiling_shader_modules...",
    "> establishing_neural_link...",
    "> system_ready_",
  ];

  const statusMessages = [
    { threshold: 0, text: "BOOT_SEQUENCE" },
    { threshold: 20, text: "ASSET_STREAM" },
    { threshold: 40, text: "MESH_COMPILE" },
    { threshold: 60, text: "SHADER_LINK" },
    { threshold: 80, text: "RENDER_INIT" },
    { threshold: 95, text: "HANDSHAKE" },
    { threshold: 100, text: "ACCESS_GRANTED" },
  ];

  useEffect(() => {
    const target = modelProgress;
    const interval = setInterval(() => {
      setDisplayProgress(prev => {
        if (prev < target) {
          return Math.min(prev + 2, target);
        }
        return prev;
      });
    }, 30);
    return () => clearInterval(interval);
  }, [modelProgress]);

  useEffect(() => {
    const currentStatus = [...statusMessages].reverse().find(s => displayProgress >= s.threshold);
    if (currentStatus) {
      setStatusText(currentStatus.text);
    }
    const lineIndex = Math.min(Math.floor(displayProgress / 25), terminalLines.length - 1);
    setCurrentLine(lineIndex);
  }, [displayProgress]);

  useEffect(() => {
    if (displayProgress >= 100 && !isUnlocked) {
      setTimeout(() => setIsUnlocked(true), 800);
      setTimeout(onComplete, 2200);
    }
  }, [displayProgress, isUnlocked, onComplete]);

  return (
    <motion.div
      exit={{ opacity: 0 }}
      transition={{ duration: 0.6, ease: [0.76, 0, 0.24, 1] }}
      className="fixed inset-0 z-[100] flex overflow-hidden"
      style={{ background: "linear-gradient(135deg, #020202 0%, #0a0a0a 50%, #050505 100%)" }}
    >
      {/* Noise texture overlay */}
      <div 
        className="absolute inset-0 opacity-[0.015] pointer-events-none mix-blend-overlay"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`,
        }}
      />

      {/* Animated grid background */}
      <div className="absolute inset-0 overflow-hidden">
        <motion.div 
          className="absolute inset-0"
          animate={{ backgroundPosition: ["0px 0px", "60px 60px"] }}
          transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
          style={{
            backgroundImage: `
              linear-gradient(rgba(57,255,20,0.03) 1px, transparent 1px),
              linear-gradient(90deg, rgba(57,255,20,0.03) 1px, transparent 1px)
            `,
            backgroundSize: '60px 60px',
          }}
        />
      </div>

      {/* Diagonal scan lines */}
      <motion.div
        animate={{ x: ["-100%", "200%"] }}
        transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
        className="absolute inset-0 pointer-events-none"
        style={{
          background: "linear-gradient(105deg, transparent 40%, rgba(57,255,20,0.03) 50%, transparent 60%)",
        }}
      />

      {/* Left vault panel */}
      <motion.div
        initial={{ x: 0 }}
        animate={isUnlocked ? { x: "-102%" } : { x: 0 }}
        transition={{ duration: 1.4, ease: [0.87, 0, 0.13, 1] }}
        className="absolute inset-y-0 left-0 w-1/2 z-[110] overflow-hidden"
        style={{ background: "linear-gradient(90deg, #030303 0%, #080808 100%)" }}
      >
        {/* Panel texture */}
        <div className="absolute inset-0 opacity-20">
          {[...Array(20)].map((_, i) => (
            <div 
              key={i} 
              className="absolute h-px bg-gradient-to-r from-transparent via-white/5 to-transparent"
              style={{ top: `${i * 5}%`, width: '100%' }}
            />
          ))}
        </div>
        
        {/* Edge glow */}
        <motion.div
          className="absolute right-0 top-0 bottom-0 w-px"
          style={{ background: "linear-gradient(180deg, transparent, #39ff14, transparent)" }}
          animate={{ opacity: [0.3, 1, 0.3] }}
          transition={{ duration: 2, repeat: Infinity }}
        />
        
        {/* Technical markings */}
        <div className="absolute right-6 top-1/2 -translate-y-1/2 flex flex-col gap-2">
          {[...Array(12)].map((_, i) => (
            <motion.div
              key={i}
              initial={{ width: 0, opacity: 0 }}
              animate={{ 
                width: displayProgress > i * 8 ? 32 - i * 2 : 0,
                opacity: displayProgress > i * 8 ? 0.6 : 0
              }}
              transition={{ duration: 0.3, delay: i * 0.05 }}
              className="h-px bg-[#39ff14]"
              style={{ marginLeft: i * 3 }}
            />
          ))}
        </div>

        {/* Large background text */}
        <motion.div
          className="absolute -right-20 top-1/2 -translate-y-1/2 select-none pointer-events-none"
          animate={isUnlocked ? { opacity: 0, x: -100 } : { opacity: 0.02 }}
          transition={{ duration: 0.8 }}
        >
          <span 
            className="text-[25vw] font-black tracking-tighter text-white uppercase"
            style={{ fontFamily: "'Space Grotesk', sans-serif", writingMode: "vertical-rl" }}
          >
            SYS
          </span>
        </motion.div>
      </motion.div>

      {/* Right vault panel */}
      <motion.div
        initial={{ x: 0 }}
        animate={isUnlocked ? { x: "102%" } : { x: 0 }}
        transition={{ duration: 1.4, ease: [0.87, 0, 0.13, 1] }}
        className="absolute inset-y-0 right-0 w-1/2 z-[110] overflow-hidden"
        style={{ background: "linear-gradient(270deg, #030303 0%, #080808 100%)" }}
      >
        <div className="absolute inset-0 opacity-20">
          {[...Array(20)].map((_, i) => (
            <div 
              key={i} 
              className="absolute h-px bg-gradient-to-r from-transparent via-white/5 to-transparent"
              style={{ top: `${i * 5}%`, width: '100%' }}
            />
          ))}
        </div>

        <motion.div
          className="absolute left-0 top-0 bottom-0 w-px"
          style={{ background: "linear-gradient(180deg, transparent, #39ff14, transparent)" }}
          animate={{ opacity: [0.3, 1, 0.3] }}
          transition={{ duration: 2, repeat: Infinity, delay: 1 }}
        />

        <div className="absolute left-6 top-1/2 -translate-y-1/2 flex flex-col gap-2 items-end">
          {[...Array(12)].map((_, i) => (
            <motion.div
              key={i}
              initial={{ width: 0, opacity: 0 }}
              animate={{ 
                width: displayProgress > i * 8 ? 32 - i * 2 : 0,
                opacity: displayProgress > i * 8 ? 0.6 : 0
              }}
              transition={{ duration: 0.3, delay: i * 0.05 }}
              className="h-px bg-[#39ff14]"
              style={{ marginRight: i * 3 }}
            />
          ))}
        </div>

        <motion.div
          className="absolute -left-20 top-1/2 -translate-y-1/2 select-none pointer-events-none"
          animate={isUnlocked ? { opacity: 0, x: 100 } : { opacity: 0.02 }}
          transition={{ duration: 0.8 }}
        >
          <span 
            className="text-[25vw] font-black tracking-tighter text-white uppercase"
            style={{ fontFamily: "'Space Grotesk', sans-serif", writingMode: "vertical-lr" }}
          >
            TEM
          </span>
        </motion.div>
      </motion.div>

      {/* Central content */}
      <div className="absolute inset-0 z-[120] flex flex-col items-center justify-center">
        <motion.div
          animate={isUnlocked ? { opacity: 0, scale: 0.9, filter: "blur(30px)" } : { opacity: 1 }}
          transition={{ duration: 1, ease: [0.76, 0, 0.24, 1] }}
          className="flex flex-col items-center"
        >
          {/* Logo with glow effect */}
          <motion.div
            initial={{ opacity: 0, y: -30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
            className="mb-20 relative"
          >
            <motion.div
              className="absolute inset-0 blur-2xl"
              animate={{ opacity: [0.3, 0.6, 0.3] }}
              transition={{ duration: 3, repeat: Infinity }}
              style={{ background: "radial-gradient(circle, rgba(57,255,20,0.4) 0%, transparent 70%)" }}
            />
            <span 
              className="relative text-7xl font-black tracking-tighter text-[#39ff14] italic"
              style={{ 
                fontFamily: "'Space Grotesk', sans-serif",
                textShadow: '0 0 40px rgba(57,255,20,0.5), 0 0 80px rgba(57,255,20,0.3)'
              }}
            >
              AO
            </span>
          </motion.div>

          {/* Main progress ring */}
          <div className="relative w-56 h-56 flex items-center justify-center mb-16">
            {/* Outer rotating ring */}
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 30, repeat: Infinity, ease: "linear" }}
              className="absolute inset-0"
            >
              <svg viewBox="0 0 224 224" className="w-full h-full">
                <circle
                  cx="112"
                  cy="112"
                  r="108"
                  fill="none"
                  stroke="rgba(57,255,20,0.05)"
                  strokeWidth="1"
                  strokeDasharray="8 12"
                />
              </svg>
            </motion.div>

            {/* Middle static ring */}
            <svg viewBox="0 0 224 224" className="absolute w-full h-full">
              <circle
                cx="112"
                cy="112"
                r="95"
                fill="none"
                stroke="rgba(57,255,20,0.08)"
                strokeWidth="1"
              />
            </svg>

            {/* Progress arc */}
            <svg viewBox="0 0 224 224" className="absolute w-full h-full" style={{ transform: 'rotate(-90deg)' }}>
              <defs>
                <linearGradient id="progressGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#39ff14" />
                  <stop offset="50%" stopColor="#00ff88" />
                  <stop offset="100%" stopColor="#39ff14" />
                </linearGradient>
                <filter id="glow">
                  <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
                  <feMerge>
                    <feMergeNode in="coloredBlur"/>
                    <feMergeNode in="SourceGraphic"/>
                  </feMerge>
                </filter>
              </defs>
              <motion.circle
                cx="112"
                cy="112"
                r="95"
                fill="none"
                stroke="url(#progressGrad)"
                strokeWidth="3"
                strokeLinecap="round"
                filter="url(#glow)"
                strokeDasharray={597}
                initial={{ strokeDashoffset: 597 }}
                animate={{ strokeDashoffset: 597 - (597 * displayProgress) / 100 }}
                transition={{ duration: 0.3, ease: "easeOut" }}
              />
            </svg>

            {/* Inner decorative ring */}
            <motion.div
              animate={{ rotate: -360 }}
              transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
              className="absolute inset-8"
            >
              <svg viewBox="0 0 160 160" className="w-full h-full">
                <polygon
                  points="80,5 155,45 155,115 80,155 5,115 5,45"
                  fill="none"
                  stroke="rgba(57,255,20,0.1)"
                  strokeWidth="1"
                />
              </svg>
            </motion.div>

            {/* Center content */}
            <div className="absolute flex flex-col items-center">
              <div className="relative">
                <motion.span 
                  className="text-6xl font-black tracking-tighter text-white"
                  style={{ 
                    fontFamily: "'Space Grotesk', sans-serif",
                    fontVariantNumeric: 'tabular-nums'
                  }}
                >
                  {displayProgress.toString().padStart(2, '0')}
                </motion.span>
                <span className="absolute -right-6 top-1 text-[#39ff14] text-xl font-bold">%</span>
              </div>
            </div>

            {/* Orbiting dot */}
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
              className="absolute inset-0"
            >
              <motion.div 
                className="absolute w-3 h-3 rounded-full bg-[#39ff14]"
                style={{ 
                  top: '2%', 
                  left: '50%', 
                  transform: 'translateX(-50%)',
                  boxShadow: '0 0 15px #39ff14, 0 0 30px #39ff14, 0 0 45px rgba(57,255,20,0.5)'
                }}
                animate={{ scale: [1, 1.2, 1] }}
                transition={{ duration: 1, repeat: Infinity }}
              />
            </motion.div>
          </div>

          {/* Status display */}
          <motion.div
            className="flex items-center gap-4 mb-8"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
          >
            <motion.div
              animate={{ 
                scale: [1, 1.3, 1],
                opacity: [1, 0.5, 1]
              }}
              transition={{ duration: 1, repeat: Infinity }}
              className="w-2 h-2 rounded-full bg-[#39ff14]"
              style={{ boxShadow: '0 0 10px #39ff14' }}
            />
            <motion.span 
              key={statusText}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              className="text-sm uppercase tracking-[0.5em] text-[#39ff14] font-mono font-bold"
            >
              {statusText}
            </motion.span>
          </motion.div>

          {/* Terminal output */}
          <div className="w-80 bg-black/40 border border-[#39ff14]/20 rounded-sm p-4 backdrop-blur-sm">
            <div className="flex items-center gap-2 mb-3 pb-2 border-b border-[#39ff14]/10">
              <div className="w-2 h-2 rounded-full bg-[#39ff14]/60" />
              <div className="w-2 h-2 rounded-full bg-[#39ff14]/40" />
              <div className="w-2 h-2 rounded-full bg-[#39ff14]/20" />
              <span className="ml-2 text-[8px] uppercase tracking-widest text-white/30 font-mono">terminal_v4.0</span>
            </div>
            <div className="space-y-1 font-mono text-xs">
              {terminalLines.slice(0, currentLine + 1).map((line, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.3 }}
                  className={`${i === currentLine ? 'text-[#39ff14]' : 'text-white/30'}`}
                >
                  {line}
                  {i === currentLine && (
                    <motion.span
                      animate={{ opacity: [1, 0] }}
                      transition={{ duration: 0.5, repeat: Infinity }}
                      className="ml-1 inline-block w-2 h-3 bg-[#39ff14]"
                    />
                  )}
                </motion.div>
              ))}
            </div>
          </div>

          {/* Bottom signature */}
          <motion.div 
            className="mt-16 flex items-center gap-6"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8 }}
          >
            <div className="w-20 h-px bg-gradient-to-r from-transparent to-[#39ff14]/40" />
            <span className="text-[9px] uppercase tracking-[0.4em] text-white/20 font-mono">
              ANDRES_ORTIZ // DIGITAL_ARCHITECT
            </span>
            <div className="w-20 h-px bg-gradient-to-l from-transparent to-[#39ff14]/40" />
          </motion.div>
        </motion.div>
      </div>

      {/* Corner brackets */}
      <div className="absolute top-8 left-8 z-[115]">
        <motion.div 
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2 }}
          className="relative"
        >
          <div className="w-12 h-px bg-[#39ff14]/60" />
          <div className="w-px h-12 bg-[#39ff14]/60" />
          <span className="absolute top-4 left-4 text-[8px] font-mono text-[#39ff14]/40 tracking-widest">001</span>
        </motion.div>
      </div>
      <div className="absolute top-8 right-8 z-[115]">
        <motion.div 
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.3 }}
          className="relative flex flex-col items-end"
        >
          <div className="w-12 h-px bg-[#39ff14]/60" />
          <div className="w-px h-12 bg-[#39ff14]/60 self-end" />
          <span className="absolute top-4 right-4 text-[8px] font-mono text-[#39ff14]/40 tracking-widest">002</span>
        </motion.div>
      </div>
      <div className="absolute bottom-8 left-8 z-[115]">
        <motion.div 
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.4 }}
          className="relative flex flex-col"
        >
          <div className="w-px h-12 bg-[#39ff14]/60" />
          <div className="w-12 h-px bg-[#39ff14]/60" />
          <span className="absolute bottom-4 left-4 text-[8px] font-mono text-[#39ff14]/40 tracking-widest">003</span>
        </motion.div>
      </div>
      <div className="absolute bottom-8 right-8 z-[115]">
        <motion.div 
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.5 }}
          className="relative flex flex-col items-end"
        >
          <div className="w-px h-12 bg-[#39ff14]/60 self-end" />
          <div className="w-12 h-px bg-[#39ff14]/60" />
          <span className="absolute bottom-4 right-4 text-[8px] font-mono text-[#39ff14]/40 tracking-widest">004</span>
        </motion.div>
      </div>

      {/* Version tag */}
      <motion.div 
        className="absolute bottom-8 left-1/2 -translate-x-1/2 z-[115]"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
      >
        <span className="text-[8px] uppercase tracking-[0.6em] text-white/10 font-mono">
          v4.0.0_STABLE
        </span>
      </motion.div>
    </motion.div>
  );
};

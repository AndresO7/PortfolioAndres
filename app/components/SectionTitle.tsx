"use client";

import { motion } from "framer-motion";
import { ReactNode } from "react";

interface SectionTitleProps {
  children: ReactNode;
  subtitle: string;
}

export const SectionTitle = ({ children, subtitle }: SectionTitleProps) => (
  <div className="mb-24">
    <motion.p
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      className="text-xs uppercase tracking-[0.7em] text-red-600 mb-6 font-mono font-black"
    >
      // {subtitle}
    </motion.p>
    <motion.h2
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      className="text-6xl md:text-9xl font-black tracking-tighter leading-[0.85] uppercase"
    >
      {children}
    </motion.h2>
  </div>
);


"use client";

import { useState } from "react";
import { motion } from "framer-motion";

interface ScrambleTextProps {
  text: string;
  delay?: number;
  duration?: number;
}

export const ScrambleText = ({ text, delay = 0 }: ScrambleTextProps) => {
  const [displayText, setDisplayText] = useState(text);
  const [hasAnimated, setHasAnimated] = useState(false);
  const characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";

  const scramble = () => {
    if (hasAnimated) return;
    setHasAnimated(true);
    
    let iteration = 0;
    const interval = setInterval(() => {
      setDisplayText(
        text
          .split("")
          .map((char, index) => {
            if (char === " ") return " ";
            if (index < iteration) return text[index];
            return characters[Math.floor(Math.random() * characters.length)];
          })
          .join("")
      );

      if (iteration >= text.length) clearInterval(interval);
      iteration += 1 / 3;
    }, 30);
  };

  return (
    <motion.span
      onViewportEnter={() => setTimeout(scramble, delay)}
      className="relative inline-block"
    >
      {/* Texto invisible que reserva el espacio */}
      <span className="invisible" aria-hidden="true">
        {text}
      </span>
      {/* Texto visible posicionado absolutamente */}
      <span className="absolute inset-0 flex justify-center">
        {displayText}
      </span>
    </motion.span>
  );
};


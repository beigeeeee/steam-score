"use client";

import { motion } from "framer-motion";

interface BlurFadeProps {
  children: React.ReactNode;
  delay?: number;
  className?: string;
  direction?: "up" | "down";
}

export function BlurFade({
  children,
  delay = 0,
  className = "",
  direction = "up",
}: BlurFadeProps) {
  const y = direction === "up" ? 12 : -12;

  return (
    <motion.div
      initial={{ opacity: 0, y, filter: "blur(6px)" }}
      animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
      transition={{ duration: 0.4, delay, ease: "easeOut" }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

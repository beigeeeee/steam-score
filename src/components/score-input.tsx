"use client";

import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface ScoreInputProps {
  label: string;
  value: number;
  onChange: (value: number) => void;
}

export function ScoreInput({ label, value, onChange }: ScoreInputProps) {
  return (
    <div className="space-y-2.5">
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium text-foreground">{label}</span>
        <motion.span
          key={value}
          initial={{ scale: 1.3, opacity: 0.7 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: "spring", stiffness: 400, damping: 15 }}
          className={cn(
            "text-sm tabular-nums font-semibold",
            value >= 8 ? "text-primary" : "text-muted-foreground"
          )}
        >
          {value}/10
        </motion.span>
      </div>
      <div className="flex gap-1.5" role="radiogroup" aria-label={label}>
        {Array.from({ length: 10 }, (_, i) => i + 1).map((n) => (
          <motion.button
            key={n}
            type="button"
            role="radio"
            aria-checked={n === value}
            aria-label={`${label}: ${n} out of 10`}
            onClick={() => {
              onChange(n);
              if (typeof navigator !== "undefined" && "vibrate" in navigator) {
                navigator.vibrate(10);
              }
            }}
            whileTap={{ scale: 0.9 }}
            className={cn(
              "flex-1 h-11 min-w-[28px] rounded-lg text-sm font-medium",
              "transition-colors duration-150 cursor-pointer",
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
              "active:scale-95",
              n === value
                ? "bg-primary text-primary-foreground shadow-sm shadow-primary/25"
                : n <= value
                ? "bg-primary/10 text-primary/70"
                : "bg-muted text-muted-foreground hover:bg-muted/70"
            )}
          >
            {n}
          </motion.button>
        ))}
      </div>
      {/* Mini bar indicator */}
      <div className="h-0.5 bg-muted rounded-full overflow-hidden">
        <motion.div
          className="h-full bg-primary/40 rounded-full"
          initial={false}
          animate={{ width: `${value * 10}%` }}
          transition={{ type: "spring", stiffness: 200, damping: 20 }}
        />
      </div>
    </div>
  );
}

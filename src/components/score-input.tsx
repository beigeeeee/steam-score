"use client";

import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface ScoreInputProps {
  label: string;
  value: number;
  onChange: (value: number) => void;
}

function getScoreColor(n: number, selected: boolean) {
  if (selected) {
    if (n <= 2) return "bg-red-500/90 text-white shadow-sm shadow-red-500/20";
    if (n === 3) return "bg-amber-400/90 text-amber-950 shadow-sm shadow-amber-400/20";
    return "bg-emerald-500/90 text-white shadow-sm shadow-emerald-500/20";
  }
  // Subtle tint for filled values below selected
  if (n <= 2) return "bg-red-50 text-red-400/80";
  if (n === 3) return "bg-amber-50 text-amber-500/80";
  return "bg-emerald-50 text-emerald-500/80";
}

function getValueColor(value: number) {
  if (value <= 2) return "text-red-500";
  if (value === 3) return "text-amber-500";
  return "text-emerald-600";
}

function getBarColor(value: number) {
  if (value <= 2) return "bg-red-400/30";
  if (value === 3) return "bg-amber-400/30";
  return "bg-emerald-500/30";
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
          className={cn("text-sm tabular-nums font-semibold", getValueColor(value))}
        >
          {value}/5
        </motion.span>
      </div>
      <div className="flex gap-2" role="radiogroup" aria-label={label}>
        {[1, 2, 3, 4, 5].map((n) => {
          const isSelected = n === value;
          const isFilled = n <= value;

          return (
            <motion.button
              key={n}
              type="button"
              role="radio"
              aria-checked={isSelected}
              aria-label={`${label}: ${n} out of 5`}
              onClick={() => {
                onChange(n);
                if (typeof navigator !== "undefined" && "vibrate" in navigator) {
                  navigator.vibrate(10);
                }
              }}
              whileTap={{ scale: 0.9 }}
              className={cn(
                "flex-1 h-12 rounded-xl text-base font-semibold",
                "transition-colors duration-150 cursor-pointer",
                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
                isSelected
                  ? getScoreColor(n, true)
                  : isFilled
                  ? getScoreColor(n, false)
                  : "bg-muted text-muted-foreground hover:bg-muted/70"
              )}
            >
              {n}
            </motion.button>
          );
        })}
      </div>
      {/* Mini bar */}
      <div className="h-0.5 bg-muted rounded-full overflow-hidden">
        <motion.div
          className={cn("h-full rounded-full", getBarColor(value))}
          initial={false}
          animate={{ width: `${value * 20}%` }}
          transition={{ type: "spring", stiffness: 200, damping: 20 }}
        />
      </div>
    </div>
  );
}

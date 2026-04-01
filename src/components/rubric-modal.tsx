"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { SCORING_RUBRIC } from "@/lib/schemas";
import { cn } from "@/lib/utils";

interface RubricModalProps {
  eventId: string;
  onAcknowledge: () => void;
}

export function RubricModal({ eventId, onAcknowledge }: RubricModalProps) {
  const [scrolledToBottom, setScrolledToBottom] = useState(false);

  function handleScroll(e: React.UIEvent<HTMLDivElement>) {
    const el = e.currentTarget;
    const atBottom = el.scrollHeight - el.scrollTop - el.clientHeight < 40;
    if (atBottom) setScrolledToBottom(true);
  }

  function handleAcknowledge() {
    localStorage.setItem(`rubric-ack-${eventId}`, "true");
    onAcknowledge();
  }

  return (
    <div className="fixed inset-0 z-50 bg-background flex flex-col">
      {/* Header */}
      <div className="sticky top-0 bg-background/95 backdrop-blur-sm border-b px-5 py-3 z-10">
        <h1 className="text-lg font-semibold text-center">Scoring Rubric</h1>
        <p className="text-xs text-muted-foreground text-center mt-0.5">
          Please review before scoring
        </p>
      </div>

      {/* Scrollable content */}
      <div
        className="flex-1 overflow-y-auto px-5 py-6 space-y-6"
        onScroll={handleScroll}
      >
        {/* Instructions */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-primary/5 border border-primary/10 rounded-xl p-4 space-y-2"
        >
          <p className="text-sm font-medium">How to score</p>
          <ul className="text-xs text-muted-foreground space-y-1.5">
            <li className="flex gap-2">
              <span className="text-primary font-bold shrink-0">1.</span>
              Evaluate each project on 4 criteria below
            </li>
            <li className="flex gap-2">
              <span className="text-primary font-bold shrink-0">2.</span>
              Grade each criteria on a 1-5 scale (score 0 if project is absent)
            </li>
            <li className="flex gap-2">
              <span className="text-primary font-bold shrink-0">3.</span>
              Feel free to ask questions. Grades K-2 usually have lower inputs compared to Grades 3-5
            </li>
            <li className="flex gap-2">
              <span className="text-primary font-bold shrink-0">4.</span>
              Submit scores independently based on your own judgement
            </li>
          </ul>
        </motion.div>

        {/* Scale legend */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="flex gap-2 justify-center"
        >
          <div className="flex items-center gap-1.5 text-xs">
            <div className="w-6 h-6 rounded-md bg-red-500/90 text-white flex items-center justify-center text-[10px] font-bold">1-2</div>
            <span className="text-muted-foreground">Developing</span>
          </div>
          <div className="flex items-center gap-1.5 text-xs">
            <div className="w-6 h-6 rounded-md bg-amber-400/90 text-amber-950 flex items-center justify-center text-[10px] font-bold">3</div>
            <span className="text-muted-foreground">Competent</span>
          </div>
          <div className="flex items-center gap-1.5 text-xs">
            <div className="w-6 h-6 rounded-md bg-emerald-500/90 text-white flex items-center justify-center text-[10px] font-bold">4-5</div>
            <span className="text-muted-foreground">Advanced</span>
          </div>
        </motion.div>

        {/* Rubric table */}
        {SCORING_RUBRIC.categories.map((cat, i) => (
          <motion.div
            key={cat.name}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 + i * 0.08 }}
            className="border rounded-xl overflow-hidden"
          >
            <div className="bg-muted/50 px-4 py-2.5 border-b">
              <h3 className="text-sm font-semibold">{cat.name}</h3>
            </div>
            <div className="divide-y">
              <div className="px-4 py-3 flex gap-3">
                <div className="w-7 h-7 rounded-lg bg-emerald-500/90 text-white flex items-center justify-center text-[10px] font-bold shrink-0 mt-0.5">4-5</div>
                <div>
                  <p className="text-[10px] font-semibold text-emerald-700 uppercase tracking-wider mb-0.5">Advanced</p>
                  <p className="text-xs text-muted-foreground leading-relaxed">{cat.advanced}</p>
                </div>
              </div>
              <div className="px-4 py-3 flex gap-3">
                <div className="w-7 h-7 rounded-lg bg-amber-400/90 text-amber-950 flex items-center justify-center text-[10px] font-bold shrink-0 mt-0.5">3</div>
                <div>
                  <p className="text-[10px] font-semibold text-amber-700 uppercase tracking-wider mb-0.5">Competent</p>
                  <p className="text-xs text-muted-foreground leading-relaxed">{cat.competent}</p>
                </div>
              </div>
              <div className="px-4 py-3 flex gap-3">
                <div className="w-7 h-7 rounded-lg bg-red-500/90 text-white flex items-center justify-center text-[10px] font-bold shrink-0 mt-0.5">1-2</div>
                <div>
                  <p className="text-[10px] font-semibold text-red-600 uppercase tracking-wider mb-0.5">Developing</p>
                  <p className="text-xs text-muted-foreground leading-relaxed">{cat.developing}</p>
                </div>
              </div>
            </div>
          </motion.div>
        ))}

        {/* Ribbon awards */}
        {/* Spacer for button */}
        <div className="h-20" />
      </div>

      {/* Fixed bottom button */}
      <div className="sticky bottom-0 bg-background/95 backdrop-blur-sm border-t px-5 py-4">
        <Button
          onClick={handleAcknowledge}
          disabled={!scrolledToBottom}
          className={cn(
            "w-full h-12 text-base cursor-pointer transition-all",
            !scrolledToBottom && "opacity-50"
          )}
        >
          {scrolledToBottom
            ? "I've read the rubric — Start scoring"
            : "Scroll down to continue ↓"}
        </Button>
      </div>
    </div>
  );
}

"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { useScores } from "@/hooks/use-scores";
import { aggregateScores } from "@/lib/aggregate";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { CountUp } from "@/components/reactbits/count-up";
import { SpotlightCard } from "@/components/reactbits/spotlight-card";
import { SplitText } from "@/components/reactbits/split-text";
import { AppHeader } from "@/components/app-header";

interface Props {
  eventId: string;
  eventName: string;
  leaderboardMode: string;
  participants: Record<string, { name: string; projectTitle: string; grade?: string }>;
}

const MEDALS = ["🥇", "🥈", "🥉"];

export function LeaderboardView({
  eventId,
  eventName,
  leaderboardMode: initialMode,
  participants,
}: Props) {
  const router = useRouter();
  const { scores, loading, error } = useScores(eventId);
  const aggregated = aggregateScores(scores);
  const [revealed, setRevealed] = useState(initialMode !== "hidden");
  const [fullscreen, setFullscreen] = useState(false);

  const ranked = Array.from(aggregated.values())
    .filter((s) => participants[s.participantId])
    .sort((a, b) => b.avgTotal - a.avgTotal);

  const maxScore = ranked.length > 0 ? ranked[0].avgTotal : 40;

  function handleReveal() {
    setRevealed(true);
  }

  function toggleFullscreen() {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen();
      setFullscreen(true);
    } else {
      document.exitFullscreen();
      setFullscreen(false);
    }
  }

  return (
    <div className={cn("min-h-dvh bg-background flex flex-col", fullscreen && "p-6")}>
      <div className="print:hidden">
        <AppHeader
          title="Leaderboard"
          subtitle={eventName}
          backLabel="Event"
          backHref={`/admin/event/${eventId}`}
          rightAction={
            <div className="flex gap-1.5">
              {!revealed && (
                <button onClick={handleReveal} className="text-xs text-primary font-medium cursor-pointer px-2 py-1 rounded-md hover:bg-primary/5 transition-colors">
                  Reveal
                </button>
              )}
              <button onClick={toggleFullscreen} className="text-xs text-muted-foreground font-medium cursor-pointer px-2 py-1 rounded-md hover:bg-muted transition-colors">
                {fullscreen ? "Exit" : "Fullscreen"}
              </button>
            </div>
          }
        />
      </div>

      <div className="flex-1 p-6 md:p-12">
      <div className="max-w-3xl mx-auto">

        {/* Header */}
        <div className="text-center mb-10">
          <p className="text-sm text-muted-foreground">{eventName}</p>
          <h1 className="text-3xl font-bold mt-1 tracking-tight">
            <span className="mr-2">🏆</span>
            <SplitText text="Leaderboard" className="text-3xl font-bold tracking-tight" />
          </h1>
        </div>

        {error && (
          <div className="bg-orange-50 text-orange-700 text-sm p-3 rounded-lg mb-6 text-center">
            {error}
          </div>
        )}

        {loading ? (
          <div className="space-y-3">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="h-20 bg-muted rounded-lg animate-pulse" />
            ))}
          </div>
        ) : ranked.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-lg text-muted-foreground">Waiting for judges...</p>
            <p className="text-sm text-muted-foreground mt-1">Scores will appear here in real-time.</p>
          </div>
        ) : (
          <AnimatePresence>
            <div className="space-y-3">
              {ranked.map((entry, index) => {
                const participant = participants[entry.participantId];
                const barWidth = (entry.avgTotal / maxScore) * 100;

                return (
                  <motion.div
                    key={entry.participantId}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.4, delay: revealed ? index * 0.15 : 0 }}
                    className="rounded-lg border bg-card overflow-hidden"
                  >
                    <SpotlightCard className="flex items-center gap-4 p-4">
                    {/* Rank */}
                    <div className="w-10 text-center shrink-0">
                      {index < 3 ? (
                        <motion.span
                          className="text-2xl inline-block"
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          transition={{ type: "spring", delay: revealed ? index * 0.15 + 0.3 : 0 }}
                        >
                          {MEDALS[index]}
                        </motion.span>
                      ) : (
                        <span className="text-lg font-bold text-muted-foreground tabular-nums">
                          {index + 1}
                        </span>
                      )}
                    </div>

                    {/* Info + Bar */}
                    <div className="flex-1 min-w-0">
                      <div className="font-medium text-sm truncate">{participant?.name}</div>
                      <div className="text-xs text-muted-foreground truncate">
                        {participant?.projectTitle}
                        {participant?.grade && (
                          <span className="ml-1.5 text-[10px] opacity-70">· {participant.grade} grade</span>
                        )}
                      </div>
                      <div className="mt-2 h-2 bg-muted rounded-full overflow-hidden">
                        <motion.div
                          className="h-full rounded-full bg-primary"
                          initial={{ width: 0 }}
                          animate={{ width: revealed ? `${barWidth}%` : "0%" }}
                          transition={{ duration: 0.8, delay: revealed ? index * 0.15 + 0.2 : 0, ease: "easeOut" }}
                        />
                      </div>
                    </div>

                    {/* Score with count-up */}
                    <div className={cn(
                      "text-xl font-bold tabular-nums shrink-0 transition-opacity duration-500",
                      !revealed && "opacity-0"
                    )}>
                      {revealed ? <CountUp value={entry.avgTotal} duration={1 + index * 0.2} /> : "0.0"}
                    </div>
                    </SpotlightCard>
                  </motion.div>
                );
              })}
            </div>
          </AnimatePresence>
        )}

        <p className="text-center text-xs text-muted-foreground mt-8">
          {revealed ? "Scores update in real-time" : "Press 'Reveal Scores' to show results"}
        </p>
      </div>
      </div>
    </div>
  );
}

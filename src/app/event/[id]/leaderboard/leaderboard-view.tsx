"use client";

import { useState, useMemo } from "react";
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
import { getScoreLevel, RIBBONS, assignRibbon, type RibbonType } from "@/lib/schemas";

interface Props {
  eventId: string;
  eventName: string;
  leaderboardMode: string;
  participants: Record<string, { name: string; projectTitle: string; grade?: string; location?: number; table?: number }>;
}

const MEDALS = ["🥇", "🥈", "🥉"];

type SortMode = "score" | "location" | "name";
type GroupMode = "none" | "grade";

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
  const [sortMode, setSortMode] = useState<SortMode>("score");
  const [groupMode, setGroupMode] = useState<GroupMode>("none");

  // Collect unique judge names from scores
  const judgeNames = useMemo(() => {
    const names = new Set<string>();
    scores.forEach((s) => names.add(s.judgeName));
    return Array.from(names);
  }, [scores]);

  // Build ranked entries with participant info attached
  const entries = useMemo(() => {
    return Array.from(aggregated.values())
      .filter((s) => participants[s.participantId])
      .map((s) => ({
        ...s,
        participant: participants[s.participantId],
      }));
  }, [aggregated, participants]);

  // Sort
  const sorted = useMemo(() => {
    const copy = [...entries];
    if (sortMode === "score") copy.sort((a, b) => b.avgTotal - a.avgTotal);
    else if (sortMode === "location") copy.sort((a, b) => (a.participant.location ?? 999) - (b.participant.location ?? 999));
    else if (sortMode === "name") copy.sort((a, b) => a.participant.name.localeCompare(b.participant.name));
    return copy;
  }, [entries, sortMode]);

  // Group by grade
  const grouped = useMemo(() => {
    if (groupMode === "none") return { All: sorted };
    const groups: Record<string, typeof sorted> = {};
    for (const entry of sorted) {
      const key = entry.participant.grade || "Ungraded";
      if (!groups[key]) groups[key] = [];
      groups[key].push(entry);
    }
    // Sort grade keys
    return Object.fromEntries(
      Object.entries(groups).sort(([a], [b]) => a.localeCompare(b))
    );
  }, [sorted, groupMode]);

  const maxScore = sorted.length > 0 ? Math.max(...sorted.map((e) => e.avgTotal)) : 20;

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
                <button onClick={() => setRevealed(true)} className="text-xs text-primary font-medium cursor-pointer px-2 py-1 rounded-md hover:bg-primary/5 transition-colors">
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

      <div className="flex-1 p-5 md:p-10">
        <div className="max-w-3xl mx-auto">
          {/* Header */}
          <div className="text-center mb-6">
            <h1 className="text-3xl font-bold mt-1 tracking-tight">
              <span className="mr-2">🏆</span>
              <SplitText text="Leaderboard" className="text-3xl font-bold tracking-tight" />
            </h1>
          </div>

          {/* Judges who scored */}
          {judgeNames.length > 0 && (
            <div className="flex flex-wrap items-center justify-center gap-2 mb-6">
              <span className="text-[10px] text-muted-foreground uppercase tracking-wider font-medium">Judges:</span>
              {judgeNames.map((name) => (
                <span key={name} className="text-xs bg-muted px-2 py-0.5 rounded-full text-muted-foreground">
                  {name}
                </span>
              ))}
            </div>
          )}


          {/* Ribbon assignment */}
          {sorted.length > 0 && revealed && (
            <div className="mb-6 p-4 bg-muted/30 rounded-xl">
              <p className="text-[10px] uppercase tracking-widest text-muted-foreground font-semibold mb-2.5">Ribbon Assignment</p>
              <div className="flex flex-wrap gap-x-6 gap-y-2">
                {(Object.keys(RIBBONS) as RibbonType[]).map((type) => {
                  const r = RIBBONS[type];
                  const count = sorted.filter((e) => e.ribbon === type).length;
                  return (
                    <div key={type} className="flex items-center gap-2 text-xs">
                      <span>{r.emoji}</span>
                      <span className={cn("font-medium", r.color)}>{r.label}</span>
                      <span className="text-muted-foreground">{r.range}</span>
                      {count > 0 && (
                        <span className={cn("text-[10px] font-bold px-1.5 py-0.5 rounded-full", r.bg, r.color)}>
                          {count}
                        </span>
                      )}
                    </div>
                  );
                })}
              </div>
              <p className="text-[10px] text-muted-foreground mt-2">
                Scored 1–5 per category (Creativity, Thoroughness, Clarity, Student Independence). Advanced = 4 or 5, Competent = 3, Developing = 1 or 2.
              </p>
            </div>
          )}

          {/* Sort + Group controls */}
          <div className="flex flex-wrap items-center justify-center gap-2 mb-6">
            {/* Sort */}
            <div className="flex gap-0.5 p-0.5 bg-muted rounded-lg">
              {([["score", "By Score"], ["location", "By Location"], ["name", "By Name"]] as [SortMode, string][]).map(([mode, label]) => (
                <button
                  key={mode}
                  onClick={() => setSortMode(mode)}
                  className={cn(
                    "px-2.5 py-1 text-[11px] font-medium rounded-md transition-colors cursor-pointer",
                    sortMode === mode ? "bg-background shadow-sm text-foreground" : "text-muted-foreground hover:text-foreground"
                  )}
                >
                  {label}
                </button>
              ))}
            </div>
            {/* Group */}
            <div className="flex gap-0.5 p-0.5 bg-muted rounded-lg">
              {([["none", "All"], ["grade", "By Grade"]] as [GroupMode, string][]).map(([mode, label]) => (
                <button
                  key={mode}
                  onClick={() => setGroupMode(mode)}
                  className={cn(
                    "px-2.5 py-1 text-[11px] font-medium rounded-md transition-colors cursor-pointer",
                    groupMode === mode ? "bg-background shadow-sm text-foreground" : "text-muted-foreground hover:text-foreground"
                  )}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>

          {error && (
            <div className="bg-orange-50 text-orange-700 text-sm p-3 rounded-lg mb-6 text-center">{error}</div>
          )}

          {loading ? (
            <div className="space-y-3">
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="h-20 bg-muted rounded-lg animate-pulse" />
              ))}
            </div>
          ) : sorted.length === 0 ? (
            <div className="text-center py-20">
              <p className="text-lg text-muted-foreground">Waiting for judges...</p>
              <p className="text-sm text-muted-foreground mt-1">Scores will appear here in real-time.</p>
            </div>
          ) : (
            Object.entries(grouped).map(([groupName, groupEntries]) => {
              // Sort within group by score for proper 1st/2nd/3rd per grade
              const groupSorted = [...groupEntries].sort((a, b) => b.avgTotal - a.avgTotal);

              return (
              <div key={groupName} className="mb-8">
                {groupMode !== "none" && (
                  <div className="mb-3">
                    <div className="flex items-center justify-between">
                      <h3 className="text-xs uppercase tracking-widest text-muted-foreground font-semibold">
                        {groupName} Grade
                      </h3>
                      <span className="text-[10px] text-muted-foreground">{groupSorted.length} participant{groupSorted.length !== 1 ? "s" : ""}</span>
                    </div>
                  </div>
                )}

                <AnimatePresence>
                  <div className="space-y-3">
                    {(sortMode === "score" && groupMode !== "none" ? groupSorted : groupEntries).map((entry, index) => {
                      const barWidth = (entry.avgTotal / maxScore) * 100;
                      // When grouped by grade, rank is within the grade group
                      const rankInGroup = groupMode !== "none"
                        ? groupSorted.findIndex((e) => e.participantId === entry.participantId)
                        : -1;
                      const globalRank = sortMode === "score"
                        ? sorted.findIndex((e) => e.participantId === entry.participantId)
                        : -1;
                      const displayRank = groupMode !== "none" ? rankInGroup : globalRank;

                      return (
                        <motion.div
                          key={entry.participantId}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ duration: 0.4, delay: revealed ? index * 0.1 : 0 }}
                          className={cn(
                            "rounded-lg border bg-card overflow-hidden",
                            groupMode !== "none" && rankInGroup < 3 && revealed && "ring-1 ring-primary/20"
                          )}
                        >
                          <SpotlightCard className="flex items-center gap-4 p-4">
                            {/* Rank or location */}
                            <div className="w-10 text-center shrink-0">
                              {sortMode === "score" && displayRank >= 0 && displayRank < 3 ? (
                                <div className="flex flex-col items-center">
                                  <motion.span
                                    className="text-2xl inline-block"
                                    initial={{ scale: 0 }}
                                    animate={{ scale: 1 }}
                                    transition={{ type: "spring", delay: revealed ? index * 0.1 + 0.2 : 0 }}
                                  >
                                    {MEDALS[displayRank]}
                                  </motion.span>
                                  {groupMode !== "none" && (
                                    <span className="text-[8px] text-muted-foreground font-medium mt-0.5">
                                      {displayRank === 0 ? "1st" : displayRank === 1 ? "2nd" : "3rd"}
                                    </span>
                                  )}
                                </div>
                              ) : sortMode === "location" && entry.participant.location ? (
                                <span className="text-xs font-medium text-muted-foreground bg-muted px-2 py-1 rounded">
                                  L{entry.participant.location}
                                </span>
                              ) : (
                                <span className="text-lg font-bold text-muted-foreground tabular-nums">
                                  {sortMode === "score" ? (displayRank >= 0 ? displayRank + 1 : index + 1) : index + 1}
                                </span>
                              )}
                            </div>

                            {/* Info + Bar */}
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2">
                                <span className="font-medium text-sm truncate">{entry.participant.name}</span>
                                {entry.participant.grade && (
                                  <span className="text-[9px] bg-muted text-muted-foreground px-1.5 py-0.5 rounded shrink-0">
                                    {entry.participant.grade}
                                  </span>
                                )}
                              </div>
                              <div className="text-xs text-muted-foreground truncate">
                                {entry.participant.projectTitle}
                                {entry.participant.table && (
                                  <span className="ml-1.5 text-[10px] opacity-70">· Table {entry.participant.table}</span>
                                )}
                              </div>
                              <div className="mt-2 h-2 bg-muted rounded-full overflow-hidden">
                                <motion.div
                                  className="h-full rounded-full bg-primary"
                                  initial={{ width: 0 }}
                                  animate={{ width: revealed ? `${barWidth}%` : "0%" }}
                                  transition={{ duration: 0.8, delay: revealed ? index * 0.1 + 0.15 : 0, ease: "easeOut" }}
                                />
                              </div>
                            </div>

                            {/* Score + ribbon */}
                            <div className={cn(
                              "text-right shrink-0 transition-opacity duration-500",
                              !revealed && "opacity-0"
                            )}>
                              <div className="text-xl font-bold tabular-nums">
                                {revealed ? <CountUp value={entry.avgTotal} duration={0.8 + index * 0.15} /> : "0.0"}
                              </div>
                              <div className="text-[9px] text-muted-foreground">/20</div>
                              {revealed && entry.noShowCount < entry.judgeCount && (
                                <div className={cn(
                                  "text-[9px] font-medium inline-flex items-center gap-0.5 mt-0.5",
                                  RIBBONS[entry.ribbon].color
                                )}>
                                  <span>{RIBBONS[entry.ribbon].emoji}</span>
                                  <span>{RIBBONS[entry.ribbon].label}</span>
                                </div>
                              )}
                              {entry.noShowCount > 0 && entry.noShowCount === entry.judgeCount && (
                                <div className="text-[9px] font-medium text-red-400">No Show</div>
                              )}
                            </div>
                          </SpotlightCard>
                        </motion.div>
                      );
                    })}
                  </div>
                </AnimatePresence>
              </div>
              );
            })
          )}

          <p className="text-center text-xs text-muted-foreground mt-4">
            {revealed ? `Scores update in real-time · ${judgeNames.length} judge${judgeNames.length !== 1 ? "s" : ""}` : "Press 'Reveal' to show results"}
          </p>
        </div>
      </div>
    </div>
  );
}

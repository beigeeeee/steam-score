"use client";

import { motion } from "framer-motion";
import {
  Radar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  ResponsiveContainer,
} from "recharts";
import { BlurFade } from "@/components/reactbits/blur-fade";
import { CountUp } from "@/components/reactbits/count-up";
import { cn } from "@/lib/utils";

interface Stats {
  avgCreativity: number;
  avgScientificMethod: number;
  avgPresentation: number;
  avgImpact: number;
  avgTotal: number;
  judgeCount: number;
  feedbacks: { judgeName: string; text: string }[];
}

interface Props {
  eventName: string;
  eventDate: string;
  participantName: string;
  projectTitle: string;
  stats: Stats | null;
}

export function ScoreCardView({
  eventName,
  eventDate,
  participantName,
  projectTitle,
  stats,
}: Props) {
  if (!stats) {
    return (
      <div className="min-h-dvh flex items-center justify-center p-6 bg-background">
        <BlurFade>
          <div className="text-center space-y-3">
            <div className="w-14 h-14 rounded-full bg-muted flex items-center justify-center mx-auto">
              <svg className="w-7 h-7 text-muted-foreground" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <p className="text-lg font-medium">No scores yet</p>
            <p className="text-sm text-muted-foreground max-w-[240px] mx-auto">
              Scores for {participantName} will appear here once judges submit their evaluations.
            </p>
          </div>
        </BlurFade>
      </div>
    );
  }

  const radarData = [
    { category: "Creativity", score: stats.avgCreativity, fullMark: 10 },
    { category: "Method", score: stats.avgScientificMethod, fullMark: 10 },
    { category: "Presentation", score: stats.avgPresentation, fullMark: 10 },
    { category: "Impact", score: stats.avgImpact, fullMark: 10 },
  ];

  return (
    <div className="min-h-dvh bg-background relative overflow-hidden">
      {/* Subtle top gradient */}
      <div className="absolute top-0 inset-x-0 h-64 bg-[radial-gradient(ellipse_at_top,rgba(16,185,129,0.06),transparent_70%)]" />

      <div className="p-6 max-w-md mx-auto relative z-10">
        {/* Header */}
        <BlurFade delay={0.1}>
          <div className="text-center mb-2 pt-4">
            <p className="text-[11px] uppercase tracking-widest text-muted-foreground font-medium">
              {eventName}
            </p>
            <h1 className="text-2xl font-bold mt-2 tracking-tight text-balance">
              {participantName}
            </h1>
            <p className="text-sm text-muted-foreground mt-1">{projectTitle}</p>
          </div>
        </BlurFade>

        {/* Radar Chart */}
        <BlurFade delay={0.2}>
          <div className="h-60 mb-2">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart data={radarData} cx="50%" cy="50%" outerRadius="70%">
                <PolarGrid stroke="hsl(var(--border))" strokeDasharray="3 3" />
                <PolarAngleAxis
                  dataKey="category"
                  tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))", fontWeight: 500 }}
                />
                <PolarRadiusAxis
                  angle={90}
                  domain={[0, 10]}
                  tick={{ fontSize: 9, fill: "hsl(var(--muted-foreground))" }}
                  axisLine={false}
                />
                <Radar
                  dataKey="score"
                  stroke="hsl(var(--primary))"
                  fill="hsl(var(--primary))"
                  fillOpacity={0.12}
                  strokeWidth={2}
                />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        </BlurFade>

        {/* Category Scores */}
        <BlurFade delay={0.3}>
          <div className="grid grid-cols-4 gap-2 text-center mb-8">
            {radarData.map((d, i) => (
              <motion.div
                key={d.category}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 + i * 0.08 }}
                className="bg-muted/50 rounded-xl p-3"
              >
                <div className={cn(
                  "text-xl font-bold tabular-nums",
                  d.score >= 8 ? "text-primary" : "text-foreground"
                )}>
                  <CountUp value={d.score} duration={1 + i * 0.2} />
                </div>
                <div className="text-[10px] text-muted-foreground leading-tight mt-1 font-medium">
                  {d.category}
                </div>
              </motion.div>
            ))}
          </div>
        </BlurFade>

        {/* Feedback Quotes */}
        {stats.feedbacks.length > 0 && (
          <BlurFade delay={0.5}>
            <div className="space-y-4 mb-8">
              <h2 className="text-xs uppercase tracking-widest text-muted-foreground font-semibold">
                Judge Feedback
              </h2>
              {stats.feedbacks.map((f, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.6 + i * 0.1 }}
                  className="space-y-1"
                >
                  <blockquote className="border-l-2 border-primary/30 pl-3 text-sm text-foreground/80 italic leading-relaxed">
                    &ldquo;{f.text}&rdquo;
                  </blockquote>
                  <p className="text-[11px] text-muted-foreground text-right font-medium">
                    — {f.judgeName}
                  </p>
                </motion.div>
              ))}
            </div>
          </BlurFade>
        )}

        {/* Total Score */}
        <BlurFade delay={0.7}>
          <div className="text-center py-6 bg-muted/30 rounded-2xl">
            <div className="inline-flex items-baseline gap-0.5">
              <span className="text-5xl font-bold tabular-nums text-primary">
                <CountUp value={stats.avgTotal} duration={1.5} />
              </span>
              <span className="text-lg text-muted-foreground font-medium">/40</span>
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              Average across {stats.judgeCount} judge
              {stats.judgeCount !== 1 ? "s" : ""}
            </p>
          </div>
        </BlurFade>

        {/* Share button */}
        <BlurFade delay={0.8}>
          <div className="flex justify-center mt-6">
            <motion.button
              whileTap={{ scale: 0.95 }}
              onClick={() => {
                if (typeof navigator !== "undefined" && navigator.share) {
                  navigator.share({
                    title: `${participantName} - ${eventName}`,
                    text: `${participantName} scored ${stats.avgTotal.toFixed(1)}/40 at ${eventName}!`,
                    url: window.location.href,
                  });
                } else {
                  navigator.clipboard.writeText(window.location.href);
                  alert("Link copied to clipboard!");
                }
              }}
              className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground bg-muted hover:bg-muted/70 px-5 py-2.5 rounded-full transition-colors cursor-pointer"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M7.217 10.907a2.25 2.25 0 100 2.186m0-2.186c.18.324.283.696.283 1.093s-.103.77-.283 1.093m0-2.186l9.566-5.314m-9.566 7.5l9.566 5.314m0 0a2.25 2.25 0 103.935 2.186 2.25 2.25 0 00-3.935-2.186zm0-12.814a2.25 2.25 0 103.933-2.185 2.25 2.25 0 00-3.933 2.185z" />
              </svg>
              Share Score Card
            </motion.button>
          </div>
        </BlurFade>

        {/* Footer */}
        <p className="text-[10px] text-center text-muted-foreground mt-8 pb-6">
          {eventName} · {eventDate}
        </p>
      </div>
    </div>
  );
}

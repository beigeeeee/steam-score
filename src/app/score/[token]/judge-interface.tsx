"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { BlurFade } from "@/components/reactbits/blur-fade";
import { SplitText } from "@/components/reactbits/split-text";
import { ShinyText } from "@/components/reactbits/shiny-text";
import { Magnet } from "@/components/reactbits/magnet";
import { CountUp } from "@/components/reactbits/count-up";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { AppHeader } from "@/components/app-header";
import { ParticipantCard } from "@/components/participant-card";
import { ScoreForm } from "@/components/score-form";
import { RubricModal } from "@/components/rubric-modal";
import { useScores } from "@/hooks/use-scores";

interface Event {
  id: string;
  name: string;
  date: string;
  participants: { id: string; name: string; projectTitle: string; grade?: string; type?: string; members?: string[]; table?: number; location?: number }[];
}

export function JudgeInterface({ event }: { event: Event }) {
  const [judgeName, setJudgeName] = useState("");
  const [registered, setRegistered] = useState(false);
  const [rubricAcknowledged, setRubricAcknowledged] = useState(false);
  const [showExitDialog, setShowExitDialog] = useState(false);
  const [selectedParticipant, setSelectedParticipant] = useState<{
    id: string;
    name: string;
    projectTitle: string;
    grade?: string;
    type?: string;
    members?: string[];
  } | null>(null);

  const { scores, error: scoreError } = useScores(event.id);

  useEffect(() => {
    const saved = localStorage.getItem(`judge-${event.id}`);
    if (saved) {
      setJudgeName(saved);
      setRegistered(true);
    }
    const ack = localStorage.getItem(`rubric-ack-${event.id}`);
    if (ack) {
      setRubricAcknowledged(true);
    }
  }, [event.id]);

  function handleRegister(e: React.FormEvent) {
    e.preventDefault();
    if (!judgeName.trim()) return;
    localStorage.setItem(`judge-${event.id}`, judgeName.trim());
    setRegistered(true);
  }

  function handleExit() {
    localStorage.removeItem(`judge-${event.id}`);
    setRegistered(false);
    setJudgeName("");
    setShowExitDialog(false);
  }

  function handleBack() {
    localStorage.removeItem(`judge-${event.id}`);
    setRegistered(false);
  }

  const myScores = scores.filter((s) => s.judgeName.toLowerCase() === judgeName.toLowerCase());
  const scoredIds = new Set(myScores.map((s) => s.participantId));
  const noShowIds = new Set(
    myScores.filter((s) => s.noShow).map((s) => s.participantId)
  );

  const allScored =
    registered &&
    event.participants.length > 0 &&
    event.participants.every((p) => scoredIds.has(p.id));

  const progressPercent =
    event.participants.length > 0
      ? (scoredIds.size / event.participants.length) * 100
      : 0;

  // ── Screen 1: QR Landing / Name Entry ──
  if (!registered) {
    return (
      <div className="min-h-dvh bg-background flex flex-col">
        <AppHeader
          title={event.name}
          backLabel="Close"
          onBack={() => setShowExitDialog(true)}
          transparent
        />

        <div className="flex-1 flex items-center justify-center px-6 pb-6">
          <div className="w-full max-w-sm space-y-8">
            <div className="space-y-3 text-center">
              <h1 className="text-2xl font-bold tracking-tight">
                <ShinyText text="STEM" speed={4} />
                <span className="text-muted-foreground">Score</span>
              </h1>
              <BlurFade delay={0.2}>
                <p className="text-base font-medium">{event.name}</p>
              </BlurFade>
            </div>

            {/* Microscope icon with pulse animation */}
            <BlurFade delay={0.3}>
              <div className="text-center space-y-1">
                <motion.div
                  className="w-40 h-40 rounded-full bg-primary/10 flex items-center justify-center mx-auto"
                  animate={{ boxShadow: ["0 0 0 0px rgba(16,185,129,0.15)", "0 0 0 12px rgba(16,185,129,0)", "0 0 0 0px rgba(16,185,129,0.15)"] }}
                  transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
                >
                  <svg className="w-20 h-20" viewBox="0 0 48 48" fill="none">
                    <rect x="19.5" y="3" width="9" height="3.5" rx="1.75" fill="#94a3b8" stroke="#1e293b" strokeWidth="1.2" />
                    <rect x="21" y="3.8" width="6" height="1.8" rx="0.9" fill="#cbd5e1" />
                    <rect x="21" y="6.5" width="6" height="16" rx="1.2" fill="#b0bec5" stroke="#1e293b" strokeWidth="1.2" />
                    <rect x="22" y="7" width="2" height="15" rx="0.8" fill="#e2e8f0" opacity="0.5" />
                    <rect x="20.5" y="13" width="7" height="1.5" rx="0.5" fill="#78909c" stroke="#1e293b" strokeWidth="0.8" />
                    <path d="M21.5 16 C19 19, 16.5 23, 15.5 27 C14.5 31, 14.5 33.5, 14.5 36" stroke="#1e293b" strokeWidth="1.5" strokeLinecap="round" fill="none" />
                    <path d="M22.5 16 C20 19, 17.5 23, 16.5 27 C15.5 31, 15.5 33.5, 15.5 36" stroke="none" fill="#94a3b8" opacity="0.4" />
                    <rect x="19" y="22" width="10" height="2.5" rx="1.25" fill="#78909c" stroke="#1e293b" strokeWidth="1.1" />
                    <rect x="22" y="24.5" width="4" height="6" rx="1" fill="#93c5fd" stroke="#1e293b" strokeWidth="1.1" />
                    <rect x="23" y="25" width="1" height="5" rx="0.5" fill="#bfdbfe" opacity="0.6" />
                    <circle cx="24" cy="32" r="2.8" fill="#60a5fa" stroke="#1e293b" strokeWidth="1.1" />
                    <circle cx="24" cy="32" r="1.5" fill="#3b82f6" opacity="0.6" />
                    <circle cx="23.2" cy="31.2" r="0.6" fill="white" opacity="0.5" />
                    <ellipse cx="13.5" cy="26" rx="3.2" ry="2.5" fill="#b0bec5" stroke="#1e293b" strokeWidth="1.1" />
                    <ellipse cx="13.5" cy="26" rx="1.8" ry="1.2" fill="#90a4ae" />
                    <line x1="11.5" y1="25.5" x2="11.5" y2="26.5" stroke="#78909c" strokeWidth="0.6" />
                    <line x1="12.5" y1="25" x2="12.5" y2="27" stroke="#78909c" strokeWidth="0.6" />
                    <ellipse cx="14" cy="31.5" rx="2" ry="1.5" fill="#b0bec5" stroke="#1e293b" strokeWidth="1" />
                    <ellipse cx="14" cy="31.5" rx="1" ry="0.7" fill="#90a4ae" />
                    <rect x="8" y="35" width="26" height="3" rx="1" fill="#cfd8dc" stroke="#1e293b" strokeWidth="1.2" />
                    <rect x="9" y="35.5" width="24" height="1" rx="0.5" fill="#e2e8f0" opacity="0.4" />
                    <path d="M12 33.5 L12 39.5" stroke="#1e293b" strokeWidth="1.5" strokeLinecap="round" />
                    <path d="M30 33.5 L30 39.5" stroke="#1e293b" strokeWidth="1.5" strokeLinecap="round" />
                    <line x1="10.5" y1="33.5" x2="13.5" y2="33.5" stroke="#1e293b" strokeWidth="1.2" strokeLinecap="round" />
                    <line x1="28.5" y1="33.5" x2="31.5" y2="33.5" stroke="#1e293b" strokeWidth="1.2" strokeLinecap="round" />
                    <rect x="18" y="35.3" width="6" height="2.4" rx="0.3" fill="#dbeafe" stroke="#93c5fd" strokeWidth="0.5" opacity="0.7" />
                    <rect x="13" y="38" width="4.5" height="5.5" rx="0.8" fill="#90a4ae" stroke="#1e293b" strokeWidth="1.1" />
                    <rect x="14" y="38.5" width="1.5" height="4.5" rx="0.5" fill="#b0bec5" opacity="0.5" />
                    <path d="M6 43.5 Q6 42 7.5 42 L34.5 42 Q36 42 36 43.5 L36 45 Q36 46 35 46 L7 46 Q6 46 6 45 Z" fill="#78909c" stroke="#1e293b" strokeWidth="1.2" />
                    <path d="M8 42.5 L34 42.5" stroke="#90a4ae" strokeWidth="0.8" strokeLinecap="round" />
                  </svg>
                </motion.div>
                <p className="text-sm font-medium text-foreground">
                  <SplitText text="Welcome, Judge!" delay={0.5} />
                </p>
                <BlurFade delay={0.8}>
                  <p className="text-xs text-muted-foreground">
                    You&apos;ve been invited to score this event
                  </p>
                </BlurFade>
              </div>
            </BlurFade>

            <BlurFade delay={0.9}>
              <form onSubmit={handleRegister} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="judgeName">Your Name</Label>
                  <Input
                    id="judgeName"
                    placeholder="Enter your full name"
                    value={judgeName}
                    onChange={(e) => setJudgeName(e.target.value)}
                    autoFocus
                    required
                    className="h-11"
                  />
                </div>
                <Magnet strength={0.1}>
                  <Button type="submit" className="w-full h-12 text-base cursor-pointer">
                    Start Scoring →
                  </Button>
                </Magnet>
              </form>
            </BlurFade>

            <BlurFade delay={1.1}>
              <p className="text-xs text-center text-muted-foreground">
                No account needed. Your scores are saved automatically.
              </p>
            </BlurFade>
          </div>
        </div>

        <Dialog open={showExitDialog} onOpenChange={setShowExitDialog}>
          <DialogContent className="max-w-xs">
            <DialogHeader>
              <DialogTitle>Leave scoring?</DialogTitle>
              <DialogDescription>
                Are you sure you want to exit? You can always come back by scanning the QR code again.
              </DialogDescription>
            </DialogHeader>
            <div className="flex gap-2 pt-2">
              <Button variant="destructive" onClick={handleExit} className="flex-1 cursor-pointer">
                Exit
              </Button>
              <Button variant="outline" onClick={() => setShowExitDialog(false)} className="flex-1 cursor-pointer">
                Cancel
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    );
  }

  // ── Completion State ──
  if (allScored) {
    return (
      <div className="min-h-dvh bg-background flex flex-col">
        <AppHeader
          title="Complete"
          backLabel="Done"
          onBack={handleBack}
        />
        <div className="flex-1 flex items-center justify-center px-6 pb-6">
          <div className="text-center space-y-5">
            {/* Animated confetti burst */}
            <div className="relative">
              <motion.div
                className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center mx-auto"
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", stiffness: 200, damping: 12 }}
              >
                <svg className="w-10 h-10 text-primary" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                  <motion.path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                    initial={{ pathLength: 0 }}
                    animate={{ pathLength: 1 }}
                    transition={{ duration: 0.6, delay: 0.3 }}
                  />
                </svg>
              </motion.div>
              {/* Sparkle particles */}
              {[...Array(6)].map((_, i) => (
                <motion.div
                  key={i}
                  className="absolute w-1.5 h-1.5 rounded-full bg-primary/60"
                  style={{ left: "50%", top: "50%" }}
                  initial={{ x: 0, y: 0, opacity: 1, scale: 1 }}
                  animate={{
                    x: Math.cos(i * 60 * Math.PI / 180) * 50,
                    y: Math.sin(i * 60 * Math.PI / 180) * 50,
                    opacity: 0,
                    scale: 0,
                  }}
                  transition={{ duration: 0.8, delay: 0.5, ease: "easeOut" }}
                />
              ))}
            </div>

            <BlurFade delay={0.4}>
              <h2 className="text-xl font-semibold">
                <SplitText text="All scored!" delay={0.5} className="text-xl font-semibold" />
              </h2>
            </BlurFade>
            <BlurFade delay={0.8}>
              <p className="text-muted-foreground text-sm max-w-[240px] mx-auto">
                Thank you, {judgeName}. You&apos;ve scored all{" "}
                {event.participants.length} participants.
              </p>
            </BlurFade>
          </div>
        </div>
      </div>
    );
  }

  // ── Rubric acknowledgment (first time only) ──
  if (!rubricAcknowledged) {
    return (
      <RubricModal
        eventId={event.id}
        onAcknowledge={() => setRubricAcknowledged(true)}
      />
    );
  }

  // ── Screen 2: Participant List ──
  return (
    <div className="min-h-dvh bg-background flex flex-col">
      <AppHeader
        title={event.name}
        backLabel="Back"
        onBack={handleBack}
        rightAction={
          <span className="text-xs text-muted-foreground tabular-nums">
            {scoredIds.size}/{event.participants.length}
          </span>
        }
      />

      <div className="flex-1 p-5 max-w-md mx-auto w-full">
        <BlurFade delay={0.05}>
          <div className="space-y-0.5 mb-4">
            <h2 className="text-lg font-semibold leading-tight">
              Hi, {judgeName} 👋
            </h2>
          </div>
        </BlurFade>

        {/* Animated score counter */}
        <BlurFade delay={0.1}>
          <div className="flex items-center gap-3 mb-5">
            <div className="flex-1">
              <div className="flex items-baseline gap-1">
                <span className="text-2xl font-bold tabular-nums text-primary">
                  <CountUp value={scoredIds.size} duration={0.6} decimals={0} />
                </span>
                <span className="text-sm text-muted-foreground">
                  of {event.participants.length} scored
                </span>
              </div>
              {/* Progress bar with spring animation */}
              <div className="h-2 bg-muted rounded-full mt-2 overflow-hidden">
                <motion.div
                  className="h-full bg-primary rounded-full"
                  initial={{ width: 0 }}
                  animate={{ width: `${progressPercent}%` }}
                  transition={{ type: "spring", stiffness: 100, damping: 15 }}
                />
              </div>
            </div>
            {/* Percentage badge */}
            <motion.div
              key={scoredIds.size}
              initial={{ scale: 1.4 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", stiffness: 300, damping: 15 }}
              className="text-xs font-semibold text-primary bg-primary/10 px-2.5 py-1 rounded-full tabular-nums"
            >
              {Math.round(progressPercent)}%
            </motion.div>
          </div>
        </BlurFade>

        {scoreError && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            className="bg-orange-50 text-orange-700 text-sm p-3 rounded-lg mb-4"
          >
            {scoreError}
          </motion.div>
        )}

        {event.participants.length === 0 ? (
          <BlurFade delay={0.2}>
            <div className="text-center py-16">
              <p className="text-sm text-muted-foreground">No participants added yet.</p>
              <p className="text-xs text-muted-foreground mt-1">Check back soon.</p>
            </div>
          </BlurFade>
        ) : (
          <div className="space-y-2">
            <AnimatePresence>
              {event.participants.map((p, i) => (
                <motion.div
                  key={p.id}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.25, delay: 0.15 + i * 0.04 }}
                >
                  <ParticipantCard
                    name={p.name}
                    projectTitle={p.projectTitle}
                    grade={p.grade}
                    type={p.type}
                    members={p.members}
                    table={p.table}
                    location={p.location}
                    scored={scoredIds.has(p.id)}
                    noShow={noShowIds.has(p.id)}
                    onClick={() => setSelectedParticipant(p)}
                  />
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}

        <BlurFade delay={0.15 + event.participants.length * 0.04 + 0.1}>
          <p className="text-xs text-center text-muted-foreground mt-6">
            Tap a participant to score them
          </p>
        </BlurFade>
      </div>

      {selectedParticipant && (
        <ScoreForm
          eventId={event.id}
          participantId={selectedParticipant.id}
          participantName={selectedParticipant.name}
          projectTitle={selectedParticipant.projectTitle}
          judgeName={judgeName}
          open={!!selectedParticipant}
          onClose={() => setSelectedParticipant(null)}
          onScored={() => {}}
        />
      )}
    </div>
  );
}

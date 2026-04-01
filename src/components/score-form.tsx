"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ScoreInput } from "@/components/score-input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { submitScore, markNoShow } from "@/lib/actions/scores";
import { CountUp } from "@/components/reactbits/count-up";
import { Magnet } from "@/components/reactbits/magnet";

interface ScoreFormProps {
  eventId: string;
  participantId: string;
  participantName: string;
  projectTitle: string;
  judgeName: string;
  open: boolean;
  onClose: () => void;
  onScored: () => void;
}

export function ScoreForm({
  eventId,
  participantId,
  participantName,
  projectTitle,
  judgeName,
  open,
  onClose,
  onScored,
}: ScoreFormProps) {
  const [creativity, setCreativity] = useState(3);
  const [thoroughness, setThoroughness] = useState(3);
  const [clarity, setClarity] = useState(3);
  const [studentIndependence, setStudentIndependence] = useState(3);
  const [feedback, setFeedback] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const total = creativity + thoroughness + clarity + studentIndependence;

  function getScoreColor() {
    if (total >= 16) return "text-primary";
    if (total >= 12) return "text-foreground";
    return "text-muted-foreground";
  }

  async function handleSubmit() {
    setSubmitting(true);
    setError(null);

    const result = await submitScore({
      eventId,
      participantId,
      judgeName,
      creativity,
      thoroughness,
      clarity,
      studentIndependence,
      feedback: feedback || undefined,
    });

    setSubmitting(false);

    if (result.error) {
      setError(result.error);
      return;
    }

    setSuccess(true);
    setTimeout(() => {
      setSuccess(false);
      setCreativity(3);
      setThoroughness(3);
      setClarity(3);
      setStudentIndependence(3);
      setFeedback("");
      onScored();
      onClose();
    }, 1500);
  }

  return (
    <Sheet open={open} onOpenChange={(o) => !o && onClose()}>
      <SheetContent
        side="bottom"
        className="h-[85dvh] overflow-y-auto rounded-t-2xl px-5 pb-8"
      >
        <SheetHeader className="pb-2 text-left">
          <SheetTitle className="text-lg leading-tight">
            {participantName}
          </SheetTitle>
          <p className="text-sm text-muted-foreground">{projectTitle}</p>
        </SheetHeader>

        <AnimatePresence mode="wait">
          {success ? (
            <motion.div
              key="success"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              className="flex flex-col items-center justify-center py-16 gap-4"
            >
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", stiffness: 300, damping: 15, delay: 0.1 }}
                className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center"
              >
                <svg
                  className="w-8 h-8 text-primary"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={2.5}
                  stroke="currentColor"
                >
                  <motion.path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M4.5 12.75l6 6 9-13.5"
                    initial={{ pathLength: 0 }}
                    animate={{ pathLength: 1 }}
                    transition={{ duration: 0.4, delay: 0.3 }}
                  />
                </svg>
              </motion.div>
              <motion.p
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="text-lg font-medium"
              >
                Score submitted!
              </motion.p>
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.6 }}
                className="text-sm text-muted-foreground"
              >
                {total}/20
              </motion.p>
            </motion.div>
          ) : (
            <motion.div
              key="form"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="space-y-5 pt-2"
            >
              {/* Category scores with staggered entrance */}
              {[
                { label: "Creativity", value: creativity, set: setCreativity },
                { label: "Thoroughness", value: thoroughness, set: setThoroughness },
                { label: "Clarity", value: clarity, set: setClarity },
                { label: "Student Independence", value: studentIndependence, set: setStudentIndependence },
              ].map((cat, i) => (
                <motion.div
                  key={cat.label}
                  initial={{ opacity: 0, x: -15 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.3, delay: i * 0.08 }}
                >
                  <ScoreInput
                    label={cat.label}
                    value={cat.value}
                    onChange={cat.set}
                  />
                </motion.div>
              ))}

              {/* Feedback */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.35 }}
                className="space-y-2"
              >
                <Label htmlFor="feedback">Feedback (optional)</Label>
                <Textarea
                  id="feedback"
                  placeholder="What stood out? Any suggestions for improvement?"
                  value={feedback}
                  onChange={(e) => setFeedback(e.target.value)}
                  maxLength={500}
                  rows={2}
                  className="resize-none"
                />
                <p className="text-xs text-muted-foreground text-right tabular-nums">
                  {feedback.length}/500
                </p>
              </motion.div>

              {/* Error */}
              <AnimatePresence>
                {error && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    className="bg-destructive/10 text-destructive text-sm p-3 rounded-lg flex items-center justify-between overflow-hidden"
                  >
                    <span>{error}</span>
                    <button
                      onClick={handleSubmit}
                      className="underline font-medium cursor-pointer ml-2 shrink-0"
                    >
                      Try again?
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Total score with animated count */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.4 }}
                className="text-center py-1"
              >
                <motion.span
                  key={total}
                  initial={{ scale: 1.3, color: "hsl(var(--primary))" }}
                  animate={{ scale: 1, color: undefined }}
                  transition={{ type: "spring", stiffness: 400, damping: 15 }}
                  className={`text-2xl font-bold tabular-nums inline-block ${getScoreColor()}`}
                >
                  {total}
                </motion.span>
                <span className="text-sm text-muted-foreground">/20</span>
              </motion.div>

              {/* Submit + No Show */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.45 }}
                className="space-y-3"
              >
                <Magnet strength={0.08}>
                  <Button
                    onClick={handleSubmit}
                    disabled={submitting}
                    className="w-full h-12 text-base cursor-pointer"
                  >
                    {submitting ? (
                      <span className="flex items-center gap-2">
                        <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                        </svg>
                        Submitting...
                      </span>
                    ) : (
                      "Submit Score"
                    )}
                  </Button>
                </Magnet>

                <button
                  type="button"
                  onClick={async () => {
                    setSubmitting(true);
                    setError(null);
                    const result = await markNoShow({ eventId, participantId, judgeName });
                    setSubmitting(false);
                    if (result.error) {
                      setError(result.error);
                      return;
                    }
                    setSuccess(true);
                    setTimeout(() => {
                      setSuccess(false);
                      setCreativity(3);
                      setThoroughness(3);
                      setClarity(3);
                      setStudentIndependence(3);
                      setFeedback("");
                      onScored();
                      onClose();
                    }, 1200);
                  }}
                  disabled={submitting}
                  className="w-full h-10 text-sm font-medium text-orange-600 bg-orange-50 hover:bg-orange-100 rounded-xl transition-colors cursor-pointer disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
                  </svg>
                  Student Not Present (No Show)
                </button>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </SheetContent>
    </Sheet>
  );
}

export interface Score {
  participantId: string;
  judgeName: string;
  creativity: number;
  thoroughness: number;
  clarity: number;
  studentIndependence: number;
  feedback?: string;
  total: number;
  noShow?: boolean;
}

export interface ParticipantScore {
  participantId: string;
  avgCreativity: number;
  avgThoroughness: number;
  avgClarity: number;
  avgStudentIndependence: number;
  avgTotal: number;
  judgeCount: number;
  noShowCount: number;
  ribbon: import("@/lib/schemas").RibbonType;
  feedbacks: { judgeName: string; text: string }[];
}

import { assignRibbon } from "@/lib/schemas";

export function aggregateScores(scores: Score[]): Map<string, ParticipantScore> {
  const byParticipant = new Map<string, Score[]>();

  for (const score of scores) {
    const existing = byParticipant.get(score.participantId) || [];
    existing.push(score);
    byParticipant.set(score.participantId, existing);
  }

  const results = new Map<string, ParticipantScore>();

  for (const [participantId, participantScores] of byParticipant) {
    const noShowCount = participantScores.filter((s) => s.noShow).length;
    const actualScores = participantScores.filter((s) => !s.noShow);
    const n = actualScores.length;

    const sum = (fn: (s: Score) => number) =>
      actualScores.reduce((acc, s) => acc + fn(s), 0);

    const avgTotal = n > 0 ? Math.round((sum((s) => s.total) / n) * 10) / 10 : 0;

    results.set(participantId, {
      participantId,
      avgCreativity: n > 0 ? Math.round((sum((s) => s.creativity) / n) * 10) / 10 : 0,
      avgThoroughness: n > 0 ? Math.round((sum((s) => s.thoroughness) / n) * 10) / 10 : 0,
      avgClarity: n > 0 ? Math.round((sum((s) => s.clarity) / n) * 10) / 10 : 0,
      avgStudentIndependence: n > 0 ? Math.round((sum((s) => s.studentIndependence) / n) * 10) / 10 : 0,
      avgTotal,
      judgeCount: participantScores.length,
      noShowCount,
      ribbon: assignRibbon(avgTotal),
      feedbacks: actualScores
        .filter((s) => s.feedback && s.feedback.trim().length > 0)
        .map((s) => ({ judgeName: s.judgeName, text: s.feedback! })),
    });
  }

  return results;
}

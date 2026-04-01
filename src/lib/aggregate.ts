export interface Score {
  participantId: string;
  judgeName: string;
  creativity: number;
  scientificMethod: number;
  presentation: number;
  impact: number;
  feedback?: string;
  total: number;
}

export interface ParticipantScore {
  participantId: string;
  avgCreativity: number;
  avgScientificMethod: number;
  avgPresentation: number;
  avgImpact: number;
  avgTotal: number;
  judgeCount: number;
  feedbacks: { judgeName: string; text: string }[];
}

export function aggregateScores(scores: Score[]): Map<string, ParticipantScore> {
  const byParticipant = new Map<string, Score[]>();

  for (const score of scores) {
    const existing = byParticipant.get(score.participantId) || [];
    existing.push(score);
    byParticipant.set(score.participantId, existing);
  }

  const results = new Map<string, ParticipantScore>();

  for (const [participantId, participantScores] of byParticipant) {
    const n = participantScores.length;
    const sum = (fn: (s: Score) => number) =>
      participantScores.reduce((acc, s) => acc + fn(s), 0);

    results.set(participantId, {
      participantId,
      avgCreativity: Math.round((sum((s) => s.creativity) / n) * 10) / 10,
      avgScientificMethod:
        Math.round((sum((s) => s.scientificMethod) / n) * 10) / 10,
      avgPresentation: Math.round((sum((s) => s.presentation) / n) * 10) / 10,
      avgImpact: Math.round((sum((s) => s.impact) / n) * 10) / 10,
      avgTotal: Math.round((sum((s) => s.total) / n) * 10) / 10,
      judgeCount: n,
      feedbacks: participantScores
        .filter((s) => s.feedback && s.feedback.trim().length > 0)
        .map((s) => ({ judgeName: s.judgeName, text: s.feedback! })),
    });
  }

  return results;
}

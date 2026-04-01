"use server";

import { adminDb } from "@/lib/firebase-admin";
import { scoreSchema } from "@/lib/schemas";

export async function submitScore(data: {
  eventId: string;
  participantId: string;
  judgeName: string;
  creativity: number;
  scientificMethod: number;
  presentation: number;
  impact: number;
  feedback?: string;
}) {
  const parsed = scoreSchema.safeParse(data);
  if (!parsed.success) {
    return { error: parsed.error.message };
  }

  const { participantId, judgeName, creativity, scientificMethod, presentation, impact, feedback } = parsed.data;
  const total = creativity + scientificMethod + presentation + impact;

  // Composite doc ID prevents duplicate scores from same judge
  const scoreId = `${judgeName.toLowerCase().replace(/\s+/g, "-")}_${participantId}`;

  await adminDb
    .collection("events")
    .doc(data.eventId)
    .collection("scores")
    .doc(scoreId)
    .set({
      participantId,
      judgeName,
      creativity,
      scientificMethod,
      presentation,
      impact,
      feedback: feedback || "",
      total,
      submittedAt: new Date().toISOString(),
    });

  return { success: true };
}

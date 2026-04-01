"use server";

import { adminDb } from "@/lib/firebase-admin";
import { scoreSchema } from "@/lib/schemas";

export async function submitScore(data: {
  eventId: string;
  participantId: string;
  judgeName: string;
  creativity: number;
  thoroughness: number;
  clarity: number;
  studentIndependence: number;
  feedback?: string;
}) {
  const parsed = scoreSchema.safeParse(data);
  if (!parsed.success) {
    return { error: parsed.error.message };
  }

  const { participantId, judgeName, creativity, thoroughness, clarity, studentIndependence, feedback } = parsed.data;
  const total = creativity + thoroughness + clarity + studentIndependence;

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
      thoroughness,
      clarity,
      studentIndependence,
      feedback: feedback || "",
      total,
      submittedAt: new Date().toISOString(),
    });

  return { success: true };
}

export async function markNoShow(data: {
  eventId: string;
  participantId: string;
  judgeName: string;
}): Promise<{ success?: boolean; error?: string }> {
  try {
    const { eventId, participantId, judgeName } = data;

    const scoreId = `${judgeName.toLowerCase().replace(/\s+/g, "-")}_${participantId}`;

    await adminDb
      .collection("events")
      .doc(eventId)
      .collection("scores")
      .doc(scoreId)
      .set({
        participantId,
        judgeName,
        creativity: 0,
        thoroughness: 0,
        clarity: 0,
        studentIndependence: 0,
        feedback: "",
        total: 0,
        noShow: true,
        submittedAt: new Date().toISOString(),
      });

    return { success: true };
  } catch {
    return { error: "Failed to mark no show" };
  }
}

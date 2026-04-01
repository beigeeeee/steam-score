"use server";

import { adminDb } from "@/lib/firebase-admin";
import { eventSchema, participantSchema } from "@/lib/schemas";
import { nanoid } from "nanoid";
import { getSessionUid } from "@/lib/actions/auth";

export async function createEvent(formData: FormData) {
  const uid = await getSessionUid();
  if (!uid) return { error: "Not authenticated" };

  const parsed = eventSchema.safeParse({
    name: formData.get("name"),
    date: formData.get("date"),
  });

  if (!parsed.success) {
    return { error: parsed.error.message };
  }

  const qrToken = nanoid(8);
  const eventRef = adminDb.collection("events").doc();

  await eventRef.set({
    name: parsed.data.name,
    date: parsed.data.date,
    status: "active",
    qrToken,
    adminUid: uid,
    leaderboardMode: "live",
    createdAt: new Date().toISOString(),
  });

  return { id: eventRef.id, qrToken };
}

export async function addParticipant(eventId: string, formData: FormData) {
  const uid = await getSessionUid();
  if (!uid) return { error: "Not authenticated" };

  const membersRaw = formData.get("members") as string | null;
  const members = membersRaw
    ? membersRaw.split(",").map((m) => m.trim()).filter(Boolean)
    : [];
  const type = members.length > 0 ? "team" : ((formData.get("type") as string) || "individual");

  const parsed = participantSchema.safeParse({
    name: formData.get("name"),
    projectTitle: formData.get("projectTitle"),
    grade: formData.get("grade") || "",
    type,
    members,
    parentEmail: formData.get("parentEmail") || "",
    needsOutlet: formData.get("needsOutlet") === "true",
    projectCategory: formData.get("projectCategory") || "",
    table: formData.get("table") ? Number(formData.get("table")) : undefined,
    location: formData.get("location") ? Number(formData.get("location")) : undefined,
  });

  if (!parsed.success) {
    return { error: parsed.error.message };
  }

  if (parsed.data.type === "team" && parsed.data.members && parsed.data.members.length > 4) {
    return { error: "A team can have no more than 4 members" };
  }

  const participantRef = adminDb
    .collection("events")
    .doc(eventId)
    .collection("participants")
    .doc();

  await participantRef.set({
    name: parsed.data.name,
    projectTitle: parsed.data.projectTitle,
    grade: parsed.data.grade || "",
    type: parsed.data.type,
    members: parsed.data.members || [],
    parentEmail: parsed.data.parentEmail || "",
    needsOutlet: parsed.data.needsOutlet || false,
    projectCategory: parsed.data.projectCategory || "",
    table: parsed.data.table || null,
    location: parsed.data.location || null,
    createdAt: new Date().toISOString(),
  });

  return { id: participantRef.id };
}

export async function deleteParticipant(eventId: string, participantId: string) {
  const uid = await getSessionUid();
  if (!uid) return { error: "Not authenticated" };

  await adminDb
    .collection("events")
    .doc(eventId)
    .collection("participants")
    .doc(participantId)
    .delete();

  return { success: true };
}

export async function deleteEvent(eventId: string) {
  const uid = await getSessionUid();
  if (!uid) return { error: "Not authenticated" };

  const eventRef = adminDb.collection("events").doc(eventId);

  // Delete subcollections first (Firestore doesn't cascade)
  const [participants, scores] = await Promise.all([
    eventRef.collection("participants").get(),
    eventRef.collection("scores").get(),
  ]);

  const batch = adminDb.batch();
  participants.docs.forEach((doc) => batch.delete(doc.ref));
  scores.docs.forEach((doc) => batch.delete(doc.ref));
  batch.delete(eventRef);
  await batch.commit();

  return { success: true };
}

export async function updateLeaderboardMode(
  eventId: string,
  mode: "hidden" | "live" | "revealed"
) {
  const uid = await getSessionUid();
  if (!uid) return { error: "Not authenticated" };

  await adminDb.collection("events").doc(eventId).update({
    leaderboardMode: mode,
  });

  return { success: true };
}

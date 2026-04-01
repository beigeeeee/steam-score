import { adminDb } from "@/lib/firebase-admin";
import { notFound } from "next/navigation";
import { aggregateScores, type Score } from "@/lib/aggregate";
import { ScoreCardView } from "./score-card-view";

interface Props {
  params: Promise<{ eventId: string; participantId: string }>;
}

export default async function ScoreCardPage({ params }: Props) {
  const { eventId, participantId } = await params;

  const [eventDoc, participantDoc, scoresSnap] = await Promise.all([
    adminDb.collection("events").doc(eventId).get(),
    adminDb
      .collection("events")
      .doc(eventId)
      .collection("participants")
      .doc(participantId)
      .get(),
    adminDb
      .collection("events")
      .doc(eventId)
      .collection("scores")
      .where("participantId", "==", participantId)
      .get(),
  ]);

  if (!eventDoc.exists || !participantDoc.exists) notFound();

  const event = eventDoc.data()!;
  const participant = participantDoc.data()!;
  const scores = scoresSnap.docs.map((d) => d.data() as Score);
  const aggregated = aggregateScores(scores);
  const stats = aggregated.get(participantId);

  return (
    <ScoreCardView
      eventName={event.name as string}
      eventDate={event.date as string}
      participantName={participant.name as string}
      projectTitle={participant.projectTitle as string}
      stats={
        stats
          ? {
              avgCreativity: stats.avgCreativity,
              avgScientificMethod: stats.avgScientificMethod,
              avgPresentation: stats.avgPresentation,
              avgImpact: stats.avgImpact,
              avgTotal: stats.avgTotal,
              judgeCount: stats.judgeCount,
              feedbacks: stats.feedbacks,
            }
          : null
      }
    />
  );
}

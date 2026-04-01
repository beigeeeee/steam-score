import { adminDb } from "@/lib/firebase-admin";
import { notFound } from "next/navigation";
import { LeaderboardView } from "./leaderboard-view";

interface Props {
  params: Promise<{ id: string }>;
}

export default async function LeaderboardPage({ params }: Props) {
  const { id } = await params;
  const doc = await adminDb.collection("events").doc(id).get();
  if (!doc.exists) notFound();

  const data = doc.data()!;

  const participantsSnap = await adminDb
    .collection("events")
    .doc(id)
    .collection("participants")
    .get();

  const participants = Object.fromEntries(
    participantsSnap.docs.map((p) => [
      p.id,
      p.data() as { name: string; projectTitle: string; grade?: string; location?: number; table?: number },
    ])
  );

  return (
    <LeaderboardView
      eventId={id}
      eventName={data.name as string}
      leaderboardMode={data.leaderboardMode as string}
      participants={participants}
    />
  );
}

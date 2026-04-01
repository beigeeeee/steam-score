import { adminDb } from "@/lib/firebase-admin";
import { JudgeInterface } from "./judge-interface";

interface Props {
  params: Promise<{ token: string }>;
}

async function getEventByToken(token: string) {
  const snapshot = await adminDb
    .collection("events")
    .where("qrToken", "==", token)
    .limit(1)
    .get();

  if (snapshot.empty) return null;

  const doc = snapshot.docs[0];
  const data = doc.data();

  const participantsSnapshot = await adminDb
    .collection("events")
    .doc(doc.id)
    .collection("participants")
    .orderBy("createdAt")
    .get();

  const participants = participantsSnapshot.docs.map((p) => ({
    id: p.id,
    ...p.data(),
  })) as { id: string; name: string; projectTitle: string; grade?: string; type?: string; members?: string[]; table?: number; location?: number }[];

  return {
    id: doc.id,
    name: data.name as string,
    date: data.date as string,
    participants,
  };
}

export default async function ScorePage({ params }: Props) {
  const { token } = await params;
  const event = await getEventByToken(token);

  if (!event) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6">
        <div className="text-center space-y-3">
          <div className="text-4xl">🔍</div>
          <h1 className="text-xl font-semibold">Event not found</h1>
          <p className="text-muted-foreground">
            Check your QR code and try again.
          </p>
        </div>
      </div>
    );
  }

  return <JudgeInterface event={event} />;
}

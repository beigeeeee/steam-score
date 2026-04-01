import { adminDb } from "@/lib/firebase-admin";
import { notFound } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { AppHeader } from "@/components/app-header";
import { EventManager } from "./event-manager";

interface Props {
  params: Promise<{ id: string }>;
}

async function getEvent(id: string) {
  const doc = await adminDb.collection("events").doc(id).get();
  if (!doc.exists) return null;

  const data = doc.data()!;

  const participantsSnap = await adminDb
    .collection("events")
    .doc(id)
    .collection("participants")
    .orderBy("createdAt")
    .get();

  const participants = participantsSnap.docs.map((p) => ({
    id: p.id,
    ...(p.data() as {
      name: string;
      projectTitle: string;
      grade?: string;
      type?: string;
      members?: string[];
      parentEmail?: string;
      needsOutlet?: boolean;
      projectCategory?: string;
      table?: number;
      location?: number;
    }),
  }));

  const scoresSnap = await adminDb
    .collection("events")
    .doc(id)
    .collection("scores")
    .get();

  const judgeNames = new Set(
    scoresSnap.docs.map((d) => d.data().judgeName as string)
  );

  return {
    id: doc.id,
    name: data.name as string,
    date: data.date as string,
    qrToken: data.qrToken as string,
    status: data.status as string,
    participants,
    scoreCount: scoresSnap.size,
    judgeCount: judgeNames.size,
  };
}

export default async function EventPage({ params }: Props) {
  const { id } = await params;
  const event = await getEvent(id);
  if (!event) notFound();

  return (
    <div className="min-h-dvh bg-background flex flex-col">
      <AppHeader
        title={event.name}
        backLabel="Events"
        backHref="/admin/dashboard"
      />

      <div className="flex-1 p-5 max-w-3xl mx-auto w-full">
        {/* Stats */}
        <div className="mb-5">
          <p className="text-sm text-muted-foreground">
            <span className="tabular-nums">{event.participants.length}</span>{" "}
            participants ·{" "}
            <span className="tabular-nums">{event.judgeCount}</span> judges ·{" "}
            <span className="tabular-nums">{event.scoreCount}</span> scores
          </p>
        </div>

        {/* Action buttons - matches wireframe */}
        <div className="flex gap-2 mb-8">
          <Link href={`/admin/event/${event.id}/qr`} className="flex-1">
            <Button variant="outline" className="w-full cursor-pointer">
              <svg
                className="w-4 h-4 mr-2"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={1.5}
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M3.75 4.875c0-.621.504-1.125 1.125-1.125h4.5c.621 0 1.125.504 1.125 1.125v4.5c0 .621-.504 1.125-1.125 1.125h-4.5A1.125 1.125 0 013.75 9.375v-4.5zM3.75 14.625c0-.621.504-1.125 1.125-1.125h4.5c.621 0 1.125.504 1.125 1.125v4.5c0 .621-.504 1.125-1.125 1.125h-4.5a1.125 1.125 0 01-1.125-1.125v-4.5zM13.5 4.875c0-.621.504-1.125 1.125-1.125h4.5c.621 0 1.125.504 1.125 1.125v4.5c0 .621-.504 1.125-1.125 1.125h-4.5A1.125 1.125 0 0113.5 9.375v-4.5z"
                />
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M6.75 6.75h.75v.75h-.75v-.75zM6.75 16.5h.75v.75h-.75v-.75zM16.5 6.75h.75v.75h-.75v-.75zM13.5 13.5h.75v.75h-.75v-.75zM13.5 19.5h.75v.75h-.75v-.75zM19.5 13.5h.75v.75h-.75v-.75zM19.5 19.5h.75v.75h-.75v-.75zM16.5 16.5h.75v.75h-.75v-.75z"
                />
              </svg>
              Print QR Sheet
            </Button>
          </Link>
          <Link
            href={`/event/${event.id}/leaderboard`}
            target="_blank"
            className="flex-1"
          >
            <Button variant="outline" className="w-full cursor-pointer">
              <svg
                className="w-4 h-4 mr-2"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={1.5}
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z"
                />
              </svg>
              Leaderboard ↗
            </Button>
          </Link>
        </div>

        <EventManager
          eventId={event.id}
          initialParticipants={event.participants}
        />
      </div>
    </div>
  );
}

import { adminDb } from "@/lib/firebase-admin";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { clearSession, getSessionUid } from "@/lib/actions/auth";
import { redirect } from "next/navigation";
import { DashboardClient } from "./dashboard-client";
import { AppHeader } from "@/components/app-header";

async function getAdminEvents() {
  const uid = await getSessionUid();
  if (!uid) return [];

  const isEmulator = process.env.NEXT_PUBLIC_USE_EMULATOR === "true";
  const query = isEmulator
    ? adminDb.collection("events").orderBy("createdAt", "desc")
    : adminDb
        .collection("events")
        .where("adminUid", "==", uid)
        .orderBy("createdAt", "desc");

  const snapshot = await query.get();

  const events = [];
  for (const doc of snapshot.docs) {
    const data = doc.data();
    const scoresSnap = await adminDb
      .collection("events")
      .doc(doc.id)
      .collection("scores")
      .get();
    const participantsSnap = await adminDb
      .collection("events")
      .doc(doc.id)
      .collection("participants")
      .get();

    events.push({
      id: doc.id,
      name: data.name as string,
      date: data.date as string,
      status: data.status as string,
      qrToken: data.qrToken as string,
      participantCount: participantsSnap.size,
      scoreCount: scoresSnap.size,
    });
  }
  return events;
}

export default async function DashboardPage() {
  const events = await getAdminEvents();

  async function handleLogout() {
    "use server";
    await clearSession();
    redirect("/admin/login");
  }

  return (
    <div className="min-h-dvh bg-background flex flex-col">
      <AppHeader
        title="STEMScore"
        subtitle="Admin Dashboard"
        rightAction={
          <form action={handleLogout}>
            <button
              type="submit"
              className="text-sm text-primary font-medium cursor-pointer px-1 py-1 rounded-md hover:bg-primary/5 transition-colors"
            >
              Log out
            </button>
          </form>
        }
      />

      <div className="flex-1 p-5 max-w-3xl mx-auto w-full">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-semibold">Events</h2>
          <Link href="/admin/event/new">
            <Button size="sm" className="cursor-pointer">+ New Event</Button>
          </Link>
        </div>

        <DashboardClient events={events} />
      </div>
    </div>
  );
}

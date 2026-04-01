import { adminDb } from "@/lib/firebase-admin";
import { notFound } from "next/navigation";
import { QRSheet } from "./qr-sheet";

interface Props {
  params: Promise<{ id: string }>;
}

export default async function QRPage({ params }: Props) {
  const { id } = await params;
  const doc = await adminDb.collection("events").doc(id).get();
  if (!doc.exists) notFound();

  const data = doc.data()!;

  return (
    <QRSheet
      eventName={data.name as string}
      qrToken={data.qrToken as string}
      eventId={id}
    />
  );
}

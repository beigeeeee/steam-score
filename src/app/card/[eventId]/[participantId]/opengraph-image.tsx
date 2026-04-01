import { ImageResponse } from "next/og";
import { adminDb } from "@/lib/firebase-admin";
import { aggregateScores, type Score } from "@/lib/aggregate";

export const runtime = "nodejs";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function OGImage({
  params,
}: {
  params: Promise<{ eventId: string; participantId: string }>;
}) {
  const { eventId, participantId } = await params;

  const [eventDoc, participantDoc, scoresSnap] = await Promise.all([
    adminDb.collection("events").doc(eventId).get(),
    adminDb.collection("events").doc(eventId).collection("participants").doc(participantId).get(),
    adminDb.collection("events").doc(eventId).collection("scores").where("participantId", "==", participantId).get(),
  ]);

  const event = eventDoc.data();
  const participant = participantDoc.data();
  const scores = scoresSnap.docs.map((d) => d.data() as Score);
  const aggregated = aggregateScores(scores);
  const stats = aggregated.get(participantId);

  const name = participant?.name || "Participant";
  const project = participant?.projectTitle || "";
  const eventName = event?.name || "STEM Competition";

  const categories = [
    { label: "Creativity", value: stats?.avgCreativity ?? 0 },
    { label: "Thoroughness", value: stats?.avgThoroughness ?? 0 },
    { label: "Clarity", value: stats?.avgClarity ?? 0 },
    { label: "Independence", value: stats?.avgStudentIndependence ?? 0 },
  ];

  return new ImageResponse(
    (
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          width: "100%",
          height: "100%",
          backgroundColor: "#fafafa",
          padding: "60px",
          fontFamily: "system-ui, sans-serif",
        }}
      >
        <div style={{ fontSize: 20, color: "#888", marginBottom: 8 }}>
          {eventName}
        </div>
        <div style={{ fontSize: 48, fontWeight: 700, marginBottom: 4 }}>
          {name}
        </div>
        <div style={{ fontSize: 24, color: "#666", marginBottom: 48 }}>
          {project}
        </div>

        <div
          style={{
            display: "flex",
            gap: "40px",
            marginBottom: 48,
          }}
        >
          {categories.map((cat) => (
            <div
              key={cat.label}
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
              }}
            >
              <div style={{ fontSize: 40, fontWeight: 700 }}>
                {cat.value.toFixed(1)}
              </div>
              <div style={{ fontSize: 16, color: "#888" }}>{cat.label}</div>
            </div>
          ))}
        </div>

        <div style={{ display: "flex", alignItems: "baseline", gap: "4px" }}>
          <span style={{ fontSize: 64, fontWeight: 700 }}>
            {stats?.avgTotal.toFixed(1) ?? "0.0"}
          </span>
          <span style={{ fontSize: 28, color: "#888" }}>/20</span>
        </div>

        <div style={{ fontSize: 14, color: "#aaa", marginTop: 40 }}>
          STEMScore
        </div>
      </div>
    ),
    { ...size }
  );
}

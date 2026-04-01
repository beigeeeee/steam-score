/**
 * Seed script for Firebase Emulator
 * Run: npx tsx scripts/seed.ts
 */

import { initializeApp } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";
import { getAuth } from "firebase-admin/auth";

process.env.FIRESTORE_EMULATOR_HOST = "127.0.0.1:8080";
process.env.FIREBASE_AUTH_EMULATOR_HOST = "127.0.0.1:9099";

const app = initializeApp({ projectId: "demo-project" });
const db = getFirestore(app);
const auth = getAuth(app);

async function seed() {
  console.log("Seeding Firebase Emulator...\n");

  // Create admin user
  let adminUser;
  try {
    adminUser = await auth.createUser({
      email: "admin@stemscore.app",
      password: "password123",
      displayName: "Admin",
    });
    console.log("✓ Created admin user: admin@stemscore.app / password123");
  } catch {
    adminUser = await auth.getUserByEmail("admin@stemscore.app");
    console.log("✓ Admin user already exists");
  }

  // Create event
  const eventRef = db.collection("events").doc("event-1");
  await eventRef.set({
    name: "Spring Science Fair 2026",
    date: "2026-04-15",
    status: "active",
    qrToken: "fair2026",
    adminUid: adminUser.uid,
    leaderboardMode: "live",
    createdAt: new Date().toISOString(),
  });
  console.log("✓ Created event: Spring Science Fair 2026 (token: fair2026)");

  // Create participants (mix of teams and individuals)
  const participants = [
    { id: "p1", name: "Team Rocket", projectTitle: "Volcano Simulation", grade: "6th", type: "team", members: ["James P.", "Jessie M.", "Meowth T."] },
    { id: "p2", name: "Solar Sisters", projectTitle: "Solar Panel Optimizer", grade: "8th", type: "team", members: ["Lily Chen", "Maya Patel"] },
    { id: "p3", name: "Code Wizards", projectTitle: "AI Plant Doctor", grade: "7th", type: "team", members: ["Alex Kim", "Jordan Lee", "Sam Rivera"] },
    { id: "p4", name: "Sarah Johnson", projectTitle: "Water Filtration System", grade: "6th", type: "individual", members: [] },
    { id: "p5", name: "Marcus Wright", projectTitle: "Mars Rover Model", grade: "8th", type: "individual", members: [] },
  ];

  for (const p of participants) {
    await eventRef.collection("participants").doc(p.id).set({
      name: p.name,
      projectTitle: p.projectTitle,
      grade: p.grade,
      type: p.type,
      members: p.members,
      createdAt: new Date().toISOString(),
    });
  }
  console.log(`✓ Created ${participants.length} participants`);

  // Create scores from 3 judges
  // Categories: [creativity, thoroughness, clarity, studentIndependence] (1-5 scale)
  const judges = ["Dr. Martinez", "Prof. Chen", "Ms. Johnson"];
  const scoreData: Record<string, number[][]> = {
    p1: [[4, 3, 5, 4], [3, 4, 4, 3], [5, 3, 4, 4]],
    p2: [[5, 4, 4, 4], [4, 5, 5, 4], [4, 4, 5, 4]],
    p3: [[5, 5, 4, 5], [5, 5, 4, 4], [5, 4, 5, 5]],
    p4: [[4, 4, 3, 5], [3, 4, 4, 4], [4, 5, 4, 5]],
    p5: [[3, 4, 4, 3], [4, 3, 4, 4], [4, 4, 3, 4]],
  };

  const feedbacks: Record<string, string[]> = {
    p1: [
      "Great visual presentation of volcanic activity.",
      "Good data collection methodology.",
      "Consider adding more quantitative analysis.",
    ],
    p2: [
      "Impressive solar tracking algorithms.",
      "Excellent use of real-world data.",
      "Could test with different weather conditions.",
    ],
    p3: [
      "Outstanding machine learning application!",
      "Very practical and useful tool.",
      "Best project in the fair.",
    ],
    p4: [
      "Good engineering approach to filtration.",
      "Well-documented testing process.",
      "Consider scalability for larger systems.",
    ],
    p5: [
      "Creative design, well executed.",
      "Good understanding of Mars terrain.",
      "Add more autonomous features.",
    ],
  };

  let scoreCount = 0;
  for (const [participantId, scores] of Object.entries(scoreData)) {
    for (let j = 0; j < judges.length; j++) {
      const [creativity, thoroughness, clarity, studentIndependence] = scores[j];
      const total = creativity + thoroughness + clarity + studentIndependence;
      const scoreId = `${judges[j].toLowerCase().replace(/\s+/g, "-")}_${participantId}`;

      await eventRef.collection("scores").doc(scoreId).set({
        participantId,
        judgeName: judges[j],
        creativity,
        thoroughness,
        clarity,
        studentIndependence,
        feedback: feedbacks[participantId][j],
        total,
        submittedAt: new Date().toISOString(),
      });
      scoreCount++;
    }
  }
  console.log(`✓ Created ${scoreCount} scores from ${judges.length} judges`);

  console.log("\n✅ Seed complete!");
  console.log("   Admin login: admin@stemscore.app / password123");
  console.log("   Judge URL:   http://localhost:3000/score/fair2026");
  console.log("   Emulator UI: http://localhost:4000");
}

seed().catch(console.error);

"use client";

import { useEffect, useState } from "react";
import {
  collection,
  onSnapshot,
  query,
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import type { Score } from "@/lib/aggregate";

export function useScores(eventId: string) {
  const [scores, setScores] = useState<Score[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!eventId) return;

    const q = query(collection(db, "events", eventId, "scores"));

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const data = snapshot.docs.map((doc) => ({
          ...(doc.data() as Score),
        }));
        setScores(data);
        setLoading(false);
        setError(null);
      },
      (err) => {
        console.error("Score subscription error:", err);
        setError("Connection lost. Scores may be stale.");
        setLoading(false);
      }
    );

    return unsubscribe;
  }, [eventId]);

  return { scores, loading, error };
}

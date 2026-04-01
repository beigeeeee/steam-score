import { describe, it, expect } from "vitest";
import { aggregateScores, type Score } from "@/lib/aggregate";

function makeScore(overrides: Partial<Score> = {}): Score {
  return {
    participantId: "p1",
    judgeName: "Judge A",
    creativity: 4,
    thoroughness: 3,
    clarity: 5,
    studentIndependence: 4,
    total: 16,
    feedback: "Good work",
    ...overrides,
  };
}

describe("aggregateScores", () => {
  it("computes correct averages for multiple judges", () => {
    const scores: Score[] = [
      makeScore({ judgeName: "A", creativity: 4, thoroughness: 3, clarity: 5, studentIndependence: 4, total: 16 }),
      makeScore({ judgeName: "B", creativity: 2, thoroughness: 4, clarity: 3, studentIndependence: 3, total: 12 }),
    ];

    const result = aggregateScores(scores);
    const p1 = result.get("p1")!;

    expect(p1.avgCreativity).toBe(3);
    expect(p1.avgThoroughness).toBe(3.5);
    expect(p1.avgClarity).toBe(4);
    expect(p1.avgStudentIndependence).toBe(3.5);
    expect(p1.avgTotal).toBe(14);
    expect(p1.judgeCount).toBe(2);
  });

  it("returns empty map for empty scores", () => {
    const result = aggregateScores([]);
    expect(result.size).toBe(0);
  });

  it("returns raw scores when single judge", () => {
    const scores: Score[] = [
      makeScore({ creativity: 5, thoroughness: 4, clarity: 3, studentIndependence: 2, total: 14 }),
    ];

    const result = aggregateScores(scores);
    const p1 = result.get("p1")!;

    expect(p1.avgCreativity).toBe(5);
    expect(p1.avgThoroughness).toBe(4);
    expect(p1.avgClarity).toBe(3);
    expect(p1.avgStudentIndependence).toBe(2);
    expect(p1.judgeCount).toBe(1);
  });

  it("groups by participantId", () => {
    const scores: Score[] = [
      makeScore({ participantId: "p1", judgeName: "A", total: 16 }),
      makeScore({ participantId: "p2", judgeName: "A", creativity: 3, total: 14 }),
      makeScore({ participantId: "p1", judgeName: "B", total: 16 }),
    ];

    const result = aggregateScores(scores);
    expect(result.size).toBe(2);
    expect(result.get("p1")!.judgeCount).toBe(2);
    expect(result.get("p2")!.judgeCount).toBe(1);
  });

  it("collects feedbacks from judges", () => {
    const scores: Score[] = [
      makeScore({ judgeName: "A", feedback: "Great" }),
      makeScore({ judgeName: "B", feedback: "" }),
      makeScore({ judgeName: "C", feedback: "Needs work" }),
    ];

    const result = aggregateScores(scores);
    const feedbacks = result.get("p1")!.feedbacks;

    expect(feedbacks).toHaveLength(2);
    expect(feedbacks[0]).toEqual({ judgeName: "A", text: "Great" });
    expect(feedbacks[1]).toEqual({ judgeName: "C", text: "Needs work" });
  });
});

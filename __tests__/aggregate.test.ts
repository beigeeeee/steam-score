import { describe, it, expect } from "vitest";
import { aggregateScores, type Score } from "@/lib/aggregate";

function makeScore(overrides: Partial<Score> = {}): Score {
  return {
    participantId: "p1",
    judgeName: "Judge A",
    creativity: 8,
    scientificMethod: 7,
    presentation: 9,
    impact: 8,
    total: 32,
    feedback: "Good work",
    ...overrides,
  };
}

describe("aggregateScores", () => {
  it("computes correct averages for multiple judges", () => {
    const scores: Score[] = [
      makeScore({ judgeName: "A", creativity: 8, scientificMethod: 6, presentation: 10, impact: 8, total: 32 }),
      makeScore({ judgeName: "B", creativity: 6, scientificMethod: 8, presentation: 8, impact: 6, total: 28 }),
    ];

    const result = aggregateScores(scores);
    const p1 = result.get("p1")!;

    expect(p1.avgCreativity).toBe(7);
    expect(p1.avgScientificMethod).toBe(7);
    expect(p1.avgPresentation).toBe(9);
    expect(p1.avgImpact).toBe(7);
    expect(p1.avgTotal).toBe(30);
    expect(p1.judgeCount).toBe(2);
  });

  it("returns empty map for empty scores", () => {
    const result = aggregateScores([]);
    expect(result.size).toBe(0);
  });

  it("returns raw scores when single judge", () => {
    const scores: Score[] = [
      makeScore({ creativity: 9, scientificMethod: 8, presentation: 7, impact: 6, total: 30 }),
    ];

    const result = aggregateScores(scores);
    const p1 = result.get("p1")!;

    expect(p1.avgCreativity).toBe(9);
    expect(p1.avgScientificMethod).toBe(8);
    expect(p1.avgPresentation).toBe(7);
    expect(p1.avgImpact).toBe(6);
    expect(p1.judgeCount).toBe(1);
  });

  it("groups by participantId", () => {
    const scores: Score[] = [
      makeScore({ participantId: "p1", judgeName: "A", total: 32 }),
      makeScore({ participantId: "p2", judgeName: "A", creativity: 6, total: 28 }),
      makeScore({ participantId: "p1", judgeName: "B", total: 32 }),
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

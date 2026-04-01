import { describe, it, expect } from "vitest";
import { scoreSchema, eventSchema, participantSchema, getScoreLevel } from "@/lib/schemas";

describe("scoreSchema", () => {
  const validScore = {
    participantId: "p1",
    judgeName: "Dr. Martinez",
    creativity: 4,
    thoroughness: 3,
    clarity: 5,
    studentIndependence: 4,
    feedback: "Great work!",
  };

  it("accepts valid input", () => {
    const result = scoreSchema.safeParse(validScore);
    expect(result.success).toBe(true);
  });

  it("accepts boundary value 1", () => {
    const result = scoreSchema.safeParse({ ...validScore, creativity: 1 });
    expect(result.success).toBe(true);
  });

  it("accepts boundary value 5", () => {
    const result = scoreSchema.safeParse({ ...validScore, creativity: 5 });
    expect(result.success).toBe(true);
  });

  it("rejects score of 0", () => {
    const result = scoreSchema.safeParse({ ...validScore, creativity: 0 });
    expect(result.success).toBe(false);
  });

  it("rejects score of 6", () => {
    const result = scoreSchema.safeParse({ ...validScore, creativity: 6 });
    expect(result.success).toBe(false);
  });

  it("rejects missing judgeName", () => {
    const { judgeName: _, ...rest } = validScore;
    const result = scoreSchema.safeParse(rest);
    expect(result.success).toBe(false);
  });

  it("rejects empty judgeName", () => {
    const result = scoreSchema.safeParse({ ...validScore, judgeName: "" });
    expect(result.success).toBe(false);
  });

  it("rejects missing participantId", () => {
    const { participantId: _, ...rest } = validScore;
    const result = scoreSchema.safeParse(rest);
    expect(result.success).toBe(false);
  });

  it("rejects feedback over 500 chars", () => {
    const result = scoreSchema.safeParse({
      ...validScore,
      feedback: "x".repeat(501),
    });
    expect(result.success).toBe(false);
  });

  it("accepts empty feedback", () => {
    const result = scoreSchema.safeParse({ ...validScore, feedback: "" });
    expect(result.success).toBe(true);
  });

  it("accepts missing feedback (defaults to empty)", () => {
    const { feedback: _, ...rest } = validScore;
    const result = scoreSchema.safeParse(rest);
    expect(result.success).toBe(true);
  });
});

describe("getScoreLevel", () => {
  it("returns Developing for 1", () => {
    expect(getScoreLevel(1)).toBe("Developing");
  });

  it("returns Developing for 2", () => {
    expect(getScoreLevel(2)).toBe("Developing");
  });

  it("returns Competent for 3", () => {
    expect(getScoreLevel(3)).toBe("Competent");
  });

  it("returns Advanced for 4", () => {
    expect(getScoreLevel(4)).toBe("Advanced");
  });

  it("returns Advanced for 5", () => {
    expect(getScoreLevel(5)).toBe("Advanced");
  });
});

describe("eventSchema", () => {
  it("accepts valid input", () => {
    const result = eventSchema.safeParse({
      name: "Spring Science Fair",
      date: "2026-04-15",
    });
    expect(result.success).toBe(true);
  });

  it("rejects missing name", () => {
    const result = eventSchema.safeParse({ name: "", date: "2026-04-15" });
    expect(result.success).toBe(false);
  });

  it("rejects missing date", () => {
    const result = eventSchema.safeParse({ name: "Test", date: "" });
    expect(result.success).toBe(false);
  });
});

describe("participantSchema", () => {
  it("accepts valid input", () => {
    const result = participantSchema.safeParse({
      name: "Team Rocket",
      projectTitle: "Volcano Sim",
    });
    expect(result.success).toBe(true);
  });

  it("rejects missing name", () => {
    const result = participantSchema.safeParse({
      name: "",
      projectTitle: "Test",
    });
    expect(result.success).toBe(false);
  });
});

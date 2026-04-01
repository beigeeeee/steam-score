import { describe, it, expect } from "vitest";
import { scoreSchema, eventSchema, participantSchema } from "@/lib/schemas";

describe("scoreSchema", () => {
  const validScore = {
    participantId: "p1",
    judgeName: "Dr. Martinez",
    creativity: 8,
    scientificMethod: 7,
    presentation: 9,
    impact: 8,
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

  it("accepts boundary value 10", () => {
    const result = scoreSchema.safeParse({ ...validScore, creativity: 10 });
    expect(result.success).toBe(true);
  });

  it("rejects score of 0", () => {
    const result = scoreSchema.safeParse({ ...validScore, creativity: 0 });
    expect(result.success).toBe(false);
  });

  it("rejects score of 11", () => {
    const result = scoreSchema.safeParse({ ...validScore, creativity: 11 });
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

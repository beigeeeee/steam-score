import { z } from "zod";

export const scoreSchema = z.object({
  participantId: z.string().min(1, "Participant is required"),
  judgeName: z.string().min(1, "Judge name is required").max(100),
  creativity: z.number().int().min(1).max(5),
  thoroughness: z.number().int().min(1).max(5),
  clarity: z.number().int().min(1).max(5),
  studentIndependence: z.number().int().min(1).max(5),
  feedback: z.string().max(500).optional().default(""),
});

// Score level labels
export const SCORE_LEVELS = {
  1: "Developing",
  2: "Developing",
  3: "Competent",
  4: "Advanced",
  5: "Advanced",
} as const;

export function getScoreLevel(score: number): string {
  return SCORE_LEVELS[score as keyof typeof SCORE_LEVELS] || "";
}


// Ribbon types based on total score (out of 20)
// Outstanding: 16-20, Achievement: 9-15, Participation: 1-8
export const RIBBONS = {
  outstanding: { label: "Outstanding", emoji: "🏆", range: "16 – 20", color: "text-yellow-600", bg: "bg-yellow-50", border: "border-yellow-200" },
  achievement: { label: "Achievement", emoji: "⭐", range: "9 – 15", color: "text-blue-600", bg: "bg-blue-50", border: "border-blue-200" },
  participation: { label: "Participation", emoji: "🎗️", range: "1 – 8", color: "text-emerald-600", bg: "bg-emerald-50", border: "border-emerald-200" },
} as const;

export type RibbonType = keyof typeof RIBBONS;

export function assignRibbon(avgTotal: number): RibbonType {
  if (avgTotal >= 16) return "outstanding";
  if (avgTotal >= 9) return "achievement";
  return "participation";
}

// Scoring rubric for judge acknowledgment
export const SCORING_RUBRIC = {
  categories: [
    {
      name: "Creativity",
      advanced: "New concept beyond student grade; Used kit in a novel, innovative way; Combined 2 different concepts to show new idea",
      competent: "Concept at grade level standard demonstration; If kit is used it is used as a starting point",
      developing: "Concept below student grade level; Only demonstrated what kit has",
    },
    {
      name: "Thoroughness",
      advanced: "Explanation is thorough: Science - Most details of scientific method included; Technology - Algorithm/Flowchart/Design included; Engineering - Design included and basic principle explained; Math - Basic principle well explained with examples/diagrams",
      competent: "Some explanation provided; Science - Important parts included (hypothesis, observation, conclusion); Technology - Basic algorithm explained; Engineering - Basic design explained; Math - Basic principle explained",
      developing: "Very little explanation; Science - Important parts missing; Technology - Basic algorithm/design missing; Engineering - Design missing/very little details; Math - Basic principle not mentioned",
    },
    {
      name: "Clarity",
      advanced: "Visually appealing trifold and very clear demonstration; Well performed experiment/properly running code/well functioning device/interesting game",
      competent: "Clear trifold/presentation; Clear experiment and results/code that runs/completely built device/working game",
      developing: "Basic presentation with few details; Incomplete experiment/code that doesn't run/incomplete device/unclear game",
    },
    {
      name: "Student Independence",
      advanced: "Very clear presentation showing students understand their project and underlying concepts; Can answer most detailed questions well",
      competent: "Clear presentation and some understanding of concepts; Can answer some detailed questions",
      developing: "Students don't know the problem/project clearly and cannot answer questions other than very basic ones",
    },
  ],
  scale: {
    advanced: "4 or 5",
    competent: "3",
    developing: "1 or 2",
  },
} as const;

export const eventSchema = z.object({
  name: z.string().min(1, "Event name is required").max(200),
  date: z.string().min(1, "Date is required"),
});

export const participantSchema = z.object({
  name: z.string().min(1, "Name is required").max(200),
  projectTitle: z.string().max(300).optional().default(""),
  grade: z.string().max(20).optional().default(""),
  type: z.enum(["individual", "team"]).default("individual"),
  members: z.array(z.string().max(100)).max(4).optional().default([]),
  parentEmail: z.string().email("Invalid email").optional().or(z.literal("")),
  needsOutlet: z.boolean().optional().default(false),
  projectCategory: z.string().max(100).optional().default(""),
  table: z.number().int().min(0).optional(),
  location: z.number().int().min(0).optional(),
});

export type ScoreInput = z.infer<typeof scoreSchema>;
export type EventInput = z.infer<typeof eventSchema>;
export type ParticipantInput = z.infer<typeof participantSchema>;

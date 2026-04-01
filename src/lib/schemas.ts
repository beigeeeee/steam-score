import { z } from "zod";

export const scoreSchema = z.object({
  participantId: z.string().min(1, "Participant is required"),
  judgeName: z.string().min(1, "Judge name is required").max(100),
  creativity: z.number().int().min(1).max(10),
  scientificMethod: z.number().int().min(1).max(10),
  presentation: z.number().int().min(1).max(10),
  impact: z.number().int().min(1).max(10),
  feedback: z.string().max(500).optional().default(""),
});

export const eventSchema = z.object({
  name: z.string().min(1, "Event name is required").max(200),
  date: z.string().min(1, "Date is required"),
});

export const participantSchema = z.object({
  name: z.string().min(1, "Name is required").max(200),
  projectTitle: z.string().min(1, "Project title is required").max(300),
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

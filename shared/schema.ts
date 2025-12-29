import { sql } from "drizzle-orm";
import { pgTable, text, varchar, integer, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const submissionCategories = ["need", "offer", "idea"] as const;
export type SubmissionCategory = typeof submissionCategories[number];

export const submissionStatuses = ["open", "in_progress", "resolved", "matched"] as const;
export type SubmissionStatus = typeof submissionStatuses[number];

export const neighborhoods = [
  "Downtown",
  "North Side",
  "South Side", 
  "East End",
  "West End",
  "Midtown",
  "Riverside",
  "Hillcrest",
  "Oakwood",
  "Greenfield",
] as const;
export type Neighborhood = typeof neighborhoods[number];

export const submissions = pgTable("submissions", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  category: text("category").notNull().$type<SubmissionCategory>(),
  status: text("status").notNull().$type<SubmissionStatus>().default("open"),
  title: text("title").notNull(),
  description: text("description").notNull(),
  neighborhood: text("neighborhood").$type<Neighborhood>(),
  contactName: text("contact_name"),
  contactEmail: text("contact_email"),
  hoursOffered: integer("hours_offered"),
  matchedWithId: varchar("matched_with_id"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const insertSubmissionSchema = createInsertSchema(submissions).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
  matchedWithId: true,
}).extend({
  category: z.enum(submissionCategories),
  status: z.enum(submissionStatuses).optional().default("open"),
  title: z.string().min(3, "Title must be at least 3 characters"),
  description: z.string().min(10, "Description must be at least 10 characters"),
  neighborhood: z.enum(neighborhoods).optional(),
  contactEmail: z.string().email("Invalid email").optional().or(z.literal("")),
  hoursOffered: z.number().min(1).max(1000).optional(),
});

export const updateSubmissionSchema = z.object({
  status: z.enum(submissionStatuses).optional(),
  title: z.string().min(3).optional(),
  description: z.string().min(10).optional(),
  neighborhood: z.enum(neighborhoods).optional().nullable(),
  contactName: z.string().optional().nullable(),
  contactEmail: z.string().email().optional().or(z.literal("")).nullable(),
  hoursOffered: z.number().min(1).max(1000).optional().nullable(),
  matchedWithId: z.string().optional().nullable(),
});

export type InsertSubmission = z.infer<typeof insertSubmissionSchema>;
export type UpdateSubmission = z.infer<typeof updateSubmissionSchema>;
export type Submission = typeof submissions.$inferSelect;

export interface DashboardStats {
  totalParticipants: number;
  totalNeedsReported: number;
  totalVolunteersOffered: number;
  totalIdeasShared: number;
  totalHoursOffered: number;
  estimatedCitizenHours: number;
  resolvedCount: number;
  matchedCount: number;
}

export interface MatchSuggestion {
  need: Submission;
  offers: Submission[];
}

export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

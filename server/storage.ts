import { 
  type User, 
  type InsertUser, 
  type Submission, 
  type InsertSubmission,
  type UpdateSubmission,
  type DashboardStats,
  type MatchSuggestion,
  submissions,
  users
} from "@shared/schema";
import { db } from "./db";
import { eq, desc, and, ne, isNull, sql } from "drizzle-orm";
import { randomUUID } from "crypto";

export interface IStorage {
  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  getSubmissions(filters?: { category?: string; neighborhood?: string; status?: string }): Promise<Submission[]>;
  getSubmissionById(id: string): Promise<Submission | undefined>;
  createSubmission(submission: InsertSubmission): Promise<Submission>;
  updateSubmission(id: string, data: UpdateSubmission): Promise<Submission | undefined>;
  getStats(): Promise<DashboardStats>;
  getMatchSuggestions(): Promise<MatchSuggestion[]>;
}

export class DatabaseStorage implements IStorage {
  async getUser(id: string): Promise<User | undefined> {
    const result = await db.select().from(users).where(eq(users.id, id));
    return result[0];
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const result = await db.select().from(users).where(eq(users.username, username));
    return result[0];
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const result = await db.insert(users).values(insertUser).returning();
    return result[0];
  }

  async getSubmissions(filters?: { category?: string; neighborhood?: string; status?: string }): Promise<Submission[]> {
    const conditions = [];
    if (filters?.category) {
      conditions.push(sql`${submissions.category} = ${filters.category}`);
    }
    if (filters?.neighborhood) {
      conditions.push(sql`${submissions.neighborhood} = ${filters.neighborhood}`);
    }
    if (filters?.status) {
      conditions.push(sql`${submissions.status} = ${filters.status}`);
    }
    
    if (conditions.length > 0) {
      return db.select().from(submissions)
        .where(and(...conditions))
        .orderBy(desc(submissions.createdAt));
    }
    
    return db.select().from(submissions).orderBy(desc(submissions.createdAt));
  }

  async getSubmissionById(id: string): Promise<Submission | undefined> {
    const result = await db.select().from(submissions).where(eq(submissions.id, id));
    return result[0];
  }

  async createSubmission(insertSubmission: InsertSubmission): Promise<Submission> {
    const result = await db.insert(submissions).values({
      ...insertSubmission,
      status: insertSubmission.status || "open",
      contactName: insertSubmission.contactName || null,
      contactEmail: insertSubmission.contactEmail || null,
      neighborhood: insertSubmission.neighborhood || null,
      hoursOffered: insertSubmission.hoursOffered || null,
    }).returning();
    return result[0];
  }

  async updateSubmission(id: string, data: UpdateSubmission): Promise<Submission | undefined> {
    const updateData: Record<string, unknown> = { updatedAt: new Date() };
    
    if (data.status !== undefined) updateData.status = data.status;
    if (data.title !== undefined) updateData.title = data.title;
    if (data.description !== undefined) updateData.description = data.description;
    if (data.neighborhood !== undefined) updateData.neighborhood = data.neighborhood;
    if (data.contactName !== undefined) updateData.contactName = data.contactName;
    if (data.contactEmail !== undefined) updateData.contactEmail = data.contactEmail;
    if (data.hoursOffered !== undefined) updateData.hoursOffered = data.hoursOffered;
    if (data.matchedWithId !== undefined) updateData.matchedWithId = data.matchedWithId;

    const result = await db.update(submissions)
      .set(updateData)
      .where(eq(submissions.id, id))
      .returning();
    
    return result[0];
  }

  async getStats(): Promise<DashboardStats> {
    const allSubmissions = await db.select().from(submissions);
    
    const needs = allSubmissions.filter(s => s.category === "need");
    const offers = allSubmissions.filter(s => s.category === "offer");
    const ideas = allSubmissions.filter(s => s.category === "idea");
    
    const totalHoursOffered = offers.reduce(
      (sum, s) => sum + (s.hoursOffered || 0), 
      0
    );
    
    const uniqueContacts = new Set(
      allSubmissions
        .filter(s => s.contactEmail)
        .map(s => s.contactEmail)
    );
    
    const resolvedCount = allSubmissions.filter(s => s.status === "resolved").length;
    const matchedCount = allSubmissions.filter(s => s.status === "matched").length;
    
    const estimatedCitizenHours = Math.round(
      totalHoursOffered * 0.6 + 
      needs.length * 2 + 
      ideas.length * 0.5 +
      resolvedCount * 3
    );

    return {
      totalParticipants: uniqueContacts.size || allSubmissions.length,
      totalNeedsReported: needs.length,
      totalVolunteersOffered: offers.length,
      totalIdeasShared: ideas.length,
      totalHoursOffered,
      estimatedCitizenHours,
      resolvedCount,
      matchedCount,
    };
  }

  async getMatchSuggestions(): Promise<MatchSuggestion[]> {
    const openNeeds = await db.select().from(submissions)
      .where(and(
        eq(submissions.category, "need"),
        eq(submissions.status, "open"),
        isNull(submissions.matchedWithId)
      ))
      .orderBy(desc(submissions.createdAt));

    const availableOffers = await db.select().from(submissions)
      .where(and(
        eq(submissions.category, "offer"),
        eq(submissions.status, "open"),
        isNull(submissions.matchedWithId)
      ))
      .orderBy(desc(submissions.createdAt));

    const suggestions: MatchSuggestion[] = [];

    for (const need of openNeeds) {
      const matchingOffers = availableOffers.filter(offer => {
        if (need.neighborhood && offer.neighborhood) {
          return need.neighborhood === offer.neighborhood;
        }
        return true;
      }).slice(0, 3);

      if (matchingOffers.length > 0) {
        suggestions.push({ need, offers: matchingOffers });
      }
    }

    return suggestions;
  }
}

export const storage = new DatabaseStorage();

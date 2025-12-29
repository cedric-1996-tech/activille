import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertSubmissionSchema, updateSubmissionSchema } from "@shared/schema";
import { fromZodError } from "zod-validation-error";

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  
  app.get("/api/submissions", async (req, res) => {
    try {
      const { category, neighborhood, status } = req.query;
      const filters: { category?: string; neighborhood?: string; status?: string } = {};
      
      if (typeof category === "string") filters.category = category;
      if (typeof neighborhood === "string") filters.neighborhood = neighborhood;
      if (typeof status === "string") filters.status = status;
      
      const submissions = await storage.getSubmissions(
        Object.keys(filters).length > 0 ? filters : undefined
      );
      res.json(submissions);
    } catch (error) {
      console.error("Error fetching submissions:", error);
      res.status(500).json({ message: "Failed to fetch submissions" });
    }
  });

  app.get("/api/submissions/:id", async (req, res) => {
    try {
      const submission = await storage.getSubmissionById(req.params.id);
      if (!submission) {
        return res.status(404).json({ message: "Submission not found" });
      }
      res.json(submission);
    } catch (error) {
      console.error("Error fetching submission:", error);
      res.status(500).json({ message: "Failed to fetch submission" });
    }
  });

  app.post("/api/submissions", async (req, res) => {
    try {
      const result = insertSubmissionSchema.safeParse(req.body);
      
      if (!result.success) {
        const validationError = fromZodError(result.error);
        return res.status(400).json({ message: validationError.message });
      }

      const submission = await storage.createSubmission(result.data);
      res.status(201).json(submission);
    } catch (error) {
      console.error("Error creating submission:", error);
      res.status(500).json({ message: "Failed to create submission" });
    }
  });

  app.patch("/api/submissions/:id", async (req, res) => {
    try {
      const result = updateSubmissionSchema.safeParse(req.body);
      
      if (!result.success) {
        const validationError = fromZodError(result.error);
        return res.status(400).json({ message: validationError.message });
      }

      const submission = await storage.updateSubmission(req.params.id, result.data);
      if (!submission) {
        return res.status(404).json({ message: "Submission not found" });
      }
      res.json(submission);
    } catch (error) {
      console.error("Error updating submission:", error);
      res.status(500).json({ message: "Failed to update submission" });
    }
  });

  app.post("/api/submissions/:id/match/:offerId", async (req, res) => {
    try {
      const { id: needId, offerId } = req.params;
      
      const need = await storage.getSubmissionById(needId);
      const offer = await storage.getSubmissionById(offerId);
      
      if (!need || !offer) {
        return res.status(404).json({ message: "Submission not found" });
      }
      
      if (need.category !== "need" || offer.category !== "offer") {
        return res.status(400).json({ message: "Can only match a need with an offer" });
      }

      const updatedNeed = await storage.updateSubmission(needId, { 
        status: "matched", 
        matchedWithId: offerId 
      });
      const updatedOffer = await storage.updateSubmission(offerId, { 
        status: "matched", 
        matchedWithId: needId 
      });

      res.json({ need: updatedNeed, offer: updatedOffer });
    } catch (error) {
      console.error("Error matching submissions:", error);
      res.status(500).json({ message: "Failed to match submissions" });
    }
  });

  app.get("/api/stats", async (req, res) => {
    try {
      const stats = await storage.getStats();
      res.json(stats);
    } catch (error) {
      console.error("Error fetching stats:", error);
      res.status(500).json({ message: "Failed to fetch stats" });
    }
  });

  app.get("/api/match-suggestions", async (req, res) => {
    try {
      const suggestions = await storage.getMatchSuggestions();
      res.json(suggestions);
    } catch (error) {
      console.error("Error fetching match suggestions:", error);
      res.status(500).json({ message: "Failed to fetch match suggestions" });
    }
  });

  return httpServer;
}

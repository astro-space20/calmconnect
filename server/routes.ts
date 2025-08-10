import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { 
  insertActivitySchema,
  insertNutritionLogSchema,
  insertSocialExposureSchema,
  insertThoughtJournalSchema,
  insertEmpathyCheckinSchema
} from "@shared/schema";

export async function registerRoutes(app: Express): Promise<Server> {
  const httpServer = createServer(app);

  // Activities
  app.get("/api/activities", async (req, res) => {
    try {
      const userId = req.query.userId as string;
      if (!userId) {
        return res.status(400).json({ message: "User ID is required" });
      }
      const activities = await storage.getActivities(userId);
      res.json(activities);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch activities" });
    }
  });

  app.post("/api/activities", async (req, res) => {
    try {
      const validatedData = insertActivitySchema.parse(req.body);
      const activity = await storage.createActivity(validatedData);
      res.status(201).json(activity);
    } catch (error) {
      res.status(400).json({ message: "Invalid activity data" });
    }
  });

  // Nutrition Logs
  app.get("/api/nutrition-logs", async (req, res) => {
    try {
      const userId = req.query.userId as string;
      if (!userId) {
        return res.status(400).json({ message: "User ID is required" });
      }
      const logs = await storage.getNutritionLogs(userId);
      res.json(logs);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch nutrition logs" });
    }
  });

  app.post("/api/nutrition-logs", async (req, res) => {
    try {
      const validatedData = insertNutritionLogSchema.parse(req.body);
      const log = await storage.createNutritionLog(validatedData);
      res.status(201).json(log);
    } catch (error) {
      res.status(400).json({ message: "Invalid nutrition log data" });
    }
  });

  // Social Exposures
  app.get("/api/social-exposures", async (req, res) => {
    try {
      const userId = req.query.userId as string;
      if (!userId) {
        return res.status(400).json({ message: "User ID is required" });
      }
      const exposures = await storage.getSocialExposures(userId);
      res.json(exposures);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch social exposures" });
    }
  });

  app.post("/api/social-exposures", async (req, res) => {
    try {
      const validatedData = insertSocialExposureSchema.parse(req.body);
      const exposure = await storage.createSocialExposure(validatedData);
      res.status(201).json(exposure);
    } catch (error) {
      res.status(400).json({ message: "Invalid social exposure data" });
    }
  });

  app.patch("/api/social-exposures/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const exposure = await storage.updateSocialExposure(id, req.body);
      if (!exposure) {
        return res.status(404).json({ message: "Social exposure not found" });
      }
      res.json(exposure);
    } catch (error) {
      res.status(400).json({ message: "Failed to update social exposure" });
    }
  });

  // Thought Journals
  app.get("/api/thought-journals", async (req, res) => {
    try {
      const userId = req.query.userId as string;
      if (!userId) {
        return res.status(400).json({ message: "User ID is required" });
      }
      const journals = await storage.getThoughtJournals(userId);
      res.json(journals);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch thought journals" });
    }
  });

  app.post("/api/thought-journals", async (req, res) => {
    try {
      const validatedData = insertThoughtJournalSchema.parse(req.body);
      const journal = await storage.createThoughtJournal(validatedData);
      res.status(201).json(journal);
    } catch (error) {
      res.status(400).json({ message: "Invalid thought journal data" });
    }
  });

  // Empathy Check-ins
  app.get("/api/empathy-checkins", async (req, res) => {
    try {
      const userId = req.query.userId as string;
      if (!userId) {
        return res.status(400).json({ message: "User ID is required" });
      }
      const checkins = await storage.getEmpathyCheckins(userId);
      res.json(checkins);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch empathy check-ins" });
    }
  });

  app.post("/api/empathy-checkins", async (req, res) => {
    try {
      const validatedData = insertEmpathyCheckinSchema.parse(req.body);
      const checkin = await storage.createEmpathyCheckin(validatedData);
      res.status(201).json(checkin);
    } catch (error) {
      res.status(400).json({ message: "Invalid empathy check-in data" });
    }
  });

  return httpServer;
}

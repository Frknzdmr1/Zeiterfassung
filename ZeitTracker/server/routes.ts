import type { Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertTimeEntrySchema } from "@shared/schema";
import { fromZodError } from "zod-validation-error";

export async function registerRoutes(app: Express): Promise<Server> {
  // Get all time entries
  app.get("/api/time-entries", async (req: Request, res: Response) => {
    try {
      const { name, date } = req.query;
      
      let entries;
      if (name && date) {
        entries = await storage.getTimeEntriesByNameAndDate(
          name as string, 
          new Date(date as string)
        );
      } else if (name) {
        entries = await storage.getTimeEntriesByName(name as string);
      } else if (date) {
        entries = await storage.getTimeEntriesByDate(new Date(date as string));
      } else {
        entries = await storage.getAllTimeEntries();
      }
      
      res.json(entries);
    } catch (error) {
      console.error("Error getting time entries:", error);
      res.status(500).json({ message: "Fehler beim Abrufen der Zeiteinträge." });
    }
  });

  // Create a new time entry
  app.post("/api/time-entries", async (req: Request, res: Response) => {
    try {
      // Validate request body
      const validationResult = insertTimeEntrySchema.safeParse(req.body);
      
      if (!validationResult.success) {
        const validationError = fromZodError(validationResult.error);
        return res.status(400).json({ 
          message: "Ungültige Daten. Bitte überprüfen Sie Ihre Eingaben.",
          details: validationError.message
        });
      }
      
      const entry = await storage.createTimeEntry(validationResult.data);
      res.status(201).json(entry);
    } catch (error) {
      console.error("Error creating time entry:", error);
      res.status(500).json({ message: "Fehler beim Erstellen des Zeiteintrags." });
    }
  });

  // Admin login
  app.post("/api/admin/login", async (req: Request, res: Response) => {
    try {
      const { username, password } = req.body;
      
      if (!username || !password) {
        return res.status(400).json({ message: "Benutzername und Passwort sind erforderlich." });
      }
      
      const isValid = await storage.validateAdmin(username, password);
      
      if (isValid) {
        res.json({ success: true, message: "Anmeldung erfolgreich." });
      } else {
        res.status(401).json({ success: false, message: "Ungültige Anmeldedaten." });
      }
    } catch (error) {
      console.error("Error during admin login:", error);
      res.status(500).json({ message: "Fehler bei der Anmeldung." });
    }
  });

  const httpServer = createServer(app);
  
  return httpServer;
}

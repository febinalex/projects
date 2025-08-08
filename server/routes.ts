import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertTheaterSchema, insertReviewSchema, insertScreenSchema } from "@shared/schema";
import { z } from "zod";

export async function registerRoutes(app: Express): Promise<Server> {
  // Get all theaters
  app.get("/api/theaters", async (req, res) => {
    try {
      const theaters = await storage.getTheaters();
      res.json(theaters);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch theaters" });
    }
  });

  // Get theaters by district
  app.get("/api/theaters/district/:district", async (req, res) => {
    try {
      const { district } = req.params;
      const theaters = await storage.getTheatersByDistrict(district);
      res.json(theaters);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch theaters for district" });
    }
  });

  // Get theater by ID
  app.get("/api/theaters/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const theater = await storage.getTheater(id);
      if (!theater) {
        return res.status(404).json({ message: "Theater not found" });
      }
      res.json(theater);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch theater" });
    }
  });

  // Create theater
  app.post("/api/theaters", async (req, res) => {
    try {
      const validatedData = insertTheaterSchema.parse(req.body);
      const theater = await storage.createTheater(validatedData);
      res.status(201).json(theater);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid theater data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create theater" });
    }
  });

  // Get reviews for a theater
  app.get("/api/theaters/:id/reviews", async (req, res) => {
    try {
      const { id } = req.params;
      const reviews = await storage.getReviews(id);
      res.json(reviews);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch reviews" });
    }
  });

  // Create review
  app.post("/api/theaters/:id/reviews", async (req, res) => {
    try {
      const { id } = req.params;
      const reviewData = { ...req.body, theaterId: id };
      const validatedData = insertReviewSchema.parse(reviewData);
      const review = await storage.createReview(validatedData);
      res.status(201).json(review);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid review data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create review" });
    }
  });

  // Get screens for a theater
  app.get("/api/theaters/:id/screens", async (req, res) => {
    try {
      const { id } = req.params;
      const screens = await storage.getScreens(id);
      res.json(screens);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch screens" });
    }
  });

  // Create screen
  app.post("/api/theaters/:id/screens", async (req, res) => {
    try {
      const { id } = req.params;
      const screenData = { ...req.body, theaterId: id };
      const validatedData = insertScreenSchema.parse(screenData);
      const screen = await storage.createScreen(validatedData);
      res.status(201).json(screen);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid screen data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create screen" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}

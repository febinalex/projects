// server/index.ts
import express2 from "express";

// server/routes.ts
import { createServer } from "http";

// server/storage.ts
import { randomUUID } from "crypto";

// server/kml-parser.ts
import { readFileSync } from "fs";
function parseKMLData() {
  const kmlContent = readFileSync("attached_assets/Kerala Theater List.kml_1754654150742.xml", "utf-8");
  const theaters2 = [];
  const placemarkRegex = /<Placemark>(.*?)<\/Placemark>/gs;
  const placemarks = kmlContent.match(placemarkRegex) || [];
  for (const placemark of placemarks) {
    try {
      const theater = parseTheaterFromPlacemark(placemark);
      if (theater) {
        theaters2.push(theater);
      }
    } catch (error) {
      console.error("Error parsing theater:", error);
    }
  }
  return theaters2;
}
function parseTheaterFromPlacemark(placemark) {
  try {
    const nameMatch = placemark.match(/<name>(.*?)<\/name>/s);
    if (!nameMatch) return null;
    const name = nameMatch[1].trim().replace(/\n/g, " ");
    const coordinatesMatch = placemark.match(/<coordinates>\s*([\d.-]+),([\d.-]+),[\d.-]+\s*<\/coordinates>/s);
    if (!coordinatesMatch) return null;
    const longitude = parseFloat(coordinatesMatch[1]);
    const latitude = parseFloat(coordinatesMatch[2]);
    const districtMatch = placemark.match(/<Data name="District">\s*<value>(.*?)<\/value>/s);
    if (!districtMatch) return null;
    const district = districtMatch[1].trim();
    const contactMatch = placemark.match(/<Data name="Contact">\s*<value>(.*?)<\/value>/s);
    const contact = contactMatch ? contactMatch[1].trim() : void 0;
    const websiteMatch = placemark.match(/<Data name="Website">\s*<value>(.*?)<\/value>/s);
    const website = websiteMatch && websiteMatch[1].trim() ? websiteMatch[1].trim() : void 0;
    const bookingMatch = placemark.match(/<Data name="Booking Site">\s*<value>(.*?)<\/value>/s);
    let bookingUrl = void 0;
    if (bookingMatch && bookingMatch[1].trim()) {
      const urlMatch = bookingMatch[1].match(/https?:\/\/[^\s]+/);
      bookingUrl = urlMatch ? urlMatch[0] : void 0;
    }
    const screens2 = [];
    for (let i = 1; i <= 12; i++) {
      const screenMatch = placemark.match(new RegExp(`<Data name="Screen ${i}"[^>]*>\\s*<value>(.*?)<\\/value>`, "s"));
      if (screenMatch && screenMatch[1].trim()) {
        const screenData = parseScreenData(i, screenMatch[1]);
        if (screenData) {
          screens2.push(screenData);
        }
      }
    }
    if (screens2.length === 0) {
      screens2.push({
        screenNumber: 1,
        capacity: 100,
        seatClasses: [{ className: "General", seatCount: 100, price: 100 }]
      });
    }
    return {
      name,
      district,
      contact,
      website,
      bookingUrl,
      latitude,
      longitude,
      screens: screens2
    };
  } catch (error) {
    console.error("Error parsing placemark:", error);
    return null;
  }
}
function parseScreenData(screenNumber, screenText) {
  if (!screenText.trim()) return null;
  const lines = screenText.split("\n").map((line) => line.trim()).filter((line) => line);
  if (lines.length === 0) return null;
  let capacity = 0;
  let screenType;
  const seatClasses = [];
  for (const line of lines) {
    const capacityMatch = line.match(/Capacity\s*:\s*(\d+)/i);
    if (capacityMatch) {
      capacity = parseInt(capacityMatch[1]);
      continue;
    }
    if (line.match(/4K|2K|Atmos|IMAX|Dolby/i) && !line.includes("\u20B9") && !line.includes(":")) {
      screenType = line;
      continue;
    }
    const seatMatch = line.match(/([^:]+)\s*:\s*(\d+)(?:\s*-\s*(\d+))?\s*₹/);
    if (seatMatch) {
      const className = seatMatch[1].trim();
      const seatCount = seatMatch[2] ? parseInt(seatMatch[2]) : 0;
      const price = seatMatch[3] ? parseInt(seatMatch[3]) : seatMatch[2] ? parseInt(seatMatch[2]) : 100;
      seatClasses.push({
        className,
        seatCount: seatCount || Math.floor(capacity * 0.5),
        // Default to half capacity if no count
        price
      });
    }
  }
  if (seatClasses.length === 0 && capacity > 0) {
    seatClasses.push({
      className: "General",
      seatCount: capacity,
      price: 100
    });
  }
  if (capacity > 0 && seatClasses.length > 0) {
    const totalSeats = seatClasses.reduce((sum, cls) => sum + cls.seatCount, 0);
    if (totalSeats !== capacity) {
      const ratio = capacity / totalSeats;
      seatClasses.forEach((cls) => {
        cls.seatCount = Math.round(cls.seatCount * ratio);
      });
    }
  }
  return {
    screenNumber,
    capacity: capacity || seatClasses.reduce((sum, cls) => sum + cls.seatCount, 0),
    screenType,
    seatClasses
  };
}

// server/storage.ts
var MemStorage = class {
  users;
  theaters;
  screens;
  reviews;
  constructor() {
    this.users = /* @__PURE__ */ new Map();
    this.theaters = /* @__PURE__ */ new Map();
    this.screens = /* @__PURE__ */ new Map();
    this.reviews = /* @__PURE__ */ new Map();
    this.loadRealTheaterData();
  }
  loadRealTheaterData() {
    try {
      const theaterDataList = parseKMLData();
      console.log(`Loading ${theaterDataList.length} theaters from KML data...`);
      for (const theaterData of theaterDataList) {
        const theaterId = randomUUID();
        const totalCapacity = theaterData.screens.reduce((sum, screen) => sum + screen.capacity, 0);
        const theater = {
          id: theaterId,
          name: theaterData.name,
          district: theaterData.district,
          contact: theaterData.contact || null,
          website: theaterData.website || null,
          bookingUrl: theaterData.bookingUrl || null,
          totalScreens: theaterData.screens.length,
          totalCapacity,
          latitude: theaterData.latitude,
          longitude: theaterData.longitude,
          description: `${theaterData.name} is located in ${theaterData.district}, Kerala. It features ${theaterData.screens.length} screen${theaterData.screens.length > 1 ? "s" : ""} with a total capacity of ${totalCapacity} seats.`,
          averageRating: Math.round((Math.random() * 2 + 3) * 10) / 10,
          // Random rating between 3-5
          totalReviews: Math.floor(Math.random() * 150) + 10,
          createdAt: /* @__PURE__ */ new Date()
        };
        this.theaters.set(theaterId, theater);
        for (const screenData of theaterData.screens) {
          const screen = {
            id: randomUUID(),
            theaterId,
            screenNumber: screenData.screenNumber,
            capacity: screenData.capacity,
            screenType: screenData.screenType || null,
            seatClasses: screenData.seatClasses
          };
          this.screens.set(screen.id, screen);
        }
      }
      console.log(`Successfully loaded ${this.theaters.size} theaters and ${this.screens.size} screens`);
    } catch (error) {
      console.error("Failed to load real theater data:", error);
      console.log("Loading with sample data as fallback...");
      this.loadSampleData();
    }
  }
  loadSampleData() {
    const sampleTheater = {
      id: randomUUID(),
      name: "Sample Cinema",
      district: "Thiruvananthapuram",
      contact: "0471-SAMPLE",
      website: null,
      bookingUrl: null,
      totalScreens: 1,
      totalCapacity: 200,
      latitude: 8.5241,
      longitude: 76.9366,
      description: "Sample theater for fallback",
      averageRating: 4,
      totalReviews: 25,
      createdAt: /* @__PURE__ */ new Date()
    };
    this.theaters.set(sampleTheater.id, sampleTheater);
  }
  async getUser(id) {
    return this.users.get(id);
  }
  async getUserByUsername(username) {
    return Array.from(this.users.values()).find(
      (user) => user.username === username
    );
  }
  async createUser(insertUser) {
    const id = randomUUID();
    const user = { ...insertUser, id };
    this.users.set(id, user);
    return user;
  }
  async getTheaters() {
    return Array.from(this.theaters.values());
  }
  async getTheatersByDistrict(district) {
    return Array.from(this.theaters.values()).filter(
      (theater) => theater.district.toLowerCase().includes(district.toLowerCase())
    );
  }
  async getTheater(id) {
    return this.theaters.get(id);
  }
  async createTheater(insertTheater) {
    const id = randomUUID();
    const theater = {
      ...insertTheater,
      id,
      averageRating: 0,
      totalReviews: 0,
      createdAt: /* @__PURE__ */ new Date()
    };
    this.theaters.set(id, theater);
    return theater;
  }
  async updateTheater(id, updates) {
    const theater = this.theaters.get(id);
    if (!theater) return void 0;
    const updatedTheater = { ...theater, ...updates };
    this.theaters.set(id, updatedTheater);
    return updatedTheater;
  }
  async getScreens(theaterId) {
    return Array.from(this.screens.values()).filter(
      (screen) => screen.theaterId === theaterId
    );
  }
  async createScreen(insertScreen) {
    const id = randomUUID();
    const screen = { ...insertScreen, id };
    this.screens.set(id, screen);
    return screen;
  }
  async getReviews(theaterId) {
    return Array.from(this.reviews.values()).filter(
      (review) => review.theaterId === theaterId
    );
  }
  async createReview(insertReview) {
    const id = randomUUID();
    const review = {
      ...insertReview,
      id,
      createdAt: /* @__PURE__ */ new Date()
    };
    this.reviews.set(id, review);
    await this.updateTheaterRating(insertReview.theaterId);
    return review;
  }
  async updateTheaterRating(theaterId) {
    const theater = this.theaters.get(theaterId);
    if (!theater) return;
    const reviews2 = await this.getReviews(theaterId);
    if (reviews2.length === 0) return;
    const totalRating = reviews2.reduce((sum, review) => sum + review.rating, 0);
    const averageRating = Math.round(totalRating / reviews2.length * 10) / 10;
    await this.updateTheater(theaterId, {
      averageRating,
      totalReviews: reviews2.length
    });
  }
};
var storage = new MemStorage();

// shared/schema.ts
import { sql } from "drizzle-orm";
import { pgTable, text, varchar, integer, real, timestamp, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
var users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  username: text("username").notNull().unique(),
  password: text("password").notNull()
});
var screens = pgTable("screens", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  theaterId: varchar("theater_id").notNull(),
  screenNumber: integer("screen_number").notNull(),
  capacity: integer("capacity").notNull().default(0),
  screenType: text("screen_type"),
  // "4K Atmos", "2K", etc.
  seatClasses: jsonb("seat_classes").$type().notNull().default([])
});
var theaters = pgTable("theaters", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  district: text("district").notNull(),
  contact: text("contact"),
  website: text("website"),
  bookingUrl: text("booking_url"),
  totalScreens: integer("total_screens").notNull().default(1),
  totalCapacity: integer("total_capacity").notNull().default(0),
  latitude: real("latitude").notNull(),
  longitude: real("longitude").notNull(),
  description: text("description"),
  averageRating: real("average_rating").default(0),
  totalReviews: integer("total_reviews").default(0),
  createdAt: timestamp("created_at").defaultNow()
});
var reviews = pgTable("reviews", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  theaterId: varchar("theater_id").notNull().references(() => theaters.id),
  userId: varchar("user_id").references(() => users.id),
  userName: text("user_name").notNull(),
  rating: integer("rating").notNull(),
  comment: text("comment"),
  createdAt: timestamp("created_at").defaultNow()
});
var insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true
});
var insertTheaterSchema = createInsertSchema(theaters).omit({
  id: true,
  createdAt: true,
  averageRating: true,
  totalReviews: true
});
var insertScreenSchema = createInsertSchema(screens).omit({
  id: true
});
var insertReviewSchema = createInsertSchema(reviews).omit({
  id: true,
  createdAt: true
});

// server/routes.ts
import { z } from "zod";
async function registerRoutes(app2) {
  app2.get("/api/theaters", async (req, res) => {
    try {
      const theaters2 = await storage.getTheaters();
      res.json(theaters2);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch theaters" });
    }
  });
  app2.get("/api/theaters/district/:district", async (req, res) => {
    try {
      const { district } = req.params;
      const theaters2 = await storage.getTheatersByDistrict(district);
      res.json(theaters2);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch theaters for district" });
    }
  });
  app2.get("/api/theaters/:id", async (req, res) => {
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
  app2.post("/api/theaters", async (req, res) => {
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
  app2.get("/api/theaters/:id/reviews", async (req, res) => {
    try {
      const { id } = req.params;
      const reviews2 = await storage.getReviews(id);
      res.json(reviews2);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch reviews" });
    }
  });
  app2.post("/api/theaters/:id/reviews", async (req, res) => {
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
  app2.get("/api/theaters/:id/screens", async (req, res) => {
    try {
      const { id } = req.params;
      const screens2 = await storage.getScreens(id);
      res.json(screens2);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch screens" });
    }
  });
  app2.post("/api/theaters/:id/screens", async (req, res) => {
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
  const httpServer = createServer(app2);
  return httpServer;
}

// server/vite.ts
import express from "express";
import fs from "fs";
import path2 from "path";
import { createServer as createViteServer, createLogger } from "vite";

// vite.config.ts
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";
import runtimeErrorOverlay from "@replit/vite-plugin-runtime-error-modal";
var vite_config_default = defineConfig({
  plugins: [
    react(),
    runtimeErrorOverlay(),
    ...process.env.NODE_ENV !== "production" && process.env.REPL_ID !== void 0 ? [
      await import("@replit/vite-plugin-cartographer").then(
        (m) => m.cartographer()
      )
    ] : []
  ],
  resolve: {
    alias: {
      "@": path.resolve(import.meta.dirname, "client", "src"),
      "@shared": path.resolve(import.meta.dirname, "shared"),
      "@assets": path.resolve(import.meta.dirname, "attached_assets")
    }
  },
  root: path.resolve(import.meta.dirname, "client"),
  build: {
    outDir: path.resolve(import.meta.dirname, "dist/public"),
    emptyOutDir: true
  },
  server: {
    fs: {
      strict: true,
      deny: ["**/.*"]
    }
  }
});

// server/vite.ts
import { nanoid } from "nanoid";
var viteLogger = createLogger();
function log(message, source = "express") {
  const formattedTime = (/* @__PURE__ */ new Date()).toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    second: "2-digit",
    hour12: true
  });
  console.log(`${formattedTime} [${source}] ${message}`);
}
async function setupVite(app2, server) {
  const serverOptions = {
    middlewareMode: true,
    hmr: { server },
    allowedHosts: true
  };
  const vite = await createViteServer({
    ...vite_config_default,
    configFile: false,
    customLogger: {
      ...viteLogger,
      error: (msg, options) => {
        viteLogger.error(msg, options);
        process.exit(1);
      }
    },
    server: serverOptions,
    appType: "custom"
  });
  app2.use(vite.middlewares);
  app2.use("*", async (req, res, next) => {
    const url = req.originalUrl;
    try {
      const clientTemplate = path2.resolve(
        import.meta.dirname,
        "..",
        "client",
        "index.html"
      );
      let template = await fs.promises.readFile(clientTemplate, "utf-8");
      template = template.replace(
        `src="/src/main.tsx"`,
        `src="/src/main.tsx?v=${nanoid()}"`
      );
      const page = await vite.transformIndexHtml(url, template);
      res.status(200).set({ "Content-Type": "text/html" }).end(page);
    } catch (e) {
      vite.ssrFixStacktrace(e);
      next(e);
    }
  });
}
function serveStatic(app2) {
  const distPath = path2.resolve(import.meta.dirname, "public");
  if (!fs.existsSync(distPath)) {
    throw new Error(
      `Could not find the build directory: ${distPath}, make sure to build the client first`
    );
  }
  app2.use(express.static(distPath));
  app2.use("*", (_req, res) => {
    res.sendFile(path2.resolve(distPath, "index.html"));
  });
}

// server/index.ts
var app = express2();
app.use(express2.json());
app.use(express2.urlencoded({ extended: false }));
app.use((req, res, next) => {
  const start = Date.now();
  const path3 = req.path;
  let capturedJsonResponse = void 0;
  const originalResJson = res.json;
  res.json = function(bodyJson, ...args) {
    capturedJsonResponse = bodyJson;
    return originalResJson.apply(res, [bodyJson, ...args]);
  };
  res.on("finish", () => {
    const duration = Date.now() - start;
    if (path3.startsWith("/api")) {
      let logLine = `${req.method} ${path3} ${res.statusCode} in ${duration}ms`;
      if (capturedJsonResponse) {
        logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
      }
      if (logLine.length > 80) {
        logLine = logLine.slice(0, 79) + "\u2026";
      }
      log(logLine);
    }
  });
  next();
});
(async () => {
  const server = await registerRoutes(app);
  app.use((err, _req, res, _next) => {
    const status = err.status || err.statusCode || 500;
    const message = err.message || "Internal Server Error";
    res.status(status).json({ message });
    throw err;
  });
  if (app.get("env") === "development") {
    await setupVite(app, server);
  } else {
    serveStatic(app);
  }
  const port = parseInt(process.env.PORT || "5000", 10);
  server.listen({
    port,
    host: "0.0.0.0",
    reusePort: true
  }, () => {
    log(`serving on port ${port}`);
  });
})();

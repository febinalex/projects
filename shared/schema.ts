import { sql } from "drizzle-orm";
import { pgTable, text, varchar, integer, real, timestamp, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

export const screens = pgTable("screens", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  theaterId: varchar("theater_id").notNull(),
  screenNumber: integer("screen_number").notNull(),
  capacity: integer("capacity").notNull().default(0),
  screenType: text("screen_type"), // "4K Atmos", "2K", etc.
  seatClasses: jsonb("seat_classes").$type<{
    className: string;
    seatCount: number;
    price: number;
  }[]>().notNull().default([]),
});

export const theaters = pgTable("theaters", {
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
  createdAt: timestamp("created_at").defaultNow(),
});

export const reviews = pgTable("reviews", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  theaterId: varchar("theater_id").notNull().references(() => theaters.id),
  userId: varchar("user_id").references(() => users.id),
  userName: text("user_name").notNull(),
  rating: integer("rating").notNull(),
  comment: text("comment"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

export const insertTheaterSchema = createInsertSchema(theaters).omit({
  id: true,
  createdAt: true,
  averageRating: true,
  totalReviews: true,
});

export const insertScreenSchema = createInsertSchema(screens).omit({
  id: true,
});

export const insertReviewSchema = createInsertSchema(reviews).omit({
  id: true,
  createdAt: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;
export type Theater = typeof theaters.$inferSelect;
export type Screen = typeof screens.$inferSelect;
export type InsertTheater = z.infer<typeof insertTheaterSchema>;
export type InsertScreen = z.infer<typeof insertScreenSchema>;
export type Review = typeof reviews.$inferSelect;
export type InsertReview = z.infer<typeof insertReviewSchema>;
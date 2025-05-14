import { pgTable, text, serial, jsonb, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// User schema from original file
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

// SaaS products schema
export const products = pgTable("products", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description").notNull(),
  url: text("url").notNull(),
  founder_twitter: text("founder_twitter").default("").notNull(),
  position: jsonb("position").$type<number[]>().notNull(),
  created_at: timestamp("created_at").defaultNow().notNull()
});

export const insertProductSchema = createInsertSchema(products).pick({
  name: true,
  description: true,
  url: true,
  founder_twitter: true,
  position: true,
});

// Add validation/transformation to ensure founder_twitter is always a string
export const insertProductSchema2 = insertProductSchema.transform((data) => ({
  ...data,
  founder_twitter: data.founder_twitter || ""
}));

export type InsertProduct = z.infer<typeof insertProductSchema>;
export type Product = typeof products.$inferSelect;

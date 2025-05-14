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

// SaaS flags schema
export const flags = pgTable("flags", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description").notNull(),
  url: text("url").notNull(),
  author: text("author").default("").notNull(),
  position: jsonb("position").$type<number[]>().notNull(),
  created_at: timestamp("created_at").defaultNow().notNull()
});

export const insertFlagSchema = createInsertSchema(flags).pick({
  name: true,
  description: true,
  url: true,
  author: true,
  position: true,
});

// Add validation/transformation to ensure author is always a string
export const insertFlagSchema2 = insertFlagSchema.transform((data) => ({
  ...data,
  author: data.author || ""
}));

export type InsertFlag = z.infer<typeof insertFlagSchema>;
export type Flag = typeof flags.$inferSelect;

// For backward compatibility
export const products = flags;
export const insertProductSchema = insertFlagSchema;
export const insertProductSchema2 = insertFlagSchema2;
export type InsertProduct = InsertFlag;
export type Product = Flag;

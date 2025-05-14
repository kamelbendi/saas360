import { 
  users, type User, type InsertUser, 
  flags, type Flag, type InsertFlag,
  products, type Product, type InsertProduct 
} from "@shared/schema";
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import { eq } from "drizzle-orm";

// Initialize database connection
const connectionString = process.env.DATABASE_URL as string;
// For connection pooling with Postgres.js
const queryClient = postgres(connectionString);
export const db = drizzle(queryClient);

// Extended storage interface with flag methods
export interface IStorage {
  // User methods (from original)
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  // Flag methods
  getFlag(id: number): Promise<Flag | undefined>;
  getAllFlags(): Promise<Flag[]>;
  createFlag(flag: InsertFlag): Promise<Flag>;
  deleteFlag(id: number): Promise<boolean>;
  
  // Product methods (for backward compatibility)
  getProduct(id: number): Promise<Product | undefined>;
  getAllProducts(): Promise<Product[]>;
  createProduct(product: InsertProduct): Promise<Product>;
  deleteProduct(id: number): Promise<boolean>;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private userCurrentId: number;

  constructor() {
    this.users = new Map();
    this.userCurrentId = 1;
    // No more in-memory storage for flags - we use the database directly
  }

  // User methods (from original)
  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.userCurrentId++;
    const user: User = { ...insertUser, id };
    this.users.set(id, user);
    return user;
  }
  
  // Flag methods - using database
  async getFlag(id: number): Promise<Flag | undefined> {
    try {
      const results = await db.select().from(flags).where(eq(flags.id, id)).limit(1);
      return results.length > 0 ? results[0] : undefined;
    } catch (error) {
      console.error("Error getting flag from database:", error);
      return undefined;
    }
  }
  
  async getAllFlags(): Promise<Flag[]> {
    try {
      return await db.select().from(flags);
    } catch (error) {
      console.error("Error getting all flags from database:", error);
      return [];
    }
  }
  
  async createFlag(insertFlag: InsertFlag): Promise<Flag> {
    try {
      // Ensure position is a valid array of numbers
      const position = Array.isArray(insertFlag.position) 
        ? [
            Number(insertFlag.position[0] || 0),
            Number(insertFlag.position[1] || 0),
            Number(insertFlag.position[2] || 0)
          ]
        : [0, 0, 0];
      
      // Create flag in database
      const result = await db.insert(flags).values({
        name: insertFlag.name,
        description: insertFlag.description,
        url: insertFlag.url,
        author: insertFlag.author || "",
        position: position,
      }).returning();
      
      if (result.length === 0) {
        throw new Error("Failed to insert flag into database");
      }
      
      return result[0];
    } catch (error) {
      console.error("Error creating flag in database:", error);
      throw error;
    }
  }
  
  async deleteFlag(id: number): Promise<boolean> {
    try {
      const result = await db.delete(flags).where(eq(flags.id, id)).returning();
      return result.length > 0;
    } catch (error) {
      console.error("Error deleting flag from database:", error);
      return false;
    }
  }
  
  // Product methods (for backward compatibility)
  async getProduct(id: number): Promise<Product | undefined> {
    return this.getFlag(id);
  }
  
  async getAllProducts(): Promise<Product[]> {
    return this.getAllFlags();
  }
  
  async createProduct(insertProduct: InsertProduct): Promise<Product> {
    // Create a clean flag object with all the required properties
    const insertFlag: InsertFlag = {
      name: insertProduct.name,
      description: insertProduct.description,
      url: insertProduct.url,
      // Handle founder_twitter correctly
      author: (insertProduct as any).founder_twitter || (insertProduct as any).author || "",
      position: (insertProduct as any).position || [0, 0, 0],
    };
    return this.createFlag(insertFlag);
  }
  
  async deleteProduct(id: number): Promise<boolean> {
    return this.deleteFlag(id);
  }
}

export const storage = new MemStorage();

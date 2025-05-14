import { 
  users, type User, type InsertUser, 
  flags, type Flag, type InsertFlag,
  products, type Product, type InsertProduct 
} from "@shared/schema";

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
  private flags: Map<number, Flag>;
  private userCurrentId: number;
  private flagCurrentId: number;

  constructor() {
    this.users = new Map();
    this.flags = new Map();
    this.userCurrentId = 1;
    this.flagCurrentId = 1;
    
    // Add some initial flags for demonstration
    // We need to initialize asynchronously but can't use async in constructor
    this.initializeData();
  }
  
  private async initializeData() {
    await this.addInitialFlags();
  }
  
  private async addInitialFlags() {
    const demoFlags: InsertFlag[] = [
      {
        name: "CloudSync",
        description: "Team collaboration and file sharing platform",
        url: "https://cloudsync.example.com",
        author: "alexharris",
        position: [5, 0, 3]
      },
      {
        name: "TaskForce",
        description: "Project management and task tracking solution",
        url: "https://taskforce.example.com",
        author: "sarahsmith",
        position: [-4, 0, 7]
      },
      {
        name: "AnalyticsPro",
        description: "Advanced analytics and reporting dashboard",
        url: "https://analyticspro.example.com",
        author: "michaelchen",
        position: [3, 0, -5]
      }
    ];
    
    for (const flag of demoFlags) {
      await this.createFlag(flag);
    }
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
  
  // Flag methods
  async getFlag(id: number): Promise<Flag | undefined> {
    return this.flags.get(id);
  }
  
  async getAllFlags(): Promise<Flag[]> {
    return Array.from(this.flags.values());
  }
  
  async createFlag(insertFlag: InsertFlag): Promise<Flag> {
    const id = this.flagCurrentId++;
    const now = new Date();
    
    // Ensure author has a default value to match the schema
    const flagWithDefaults = {
      ...insertFlag,
      author: insertFlag.author || ""
    };
    
    const flag: Flag = { ...flagWithDefaults, id, created_at: now };
    this.flags.set(id, flag);
    return flag;
  }
  
  async deleteFlag(id: number): Promise<boolean> {
    if (!this.flags.has(id)) {
      return false;
    }
    return this.flags.delete(id);
  }
  
  // Product methods (for backward compatibility)
  async getProduct(id: number): Promise<Product | undefined> {
    return this.getFlag(id);
  }
  
  async getAllProducts(): Promise<Product[]> {
    return this.getAllFlags();
  }
  
  async createProduct(insertProduct: InsertProduct): Promise<Product> {
    // Map founder_twitter to author if needed
    const insertFlag: InsertFlag = {
      ...insertProduct,
      author: (insertProduct as any).founder_twitter || insertProduct.author || ""
    };
    return this.createFlag(insertFlag);
  }
  
  async deleteProduct(id: number): Promise<boolean> {
    return this.deleteFlag(id);
  }
}

export const storage = new MemStorage();

import { users, type User, type InsertUser, products, type Product, type InsertProduct } from "@shared/schema";

// Extended storage interface with product methods
export interface IStorage {
  // User methods (from original)
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  // Product methods
  getProduct(id: number): Promise<Product | undefined>;
  getAllProducts(): Promise<Product[]>;
  createProduct(product: InsertProduct): Promise<Product>;
  deleteProduct(id: number): Promise<boolean>;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private products: Map<number, Product>;
  private userCurrentId: number;
  private productCurrentId: number;

  constructor() {
    this.users = new Map();
    this.products = new Map();
    this.userCurrentId = 1;
    this.productCurrentId = 1;
    
    // Add some initial products for demonstration
    this.addInitialProducts();
  }
  
  private addInitialProducts() {
    const demoProducts = [
      {
        name: "CloudSync",
        description: "Team collaboration and file sharing platform",
        url: "https://cloudsync.example.com",
        founder_twitter: "alexharris",
        position: [5, 0, 3]
      },
      {
        name: "TaskForce",
        description: "Project management and task tracking solution",
        url: "https://taskforce.example.com",
        founder_twitter: "sarahsmith",
        position: [-4, 0, 7]
      },
      {
        name: "AnalyticsPro",
        description: "Advanced analytics and reporting dashboard",
        url: "https://analyticspro.example.com",
        founder_twitter: "michaelchen",
        position: [3, 0, -5]
      }
    ];
    
    demoProducts.forEach(product => {
      this.createProduct(product);
    });
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
  
  // Product methods
  async getProduct(id: number): Promise<Product | undefined> {
    return this.products.get(id);
  }
  
  async getAllProducts(): Promise<Product[]> {
    return Array.from(this.products.values());
  }
  
  async createProduct(insertProduct: InsertProduct): Promise<Product> {
    const id = this.productCurrentId++;
    const now = new Date();
    const product: Product = { ...insertProduct, id, created_at: now };
    this.products.set(id, product);
    return product;
  }
  
  async deleteProduct(id: number): Promise<boolean> {
    if (!this.products.has(id)) {
      return false;
    }
    return this.products.delete(id);
  }
}

export const storage = new MemStorage();

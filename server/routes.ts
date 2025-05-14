import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";

export async function registerRoutes(app: Express): Promise<Server> {
  // API routes for flags
  app.get("/api/flags", async (req, res) => {
    try {
      const flags = await storage.getAllFlags();
      res.json(flags);
    } catch (error) {
      console.error("Error fetching flags:", error);
      res.status(500).json({ message: "Failed to fetch flags" });
    }
  });

  app.get("/api/flags/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid flag ID" });
      }
      
      const flag = await storage.getFlag(id);
      if (!flag) {
        return res.status(404).json({ message: "Flag not found" });
      }
      
      res.json(flag);
    } catch (error) {
      console.error("Error fetching flag:", error);
      res.status(500).json({ message: "Failed to fetch flag" });
    }
  });

  app.post("/api/flags", async (req, res) => {
    try {
      const { name, description, url, author, position } = req.body;
      
      // Basic validation
      if (!name || !description || !url || !position) {
        return res.status(400).json({ message: "Missing required fields" });
      }
      
      const newFlag = await storage.createFlag({
        name,
        description,
        url,
        author: author || "",
        position
      });
      
      res.status(201).json(newFlag);
    } catch (error) {
      console.error("Error creating flag:", error);
      res.status(500).json({ message: "Failed to create flag" });
    }
  });

  app.delete("/api/flags/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid flag ID" });
      }
      
      const deleted = await storage.deleteFlag(id);
      if (!deleted) {
        return res.status(404).json({ message: "Flag not found" });
      }
      
      res.status(204).send();
    } catch (error) {
      console.error("Error deleting flag:", error);
      res.status(500).json({ message: "Failed to delete flag" });
    }
  });
  
  // Keep original product API for backward compatibility
  app.get("/api/products", async (req, res) => {
    try {
      const products = await storage.getAllProducts();
      res.json(products);
    } catch (error) {
      console.error("Error fetching products:", error);
      res.status(500).json({ message: "Failed to fetch products" });
    }
  });

  app.get("/api/products/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid product ID" });
      }
      
      const product = await storage.getProduct(id);
      if (!product) {
        return res.status(404).json({ message: "Product not found" });
      }
      
      res.json(product);
    } catch (error) {
      console.error("Error fetching product:", error);
      res.status(500).json({ message: "Failed to fetch product" });
    }
  });

  app.post("/api/products", async (req, res) => {
    try {
      const { name, description, url, founder_twitter, position } = req.body;
      
      // Basic validation
      if (!name || !description || !url || !position) {
        return res.status(400).json({ message: "Missing required fields" });
      }
      
      const newProduct = await storage.createProduct({
        name,
        description,
        url,
        author: founder_twitter || "",
        position
      });
      
      res.status(201).json(newProduct);
    } catch (error) {
      console.error("Error creating product:", error);
      res.status(500).json({ message: "Failed to create product" });
    }
  });

  app.delete("/api/products/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid product ID" });
      }
      
      const deleted = await storage.deleteProduct(id);
      if (!deleted) {
        return res.status(404).json({ message: "Product not found" });
      }
      
      res.status(204).send();
    } catch (error) {
      console.error("Error deleting product:", error);
      res.status(500).json({ message: "Failed to delete product" });
    }
  });

  // User routes (from original file)
  app.get("/api/users/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid user ID" });
      }
      
      const user = await storage.getUser(id);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      
      // Don't return password in API response
      const { password, ...userWithoutPassword } = user;
      res.json(userWithoutPassword);
    } catch (error) {
      console.error("Error fetching user:", error);
      res.status(500).json({ message: "Failed to fetch user" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}

import { useState, useCallback } from "react";
import { apiRequest } from "../lib/queryClient";
import { toast } from "sonner";
import { SaasProduct } from "../lib/stores/useLunarStore";

export const useSupabaseProducts = () => {
  const [products, setProducts] = useState<SaasProduct[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  
  // Fetch flags from API
  const fetchProducts = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await apiRequest("GET", "/api/flags", undefined);
      const data = await response.json();
      console.log("Fetched flags from API:", data);
      
      // Convert from flags to products if needed
      const formattedProducts = data.map((flag: any) => {
        // Ensure position is an array
        let position = flag.position;
        
        if (!Array.isArray(position)) {
          console.warn(`Flag ${flag.id} position is not an array:`, position);
          
          // Try to parse JSON if it's a string
          if (typeof position === 'string') {
            try {
              position = JSON.parse(position);
              console.log(`Parsed position for flag ${flag.id}:`, position);
            } catch (e) {
              console.error(`Failed to parse position for flag ${flag.id}:`, e);
              position = [0, 0, 0]; // Default position if parsing fails
            }
          } else {
            position = [0, 0, 0]; // Default position if not string or array
          }
        }
        
        return {
          id: flag.id,
          name: flag.name,
          description: flag.description,
          url: flag.url,
          founder_twitter: flag.author, // Map author to founder_twitter for backward compatibility
          author: flag.author,
          position: position,
          created_at: flag.created_at
        };
      });
      
      console.log("Formatted products:", formattedProducts);
      setProducts(formattedProducts);
    } catch (err) {
      setError(err as Error);
      toast.error("Failed to load flags");
      console.error("Error fetching flags:", err);
    } finally {
      setLoading(false);
    }
  }, []);
  
  // Add a new flag
  const addProduct = useCallback(async (product: Omit<SaasProduct, "id">) => {
    setLoading(true);
    
    try {
      // Convert the product to a flag format
      const flag = {
        name: product.name,
        description: product.description,
        url: product.url,
        author: product.founder_twitter || product.author || "", // Support both field names
        position: product.position,
      };
      
      console.log("Sending product to backend:", flag);
      const response = await apiRequest("POST", "/api/flags", flag);
      const newFlag = await response.json();
      console.log("Received new flag from backend:", newFlag);
      
      // Convert back to product format for UI
      const newProduct: SaasProduct = {
        id: newFlag.id,
        name: newFlag.name,
        description: newFlag.description,
        url: newFlag.url,
        founder_twitter: newFlag.author,
        author: newFlag.author,
        position: newFlag.position,
        created_at: newFlag.created_at
      };
      
      console.log("Created new product object:", newProduct);
      
      // Make sure the position is an array
      if (!Array.isArray(newProduct.position)) {
        console.error("Position is not an array:", newProduct.position);
        
        // Try to parse it if it's a string
        if (typeof newProduct.position === 'string') {
          try {
            newProduct.position = JSON.parse(newProduct.position);
          } catch (e) {
            console.error("Failed to parse position string:", e);
          }
        }
        
        // If still not an array, use default position
        if (!Array.isArray(newProduct.position)) {
          console.warn("Using default position");
          newProduct.position = [0, 0, 0];
        }
      }
      
      // Update the products list
      setProducts((prev) => [...prev, newProduct]);
      toast.success("Flag added successfully");
      return newProduct;
    } catch (err) {
      setError(err as Error);
      toast.error("Failed to add flag");
      console.error("Error adding flag:", err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);
  
  // Delete a flag
  const deleteProduct = useCallback(async (id: number) => {
    setLoading(true);
    
    try {
      // Use the flags API endpoint
      await apiRequest("DELETE", `/api/flags/${id}`, undefined);
      setProducts((prev) => prev.filter((product) => product.id !== id));
      toast.success("Flag deleted successfully");
    } catch (err) {
      setError(err as Error);
      toast.error("Failed to delete flag");
      console.error("Error deleting flag:", err);
    } finally {
      setLoading(false);
    }
  }, []);
  
  return {
    products,
    loading,
    error,
    fetchProducts,
    addProduct,
    deleteProduct
  };
};

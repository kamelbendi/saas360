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
      
      // Convert from flags to products if needed
      const formattedProducts = data.map((flag: any) => ({
        id: flag.id,
        name: flag.name,
        description: flag.description,
        url: flag.url,
        founder_twitter: flag.author, // Map author to founder_twitter for backward compatibility
        author: flag.author,
        position: flag.position,
        created_at: flag.created_at
      }));
      
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
      
      const response = await apiRequest("POST", "/api/flags", flag);
      const newFlag = await response.json();
      
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

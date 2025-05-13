import { useState, useCallback } from "react";
import { apiRequest } from "../lib/queryClient";
import { toast } from "sonner";
import { SaasProduct } from "../lib/stores/useLunarStore";

export const useSupabaseProducts = () => {
  const [products, setProducts] = useState<SaasProduct[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  
  // Fetch products from API
  const fetchProducts = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await apiRequest("GET", "/api/products", undefined);
      const data = await response.json();
      setProducts(data);
    } catch (err) {
      setError(err as Error);
      toast.error("Failed to load products");
      console.error("Error fetching products:", err);
    } finally {
      setLoading(false);
    }
  }, []);
  
  // Add a new product
  const addProduct = useCallback(async (product: Omit<SaasProduct, "id">) => {
    setLoading(true);
    
    try {
      const response = await apiRequest("POST", "/api/products", product);
      const newProduct = await response.json();
      setProducts((prev) => [...prev, newProduct]);
      toast.success("Product added successfully");
      return newProduct;
    } catch (err) {
      setError(err as Error);
      toast.error("Failed to add product");
      console.error("Error adding product:", err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);
  
  // Delete a product
  const deleteProduct = useCallback(async (id: number) => {
    setLoading(true);
    
    try {
      await apiRequest("DELETE", `/api/products/${id}`, undefined);
      setProducts((prev) => prev.filter((product) => product.id !== id));
      toast.success("Product deleted successfully");
    } catch (err) {
      setError(err as Error);
      toast.error("Failed to delete product");
      console.error("Error deleting product:", err);
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

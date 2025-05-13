import { create } from "zustand";

// Type for SaaS product
export interface SaasProduct {
  id: number;
  name: string;
  description: string;
  url: string;
  position: number[];
  created_at?: string;
}

// Interface for lunar environment state
interface LunarState {
  selectedProduct: SaasProduct | null;
  cameraPosition: [number, number, number];
  isPlacingProduct: boolean;
  
  // Actions
  setSelectedProduct: (product: SaasProduct | null) => void;
  setCameraPosition: (position: [number, number, number]) => void;
  setIsPlacingProduct: (isPlacing: boolean) => void;
}

// Create the store
export const useLunarStore = create<LunarState>((set) => ({
  selectedProduct: null,
  cameraPosition: [0, 5, 15],
  isPlacingProduct: false,
  
  setSelectedProduct: (product) => set({ selectedProduct: product }),
  setCameraPosition: (position) => set({ cameraPosition: position }),
  setIsPlacingProduct: (isPlacing) => set({ isPlacingProduct: isPlacing }),
}));

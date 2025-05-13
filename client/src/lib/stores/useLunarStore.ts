import { create } from "zustand";
import * as THREE from "three";

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
  
  // Context menu state
  contextMenuVisible: boolean;
  contextMenuPosition: { x: number, y: number };
  placementPosition: THREE.Vector3 | null;
  
  // Actions
  setSelectedProduct: (product: SaasProduct | null) => void;
  setCameraPosition: (position: [number, number, number]) => void;
  setIsPlacingProduct: (isPlacing: boolean) => void;
  
  // Context menu actions
  showContextMenu: (position: { x: number, y: number }) => void;
  hideContextMenu: () => void;
  setPlacementPosition: (position: THREE.Vector3 | null) => void;
}

// Create the store
export const useLunarStore = create<LunarState>((set) => ({
  selectedProduct: null,
  cameraPosition: [0, 5, 15],
  isPlacingProduct: false,
  
  // Context menu state
  contextMenuVisible: false,
  contextMenuPosition: { x: 0, y: 0 },
  placementPosition: null,
  
  // Core actions
  setSelectedProduct: (product) => set({ selectedProduct: product }),
  setCameraPosition: (position) => set({ cameraPosition: position }),
  setIsPlacingProduct: (isPlacing) => set({ isPlacingProduct: isPlacing }),
  
  // Context menu actions
  showContextMenu: (position) => set({ 
    contextMenuVisible: true, 
    contextMenuPosition: position 
  }),
  hideContextMenu: () => set({ contextMenuVisible: false }),
  setPlacementPosition: (position) => set({ placementPosition: position }),
}));

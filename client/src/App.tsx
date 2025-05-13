import { Suspense, useEffect, useState } from "react";
import { Canvas } from "@react-three/fiber";
import { Loader } from "@react-three/drei";
import { Toaster } from "sonner";
import * as THREE from "three";
import { useAudio } from "./lib/stores/useAudio";
import { useLunarStore } from "./lib/stores/useLunarStore"; 
import { useSupabaseProducts } from "./hooks/useSupabaseProducts";
import LoadingScreen from "./components/UI/LoadingScreen";
import FloatingTitle from "./components/UI/FloatingTitle";
import LunarEnvironment from "./components/LunarEnvironment";
import SaasPlacementMenu from "./components/UI/SaasPlacementMenu";
import ProductPopup from "./components/UI/ProductPopup";
import "@fontsource/inter";

function App() {
  const [isLoading, setIsLoading] = useState(true);
  const { setBackgroundMusic } = useAudio();
  const { 
    selectedProduct, 
    setSelectedProduct,
    placementPosition,
    setPlacementPosition,
    contextMenuVisible,
    contextMenuPosition,
    hideContextMenu,
    isPlacingProduct,
    setIsPlacingProduct
  } = useLunarStore();
  
  const { addProduct, fetchProducts } = useSupabaseProducts();
  
  // Handle adding a new product
  const handleAddProduct = async (productData: any) => {
    if (!placementPosition) return;
    
    // Create product object with position data
    const newProduct = {
      ...productData,
      position: [placementPosition.x, placementPosition.y, placementPosition.z]
    };
    
    // Add product to database
    try {
      await addProduct(newProduct);
      hideContextMenu();
      setIsPlacingProduct(false);
      setPlacementPosition(null);
      
      // Refresh product list
      fetchProducts();
    } catch (error) {
      console.error('Error adding product:', error);
    }
  };
  
  // Setup background music
  useEffect(() => {
    const bgMusic = new Audio("/sounds/background.mp3");
    bgMusic.loop = true;
    bgMusic.volume = 0.3;
    setBackgroundMusic(bgMusic);
    
    // Preload hit and success sounds
    const hitSound = new Audio("/sounds/hit.mp3");
    const successSound = new Audio("/sounds/success.mp3");
    hitSound.preload = "auto";
    successSound.preload = "auto";
    
    // Set fake loading time for better UX
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 2000);
    
    return () => clearTimeout(timer);
  }, [setBackgroundMusic]);
  
  return (
    <>
      {isLoading ? (
        <LoadingScreen />
      ) : (
        <>
          <Canvas 
            shadows
            camera={{ 
              position: [0, 5, 15], 
              fov: 60,
              near: 0.1,
              far: 1000
            }}
            gl={{ 
              antialias: true,
              powerPreference: "default",
              toneMapping: THREE.ACESFilmicToneMapping,
              toneMappingExposure: 1.0
            }}
          >
            <Suspense fallback={null}>
              <LunarEnvironment />
            </Suspense>
          </Canvas>
          <Loader />
          <FloatingTitle />
          <Toaster position="top-right" richColors />
          
          {/* Context Menu */}
          {contextMenuVisible && (
            <SaasPlacementMenu 
              position={contextMenuPosition}
              onClose={hideContextMenu}
              onAddProduct={() => setIsPlacingProduct(true)}
            />
          )}
          
          {/* Product Form */}
          {isPlacingProduct && placementPosition && (
            <div className="lunar-ui">
              <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4">
                <div className="bg-card p-6 rounded-lg w-full max-w-md">
                  <h2 className="text-xl font-bold mb-4">Add SaaS Product</h2>
                  <form onSubmit={(e) => {
                    e.preventDefault();
                    const formData = new FormData(e.currentTarget);
                    handleAddProduct({
                      name: formData.get('name') as string,
                      description: formData.get('description') as string,
                      url: formData.get('url') as string
                    });
                  }}>
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium mb-1">Name</label>
                        <input 
                          type="text" 
                          name="name" 
                          className="w-full p-2 bg-secondary rounded border border-border" 
                          required 
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-1">Description</label>
                        <textarea 
                          name="description" 
                          className="w-full p-2 bg-secondary rounded border border-border" 
                          rows={3} 
                          required 
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-1">URL</label>
                        <input 
                          type="url" 
                          name="url" 
                          className="w-full p-2 bg-secondary rounded border border-border" 
                          required 
                        />
                      </div>
                      <div className="flex justify-end space-x-2 pt-2">
                        <button 
                          type="button" 
                          className="px-4 py-2 bg-secondary text-white rounded hover:bg-secondary/80"
                          onClick={() => {
                            hideContextMenu();
                            setIsPlacingProduct(false);
                          }}
                        >
                          Cancel
                        </button>
                        <button 
                          type="submit" 
                          className="px-4 py-2 bg-primary text-white rounded hover:bg-primary/80"
                        >
                          Add Product
                        </button>
                      </div>
                    </div>
                  </form>
                </div>
              </div>
            </div>
          )}
          
          {/* Selected Product Popup */}
          {selectedProduct && (
            <ProductPopup 
              product={selectedProduct}
              position={selectedProduct.position as [number, number, number]}
              onClose={() => setSelectedProduct(null)}
            />
          )}
        </>
      )}
    </>
  );
}

export default App;

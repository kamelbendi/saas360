import { useEffect, useRef, useState } from "react";
import { useThree, useFrame } from "@react-three/fiber";
import { OrbitControls, Stars, useKeyboardControls } from "@react-three/drei";
import * as THREE from "three";
import { useLunarStore } from "../lib/stores/useLunarStore";
import { useRightClickMenu } from "../hooks/useRightClickMenu";
import { useSupabaseProducts } from "../hooks/useSupabaseProducts";
import MoonSurface from "./MoonSurface";
import SaasProduct from "./SaasProduct";
import SpaceSkybox from "./SpaceSkybox";
import SaasPlacementMenu from "./UI/SaasPlacementMenu";
import SaasInfoPanel from "./UI/SaasInfoPanel";

// Define Controls for keyboard navigation
enum Controls {
  forward = 'forward',
  backward = 'backward',
  left = 'left',
  right = 'right',
  up = 'up',
  down = 'down',
}

// Main component for the lunar environment
const LunarEnvironment = () => {
  const { camera, gl } = useThree();
  const controls = useRef<any>();
  const { products, fetchProducts, addProduct } = useSupabaseProducts();
  const { selectedProduct, setSelectedProduct } = useLunarStore();
  
  // Set up controls
  const forward = useKeyboardControls<Controls>(state => state.forward);
  const backward = useKeyboardControls<Controls>(state => state.backward);
  const left = useKeyboardControls<Controls>(state => state.left);
  const right = useKeyboardControls<Controls>(state => state.right);
  const up = useKeyboardControls<Controls>(state => state.up);
  const down = useKeyboardControls<Controls>(state => state.down);

  const [cameraPosition, setCameraPosition] = useState(new THREE.Vector3(0, 5, 15));
  const [isPlacingProduct, setIsPlacingProduct] = useState(false);
  const [placementPosition, setPlacementPosition] = useState<THREE.Vector3 | null>(null);

  // Context menu for placing products
  const { 
    contextMenu, 
    showContextMenu, 
    hideContextMenu 
  } = useRightClickMenu();

  // Handle right click on the moon surface
  const handleRightClick = (event: any) => {
    if (!event.intersections.length) return;
    const intersect = event.intersections[0];
    setPlacementPosition(intersect.point);
    showContextMenu(event.originalEvent);
  };

  // Add a product at the current placement position
  const handleAddProduct = async (productData: any) => {
    if (!placementPosition) return;
    
    try {
      await addProduct({
        ...productData,
        position: [placementPosition.x, placementPosition.y, placementPosition.z]
      });
      hideContextMenu();
      setIsPlacingProduct(false);
    } catch (error) {
      console.error("Failed to add product:", error);
    }
  };

  // Load products on mount
  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  // Frame update for camera controls
  useFrame(() => {
    const speed = 0.2;
    let moved = false;
    const newPosition = cameraPosition.clone();

    if (forward) {
      newPosition.z -= speed;
      moved = true;
    }
    if (backward) {
      newPosition.z += speed;
      moved = true;
    }
    if (left) {
      newPosition.x -= speed;
      moved = true;
    }
    if (right) {
      newPosition.x += speed;
      moved = true;
    }
    if (up) {
      newPosition.y += speed;
      moved = true;
    }
    if (down && newPosition.y > 1) {
      newPosition.y -= speed;
      moved = true;
    }

    if (moved) {
      setCameraPosition(newPosition);
      camera.position.copy(newPosition);
      controls.current?.target.set(newPosition.x, 0, newPosition.z - 5);
    }
  });

  return (
    <>
      {/* Skybox with stars */}
      <SpaceSkybox />
      
      {/* Directional light - sun light */}
      <directionalLight 
        position={[50, 50, 0]} 
        intensity={0.8} 
        castShadow 
        shadow-mapSize={[2048, 2048]}
      />
      
      {/* Ambient light for general illumination */}
      <ambientLight intensity={0.2} />
      
      {/* Hemisphere light for better color gradient from sky to ground */}
      <hemisphereLight 
        args={[0x3284ff, 0xffc87f, 0.6]} 
        position={[0, 50, 0]} 
      />
      
      {/* Point light to simulate Earth's reflected light */}
      <pointLight position={[-50, 20, -50]} intensity={0.5} color="#4fc3f7" />
      
      {/* Moon surface */}
      <MoonSurface onRightClick={handleRightClick} />
      
      {/* Render all SaaS products */}
      {products.map((product) => (
        <SaasProduct 
          key={product.id} 
          product={product} 
          isSelected={selectedProduct?.id === product.id}
          onClick={() => setSelectedProduct(product)}
        />
      ))}
      
      {/* Particle stars */}
      <Stars 
        radius={100} 
        depth={50} 
        count={5000} 
        factor={4} 
        saturation={0} 
      />
      
      {/* Camera controls */}
      <OrbitControls 
        ref={controls}
        enableDamping={true}
        dampingFactor={0.05}
        minDistance={2}
        maxDistance={50}
        minPolarAngle={0.1}
        maxPolarAngle={Math.PI / 2 - 0.1}
        enablePan={true}
        target={[0, 0, 0]}
      />
      
      {/* UI Elements */}
      {contextMenu.visible && (
        <SaasPlacementMenu 
          position={contextMenu.position}
          onClose={hideContextMenu}
          onAddProduct={() => setIsPlacingProduct(true)}
        />
      )}
      
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
      
      {selectedProduct && (
        <SaasInfoPanel 
          product={selectedProduct}
          onClose={() => setSelectedProduct(null)}
        />
      )}
    </>
  );
};

export default LunarEnvironment;

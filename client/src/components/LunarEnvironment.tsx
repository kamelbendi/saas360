import { useEffect, useRef, useState, useMemo } from "react";
import { useThree, useFrame } from "@react-three/fiber";
import { OrbitControls, Stars } from "@react-three/drei";
import * as THREE from "three";
import { useLunarStore } from "../lib/stores/useLunarStore";
import { useRightClickMenu } from "../hooks/useRightClickMenu";
import { useSupabaseProducts } from "../hooks/useSupabaseProducts";
import GroundSurface from "./MoonSurface";
import SaasProduct from "./SaasProduct";
import SpaceSkybox from "./SpaceSkybox";
import FlyingStars from "./FlyingStars";
import ShootingStars from "./ShootingStars";
import AnimatedBackground from "./AnimatedBackground";
import { createRandomAsteroids } from "./FloatingAsteroid";
import SaasPlacementMenu from "./UI/SaasPlacementMenu";
import ProductPopup from "./UI/ProductPopup";

// Main component for the lunar environment
const LunarEnvironment = () => {
  const { camera, gl } = useThree();
  const controls = useRef<any>();
  const { products, fetchProducts, addProduct } = useSupabaseProducts();
  const { selectedProduct, setSelectedProduct } = useLunarStore();

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

  // Set fixed camera position
  useEffect(() => {
    // Set initial camera position
    const initialPosition = new THREE.Vector3(0, 20, 30);
    setCameraPosition(initialPosition);
    camera.position.copy(initialPosition);
    
    if (controls.current) {
      controls.current.target.set(0, 0, 0);
      
      // Limit orbit controls
      controls.current.minPolarAngle = Math.PI * 0.2; // Don't go below the horizon
      controls.current.maxPolarAngle = Math.PI * 0.4; // Don't go too high above
      controls.current.minAzimuthAngle = -Math.PI * 0.4; // Limit rotation left
      controls.current.maxAzimuthAngle = Math.PI * 0.4; // Limit rotation right
      controls.current.minDistance = 20; // Don't zoom in too close
      controls.current.maxDistance = 50; // Don't zoom out too far
      controls.current.enablePan = false; // Disable panning
    }
  }, [camera, setCameraPosition]);

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
      
      {/* Grey curved ground */}
      <GroundSurface onRightClick={handleRightClick} />
      
      {/* Interactive animated background */}
      <AnimatedBackground />
      
      {/* Render all SaaS products */}
      {products.map((product) => (
        <SaasProduct 
          key={product.id} 
          product={product} 
          isSelected={selectedProduct?.id === product.id}
          onClick={() => setSelectedProduct(product)}
        />
      ))}
      
      {/* Flying stars animations */}
      <FlyingStars />
      
      {/* Shooting stars for more dynamism */}
      <ShootingStars />
      
      {/* Floating asteroids */}
      {useMemo(() => createRandomAsteroids(12, 60, 30), [])}
      
      {/* Camera controls - limited to rotation only */}
      <OrbitControls 
        ref={controls}
        enableDamping={true}
        dampingFactor={0.05}
        enableZoom={true}
        enablePan={false}
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
        <ProductPopup 
          product={selectedProduct}
          position={selectedProduct.position as [number, number, number]}
          onClose={() => setSelectedProduct(null)}
        />
      )}
    </>
  );
};

export default LunarEnvironment;

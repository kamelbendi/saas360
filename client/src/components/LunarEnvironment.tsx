import { useEffect, useRef, useMemo } from "react";
import { useThree, useFrame } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import * as THREE from "three";
import { useLunarStore } from "../lib/stores/useLunarStore";
import { useSupabaseProducts } from "../hooks/useSupabaseProducts";
import GroundSurface from "./MoonSurface";
import SaasProduct from "./SaasProduct";
import SpaceSkybox from "./SpaceSkybox";
import FlyingStars from "./FlyingStars";
import ShootingStars from "./ShootingStars";
import CelestialBodies from "./CelestialBodies";
import AnimatedBackground from "./AnimatedBackground";
import { createRandomAsteroids } from "./FloatingAsteroid";

// Main component for the lunar environment (3D only)
const LunarEnvironment = () => {
  const { camera } = useThree();
  const controls = useRef<any>();
  const { products, fetchProducts } = useSupabaseProducts();
  const { 
    selectedProduct, 
    setSelectedProduct,
    placementPosition,
    setPlacementPosition,
    showContextMenu,
    hideContextMenu,
    setCameraPosition
  } = useLunarStore();

  // Handle right click on the moon surface
  const handleRightClick = (event: any) => {
    // Make sure we have event and intersections
    if (!event || !event.intersections || !event.intersections.length) return;
    
    // Get the intersection point and original event
    const intersect = event.intersections[0];
    const originalEvent = event.nativeEvent || event.originalEvent;
    
    if (!originalEvent) {
      console.error('No original event found in right-click handler');
      return;
    }
    
    // Set the placement position and show context menu
    setPlacementPosition(intersect.point);
    showContextMenu({
      x: originalEvent.clientX,
      y: originalEvent.clientY
    });
  };

  // This component no longer handles adding products directly
  // Product addition is now managed in App.tsx

  // Load products on mount
  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  // Set fixed camera position
  useEffect(() => {
    // Set initial camera position
    const initialPosition = new THREE.Vector3(0, 20, 30);
    setCameraPosition([initialPosition.x, initialPosition.y, initialPosition.z]);
    camera.position.copy(initialPosition);
    
    if (controls.current) {
      controls.current.target.set(0, 0, 0);
      
      // Set orbit control limits
      controls.current.minPolarAngle = Math.PI * 0.2; // Don't go below the horizon
      controls.current.maxPolarAngle = Math.PI * 0.5; // Don't go too high above
      // Remove azimuth limits to enable 360-degree rotation
      controls.current.minAzimuthAngle = -Infinity; // No limit for left rotation
      controls.current.maxAzimuthAngle = Infinity; // No limit for right rotation
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
      
      {/* Celestial bodies like Earth, Mars, etc */}
      <CelestialBodies />
      
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
      
      {/* No UI Elements inside the canvas - UI moved to App.tsx */}
    </>
  );
};

export default LunarEnvironment;

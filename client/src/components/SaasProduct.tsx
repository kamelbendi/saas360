import { useRef, useEffect, useState, useMemo } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import { Text, Html, useCursor, useTexture } from "@react-three/drei";
import * as THREE from "three";
import { useAudio } from "../lib/stores/useAudio";
import { useSpring, animated } from "@react-spring/three";

interface SaasProductProps {
  product: {
    id: number;
    name: string;
    description: string;
    url: string;
    position: number[];
  };
  isSelected: boolean;
  onClick: () => void;
}

const SaasProduct = ({ product, isSelected, onClick }: SaasProductProps) => {
  const { playHit } = useAudio();
  const groupRef = useRef<THREE.Group>(null);
  const baseRef = useRef<THREE.Mesh>(null);
  const floatingRef = useRef<THREE.Mesh>(null);
  const [hovered, setHovered] = useState(false);
  
  // Change cursor on hover
  useCursor(hovered);
  
  // Create position from the product data
  const position = new THREE.Vector3(...product.position);
  
  // Function to extract domain from URL
  const extractDomainFromUrl = (url: string): string => {
    try {
      const parsed = new URL(url);
      return parsed.hostname.replace('www.', '').split('.')[0]; // Get the main domain name
    } catch (e) {
      return product.name; // Fallback to name if URL is invalid
    }
  };
  
  // Extract domain for favicon
  const domain = useMemo(() => extractDomainFromUrl(product.url), [product.url]);
  
  // Function to create favicon URL
  const getFaviconUrl = (domain: string): string => {
    return `https://www.google.com/s2/favicons?domain=${domain}&sz=128`;
  };
  
  // Create American flag style texture with logo from domain
  const logoTexture = useMemo(() => {
    const canvas = document.createElement('canvas');
    canvas.width = 256; // Reduced for better performance
    canvas.height = 128;
    const ctx = canvas.getContext('2d');
    
    if (ctx) {
      // Draw red and white stripes (American flag style) - brighter red
      const stripeHeight = canvas.height / 7; // 7 stripes total
      for (let i = 0; i < 7; i++) {
        ctx.fillStyle = i % 2 === 0 ? '#FF3030' : '#FFFFFF'; // Brighter red
        ctx.fillRect(0, i * stripeHeight, canvas.width, stripeHeight);
      }
      
      // Draw blue rectangle (union) in the top left - brighter blue
      ctx.fillStyle = '#0055AA'; // Brighter blue
      ctx.fillRect(0, 0, canvas.width * 0.4, canvas.height * 0.5);
      
      // Draw logo in the blue rectangle
      const logoSize = canvas.height * 0.4;
      const logoX = canvas.width * 0.2;
      const logoY = canvas.height * 0.25;
      
      // Draw bright circle with first letter
      ctx.beginPath();
      ctx.arc(logoX, logoY, logoSize/2, 0, Math.PI * 2);
      ctx.fillStyle = '#FFFFFF';
      ctx.fill();
      
      // Add light outer glow for better visibility
      ctx.beginPath();
      ctx.arc(logoX, logoY, logoSize/2 + 3, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.8)';
      ctx.lineWidth = 2;
      ctx.stroke();
      
      // Draw the first letter
      ctx.font = `bold ${logoSize * 0.5}px Arial`;
      ctx.fillStyle = '#0055AA'; // Match the blue color
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(product.name.charAt(0).toUpperCase(), logoX, logoY);
      
      // Add glow/highlight effect when hovered
      if (hovered) {
        ctx.save();
        ctx.globalAlpha = 0.4; // Stronger glow
        ctx.fillStyle = "#FFFF00";
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.restore();
      }
    }
    
    const texture = new THREE.CanvasTexture(canvas);
    texture.needsUpdate = true;
    return texture;
  }, [product.name, hovered]); // Removed dependencies that were causing excess re-renders
  
  // Handle hover and click interactions
  const handlePointerOver = () => {
    setHovered(true);
    document.body.style.cursor = 'pointer';
  };
  
  const handlePointerOut = () => {
    setHovered(false);
    document.body.style.cursor = 'auto';
  };
  
  const handleClick = () => {
    playHit();
    onClick();
  };
  
  // Get camera for facing rotation logic
  const { camera } = useThree();
  
  // Make objects face the camera with better performance - safer implementation
  useFrame(() => {
    try {
      if (floatingRef.current) {
        // Update flag to face camera (horizontally only)
        const cameraXZ = new THREE.Vector3(camera.position.x, 0, camera.position.z);
        const flagXZ = new THREE.Vector3(position.x, 0, position.z);
        const angleToCamera = Math.atan2(
          cameraXZ.x - flagXZ.x,
          cameraXZ.z - flagXZ.z
        );
        
        // Apply rotation to flag (Y-axis only for performance)
        floatingRef.current.rotation.y = angleToCamera;
      }
    } catch (error) {
      // Safely handle any errors in the frame update
      console.log("Error updating flag rotation:", error);
    }
  });
  
  // No spring animation for the pole - completely stable
  const poleSpring = useSpring({
    rotateX: 0,
    rotateY: 0,
    rotateZ: 0,
    config: { mass: 1, tension: 100, friction: 20 }
  });
  
  return (
    <group 
      ref={groupRef}
      position={position}
      onPointerOver={handlePointerOver}
      onPointerOut={handlePointerOut}
      onClick={handleClick}
    >
      {/* Base */}
      <mesh 
        ref={baseRef}
        position={[0, 0, 0]} 
        rotation={[0, 0, 0]}
      >
        <cylinderGeometry args={[0.2, 0.3, 0.1, 16]} />
        <meshStandardMaterial 
          color={isSelected ? "#f5f5f5" : "#e0e0e0"} 
          roughness={0.7}
          metalness={0.3}
          emissive={isSelected ? "#ffffff" : "#e0e0e0"}
          emissiveIntensity={isSelected ? 0.3 : 0.1}
        />
      </mesh>
      
      {/* Flag pole - metallic, slightly taller */}
      <animated.mesh 
        position={[0, 1.0, 0]} 
        rotation-x={poleSpring.rotateX}
        rotation-y={poleSpring.rotateY}
        rotation-z={poleSpring.rotateZ}
      >
        <cylinderGeometry args={[0.02, 0.02, 2.0, 8]} />
        <meshStandardMaterial 
          color="#a0a0a0" 
          roughness={0.1}
          metalness={0.9}
        />
        
        {/* Flag with logo - will make it face camera in useFrame */}
        <mesh
          ref={floatingRef} 
          position={[0.75, 0.7, 0]}
        >
          <planeGeometry args={[1.2, 0.8, 1, 1]} />
          <meshStandardMaterial 
            map={logoTexture}
            side={THREE.DoubleSide}
            roughness={0.1}
            metalness={0.3}
            emissive={hovered ? "#ffffcc" : "#ffffff"} 
            emissiveIntensity={hovered ? 0.7 : 0.4} // Increased for better visibility
            toneMapped={false} // Makes colors brighter
          />
        </mesh>
        
        {/* Add point light to make the flag more visible */}
        <pointLight
          position={[0.75, 0.7, 0.1]}
          intensity={1.0}
          distance={2}
          color="#ffffff"
          decay={1}
        />
        
        {/* Add spotlight for better visibility from angles */}
        <spotLight 
          position={[0.75, 1.2, 0.3]} 
          angle={0.5}
          penumbra={0.5}
          intensity={1.5}
          distance={3}
          color="#ffffff"
        />
      </animated.mesh>
      
      {/* HTML-based name label that always follows camera properly */}
      <Html 
        position={[0, 2.3, 0]} 
        center 
        sprite
        transform
        occlude={false}
        distanceFactor={8}
        zIndexRange={[100, 0]}
      >
        <div 
          style={{ 
            pointerEvents: 'none', 
            whiteSpace: 'nowrap',
            padding: '5px 12px',
            fontSize: '14px',
            fontWeight: 'bold', 
            backgroundColor: 'rgba(0, 0, 0, 0.75)',
            color: 'white',
            border: `2px solid ${hovered ? "#ffff00" : "white"}`,
            borderRadius: '6px',
            boxShadow: '0 4px 8px rgba(0, 0, 0, 0.4)',
            transform: `scale(${hovered ? 1.1 : 1})`,
            transition: 'all 0.2s ease',
            textShadow: '0 1px 2px rgba(0,0,0,0.8)'
          }}
        >
          {product.name}
        </div>
      </Html>
      

      
      {/* Light on ground when selected */}
      {isSelected && (
        <pointLight
          position={[0, 0.1, 0]}
          intensity={0.8}
          distance={3}
          color="#ffffff"
        />
      )}
      
      {/* Selected marker - smaller yellow indicator on top of pole */}
      {isSelected && (
        <mesh position={[0, 2.1, 0]}>
          <sphereGeometry args={[0.05, 16, 16]} />
          <meshBasicMaterial color="#ffff00" />
        </mesh>
      )}
      
      {/* Glowing particles and lights */}
      <pointLight
        position={[0, 0.5, 0]}
        intensity={0.2}
        distance={1}
        color={isSelected ? "#ffffff" : "#4fc3f7"}
      />
    </group>
  );
};

export default SaasProduct;
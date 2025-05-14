import { useRef, useEffect, useState, useMemo } from "react";
import { useFrame } from "@react-three/fiber";
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
    canvas.width = 512;
    canvas.height = 256;
    const ctx = canvas.getContext('2d');
    
    if (ctx) {
      // Draw red and white stripes (American flag style)
      const stripeHeight = canvas.height / 7; // 7 stripes total
      for (let i = 0; i < 7; i++) {
        ctx.fillStyle = i % 2 === 0 ? '#FF0000' : '#FFFFFF';
        ctx.fillRect(0, i * stripeHeight, canvas.width, stripeHeight);
      }
      
      // Draw blue rectangle (union) in the top left
      ctx.fillStyle = '#002868';
      ctx.fillRect(0, 0, canvas.width * 0.4, canvas.height * 0.5);
      
      // Draw stars or logo in the blue rectangle
      const logoSize = canvas.height * 0.4;
      const logoX = canvas.width * 0.2;
      const logoY = canvas.height * 0.25;
      
      // Create a temporary image for favicon
      const faviconImg = new Image();
      faviconImg.crossOrigin = "Anonymous"; // Allow cross-origin image loading
      
      // Draw the company logo or a placeholder circle with the first letter
      // Since we can't await the image load in a synchronous function,
      // we'll draw a placeholder first and update it when image loads
      
      // Draw placeholder circle with first letter for now
      ctx.beginPath();
      ctx.arc(logoX, logoY, logoSize/2, 0, Math.PI * 2);
      ctx.fillStyle = '#FFFFFF';
      ctx.fill();
      
      // Draw the first letter
      ctx.font = `bold ${logoSize * 0.5}px Arial`;
      ctx.fillStyle = '#002868';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(product.name.charAt(0).toUpperCase(), logoX, logoY);
      
      // Add glow/highlight effect when hovered
      if (hovered) {
        ctx.save();
        ctx.globalAlpha = 0.3;
        ctx.fillStyle = "#FFFF00";
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.restore();
      }
    }
    
    return new THREE.CanvasTexture(canvas);
  }, [product.name, product.url, domain, hovered]);
  
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
  
  // Flag geometry - simple flat plane
  const flagGeometry = useMemo(() => {
    const geometry = new THREE.PlaneGeometry(1.5, 0.8, 4, 4);
    return geometry;
  }, []);

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
        
        {/* Flag with logo - positioned right */}
        <mesh 
          ref={floatingRef} 
          position={[0.35, 0.7, 0]} 
          rotation={[0, Math.PI/2, 0]}
          scale={[0.75, 0.5, 0.75]}
        >
          <planeGeometry args={[1.5, 0.8, 4, 4]} />
          <meshStandardMaterial 
            map={logoTexture}
            side={THREE.DoubleSide}
            roughness={0.3}
            metalness={0.1}
            emissive={hovered ? "#ffffaa" : "#ffffff"}
            emissiveIntensity={hovered ? 0.2 : 0}
          />
        </mesh>
      </animated.mesh>
      
      {/* Product name label that always faces the camera */}
      <Html position={[0, 2.2, 0]} center transform occlude>
        <div 
          className={`product-label ${hovered ? 'product-label-hover' : ''}`}
          style={{ 
            pointerEvents: 'none', 
            whiteSpace: 'nowrap',
            fontSize: '12px',
            fontWeight: 'bold', 
            padding: '4px 8px',
            backgroundColor: 'white',
            color: 'black',
            borderRadius: '4px',
            boxShadow: '0 2px 4px rgba(0,0,0,0.2)',
            opacity: hovered ? 1 : 0.9,
            transform: `scale(${hovered ? 1.1 : 1})`
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
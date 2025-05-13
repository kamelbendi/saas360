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
  
  // Create logo texture for the flag
  const logoTexture = useMemo(() => {
    const canvas = document.createElement('canvas');
    canvas.width = 256;
    canvas.height = 128;
    const ctx = canvas.getContext('2d');
    
    if (ctx) {
      // Background color
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, 256, 128);
      
      // Draw border
      ctx.strokeStyle = hovered ? '#1976d2' : '#2196f3';
      ctx.lineWidth = 4;
      ctx.strokeRect(2, 2, 252, 124);
      
      // "SAAS" text at the top of the flag
      ctx.font = 'bold 16px Arial';
      ctx.fillStyle = '#000000';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'top';
      ctx.fillText('SAAS', 128, 10);
      
      // Add underline below SAAS
      ctx.beginPath();
      ctx.moveTo(88, 28);
      ctx.lineTo(168, 28);
      ctx.strokeStyle = '#000000';
      ctx.lineWidth = 1;
      ctx.stroke();
      
      // Draw logo (circle with first letter of company name)
      ctx.beginPath();
      ctx.arc(64, 64, 30, 0, Math.PI * 2);
      ctx.fillStyle = hovered ? '#1976d2' : '#2196f3';
      ctx.fill();
      
      // First letter of company in white
      ctx.font = 'bold 36px Arial';
      ctx.fillStyle = '#ffffff';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(product.name.charAt(0).toUpperCase(), 64, 64);
      
      // Draw company name
      ctx.fillStyle = '#000000';
      ctx.font = 'bold 20px Arial';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      
      // Wrap text if too long
      const name = product.name;
      if (name.length > 10) {
        const words = name.split(' ');
        let line1 = '';
        let line2 = '';
        
        if (words.length > 1) {
          // Try to split at spaces
          const middleIndex = Math.floor(words.length / 2);
          line1 = words.slice(0, middleIndex).join(' ');
          line2 = words.slice(middleIndex).join(' ');
        } else {
          // Split in the middle if it's a single word
          const middle = Math.floor(name.length / 2);
          line1 = name.slice(0, middle);
          line2 = name.slice(middle);
        }
        
        ctx.fillText(line1, 170, 50);
        ctx.fillText(line2, 170, 78);
      } else {
        ctx.fillText(name, 170, 64);
      }
    }
    
    return new THREE.CanvasTexture(canvas);
  }, [product.name, hovered]);
  
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
      
      {/* Flag pole - shorter and vertical */}
      <animated.mesh 
        position={[0, 0.9, 0]} 
        rotation-x={poleSpring.rotateX}
        rotation-y={poleSpring.rotateY}
        rotation-z={poleSpring.rotateZ}
      >
        <cylinderGeometry args={[0.02, 0.02, 1.8, 8]} />
        <meshStandardMaterial 
          color="#a0a0a0" 
          roughness={0.5}
          metalness={0.9}
        />
        
        {/* Flag with logo - smaller and positioned right */}
        <mesh 
          ref={floatingRef} 
          position={[0.35, 0.7, 0]} 
          rotation={[0, Math.PI/2, 0]}
          scale={[0.7, 0.5, 0.7]}
        >
          <planeGeometry args={[1.5, 0.8]} />
          <meshStandardMaterial 
            map={logoTexture}
            side={THREE.DoubleSide}
            roughness={0.4}
            metalness={0.2}
          />
        </mesh>
      </animated.mesh>
      
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
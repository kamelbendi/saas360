import { useRef, useEffect, useState } from "react";
import { useFrame } from "@react-three/fiber";
import { Text, Html, useCursor } from "@react-three/drei";
import * as THREE from "three";
import { useAudio } from "../lib/stores/useAudio";

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
  
  // Handle hover and click interactions
  const handlePointerOver = () => setHovered(true);
  const handlePointerOut = () => setHovered(false);
  const handleClick = () => {
    playHit();
    onClick();
  };
  
  // Floating animation for the product marker
  useFrame((state) => {
    if (floatingRef.current) {
      floatingRef.current.position.y = Math.sin(state.clock.getElapsedTime() * 2) * 0.1 + 0.5;
      floatingRef.current.rotation.y += 0.01;
    }
    
    if (groupRef.current && isSelected) {
      groupRef.current.rotation.y += 0.01;
    }
  });
  
  // Highlight effect when selected
  useEffect(() => {
    if (baseRef.current && floatingRef.current) {
      if (isSelected) {
        (baseRef.current.material as THREE.MeshStandardMaterial).emissive.set('#4fc3f7');
        (floatingRef.current.material as THREE.MeshStandardMaterial).emissive.set('#4fc3f7');
      } else {
        (baseRef.current.material as THREE.MeshStandardMaterial).emissive.set('#000000');
        (floatingRef.current.material as THREE.MeshStandardMaterial).emissive.set('#000000');
      }
    }
  }, [isSelected]);

  return (
    <group
      ref={groupRef}
      position={position}
      onPointerOver={handlePointerOver}
      onPointerOut={handlePointerOut}
      onClick={handleClick}
    >
      {/* Base cylinder */}
      <mesh ref={baseRef} position={[0, 0.1, 0]} castShadow receiveShadow>
        <cylinderGeometry args={[0.5, 0.7, 0.2, 16]} />
        <meshStandardMaterial 
          color={hovered ? "#4fc3f7" : "#2196f3"} 
          roughness={0.3}
          metalness={0.7}
        />
      </mesh>
      
      {/* Floating hologram-like object */}
      <mesh ref={floatingRef} position={[0, 0.5, 0]} castShadow>
        <dodecahedronGeometry args={[0.3, 0]} />
        <meshStandardMaterial 
          color={hovered ? "#4fc3f7" : "#2196f3"} 
          roughness={0.1}
          metalness={0.9}
          transparent
          opacity={0.8}
        />
      </mesh>
      
      {/* Product name label */}
      <Text
        position={[0, 1.2, 0]}
        fontSize={0.4}
        color="#ffffff"
        anchorX="center"
        anchorY="middle"
        maxWidth={2}
      >
        {product.name}
      </Text>
      
      {/* Glowing particles */}
      <pointLight
        position={[0, 0.5, 0]}
        distance={1.5}
        intensity={2}
        color="#4fc3f7"
      />
      
      {/* Selected indicator */}
      {isSelected && (
        <Html position={[0, -0.5, 0]} center>
          <div className="px-2 py-1 bg-primary text-xs rounded text-white pointer-events-none">
            Selected
          </div>
        </Html>
      )}
    </group>
  );
};

export default SaasProduct;

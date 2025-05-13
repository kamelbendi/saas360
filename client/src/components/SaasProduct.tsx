import { useRef, useEffect, useState, useMemo } from "react";
import { useFrame } from "@react-three/fiber";
import { Text, Html, useCursor, useTexture } from "@react-three/drei";
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
  
  // Create holographic effect texture
  const hologramTexture = useMemo(() => {
    const canvas = document.createElement('canvas');
    canvas.width = 128;
    canvas.height = 128;
    const ctx = canvas.getContext('2d');
    
    if (ctx) {
      // Create a radial gradient for the hologram effect
      const gradient = ctx.createRadialGradient(64, 64, 0, 64, 64, 64);
      gradient.addColorStop(0, 'rgba(79, 195, 247, 0.9)');
      gradient.addColorStop(0.5, 'rgba(33, 150, 243, 0.5)');
      gradient.addColorStop(1, 'rgba(25, 118, 210, 0.0)');
      
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, 128, 128);
      
      // Add scan lines for hologram effect
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.2)';
      ctx.lineWidth = 1;
      
      for (let i = 0; i < 128; i += 4) {
        ctx.beginPath();
        ctx.moveTo(0, i);
        ctx.lineTo(128, i);
        ctx.stroke();
      }
    }
    
    return new THREE.CanvasTexture(canvas);
  }, []);
  
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
  
  // Floating animation for the product marker
  useFrame((state) => {
    const time = state.clock.getElapsedTime();
    
    if (floatingRef.current) {
      floatingRef.current.position.y = Math.sin(time * 2) * 0.1 + 0.5;
      floatingRef.current.rotation.y += 0.01;
      
      // Pulse scale based on hover state
      const targetScale = hovered ? 1.15 : 1.0;
      floatingRef.current.scale.x = THREE.MathUtils.lerp(floatingRef.current.scale.x, targetScale, 0.1);
      floatingRef.current.scale.y = THREE.MathUtils.lerp(floatingRef.current.scale.y, targetScale, 0.1);
      floatingRef.current.scale.z = THREE.MathUtils.lerp(floatingRef.current.scale.z, targetScale, 0.1);
    }
    
    if (baseRef.current) {
      // Subtle breathing effect for the base
      const breathingScale = 1 + Math.sin(time * 1.5) * 0.03;
      baseRef.current.scale.set(breathingScale, 1, breathingScale);
      
      if (isSelected) {
        // Rotate the base when selected
        baseRef.current.rotation.y += 0.02;
      }
    }
    
    if (groupRef.current && isSelected) {
      // Add a slight hover effect when selected
      groupRef.current.position.y = position.y + Math.sin(time) * 0.05;
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
      {/* Base platform with lights */}
      <mesh ref={baseRef} position={[0, 0.1, 0]} castShadow receiveShadow>
        <cylinderGeometry args={[0.5, 0.7, 0.2, 16]} />
        <meshStandardMaterial 
          color={hovered ? "#4fc3f7" : "#2196f3"} 
          roughness={0.3}
          metalness={0.7}
          emissiveIntensity={isSelected ? 0.5 : 0.1}
        />
      </mesh>
      
      {/* Light ring around the base */}
      <mesh position={[0, 0.21, 0]} rotation={[Math.PI/2, 0, 0]}>
        <ringGeometry args={[0.5, 0.6, 32]} />
        <meshBasicMaterial 
          color={isSelected ? "#4fc3f7" : "#2196f3"} 
          transparent
          opacity={0.7}
          side={THREE.DoubleSide}
        />
      </mesh>
      
      {/* Floating hologram-like object */}
      <mesh ref={floatingRef} position={[0, 0.5, 0]} castShadow>
        <dodecahedronGeometry args={[0.25, 1]} />
        <meshPhysicalMaterial 
          color={hovered ? "#4fc3f7" : "#2196f3"} 
          roughness={0.1}
          metalness={0.9}
          transparent
          opacity={0.8}
          clearcoat={1}
          clearcoatRoughness={0.1}
          transmission={0.2}
        />
      </mesh>
      
      {/* Holographic ring around floating object */}
      <mesh position={[0, 0.5, 0]} rotation={[Math.PI/2, 0, 0]}>
        <ringGeometry args={[0.35, 0.4, 32]} />
        <meshBasicMaterial 
          color="#4fc3f7" 
          transparent
          opacity={0.6}
          side={THREE.DoubleSide}
          map={hologramTexture}
        />
      </mesh>
      
      {/* Product name label with glow */}
      <group position={[0, 1.2, 0]}>
        {/* Glow effect behind text */}
        {(isSelected || hovered) && (
          <sprite scale={[2, 0.5, 1]}>
            <spriteMaterial 
              transparent
              opacity={0.4}
              color="#4fc3f7"
              blending={THREE.AdditiveBlending}
            />
          </sprite>
        )}
        
        <Text
          fontSize={0.35}
          color={isSelected ? "#ffffff" : (hovered ? "#e0f7fa" : "#b3e5fc")}
          anchorX="center"
          anchorY="middle"
          maxWidth={2}
          outlineWidth={isSelected ? 0.02 : 0}
          outlineColor="#0277bd"
          font="/fonts/inter.woff"
        >
          {product.name}
        </Text>
      </group>
      
      {/* Glowing particles and lights */}
      <pointLight
        position={[0, 0.5, 0]}
        distance={1.5}
        intensity={hovered ? 3 : 2}
        color="#4fc3f7"
      />
      
      {/* Additional ambient light for selected items */}
      {isSelected && (
        <pointLight
          position={[0, 0.1, 0]}
          distance={3}
          intensity={1}
          color="#0277bd"
        />
      )}
      
      {/* Particle system for selected items */}
      {isSelected && (
        <points>
          <bufferGeometry>
            <float32BufferAttribute 
              attach="attributes-position" 
              array={new Float32Array(Array(30).fill(0).flatMap(() => [
                (Math.random() - 0.5) * 1.5,
                (Math.random()) * 1.5,
                (Math.random() - 0.5) * 1.5
              ]))} 
              count={30} 
              itemSize={3} 
            />
          </bufferGeometry>
          <pointsMaterial 
            size={0.05} 
            color="#4fc3f7" 
            transparent 
            opacity={0.8}
            blending={THREE.AdditiveBlending}
          />
        </points>
      )}
      
      {/* Selected indicator */}
      {isSelected && (
        <Html position={[0, -0.5, 0]} center>
          <div className="selected-badge">
            Active Selection
          </div>
        </Html>
      )}
    </group>
  );
};

export default SaasProduct;
